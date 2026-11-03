import fs from 'fs';

async function runEndToEndVerification() {
  console.log('=== STARTING PRICEGUARD END-TO-END WORKFLOW VERIFICATION ===');
  const baseUrl = 'http://localhost:3000';

  // 1. Health Check
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthData = await healthRes.json();
  console.log('1. Health Check:', healthData.status === 'healthy' ? 'PASS' : 'FAIL', healthData);

  // 2. Authentication: Register user
  const testEmail = `test_audit_${Date.now()}@palmgrouphospitality.com`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
      name: 'Chef Marcus Sterling',
      businessName: 'The Sterling Grill Group',
      businessType: 'Restaurant'
    })
  });
  const regData = await regRes.json();
  console.log('2. User Registration:', regData.success ? 'PASS' : 'FAIL', 'User ID:', regData.user?.id);
  const token = regData.token;

  // 3. Price List Upload & Extraction: Real XLSX file
  const xlsxBuffer = fs.readFileSync('test_fixtures/supplier_pricelist_15_items.xlsx');
  const xlsxBase64 = xlsxBuffer.toString('base64');
  const priceListRes = await fetch(`${baseUrl}/api/extract/pricelist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      fileName: 'supplier_pricelist_15_items.xlsx',
      fileData: xlsxBase64
    })
  });
  const priceListData = await priceListRes.json();
  console.log('3. XLSX Price List Extraction:', priceListData.success && priceListData.productsCount === 15 ? 'PASS' : 'FAIL', `Extracted ${priceListData.productsCount} products`);

  // 4. PDF Invoice Uploads & Extraction: 3 Real PDF Files
  const invoicesToAudit = [];

  // PDF 1
  const pdf1Buf = fs.readFileSync('test_fixtures/invoice_1_artisan_meats.pdf');
  const inv1Res = await fetch(`${baseUrl}/api/extract/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      fileName: 'invoice_1_artisan_meats.pdf',
      fileData: pdf1Buf.toString('base64'),
      mimeType: 'application/pdf'
    })
  });
  const inv1Data = await inv1Res.json();
  console.log('4a. PDF Invoice 1 Extraction:', inv1Data.success ? 'PASS' : 'FAIL', `Inv #${inv1Data.invoice?.invoiceNumber}, Lines: ${inv1Data.invoice?.lineItems.length}, Engine: ${inv1Data.method}`);
  invoicesToAudit.push(inv1Data.invoice);

  // PDF 2
  const pdf2Buf = fs.readFileSync('test_fixtures/invoice_2_pacific_coast.pdf');
  const inv2Res = await fetch(`${baseUrl}/api/extract/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      fileName: 'invoice_2_pacific_coast.pdf',
      fileData: pdf2Buf.toString('base64'),
      mimeType: 'application/pdf'
    })
  });
  const inv2Data = await inv2Res.json();
  console.log('4b. PDF Invoice 2 Extraction:', inv2Data.success ? 'PASS' : 'FAIL', `Inv #${inv2Data.invoice?.invoiceNumber}, Lines: ${inv2Data.invoice?.lineItems.length}, Engine: ${inv2Data.method}`);
  invoicesToAudit.push(inv2Data.invoice);

  // PDF 3 (Duplicate)
  const pdf3Buf = fs.readFileSync('test_fixtures/invoice_3_duplicate_artisan_meats.pdf');
  const inv3Res = await fetch(`${baseUrl}/api/extract/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      fileName: 'invoice_3_duplicate_artisan_meats.pdf',
      fileData: pdf3Buf.toString('base64'),
      mimeType: 'application/pdf'
    })
  });
  const inv3Data = await inv3Res.json();
  console.log('4c. PDF Invoice 3 (Duplicate) Extraction:', inv3Data.success ? 'PASS' : 'FAIL', `Inv #${inv3Data.invoice?.invoiceNumber}, Lines: ${inv3Data.invoice?.lineItems.length}`);
  invoicesToAudit.push(inv3Data.invoice);

  // 5. Execute Audit Comparison
  const auditRes = await fetch(`${baseUrl}/api/audit/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      title: 'Q4 Full Supplier Verification Audit',
      supplierName: 'Artisan Meats & Pacific Coast Produce',
      industry: 'restaurant',
      priceList: priceListData.products,
      invoices: invoicesToAudit
    })
  });
  const auditData = await auditRes.json();
  const summary = auditData.audit?.summary;
  console.log('5. Audit Run Summary:');
  console.log('   - Total Invoices:', summary?.totalInvoices);
  console.log('   - Total Billed:', `$${summary?.totalInvoiceAmount.toFixed(2)}`);
  console.log('   - Lines Processed:', summary?.totalLinesProcessed);
  console.log('   - Matched Lines:', summary?.matchedLinesCount);
  console.log('   - Needs Review (Unmatched/Pack):', summary?.needsReviewCount);
  console.log('   - Verified Price Overcharge (RATE ONLY):', `$${summary?.potentialPriceOvercharge?.toFixed(2)}`);
  console.log('   - Duplicate Invoice Exposure (SEPARATED):', `$${summary?.duplicateInvoiceExposure?.toFixed(2)}`);
  console.log('   - Unmatched Total Spend:', `$${summary?.unmatchedTotalAmount?.toFixed(2)}`);
  
  const findings = auditData.audit?.findings || [];
  console.log(`   - Findings Generated (${findings.length}):`);
  findings.forEach((f: any) => {
    console.log(`     * [${f.findingType}] ${f.invoiceItem.rawDescription}: Rate $${f.invoicedPrice.toFixed(2)} vs Contract $${f.agreedPrice.toFixed(2)} -> Overcharge: $${f.potentialOvercharge.toFixed(2)}`);
  });

  // Verify critical expected outcomes
  const chickenOvercharge = findings.find((f: any) => f.invoiceItem.rawDescription.includes('CHKN BRST'));
  const evooOvercharge = findings.find((f: any) => f.invoiceItem.rawDescription.includes('EVOO'));
  const dupFinding = findings.find((f: any) => f.findingType === 'duplicate_invoice');
  const unmatchedFinding = findings.find((f: any) => f.invoiceItem.rawDescription.includes('AGAVE'));

  console.log('5a. Verified Poultry Overcharge ($300.00 expected):', chickenOvercharge?.potentialOvercharge === 300 ? 'PASS' : 'FAIL', `(Actual: $${chickenOvercharge?.potentialOvercharge})`);
  console.log('5b. Verified EVOO Overcharge ($240.00 expected):', evooOvercharge?.potentialOvercharge === 240 ? 'PASS' : 'FAIL', `(Actual: $${evooOvercharge?.potentialOvercharge})`);
  console.log('5c. Verified Duplicate Invoice Detection ($4,620.00 exposure):', dupFinding ? 'PASS' : 'FAIL', `(Actual: ${dupFinding?.invoiceNumber} flagged)`);
  console.log('5d. Verified Financial Separation (Overcharge $654.00, NOT $5,274.00):', summary?.potentialPriceOvercharge === 654 && summary?.duplicateInvoiceExposure === 4620 ? 'PASS' : 'FAIL', `(Actual Rate: $${summary?.potentialPriceOvercharge}, Actual Duplicate: $${summary?.duplicateInvoiceExposure})`);
  console.log('5e. Verified Unmatched Product Detection ($0.00 overcharge):', unmatchedFinding && unmatchedFinding.potentialOvercharge === 0 ? 'PASS' : 'FAIL', `(Actual: ${unmatchedFinding?.invoiceItem.rawDescription} flagged)`);

  // 6. CSV Export Verification
  const auditId = auditData.audit.id;
  const csvRes = await fetch(`${baseUrl}/api/audits/${auditId}/export.csv`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const csvText = await csvRes.text();
  console.log('6. CSV Export Generation:', csvRes.ok && csvText.includes('CHKN BRST') && csvText.includes('300.00') ? 'PASS' : 'FAIL', `(${csvText.split('\n').length} rows)`);

  // 7. Lead Submission Persistence
  const leadRes = await fetch(`${baseUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Chef Marcus Sterling',
      email: testEmail,
      businessName: 'The Sterling Grill Group',
      businessType: 'Restaurant',
      locationsCount: '3',
      estimatedMonthlySpend: '$75,000 to $150,000',
      message: 'Interested in running this across all 3 kitchens.'
    })
  });
  const leadData = await leadRes.json();
  console.log('7. Lead Submission:', leadData.success ? 'PASS' : 'FAIL', `Lead ID: ${leadData.leadId}`);

  // 8. Audit Deletion
  const delRes = await fetch(`${baseUrl}/api/audits/${auditId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const delData = await delRes.json();
  console.log('8. Audit Deletion:', delData.success ? 'PASS' : 'FAIL');

  console.log('=== END-TO-END VERIFICATION COMPLETED SUCCESSFULLY ===');
}

runEndToEndVerification().catch(e => console.error('E2E FAILED:', e));
