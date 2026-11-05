/**
 * PriceGuard Security, Authorization, and Document Lifecycle Verification Suite
 * Tests:
 * 1. Unauthenticated access rejected with HTTP 401 across all private endpoints
 * 2. Expired session token rejected with HTTP 401
 * 3. Demo account password cannot be bypassed (strict verification enforced)
 * 4. Cross-account access forbidden (User B cannot view User A's audit)
 * 5. Cross-account deletion forbidden (User B cannot delete User A's audit)
 * 6. Sample/Demo audits protected as read-only
 * 7. Full file lifecycle: upload linked to audit, audit deletion removes disk file and DB record
 * 8. Scanned PDF detection: image PDFs without text return 422 requiring OCR, never faked
 * 9. Historical invoice effective date validation: active vs outside agreement dates
 * 10. Data safety: .gitignore excludes runtime database, WAL/SHM sidecars, and private uploads
 */

import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const BASE_URL = 'http://localhost:3000';

interface TestItem {
  id: number;
  name: string;
  category: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

async function runSecurityAndAuditTests() {
  console.log('======================================================================');
  console.log('PRICEGUARD SECURITY, AUTHORIZATION & AUDIT ENGINE VERIFICATION');
  console.log('Testing endpoint:', BASE_URL);
  console.log('======================================================================\n');

  const tests: TestItem[] = [];

  // =========================================================================
  // TEST 1: Unauthenticated access rejected across all private endpoints
  // =========================================================================
  console.log('--- Test 1: Unauthenticated access rejected (HTTP 401) ---');
  try {
    const endpoints = [
      { method: 'GET', path: '/api/auth/me', name: 'GET /api/auth/me' },
      { method: 'GET', path: '/api/audits', name: 'GET /api/audits' },
      { method: 'POST', path: '/api/audit/run', body: JSON.stringify({ priceList: [], invoices: [] }), name: 'POST /api/audit/run' },
      { method: 'GET', path: '/api/audits/sample-id-123', name: 'GET /api/audits/:id' },
      { method: 'DELETE', path: '/api/audits/sample-id-123', name: 'DELETE /api/audits/:id' },
      { method: 'GET', path: '/api/audits/sample-id-123/export.csv', name: 'GET /api/audits/:id/export.csv' }
    ];

    let allRejected = true;
    const failures: string[] = [];

    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep.path}`, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: ep.body
      });
      if (res.status !== 401) {
        allRejected = false;
        failures.push(`${ep.name} returned HTTP ${res.status} instead of 401`);
      }
    }

    if (!allRejected) {
      throw new Error(`Authentication bypass detected: ${failures.join(', ')}`);
    }

    tests.push({
      id: 1,
      name: 'Unauthenticated Access Protection',
      category: 'Authentication & Access Control',
      status: 'PASS',
      details: 'All 6 private endpoints strictly returned HTTP 401 when called without Authorization header.'
    });
    console.log('✓ Test 1 PASSED: All private endpoints strictly require valid bearer token.');
  } catch (err: any) {
    tests.push({
      id: 1,
      name: 'Unauthenticated Access Protection',
      category: 'Authentication & Access Control',
      status: 'FAIL',
      details: err.message
    });
    console.error('✗ Test 1 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 2: Expired session token rejected with HTTP 401
  // =========================================================================
  console.log('\n--- Test 2: Expired session token rejected ---');
  try {
    // Register temporary user
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `expiry_test_${Date.now()}@restaurant.com`,
        password: 'ValidPassword123!',
        name: 'Expiry Tester',
        businessName: 'Expiry Test Bistro'
      })
    });
    const regData = await regRes.json();
    const token = regData.token;

    // Directly set token expiration in SQLite to past
    const db = new DatabaseSync('./data/priceguard.db');
    db.prepare('UPDATE sessions SET expires_at = ? WHERE token = ?').run(Date.now() - 10000, token);

    // Call /api/auth/me with expired token
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (meRes.status !== 401) {
      throw new Error(`Expected HTTP 401 for expired token, got HTTP ${meRes.status}`);
    }

    tests.push({
      id: 2,
      name: 'Expired Session Invalidation',
      category: 'Session Security',
      status: 'PASS',
      details: 'Session with past expires_at was automatically invalidated and rejected with HTTP 401.'
    });
    console.log('✓ Test 2 PASSED: Expired session token strictly rejected.');
  } catch (err: any) {
    tests.push({
      id: 2,
      name: 'Expired Session Invalidation',
      category: 'Session Security',
      status: 'FAIL',
      details: err.message
    });
    console.error('✗ Test 2 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 3: Demo account password cannot be bypassed
  // =========================================================================
  console.log('\n--- Test 3: Demo account password verification ---');
  try {
    // Attempt login with invalid password for demo account
    const badLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@priceguard.audit',
        password: 'WrongPasswordShouldFail!'
      })
    });

    if (badLogin.status !== 401) {
      throw new Error(`Demo account password bypass vulnerability present: returned HTTP ${badLogin.status}`);
    }

    // Attempt login with correct password
    const goodLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@priceguard.audit',
        password: 'DemoAccess2026!'
      })
    });

    if (goodLogin.status !== 200) {
      throw new Error(`Failed to login with configured demo credentials: HTTP ${goodLogin.status}`);
    }

    tests.push({
      id: 3,
      name: 'Demo Account Password Hardening',
      category: 'Authentication Security',
      status: 'PASS',
      details: 'Password bypass removed. Incorrect passwords strictly return 401; valid PBKDF2 hash verifies.'
    });
    console.log('✓ Test 3 PASSED: Demo account password verification cannot be bypassed.');
  } catch (err: any) {
    tests.push({
      id: 3,
      name: 'Demo Account Password Hardening',
      category: 'Authentication Security',
      status: 'FAIL',
      details: err.message
    });
    console.error('✗ Test 3 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 4 & 5: Cross-account access and cross-account deletion forbidden
  // =========================================================================
  console.log('\n--- Tests 4 & 5: Cross-account isolation and unauthorized deletion ---');
  try {
    // 1. Create User Alpha
    const userARes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `alpha_${Date.now()}@hotelgroup.com`,
        password: 'PasswordAlpha123!',
        name: 'General Manager Alpha',
        businessName: 'Alpha Grand Hotel'
      })
    });
    const userA = await userARes.json();
    const tokenA = userA.token;

    // 2. Create User Beta
    const userBRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `beta_${Date.now()}@bistrogroup.com`,
        password: 'PasswordBeta123!',
        name: 'Executive Chef Beta',
        businessName: 'Beta Seafood Bistro'
      })
    });
    const userB = await userBRes.json();
    const tokenB = userB.token;

    // 3. User A creates a private audit
    const priceListA = [
      { id: 'p1', sku: 'ALPH-01', name: 'Prime Ribeye AAA', category: 'Beef', agreedPrice: 32.0, unit: 'KG', packSize: '', effectiveFrom: '2020-01-01' }
    ];
    const invoicesA = [
      {
        id: 'inv-a',
        invoiceNumber: 'INV-ALPHA-101',
        supplierName: 'Alpha Prime Provisions',
        invoiceDate: '2026-10-10',
        currency: 'USD',
        subtotal: 350.0,
        totalAmount: 350.0,
        sourceFileName: 'alpha_invoice.pdf',
        lineItems: [
          { id: 'li-1', lineIndex: 0, rawCode: 'ALPH-01', rawDescription: 'Prime Ribeye AAA', quantity: 10, unit: 'KG', invoicedUnitPrice: 35.0, lineTotal: 350.0 }
        ]
      }
    ];

    const auditARes = await fetch(`${BASE_URL}/api/audit/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        priceList: priceListA,
        invoices: invoicesA,
        title: 'Alpha Private Q3 Beef Audit',
        supplierName: 'Alpha Prime Provisions'
      })
    });
    const auditAData = await auditARes.json();
    const auditAId = auditAData.audit.id;

    // 4. Test Cross-Account Access: User B attempts to read User A's audit
    const crossReadRes = await fetch(`${BASE_URL}/api/audits/${auditAId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });

    if (crossReadRes.status !== 404) {
      throw new Error(`Cross-account access vulnerability! User B read User A audit with status ${crossReadRes.status}`);
    }

    // Verify User B's audit list does not contain User A's audit
    const listBRes = await fetch(`${BASE_URL}/api/audits`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const listBData = await listBRes.json();
    const hasAuditA = (listBData.audits || []).some((a: any) => a.id === auditAId);
    if (hasAuditA) {
      throw new Error(`Data leakage! User A audit appeared in User B audit list.`);
    }

    tests.push({
      id: 4,
      name: 'Cross-Account Data Isolation',
      category: 'Authorization & Multi-Tenancy',
      status: 'PASS',
      details: 'User B blocked from viewing User A audit (HTTP 404); audit list completely isolated.'
    });
    console.log('✓ Test 4 PASSED: Cross-account reading strictly blocked (HTTP 404).');

    // 5. Test Cross-Account Deletion: User B attempts to delete User A's audit
    const crossDeleteRes = await fetch(`${BASE_URL}/api/audits/${auditAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });

    if (crossDeleteRes.status !== 404) {
      throw new Error(`Cross-account deletion vulnerability! User B deleted User A audit with status ${crossDeleteRes.status}`);
    }

    // Confirm audit still exists for User A
    const verifyExistsRes = await fetch(`${BASE_URL}/api/audits/${auditAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (verifyExistsRes.status !== 200) {
      throw new Error('Audit was improperly deleted or damaged by cross-account request.');
    }

    tests.push({
      id: 5,
      name: 'Cross-Account Deletion Prevention',
      category: 'Authorization & Multi-Tenancy',
      status: 'PASS',
      details: 'User B blocked from deleting User A audit (HTTP 404); User A record preserved intact.'
    });
    console.log('✓ Test 5 PASSED: Unauthorized cross-account deletion strictly prevented.');

    // 6. Test Demo Sample Deletion: User A attempts to delete sample-restaurant-session
    const deleteSampleRes = await fetch(`${BASE_URL}/api/audits/sample-restaurant-session`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    if (deleteSampleRes.status !== 404) {
      throw new Error(`Sample audit deletion was not blocked: returned HTTP ${deleteSampleRes.status}`);
    }

    tests.push({
      id: 6,
      name: 'Read-Only Demo Sample Protection',
      category: 'Data Integrity',
      status: 'PASS',
      details: 'Sample audits are protected from deletion (HTTP 404).'
    });
    console.log('✓ Test 6 PASSED: Demo sample audits are read-only and protected from deletion.');
  } catch (err: any) {
    tests.push({
      id: 4,
      name: 'Cross-Account Data Isolation',
      category: 'Authorization & Multi-Tenancy',
      status: 'FAIL',
      details: err.message
    });
    tests.push({
      id: 5,
      name: 'Cross-Account Deletion Prevention',
      category: 'Authorization & Multi-Tenancy',
      status: 'FAIL',
      details: err.message
    });
    tests.push({
      id: 6,
      name: 'Read-Only Demo Sample Protection',
      category: 'Data Integrity',
      status: 'FAIL',
      details: err.message
    });
    console.error('✗ Tests 4/5/6 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 7: File lifecycle & audit deletion cleanup
  // =========================================================================
  console.log('\n--- Test 7: File lifecycle and cascading deletion ---');
  try {
    // 1. Register test user
    const userRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `file_lifecycle_${Date.now()}@bistro.com`,
        password: 'SecurePassword123!',
        name: 'File Manager',
        businessName: 'Coastal Hospitality'
      })
    });
    const user = await userRes.json();
    const token = user.token;

    // 2. Upload and extract invoice PDF
    const dummyPdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 200 >>
stream
BT
/F1 12 Tf
72 712 Td
(Supplier: Cascade Meats LLC) Tj
0 -18 Td
(Invoice Number: INV-CASCADE-7788) Tj
0 -18 Td
(Invoice Date: 2026-10-15) Tj
0 -18 Td
(BEEF-90 | Chuck Roast Bulk | 10 | KG | 12.00 | 120.00) Tj
0 -18 Td
(Total Amount: $120.00) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
466
%%EOF`;

    const base64Pdf = Buffer.from(dummyPdfContent).toString('base64');
    const extractRes = await fetch(`${BASE_URL}/api/extract/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        fileData: base64Pdf,
        fileName: 'Cascade_Meats_INV_7788.pdf',
        mimeType: 'application/pdf'
      })
    });

    const extractData = await extractRes.json();
    if (!extractData.success || !extractData.fileId) {
      throw new Error(`File extraction did not register fileId: ${JSON.stringify(extractData)}`);
    }

    const uploadedFileId = extractData.fileId;
    const extractedInvoice = extractData.invoice;

    // Verify file exists on disk
    const db = new DatabaseSync('./data/priceguard.db');
    const fileRow = db.prepare('SELECT storage_path FROM uploaded_files WHERE id = ?').get(uploadedFileId) as any;
    if (!fileRow || !fs.existsSync(fileRow.storage_path)) {
      throw new Error(`Uploaded file not written to disk at: ${fileRow?.storage_path}`);
    }

    // 3. Run audit passing fileIds
    const auditRes = await fetch(`${BASE_URL}/api/audit/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        priceList: [
          { id: 'p1', sku: 'BEEF-90', name: 'Chuck Roast Bulk', category: 'Beef', agreedPrice: 10.0, unit: 'KG', packSize: '', effectiveFrom: '2020-01-01' }
        ],
        invoices: [extractedInvoice],
        title: 'Cascade Meats Audit',
        supplierName: 'Cascade Meats LLC',
        fileIds: [uploadedFileId]
      })
    });

    const auditData = await auditRes.json();
    const auditId = auditData.audit.id;

    // Verify file is linked to audit_id in DB
    const linkedRow = db.prepare('SELECT audit_id FROM uploaded_files WHERE id = ?').get(uploadedFileId) as any;
    if (linkedRow.audit_id !== auditId) {
      throw new Error(`File ${uploadedFileId} was not linked to audit ${auditId}; got ${linkedRow.audit_id}`);
    }

    // 4. Delete the audit
    const deleteRes = await fetch(`${BASE_URL}/api/audits/${auditId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!deleteRes.ok) {
      throw new Error(`Audit deletion failed: HTTP ${deleteRes.status}`);
    }

    // Verify physical file was unlinked from disk
    if (fs.existsSync(fileRow.storage_path)) {
      throw new Error(`Physical file was NOT removed from disk upon audit deletion: ${fileRow.storage_path}`);
    }

    // Verify uploaded_files record was removed from DB
    const fileStillInDb = db.prepare('SELECT id FROM uploaded_files WHERE id = ?').get(uploadedFileId);
    if (fileStillInDb) {
      throw new Error(`Record for ${uploadedFileId} remains in uploaded_files table.`);
    }

    tests.push({
      id: 7,
      name: 'File Lifecycle & Cascade Deletion',
      category: 'File Storage & Privacy',
      status: 'PASS',
      details: 'Upload registered fileId, linked to auditId, and deleting audit removed both disk file and database record.'
    });
    console.log('✓ Test 7 PASSED: Uploaded files strictly linked to audit and deleted from disk upon audit removal.');
  } catch (err: any) {
    tests.push({
      id: 7,
      name: 'File Lifecycle & Cascade Deletion',
      category: 'File Storage & Privacy',
      status: 'FAIL',
      details: err.message
    });
    console.error('✗ Test 7 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 8: Scanned PDF detection
  // =========================================================================
  console.log('\n--- Test 8: Scanned PDF detection (no fake OCR) ---');
  try {
    // PDF with zero text (image only placeholder)
    const emptyPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer << /Size 4 /Root 1 0 R >>
startxref
193
%%EOF`;

    const base64Empty = Buffer.from(emptyPdf).toString('base64');
    const scanRes = await fetch(`${BASE_URL}/api/extract/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: base64Empty,
        fileName: 'scanned_paper_invoice.pdf',
        mimeType: 'application/pdf'
      })
    });

    const scanData = await scanRes.json();
    if (scanRes.status !== 422 || !scanData.isScannedDocument) {
      throw new Error(`Scanned document was not identified: HTTP ${scanRes.status}, data: ${JSON.stringify(scanData)}`);
    }

    tests.push({
      id: 8,
      name: 'Scanned Document OCR Detection',
      category: 'Document Extraction',
      status: 'PASS',
      details: 'Non-text PDF accurately detected as scanned document (HTTP 422); reports OCR requirement truthfully.'
    });
    console.log('✓ Test 8 PASSED: Scanned non-text PDF flagged with HTTP 422, never returning faked success.');
  } catch (err: any) {
    tests.push({
      id: 8,
      name: 'Scanned Document OCR Detection',
      category: 'Document Extraction',
      status: 'FAIL',
      details: err.message
    });
    console.error('✗ Test 8 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 9: Historical invoice effective date validation
  // =========================================================================
  console.log('\n--- Test 9: Historical invoice effective date validation ---');
  try {
    // Register user for test
    const userRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `date_test_${Date.now()}@resort.com`,
        password: 'SecurePassword123!',
        name: 'Procurement Director',
        businessName: 'Highland Resort'
      })
    });
    const user = await userRes.json();
    const token = user.token;

    // Price list valid ONLY from 2026-06-01 to 2026-12-31
    const priceListWithDates = [
      {
        id: 'p-date',
        sku: 'DAIR-50',
        name: 'Organic Butter Solid 25kg',
        category: 'Dairy',
        agreedPrice: 180.0,
        unit: 'CASE',
        packSize: '',
        effectiveFrom: '2026-06-01',
        effectiveTo: '2026-12-31'
      }
    ];

    // Invoice dated BEFORE effective start date (2026-03-15)
    const earlyInvoice = {
      id: 'inv-early',
      invoiceNumber: 'INV-EARLY-001',
      supplierName: 'Dairy Fresh Wholesale',
      invoiceDate: '2026-03-15', // PRIOR to agreement effective date
      currency: 'USD',
      subtotal: 210.0,
      totalAmount: 210.0,
      sourceFileName: 'early_invoice.pdf',
      lineItems: [
        { id: 'li-1', lineIndex: 0, rawCode: 'DAIR-50', rawDescription: 'Organic Butter Solid 25kg', quantity: 1, unit: 'CASE', invoicedUnitPrice: 210.0, lineTotal: 210.0 }
      ]
    };

    // Invoice dated DURING effective agreement (2026-08-15)
    const validInvoice = {
      id: 'inv-valid',
      invoiceNumber: 'INV-VALID-002',
      supplierName: 'Dairy Fresh Wholesale',
      invoiceDate: '2026-08-15', // WITHIN agreement window
      currency: 'USD',
      subtotal: 210.0,
      totalAmount: 210.0,
      sourceFileName: 'valid_invoice.pdf',
      lineItems: [
        { id: 'li-1', lineIndex: 0, rawCode: 'DAIR-50', rawDescription: 'Organic Butter Solid 25kg', quantity: 1, unit: 'CASE', invoicedUnitPrice: 210.0, lineTotal: 210.0 }
      ]
    };

    const auditRes = await fetch(`${BASE_URL}/api/audit/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        priceList: priceListWithDates,
        invoices: [earlyInvoice, validInvoice],
        title: 'Butter Contract Date Audit',
        supplierName: 'Dairy Fresh Wholesale'
      })
    });

    const auditData = await auditRes.json();
    const findings = auditData.audit.findings;

    // Finding for early invoice: should be flagged with held overcharge ($0.00)
    const earlyFinding = findings.find((f: any) => f.invoiceNumber === 'INV-EARLY-001');
    if (!earlyFinding || earlyFinding.potentialOvercharge !== 0 || !earlyFinding.evidence.calculationExplanation.includes('prior to contract effective date')) {
      throw new Error(`Early invoice finding failed date check: ${JSON.stringify(earlyFinding)}`);
    }

    // Finding for valid invoice: confirmed rate overcharge of $30.00
    const validFinding = findings.find((f: any) => f.invoiceNumber === 'INV-VALID-002');
    if (!validFinding || validFinding.potentialOvercharge !== 30.0 || validFinding.findingType !== 'price_mismatch') {
      throw new Error(`Active invoice finding failed overcharge calculation: ${JSON.stringify(validFinding)}`);
    }

    tests.push({
      id: 9,
      name: 'Agreement Effective Date Validation',
      category: 'Audit Calculations',
      status: 'PASS',
      details: 'Historical invoice prior to agreement effective date held at $0.00; invoice within window accurately audited.'
    });
    console.log('✓ Test 9 PASSED: Historical invoice date comparisons respect applicable agreement periods.');
  } catch (err: any) {
    tests.push({
      id: 9,
      name: 'Agreement Effective Date Validation',
      category: 'Audit Calculations',
      status: 'FAIL',
      details: err.message
    });
    console.error('✗ Test 9 FAILED:', err.message);
  }

  // =========================================================================
  // TEST 10: Data safety and .gitignore exclusion
  // =========================================================================
  console.log('\n--- Test 10: Public repository data safety & .gitignore ---');
  try {
    const gitignoreContent = fs.readFileSync('./.gitignore', 'utf8');

    const requiredExclusions = ['data/', '*.db', '*.db-wal', '*.db-shm', 'private_uploads/'];
    const missing = requiredExclusions.filter(item => !gitignoreContent.includes(item));

    if (missing.length > 0) {
      throw new Error(`.gitignore missing essential security exclusions: ${missing.join(', ')}`);
    }

    // Confirm no unencrypted json credentials/leads remain in repo
    const legacyFiles = ['./data/audits.json', './data/leads.json', './data/sessions.json', './data/users.json'];
    const remaining = legacyFiles.filter(f => fs.existsSync(f));
    if (remaining.length > 0) {
      throw new Error(`Legacy sensitive JSON files still present: ${remaining.join(', ')}`);
    }

    tests.push({
      id: 10,
      name: 'Repository Data Safety & Secret Exclusion',
      category: 'Data Protection & Security',
      status: 'PASS',
      details: '.gitignore excludes data/, *.db, WAL/SHM sidecars, and private uploads; legacy JSON files removed.'
    });
    console.log('✓ Test 10 PASSED: Database, sidecar files, and private customer uploads excluded from version control.');
  } catch (err: any) {
    tests.push({
      id: 10,
      name: 'Repository Data Safety & Secret Exclusion',
      category: 'Data Protection & Security',
      status: 'FAIL',
      details: err.message
    });
    console.error('✗ Test 10 FAILED:', err.message);
  }

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log('\n======================================================================');
  console.log('SECURITY & AUDIT FIXES VERIFICATION SUMMARY');
  console.log('======================================================================');
  const allPassed = tests.every(t => t.status === 'PASS');
  tests.forEach(t => {
    console.log(`[${t.status}] Test ${t.id} (${t.category}): ${t.name}`);
    console.log(`       ${t.details}`);
  });
  console.log('======================================================================');
  console.log(`FINAL RESULT: ${allPassed ? 'ALL 10 VERIFICATION TESTS PASSED' : 'TEST FAILURES DETECTED'}`);
  console.log('======================================================================');

  return { allPassed, tests };
}

runSecurityAndAuditTests().then(({ allPassed }) => {
  process.exit(allPassed ? 0 : 1);
}).catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
