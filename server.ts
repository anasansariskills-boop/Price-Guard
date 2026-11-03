import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { PDFParse } from 'pdf-parse';
import * as XLSX from 'xlsx';
import { runInvoiceAudit } from './src/utils/auditEngine.ts';
import { AgreedProduct, InvoiceDocument, LeadSubmission, AuditSession, UserAccount } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

import {
  createUser,
  authenticateUser,
  getUserById,
  validateSession,
  destroySession,
  saveAuditSession,
  getAuditsForUser,
  getAuditById,
  deleteAuditById,
  registerUploadedFile,
  saveLead,
  getAllLeads,
  getDatabaseStats
} from './src/db/database.ts';

// Authentication middleware helper
function getAuthenticatedUserId(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const userId = validateSession(token);
    if (userId) return userId;
  }
  // Default to demo-user if unauthenticated
  return 'demo-user';
}

// Server-Side Gemini Initialization
const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && process.env.GEMINI_API_KEY.length > 10);
const ai = hasApiKey
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    })
  : null;

let isGeminiAvailable = false;
// Non-blocking connectivity probe
if (ai) {
  Promise.race([
    ai.models.generateContent({ model: 'gemini-3.8-flash', contents: 'test' }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini probe timeout')), 2500))
  ]).then(() => {
    isGeminiAvailable = true;
    console.log('[PriceGuard] Gemini 3.8 Flash model verified and ready.');
  }).catch((err) => {
    isGeminiAvailable = false;
    console.warn('[PriceGuard] Gemini API key scope/connectivity unverified, defaulting to native parser engine:', err.message || 'Scope error');
  });
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, businessName, businessType } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const { user, token } = createUser({
      email,
      password,
      name,
      businessName,
      businessType
    });

    return res.status(201).json({ success: true, token, user });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(400).json({ error: err.message || 'Failed to create account.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const authResult = authenticateUser(email, password);
    if (!authResult) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.json({ success: true, token: authResult.token, user: authResult.user });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to authenticate.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const user = getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  return res.json({ user });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    destroySession(token);
  }
  return res.json({ success: true });
});

// ==========================================
// HEALTH & TEST FIXTURES
// ==========================================

app.get('/api/health', (req, res) => {
  const stats = getDatabaseStats();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!ai,
    geminiVerified: isGeminiAvailable,
    geminiModel: 'gemini-3.8-flash',
    geminiStatus: isGeminiAvailable ? 'READY' : 'BLOCKED (ACCESS_TOKEN_SCOPE_INSUFFICIENT)',
    parsers: ['pdf-parse', 'xlsx', 'regex-tabular'],
    database: stats
  });
});

app.get('/api/test-fixtures/files', (req, res) => {
  const fixturesDir = path.resolve('./test_fixtures');
  if (fs.existsSync(fixturesDir)) {
    const files = fs.readdirSync(fixturesDir).map(file => {
      const stat = fs.statSync(path.join(fixturesDir, file));
      return {
        fileName: file,
        sizeBytes: stat.size,
        downloadUrl: `/api/test-fixtures/${file}`
      };
    });
    return res.json({ files });
  }
  return res.json({ files: [] });
});

app.get('/api/test-fixtures/:filename', (req, res) => {
  const filePath = path.resolve('./test_fixtures', path.basename(req.params.filename));
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  return res.status(404).send('Test fixture not found.');
});

// ==========================================
// PARSING & EXTRACTION ENGINES
// ==========================================

/**
 * Robust deterministic parser for invoice text extracted from PDFs or plaintext
 */
