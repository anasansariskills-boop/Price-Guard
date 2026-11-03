import { AgreedProduct, InvoiceDocument, InvoiceLineItem, DiscrepancyFinding, AuditSummary } from '../types/index.ts';

/**
 * Normalizes text for product matching by trimming, lowercasing,
 * removing special punctuation, and stripping common hospitality qualifiers.
 */
export function normalizeProductText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s/]/g, ' ')
    .replace(/\b(fresh|frozen|chilled|imported|domestic|premium|grade a|select|bulk|box|pkg|pack)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Token Similarity (Jaccard Index of words) between two strings
 */
export function calculateTokenSimilarity(s1: string, s2: string): number {
  const norm1 = normalizeProductText(s1);
  const norm2 = normalizeProductText(s2);
  
  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  const words1 = new Set(norm1.split(' ').filter(w => w.length > 1));
  const words2 = new Set(norm2.split(' ').filter(w => w.length > 1));

  if (words1.size === 0 || words2.size === 0) return 0.0;

  let intersectionCount = 0;
  words1.forEach(word => {
    if (words2.has(word)) {
      intersectionCount++;
    } else {
      // Check partial stem
      for (const w2 of words2) {
        if (word.startsWith(w2) || w2.startsWith(word)) {
          intersectionCount += 0.75;
          break;
        }
      }
    }
  });

  const unionSize = words1.size + words2.size - Math.floor(intersectionCount);
  return Math.min(1.0, intersectionCount / Math.max(1, unionSize));
}

/**
 * Normalizes units of measure to check compatibility
 */
/**
 * Normalizes units of measure to check compatibility
 */
export function areUnitsCompatible(unit1?: string, unit2?: string): boolean {
  if (!unit1 || !unit2) return true;
  const u1 = unit1.toLowerCase().trim();
  const u2 = unit2.toLowerCase().trim();

  if (u1 === u2) return true;

  const aliases: Record<string, string[]> = {
    kg: ['kg', 'kilo', 'kilogram', 'kgs'],
    lb: ['lb', 'lbs', 'pound', 'pounds'],
    case: ['case', 'cs', 'ctn', 'carton', 'box'],
    ea: ['ea', 'each', 'pc', 'piece', 'unit', 'single'],
    bottle: ['btl', 'bottle', 'bottles'],
    gal: ['gal', 'gallon', 'gallons'],
    liter: ['l', 'ltr', 'liter', 'litre']
  };

  for (const group of Object.values(aliases)) {
    if (group.includes(u1) && group.includes(u2)) {
      return true;
    }
  }

  return false;
}

export interface UnitConversionResult {
  convertedAgreedPrice: number;
  conversionFactor: number;
  explanation: string;
}

/**
 * Converts unit prices across known metric/imperial conversions (kg <-> lb)
 */
export function convertUnitPrice(
  invoicedUnit?: string,
  agreedPrice?: number,
  agreedUnit?: string
): UnitConversionResult | null {
  if (!invoicedUnit || !agreedPrice || !agreedUnit) return null;
  const inv = invoicedUnit.toLowerCase().trim();
  const agr = agreedUnit.toLowerCase().trim();

  const isKgInv = ['kg', 'kilo', 'kilogram', 'kgs'].includes(inv);
  const isLbInv = ['lb', 'lbs', 'pound', 'pounds'].includes(inv);
  const isKgAgr = ['kg', 'kilo', 'kilogram', 'kgs'].includes(agr);
  const isLbAgr = ['lb', 'lbs', 'pound', 'pounds'].includes(agr);

  if (isKgInv && isLbAgr) {
    // Invoice in KG, Agreement in LB: 1 kg = 2.20462 lb
    const factor = 2.20462;
    const converted = Math.round(agreedPrice * factor * 100) / 100;
    return {
      convertedAgreedPrice: converted,
      conversionFactor: factor,
      explanation: `Converted agreed $${agreedPrice.toFixed(2)}/lb to $${converted.toFixed(2)}/kg (1 kg = 2.20462 lb)`
    };
  }

  if (isLbInv && isKgAgr) {
    // Invoice in LB, Agreement in KG: 1 lb = 0.453592 kg
    const factor = 0.453592;
    const converted = Math.round(agreedPrice * factor * 100) / 100;
    return {
      convertedAgreedPrice: converted,
      conversionFactor: factor,
      explanation: `Converted agreed $${agreedPrice.toFixed(2)}/kg to $${converted.toFixed(2)}/lb (1 lb = 0.453592 kg)`
    };
  }

  return null;
}

/**
 * Core deterministic invoice auditing engine.
 * Compares an array of invoices against an agreed price list.
 * STRICT PRINCIPLE: Never combines duplicate invoice exposure with line-item price overcharges.
 */
export function runInvoiceAudit(
  priceList: AgreedProduct[],
  invoices: InvoiceDocument[]
): { findings: DiscrepancyFinding[]; summary: AuditSummary } {
  const findings: DiscrepancyFinding[] = [];
  const seenInvoiceNumbers = new Map<string, string>(); // invoiceNumber -> supplier

  let totalLinesProcessed = 0;
  let matchedLinesCount = 0;
  let needsReviewCount = 0;
  let discrepancyCount = 0;
  let potentialPriceOvercharge = 0;
  let duplicateInvoiceExposure = 0;
  let duplicateInvoiceCount = 0;
  let unmatchedProductsCount = 0;
  let unmatchedTotalAmount = 0;
  let needsReviewTotalAmount = 0;
  let totalInvoiceAmount = 0;

  // 1. Check for Duplicate Invoices
  for (const invoice of invoices) {
    totalInvoiceAmount += invoice.totalAmount || 0;
    const invKey = `${invoice.supplierName.toLowerCase()}_${invoice.invoiceNumber.toLowerCase()}`;
    
    if (seenInvoiceNumbers.has(invKey)) {
      // Duplicate invoice alert: isolated in duplicateInvoiceExposure
      duplicateInvoiceCount++;
      duplicateInvoiceExposure += invoice.totalAmount;
      findings.push({
        id: `dup-${invoice.id}`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        supplierName: invoice.supplierName,
        invoiceDate: invoice.invoiceDate,
        lineIndex: 0,
        invoiceItem: {
          id: `line-dup-${invoice.id}`,
          lineIndex: 0,
          rawCode: 'DUP-INV',
          rawDescription: `Duplicate invoice submission for ${invoice.invoiceNumber}`,
          quantity: 1,
          unit: 'INVOICE',
          invoicedUnitPrice: invoice.totalAmount,
          lineTotal: invoice.totalAmount,
          sourceTextRef: `Header: Invoice Number ${invoice.invoiceNumber}`
        },
        matchedAgreedProduct: null,
        matchConfidence: 1.0,
        matchMethod: 'exact_sku',
        findingType: 'duplicate_invoice',
        agreedPrice: 0,
        invoicedPrice: invoice.totalAmount,
        unitPriceDiff: invoice.totalAmount,
        quantity: 1,
        potentialOvercharge: invoice.totalAmount,
        status: 'potential',
        evidence: {
          sourceDocument: `${invoice.sourceFileName} (Invoice #${invoice.invoiceNumber})`,
          sourceLineRef: `Invoice #${invoice.invoiceNumber} with total $${invoice.totalAmount.toFixed(2)}`,
          agreedRecordRef: `Identical invoice number previously processed for ${invoice.supplierName}`,
          calculationExplanation: `Duplicate billing: entire invoice amount ($${invoice.totalAmount.toFixed(2)}) is identified as duplicate exposure. This is reported separately and NOT combined into line-item overcharges.`,
          uncertaintyNotes: 'Verify whether supplier re-issued the document or if this represents a duplicate payment risk.'
        }
      });
      // Skip processing duplicate lines to prevent double-counting line items
      continue;
    } else {
      seenInvoiceNumbers.set(invKey, invoice.supplierName);
    }

    // 2. Process Line Items
    for (const item of invoice.lineItems) {
      totalLinesProcessed++;

      // Try exact SKU match
      let matchedProduct: AgreedProduct | null = null;
      let matchMethod: DiscrepancyFinding['matchMethod'] = 'unmatched';
      let matchConfidence = 0;

      if (item.rawCode) {
        const exactSku = priceList.find(p => p.sku && p.sku.toLowerCase() === item.rawCode.toLowerCase());
        if (exactSku) {
          matchedProduct = exactSku;
          matchMethod = 'exact_sku';
          matchConfidence = 1.0;
        }
      }

      // Try normalized description exact match
      if (!matchedProduct) {
        const itemNorm = normalizeProductText(item.rawDescription);
        const normMatch = priceList.find(p => normalizeProductText(p.name) === itemNorm);
        if (normMatch) {
          matchedProduct = normMatch;
          matchMethod = 'normalized_text';
          matchConfidence = 0.95;
        }
      }

      // Try fuzzy token similarity
      if (!matchedProduct) {
        let bestScore = 0;
        let bestProduct: AgreedProduct | null = null;

        for (const p of priceList) {
          const score = calculateTokenSimilarity(item.rawDescription, p.name);
          if (score > bestScore) {
            bestScore = score;
            bestProduct = p;
          }
        }

        if (bestProduct && bestScore >= 0.70) {
          matchedProduct = bestProduct;
          matchMethod = 'fuzzy_match';
          matchConfidence = Math.round(bestScore * 100) / 100;
        } else if (bestProduct && bestScore >= 0.45) {
          // Weak candidate that needs human review
          matchedProduct = bestProduct;
          matchMethod = 'fuzzy_match';
          matchConfidence = Math.round(bestScore * 100) / 100;
        }
      }

      // If still unmatched
      if (!matchedProduct) {
        needsReviewCount++;
        unmatchedProductsCount++;
        const itemAmount = item.lineTotal || (item.quantity * item.invoicedUnitPrice);
        unmatchedTotalAmount += itemAmount;

        findings.push({
          id: `unmatched-${invoice.id}-${item.id}`,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          supplierName: invoice.supplierName,
          invoiceDate: invoice.invoiceDate,
          lineIndex: item.lineIndex,
          invoiceItem: item,
          matchedAgreedProduct: null,
          matchConfidence: 0,
          matchMethod: 'unmatched',
          findingType: 'unmatched_product',
          agreedPrice: 0,
          invoicedPrice: item.invoicedUnitPrice,
          unitPriceDiff: 0,
          quantity: item.quantity,
          potentialOvercharge: 0,
          status: 'potential',
          evidence: {
            sourceDocument: `${invoice.sourceFileName} (Line ${item.lineIndex + 1})`,
            sourceLineRef: `"${item.rawDescription}" (Code: ${item.rawCode || 'N/A'}) - Qty: ${item.quantity} ${item.unit} @ $${item.invoicedUnitPrice.toFixed(2)}`,
            agreedRecordRef: 'No corresponding item found in agreed price list',
            calculationExplanation: 'Item cannot be automatically verified against agreed price list. Spend isolated as unmatched.',
            uncertaintyNotes: 'Confirm whether this product was purchased under a separate contract or spot purchase.'
          }
        });
        continue;
      }

      matchedLinesCount++;

      // 3. Price and Pack Size / Unit Comparison
      let agreedRate = matchedProduct.agreedPrice;
      const invoicedRate = item.invoicedUnitPrice;
      let unitExplanation = '';

      // Check for metric/imperial unit conversion
      const unitConversion = convertUnitPrice(item.unit, matchedProduct.agreedPrice, matchedProduct.unit);
      if (unitConversion) {
        agreedRate = unitConversion.convertedAgreedPrice;
        unitExplanation = unitConversion.explanation;
      }

      const unitCompatible = areUnitsCompatible(item.unit, matchedProduct.unit) || Boolean(unitConversion);
      const unitDiff = Math.round((invoicedRate - agreedRate) * 100) / 100;

      // Pack size mismatch check (e.g. Case of 6 vs Case of 12, or unknown unit conversion)
      const packConflict = !unitCompatible || (
        item.packSize && matchedProduct.packSize &&
        item.packSize.toLowerCase() !== matchedProduct.packSize.toLowerCase() &&
        Math.abs(unitDiff) > 0.01
      );

      if (packConflict && Math.abs(unitDiff) > 0.01) {
        // UNCERTAIN UNIT/PACK CONVERSION: Never calculate a confirmed overcharge!
        needsReviewCount++;
        needsReviewTotalAmount += Math.abs(unitDiff * item.quantity);

        findings.push({
          id: `pack-${invoice.id}-${item.id}`,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          supplierName: invoice.supplierName,
          invoiceDate: invoice.invoiceDate,
          lineIndex: item.lineIndex,
          invoiceItem: item,
          matchedAgreedProduct: matchedProduct,
          matchConfidence: Math.min(matchConfidence, 0.65),
          matchMethod,
          findingType: 'pack_size_discrepancy',
          agreedPrice: agreedRate,
          invoicedPrice: invoicedRate,
          unitPriceDiff: unitDiff,
          quantity: item.quantity,
          potentialOvercharge: 0, // CRITICAL: Zero confirmed overcharge when unit conversion is uncertain
          status: 'potential',
          evidence: {
            sourceDocument: `${invoice.sourceFileName} (Line ${item.lineIndex + 1})`,
            sourceLineRef: `Invoiced as "${item.rawDescription}" with unit "${item.unit || 'unit'}" (pack: "${item.packSize || 'N/A'}") @ $${invoicedRate.toFixed(2)}`,
            agreedRecordRef: `Agreed: "${matchedProduct.name}" (${matchedProduct.sku}) with unit "${matchedProduct.unit}" (pack: "${matchedProduct.packSize || 'N/A'}") @ $${matchedProduct.agreedPrice.toFixed(2)}`,
            calculationExplanation: `Packaging format or unit differs between agreement and invoice. Overcharge held at $0.00 until packaging multiplier is verified by operator.`,
            uncertaintyNotes: 'Verify packaging conversion multiplier before requesting supplier credit.'
          }
        });
      } else if (matchConfidence < 0.80) {
        // Ambiguous brand / description match: Flag for review with held overcharge
        needsReviewCount++;
        const potentialDiff = Math.max(0, unitDiff);
        const potOvercharge = Math.round(potentialDiff * item.quantity * 100) / 100;
        needsReviewTotalAmount += potOvercharge;
        
        findings.push({
          id: `pot-${invoice.id}-${item.id}`,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          supplierName: invoice.supplierName,
          invoiceDate: invoice.invoiceDate,
          lineIndex: item.lineIndex,
          invoiceItem: item,
          matchedAgreedProduct: matchedProduct,
          matchConfidence,
          matchMethod,
          findingType: 'potential_mismatch',
          agreedPrice: agreedRate,
          invoicedPrice: invoicedRate,
          unitPriceDiff: unitDiff,
          quantity: item.quantity,
          potentialOvercharge: potOvercharge,
          status: 'potential',
          evidence: {
            sourceDocument: `${invoice.sourceFileName} (Line ${item.lineIndex + 1})`,
            sourceLineRef: `Invoiced as "${item.rawDescription}" @ $${invoicedRate.toFixed(2)}`,
            agreedRecordRef: `Candidate: "${matchedProduct.name}" (${matchedProduct.sku}) @ $${agreedRate.toFixed(2)} (Confidence: ${Math.round(matchConfidence * 100)}%)`,
            calculationExplanation: `Description is ambiguous. If verified: ($${invoicedRate.toFixed(2)} - $${agreedRate.toFixed(2)}) x ${item.quantity} = $${potOvercharge.toFixed(2)} potential difference.`,
            uncertaintyNotes: 'Product description is ambiguous. Please confirm if this is the identical product specification before requesting credit.'
          }
        });
      } else if (unitDiff > 0.005) {
        // Confirmed Overcharge on verified match
        discrepancyCount++;
        const overcharge = Math.round(unitDiff * item.quantity * 100) / 100;
        potentialPriceOvercharge += overcharge;

        findings.push({
          id: `diff-${invoice.id}-${item.id}`,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          supplierName: invoice.supplierName,
          invoiceDate: invoice.invoiceDate,
          lineIndex: item.lineIndex,
          invoiceItem: item,
          matchedAgreedProduct: matchedProduct,
          matchConfidence,
          matchMethod,
          findingType: 'price_mismatch',
          agreedPrice: agreedRate,
          invoicedPrice: invoicedRate,
          unitPriceDiff: unitDiff,
          quantity: item.quantity,
          potentialOvercharge: overcharge,
          status: 'potential',
          evidence: {
            sourceDocument: `${invoice.sourceFileName} (Line ${item.lineIndex + 1})`,
            sourceLineRef: `Invoice line: "${item.rawDescription}" charged at $${invoicedRate.toFixed(2)}/${item.unit} (Qty: ${item.quantity})`,
            agreedRecordRef: `Agreed agreement: "${matchedProduct.name}" (${matchedProduct.sku}) at $${matchedProduct.agreedPrice.toFixed(2)}/${matchedProduct.unit}${unitExplanation ? ` [${unitExplanation}]` : ''}`,
            calculationExplanation: `($${invoicedRate.toFixed(2)} charged - $${agreedRate.toFixed(2)} agreed) x ${item.quantity} ${item.unit} = $${overcharge.toFixed(2)} potential price overcharge`,
            uncertaintyNotes: undefined
          }
        });
      }
    }
  }

  const roundedOvercharge = Math.round(potentialPriceOvercharge * 100) / 100;

  const summary: AuditSummary = {
    totalInvoices: invoices.length,
    totalInvoiceAmount: Math.round(totalInvoiceAmount * 100) / 100,
    totalLinesProcessed,
    matchedLinesCount,
    needsReviewCount,
    discrepancyCount,
    potentialPriceOvercharge: roundedOvercharge,
    duplicateInvoiceExposure: Math.round(duplicateInvoiceExposure * 100) / 100,
    duplicateInvoiceCount,
    unmatchedProductsCount,
    unmatchedTotalAmount: Math.round(unmatchedTotalAmount * 100) / 100,
    needsReviewTotalAmount: Math.round(needsReviewTotalAmount * 100) / 100,
    totalPotentialOvercharge: roundedOvercharge, // strictly price overcharge
    confirmedOvercharge: 0
  };

  return { findings, summary };
}

/**
 * Deterministically recalculates audit summary when user confirms, reviews, or dismisses findings.
 */
export function recalculateAuditSummary(
  findings: DiscrepancyFinding[],
  invoicesCount: number,
  invoicesTotal: number,
  linesProcessed: number
): AuditSummary {
  let matchedLinesCount = 0;
  let needsReviewCount = 0;
  let discrepancyCount = 0;
  let potentialPriceOvercharge = 0;
  let duplicateInvoiceExposure = 0;
  let duplicateInvoiceCount = 0;
  let unmatchedProductsCount = 0;
  let unmatchedTotalAmount = 0;
  let needsReviewTotalAmount = 0;
  let confirmedOvercharge = 0;

  for (const f of findings) {
    if (f.findingType === 'duplicate_invoice') {
      duplicateInvoiceCount++;
      duplicateInvoiceExposure += f.invoicedPrice;
    } else if (f.findingType === 'unmatched_product') {
      unmatchedProductsCount++;
      unmatchedTotalAmount += (f.invoiceItem.lineTotal || (f.invoiceItem.quantity * f.invoiceItem.invoicedUnitPrice));
    } else if (f.findingType === 'pack_size_discrepancy') {
      needsReviewCount++;
      matchedLinesCount++;
      needsReviewTotalAmount += (f.potentialOvercharge || (Math.abs(f.unitPriceDiff) * f.quantity));
      if (f.status === 'confirmed') {
        discrepancyCount++;
        confirmedOvercharge += f.potentialOvercharge;
        potentialPriceOvercharge += f.potentialOvercharge;
      }
    } else if (f.findingType === 'potential_mismatch') {
      matchedLinesCount++;
      if (f.status === 'confirmed') {
        discrepancyCount++;
        confirmedOvercharge += f.potentialOvercharge;
        potentialPriceOvercharge += f.potentialOvercharge;
      } else if (f.status === 'potential') {
        needsReviewCount++;
        needsReviewTotalAmount += f.potentialOvercharge;
      }
    } else if (f.findingType === 'price_mismatch') {
      matchedLinesCount++;
      discrepancyCount++;
      if (f.status !== 'dismissed') {
        potentialPriceOvercharge += f.potentialOvercharge;
      }
      if (f.status === 'confirmed') {
        confirmedOvercharge += f.potentialOvercharge;
      }
    }
  }

  const roundedOvercharge = Math.round(potentialPriceOvercharge * 100) / 100;

  return {
    totalInvoices: invoicesCount,
    totalInvoiceAmount: Math.round(invoicesTotal * 100) / 100,
    totalLinesProcessed: linesProcessed,
    matchedLinesCount,
    needsReviewCount,
    discrepancyCount,
    potentialPriceOvercharge: roundedOvercharge,
    duplicateInvoiceExposure: Math.round(duplicateInvoiceExposure * 100) / 100,
    duplicateInvoiceCount,
    unmatchedProductsCount,
    unmatchedTotalAmount: Math.round(unmatchedTotalAmount * 100) / 100,
    needsReviewTotalAmount: Math.round(needsReviewTotalAmount * 100) / 100,
    totalPotentialOvercharge: roundedOvercharge,
    confirmedOvercharge: Math.round(confirmedOvercharge * 100) / 100
  };
}

/**
 * Generates a clean, polite, professional supplier correction request draft email.
 */
export function generateSupplierEmailDraft(finding: DiscrepancyFinding): { subject: string; body: string } {
  const diffFormatted = finding.unitPriceDiff.toFixed(2);
  const totalDiffFormatted = finding.potentialOvercharge.toFixed(2);
  const chargedFormatted = finding.invoicedPrice.toFixed(2);
  const agreedFormatted = finding.agreedPrice.toFixed(2);

  const subject = `Billing inquiry: Invoice ${finding.invoiceNumber} - ${finding.invoiceItem.rawDescription}`;

  const body = `Dear ${finding.supplierName} Accounts Team,

We recently reviewed invoice #${finding.invoiceNumber} (dated ${finding.invoiceDate}) against our agreed pricing schedule.

We noticed the following difference:

- Product: ${finding.invoiceItem.rawDescription}
- Invoice Line Rate: $${chargedFormatted} per ${finding.invoiceItem.unit} (Quantity: ${finding.quantity} ${finding.invoiceItem.unit})
- Agreed Contract Rate: $${agreedFormatted} per ${finding.matchedAgreedProduct?.unit || finding.invoiceItem.unit} (Ref: ${finding.matchedAgreedProduct?.sku || 'Agreed Price List'})
- Variance: $${diffFormatted} per unit
- Calculated Difference: $${totalDiffFormatted}

Could you please review this invoice and let us know if a corrected invoice or credit note will be issued for $${totalDiffFormatted}?

Thank you for your assistance.

Sincerely,
Procurement & Finance Team`;

  return { subject, body };
}