export function parseInvoiceTextToDocument(rawText: string, fileName: string): InvoiceDocument {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  let supplierName = 'Supplier Document';
  let invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
  let invoiceDate = new Date().toISOString().split('T')[0];
  let currency = 'USD';
  let totalAmount = 0;
  const lineItems: any[] = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];

    // Detect Invoice Number (avoiding lines containing 'total', 'amount', 'date')
    if (!/total|amount|date/i.test(l) && /invoice\s*(?:number|#|no\.?|id|code)?\s*[:\-]?\s*([A-Za-z0-9\-]+)/i.test(l)) {
      const m = l.match(/invoice\s*(?:number|#|no\.?|id|code)?\s*[:\-]?\s*([A-Za-z0-9\-]+)/i);
      if (m && m[1] && m[1].toUpperCase() !== 'TOTAL') {
        invoiceNumber = m[1];
      }
    }

    // Detect Invoice Date
    if (/invoice\s*date\s*[:\-]?\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})/i.test(l)) {
      const m = l.match(/invoice\s*date\s*[:\-]?\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})/i);
      if (m && m[1]) invoiceDate = m[1];
    }

    // Detect Supplier Name (typically in top 6 lines)
    if (i < 6 && /^[A-Z][A-Za-z0-9 &.,'-]+(?:Co\.|LLC|Inc\.|Produce|Meats|Hospitality|Supply|Chemicals|Linen)/i.test(l)) {
      supplierName = l.replace(/^supplier\s*[:\-]?\s*/i, '').trim();
    } else if (i < 6 && /^supplier\s*[:\-]?\s*([A-Za-z0-9 &.,'-]+)/i.test(l)) {
      const m = l.match(/^supplier\s*[:\-]?\s*([A-Za-z0-9 &.,'-]+)/i);
      if (m && m[1]) supplierName = m[1].trim();
    }

    // Detect Total Amount
    if (/(?:total(?:\s*amount|\s*due)?|subtotal|balance\s*due)\s*[:\$]?\s*([0-9,]+\.[0-9]{2})/i.test(l)) {
      const m = l.match(/(?:total(?:\s*amount|\s*due)?|subtotal|balance\s*due)\s*[:\$]?\s*([0-9,]+\.[0-9]{2})/i);
      if (m && m[1]) totalAmount = parseFloat(m[1].replace(/,/g, ''));
    }

    // Parse Tabular Line Items
    // Format A: Pipe-separated: SKU | Description | Qty | Unit | Unit Price | Total
    if (l.includes('|')) {
      const parts = l.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        if (/description|unit price|item code|qty/i.test(parts[0]) || /description|unit price/i.test(parts[1])) {
          continue;
        }
        let code = '';
        let desc = '';
        let qty = 1;
        let unit = 'EA';
        let price = 0;
        let lineTotal = 0;

        if (parts.length >= 6) {
          code = parts[0];
          desc = parts[1];
          qty = parseFloat(parts[2]);
          unit = parts[3].toUpperCase();
          price = parseFloat(parts[4]);
          lineTotal = parseFloat(parts[5]);
        } else if (parts.length >= 4) {
          desc = parts[0];
          qty = parseFloat(parts[1]);
          unit = parts[2].toUpperCase();
          price = parseFloat(parts[3]);
          lineTotal = parts[4] ? parseFloat(parts[4]) : qty * price;
        }

        if (!isNaN(qty) && !isNaN(price)) {
          lineItems.push({
            id: `li-${lineItems.length}`,
            lineIndex: lineItems.length,
            rawCode: code,
            rawDescription: desc,
            quantity: qty,
            unit: unit || 'UNIT',
            invoicedUnitPrice: price,
            lineTotal: isNaN(lineTotal) ? qty * price : lineTotal,
            sourceTextRef: l
          });
        }
      }
    }
    // Format B: Comma or tab separated
    else if (l.includes(',') || l.includes('\t')) {
      const parts = l.split(/[,\t]/).map(p => p.trim());
      if (parts.length >= 4 && !/description|item/i.test(parts[0])) {
        const code = parts.length >= 5 ? parts[0] : '';
        const desc = parts.length >= 5 ? parts[1] : parts[0];
        const qty = parseFloat(parts.length >= 5 ? parts[2] : parts[1]);
        const unit = parts.length >= 5 ? parts[3] : 'UNIT';
        const price = parseFloat(parts.length >= 5 ? parts[4] : parts[2]);
        const total = parts.length >= 6 ? parseFloat(parts[5]) : qty * price;

        if (!isNaN(qty) && !isNaN(price)) {
          lineItems.push({
            id: `li-${lineItems.length}`,
            lineIndex: lineItems.length,
            rawCode: code,
            rawDescription: desc,
            quantity: qty,
            unit: unit.toUpperCase() || 'UNIT',
            invoicedUnitPrice: price,
            lineTotal: isNaN(total) ? qty * price : total,
            sourceTextRef: l
          });
        }
      }
    }
  }

  if (totalAmount === 0 && lineItems.length > 0) {
    totalAmount = Math.round(lineItems.reduce((acc, cur) => acc + cur.lineTotal, 0) * 100) / 100;
  }

  return {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    supplierName,
    invoiceDate,
    currency,
    subtotal: totalAmount,
    totalAmount,
    sourceFileName: fileName,
    lineItems,
    extractionEngine: 'native_pdf_parser'
  };
}

// ==========================================
// INVOICE EXTRACTION ENDPOINT
// ==========================================
app.post('/api/extract/invoice', async (req, res) => {
  try {
    const { text, fileData, mimeType, fileName } = req.body;

    if (!text && !fileData) {
      return res.status(400).json({ error: 'Either document text or fileData must be provided.' });
    }

    let extractedText = text || '';

    // If PDF fileData (base64) was provided, extract text with PDFParse
    const isPDF = (mimeType && mimeType.includes('pdf')) || (fileName && fileName.toLowerCase().endsWith('.pdf'));
    if (fileData && isPDF) {
      try {
        const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, '');
        const pdfBuffer = Buffer.from(cleanBase64, 'base64');
        const parser = new PDFParse({ data: pdfBuffer });
        await (parser as any).load();
        const pdfTextResult = await parser.getText();
        extractedText = pdfTextResult.text || '';
        
        // Securely register upload in private database-tracked storage
        const userId = getAuthenticatedUserId(req);
        registerUploadedFile(userId, fileName || 'invoice.pdf', pdfBuffer, mimeType || 'application/pdf');
      } catch (pdfErr) {
        console.error('PDFParse extraction error:', pdfErr);
      }
    }

    // Try Gemini AI extraction if verified and available
    if (ai && isGeminiAvailable && extractedText) {
      try {
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Extract the supplier invoice into structured JSON from this text:\n\n${extractedText}`,
          config: {
            systemInstruction: 'You extract hotel and restaurant supplier invoices into structured JSON. Always provide accurate arithmetic.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                supplierName: { type: Type.STRING },
                invoiceNumber: { type: Type.STRING },
                invoiceDate: { type: Type.STRING },
                currency: { type: Type.STRING },
                totalAmount: { type: Type.NUMBER },
                lineItems: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      rawCode: { type: Type.STRING },
                      rawDescription: { type: Type.STRING },
                      quantity: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                      invoicedUnitPrice: { type: Type.NUMBER },
                      lineTotal: { type: Type.NUMBER }
                    },
                    required: ['rawDescription', 'quantity', 'invoicedUnitPrice', 'lineTotal']
                  }
                }
              },
              required: ['supplierName', 'invoiceNumber', 'lineItems', 'totalAmount']
            }
          }
        });

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI extraction timeout')), 4000));
        const geminiResponse = await Promise.race([geminiPromise, timeoutPromise]) as any;

        const jsonText = geminiResponse.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          const doc: InvoiceDocument = {
            id: `inv-${Date.now()}`,
            invoiceNumber: parsed.invoiceNumber || 'INV-001',
            supplierName: parsed.supplierName || 'Supplier',
            invoiceDate: parsed.invoiceDate || new Date().toISOString().split('T')[0],
            currency: parsed.currency || 'USD',
            subtotal: parsed.totalAmount || 0,
            totalAmount: parsed.totalAmount || 0,
            sourceFileName: fileName || 'uploaded_invoice.pdf',
            lineItems: (parsed.lineItems || []).map((li: any, idx: number) => ({
              id: `li-${Date.now()}-${idx}`,
              lineIndex: idx,
              rawCode: li.rawCode || '',
              rawDescription: li.rawDescription || 'Unnamed Item',
              quantity: Number(li.quantity) || 1,
              unit: li.unit || 'UNIT',
              invoicedUnitPrice: Number(li.invoicedUnitPrice) || 0,
              lineTotal: Number(li.lineTotal) || (Number(li.quantity) * Number(li.invoicedUnitPrice)),
              sourceTextRef: `Line ${idx + 1}: ${li.rawDescription} - ${li.quantity} @ $${li.invoicedUnitPrice}`
            })),
            extractionEngine: 'gemini_3.8_flash'
          };
          return res.json({ success: true, invoice: doc, method: 'gemini' });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini extraction unavailable or failed, using native parser:', geminiErr.message || geminiErr);
      }
    }

    // Deterministic parser execution
    const invoiceDoc = parseInvoiceTextToDocument(extractedText, fileName || 'invoice.pdf');
    return res.json({ success: true, invoice: invoiceDoc, method: 'native_pdf_parser' });
  } catch (err: any) {
    console.error('Invoice extraction route error:', err);
    return res.status(500).json({ error: 'Failed to extract invoice.' });
  }
});

// ==========================================
// PRICE LIST EXTRACTION ENDPOINT (CSV / XLSX)
// ==========================================
app.post('/api/extract/pricelist', (req, res) => {
  try {
    const { fileData, fileName, csvContent, textContent, supplierName } = req.body;
    let products: AgreedProduct[] = [];

    // Check if XLSX or XLS fileData provided
    const isExcel = fileName && (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls'));
    if (fileData && isExcel) {
      const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, '');
      const excelBuffer = Buffer.from(cleanBase64, 'base64');
      const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);

      rawRows.forEach((row, idx) => {
        // Find price field
        let agreedPrice = 0;
        let sku = `SKU-${idx + 1}`;
        let name = `Product ${idx + 1}`;
        let unit = 'UNIT';
        let packSize = '';

        for (const [key, val] of Object.entries(row)) {
          const k = key.toLowerCase();
          const strVal = String(val).trim();

          if (/sku|code|item\s*no|prod\s*id/i.test(k)) {
            sku = strVal;
          } else if (/name|description|item|product/i.test(k)) {
            name = strVal;
          } else if (/price|rate|agreed|contract/i.test(k)) {
            const num = parseFloat(strVal.replace(/[$,]/g, ''));
            if (!isNaN(num)) agreedPrice = num;
          } else if (/unit|uom/i.test(k)) {
            unit = strVal.toUpperCase();
          } else if (/pack|size|case|packaging/i.test(k)) {
            packSize = strVal;
          }
        }

        if (agreedPrice > 0) {
          products.push({
            id: `prod-${Date.now()}-${idx}`,
            sku,
            name,
            category: 'Agreed Contract Catalog',
            agreedPrice,
            unit,
            packSize,
            effectiveFrom: new Date().toISOString().split('T')[0]
          });
        }
      });

      return res.json({ success: true, productsCount: products.length, products, format: 'xlsx' });
    }

    // Otherwise process CSV or text
    const content = csvContent || textContent || '';
    if (!content) {
      return res.status(400).json({ error: 'Price list content or file is required.' });
    }

    const lines = content.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const separator = content.includes(';') ? ';' : content.includes('\t') ? '\t' : ',';
    
    // Check if first row is a header
    const hasHeader = /sku|price|item|product|code|unit|rate|name/i.test(lines[0]);
    let skuCol = -1;
    let nameCol = -1;
    let priceCol = -1;
    let unitCol = -1;
    let packCol = -1;

    if (hasHeader) {
      const headerCols = lines[0].split(separator).map((c: string) => c.replace(/^["']|["']$/g, '').trim().toLowerCase());
      headerCols.forEach((h: string, idx: number) => {
        if (/sku|code|item\s*#|prod\s*id/i.test(h)) skuCol = idx;
        else if (/name|description|product|item/i.test(h)) nameCol = idx;
        else if (/price|rate|agreed|cost/i.test(h)) priceCol = idx;
        else if (/unit|uom/i.test(h)) unitCol = idx;
        else if (/pack|size|packaging/i.test(h)) packCol = idx;
      });
    }

    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(separator).map((c: string) => c.replace(/^["']|["']$/g, '').trim());

      if (cols.length >= 2) {
        let sku = '';
        let name = '';
        let agreedPrice = 0;
        let unit = 'UNIT';
        let packSize = '';

        if (priceCol !== -1 && cols[priceCol] !== undefined) {
          const cleanNum = cols[priceCol].replace(/[$,]/g, '').trim();
          const parsedNum = parseFloat(cleanNum);
          if (!isNaN(parsedNum) && parsedNum > 0) {
            agreedPrice = parsedNum;
            sku = skuCol !== -1 ? cols[skuCol] : `SKU-${i}`;
            name = nameCol !== -1 ? cols[nameCol] : cols[0];
            unit = unitCol !== -1 && cols[unitCol] ? cols[unitCol] : 'UNIT';
            packSize = packCol !== -1 && cols[packCol] ? cols[packCol] : '';
          }
        } else {
          // Fallback: look for strictly numeric price column (e.g. 120.00, not '10 KG Box')
          let detectedPriceIdx = -1;
          for (let c = cols.length - 1; c >= 0; c--) {
            const cleanVal = cols[c].replace(/[$,]/g, '').trim();
            if (/^[0-9]+(?:\.[0-9]{1,4})?$/.test(cleanVal)) {
              detectedPriceIdx = c;
              break;
            }
          }

          if (detectedPriceIdx !== -1) {
            agreedPrice = parseFloat(cols[detectedPriceIdx].replace(/[$,]/g, '').trim());
            name = cols[detectedPriceIdx === 1 ? 0 : 1] || cols[0];
            sku = detectedPriceIdx > 1 ? cols[0] : `SKU-${i + 1}`;
            unit = cols[detectedPriceIdx + 1] || 'UNIT';
            packSize = cols[detectedPriceIdx + 2] || '';
          }
        }

        if (agreedPrice > 0) {
          products.push({
            id: `prod-${Date.now()}-${i}`,
            sku: sku || `SKU-${i + 1}`,
            name: name || `Product ${i + 1}`,
            category: 'Agreed Catalog',
            agreedPrice,
            unit: unit.toUpperCase() || 'UNIT',
            packSize,
            effectiveFrom: new Date().toISOString().split('T')[0]
          });
        }
      }
    }

    return res.json({ success: true, productsCount: products.length, products, format: 'csv' });
  } catch (err: any) {
    console.error('Price list parsing error:', err);
    return res.status(500).json({ error: 'Failed to parse price list.' });
  }
});

// ==========================================
// AUDIT EXECUTION & PERSISTENCE
// ==========================================
app.post('/api/audit/run', (req, res) => {
  try {
    const { priceList, invoices, title, supplierName, industry } = req.body;
    const userId = getAuthenticatedUserId(req);

    if (!Array.isArray(priceList) || priceList.length === 0) {
      return res.status(400).json({ error: 'Valid agreed price list is required.' });
    }
    if (!Array.isArray(invoices) || invoices.length === 0) {
      return res.status(400).json({ error: 'At least one invoice is required.' });
    }

    const { findings, summary } = runInvoiceAudit(priceList, invoices);

    const newAuditSession: AuditSession = {
      id: `audit-${Date.now()}`,
      userId,
      title: title || `${supplierName || 'Supplier'} Invoice Audit`,
      supplierName: supplierName || 'Hospitality Supplier',
      industry: industry || 'restaurant',
      createdAt: new Date().toISOString().split('T')[0],
      priceList,
      invoices,
      findings,
      summary
    };

    saveAuditSession(newAuditSession);

    return res.json({ success: true, audit: newAuditSession });
  } catch (err: any) {
    console.error('Audit execution error:', err);
    return res.status(500).json({ error: 'Failed to run audit comparison.' });
  }
});

app.get('/api/audits', (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const userAudits = getAuditsForUser(userId);
  res.json({ audits: userAudits });
});

app.get('/api/audits/:id', (req, res) => {
  const { id } = req.params;
  const userId = getAuthenticatedUserId(req);
  const audit = getAuditById(id, userId);
  if (!audit) {
    return res.status(404).json({ error: 'Audit session not found.' });
  }
  return res.json({ audit });
});

app.delete('/api/audits/:id', (req, res) => {
  const { id } = req.params;
  const userId = getAuthenticatedUserId(req);
  const deleted = deleteAuditById(id, userId);
  res.json({ success: deleted, message: deleted ? 'Audit session deleted.' : 'Audit not found or unauthorized.' });
});

app.get('/api/audits/:id/export.csv', (req, res) => {
  const { id } = req.params;
  const userId = getAuthenticatedUserId(req);
  const audit = getAuditById(id, userId);

  if (!audit) {
    return res.status(404).send('Audit session not found.');
  }

  const csvRows: string[] = [
    ['Invoice Number', 'Invoice Date', 'Supplier', 'Invoiced Item', 'Matched Agreed Product', 'Agreed SKU', 'Agreed Rate', 'Charged Rate', 'Quantity', 'Unit', 'Unit Diff', 'Potential Overcharge', 'Finding Type', 'Status', 'Evidence Calculation'].join(',')
  ];

  audit.findings.forEach(f => {
    const row = [
      `"${f.invoiceNumber}"`,
      `"${f.invoiceDate}"`,
      `"${f.supplierName.replace(/"/g, '""')}"`,
      `"${f.invoiceItem.rawDescription.replace(/"/g, '""')}"`,
      `"${f.matchedAgreedProduct?.name?.replace(/"/g, '""') || 'Unmatched'}"`,
      `"${f.matchedAgreedProduct?.sku || 'N/A'}"`,
      f.agreedPrice.toFixed(2),
      f.invoicedPrice.toFixed(2),
      f.quantity.toString(),
      `"${f.invoiceItem.unit}"`,
      f.unitPriceDiff.toFixed(2),
      f.potentialOvercharge.toFixed(2),
      `"${f.findingType}"`,
      `"${f.status}"`,
      `"${f.evidence.calculationExplanation.replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="priceguard_audit_${id}.csv"`);
  res.send(csvRows.join('\n'));
});

// ==========================================
// LEADS SUBMISSION
// ==========================================
app.post('/api/leads', (req, res) => {
  try {
    const { name, email, businessName, businessType, locationsCount, estimatedMonthlySpend, message } = req.body;

    if (!name || !email || !businessName) {
      return res.status(400).json({ error: 'Name, email, and business name are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid work email address.' });
    }

    const leadId = saveLead({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      businessName: businessName.trim(),
      businessType: businessType || 'Restaurant',
      locationsCount: locationsCount || '1',
      estimatedMonthlySpend: estimatedMonthlySpend || 'Not specified',
      message: message ? message.trim() : ''
    });

    return res.status(201).json({
      success: true,
      leadId,
      message: 'Thank you. Your request for a supplier invoice audit has been received.'
    });
  } catch (err: any) {
    console.error('Lead submission error:', err);
    return res.status(500).json({ error: 'Internal server error processing lead request.' });
  }
});

app.get('/api/leads', (req, res) => {
  res.json({ leads: getAllLeads() });
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PriceGuard server active on http://0.0.0.0:${PORT}`);
  });
}

const isMain = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isMain) {
  startServer();
}
