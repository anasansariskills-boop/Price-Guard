import React, { useState, useMemo } from 'react';
import {
  RESTAURANT_PRICELIST,
  RESTAURANT_INVOICES,
  HOTEL_PRICELIST,
  HOTEL_INVOICES
} from '../fixtures/sampleAudits';
import {
  AgreedProduct,
  InvoiceDocument,
  DiscrepancyFinding,
  AuditSummary,
  FindingStatus
} from '../types';
import {
  runInvoiceAudit,
  recalculateAuditSummary,
  generateSupplierEmailDraft
} from '../utils/auditEngine';

interface DemoDashboardProps {
  initialIndustry?: 'restaurant' | 'hotel';
  onNavigateHome: () => void;
  onRequestReview: () => void;
  onIndustryChange?: (ind: 'restaurant' | 'hotel') => void;
}

export const DemoDashboard: React.FC<DemoDashboardProps> = ({
  initialIndustry = 'restaurant',
  onNavigateHome,
  onRequestReview,
  onIndustryChange
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<'restaurant' | 'hotel'>(initialIndustry);

  // In-memory editable working copies of invoices and price list for live comparison
  const [invoices, setInvoices] = useState<InvoiceDocument[]>(() => {
    const source = initialIndustry === 'restaurant' ? RESTAURANT_INVOICES : HOTEL_INVOICES;
    return JSON.parse(JSON.stringify(source));
  });

  const [priceList, setPriceList] = useState<AgreedProduct[]>(() => {
    const source = initialIndustry === 'restaurant' ? RESTAURANT_PRICELIST : HOTEL_PRICELIST;
    return JSON.parse(JSON.stringify(source));
  });

  // Current audit calculation state
  const initialAuditResult = useMemo(() => {
    return runInvoiceAudit(priceList, invoices);
  }, [priceList, invoices]);

  const [findings, setFindings] = useState<DiscrepancyFinding[]>(initialAuditResult.findings);
  const [summary, setSummary] = useState<AuditSummary>(initialAuditResult.summary);

  // UI state
  const [activeTab, setActiveTab] = useState<'findings' | 'scenario' | 'invoices' | 'pricelist'>('findings');
  const [selectedFindingFilter, setSelectedFindingFilter] = useState<'all' | 'overcharge' | 'duplicate' | 'review'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('all');
  
  // Modals state
  const [evidenceFinding, setEvidenceFinding] = useState<DiscrepancyFinding | null>(null);
  const [emailFinding, setEmailFinding] = useState<DiscrepancyFinding | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [recalcBanner, setRecalcBanner] = useState<string | null>(null);

  // Live Scenario Editor State
  const [scenarioInvoiceId, setScenarioInvoiceId] = useState<string>('');
  const [scenarioLineIndex, setScenarioLineIndex] = useState<number>(0);
  const [scenarioPrice, setScenarioPrice] = useState<string>('');
  const [scenarioQty, setScenarioQty] = useState<string>('');

  // Switch industry handler
  const handleSwitchIndustry = (ind: 'restaurant' | 'hotel') => {
    setSelectedIndustry(ind);
    if (onIndustryChange) onIndustryChange(ind);

    const newInvoices: InvoiceDocument[] = JSON.parse(
      JSON.stringify(ind === 'restaurant' ? RESTAURANT_INVOICES : HOTEL_INVOICES)
    );
    const newPriceList: AgreedProduct[] = JSON.parse(
      JSON.stringify(ind === 'restaurant' ? RESTAURANT_PRICELIST : HOTEL_PRICELIST)
    );

    setInvoices(newInvoices);
    setPriceList(newPriceList);

    const result = runInvoiceAudit(newPriceList, newInvoices);
    setFindings(result.findings);
    setSummary(result.summary);
    setSelectedInvoiceId('all');
    setRecalcBanner(null);
  };

  // Reset demo back to baseline
  const handleResetDemo = () => {
    const freshInvoices: InvoiceDocument[] = JSON.parse(
      JSON.stringify(selectedIndustry === 'restaurant' ? RESTAURANT_INVOICES : HOTEL_INVOICES)
    );
    const freshPriceList: AgreedProduct[] = JSON.parse(
      JSON.stringify(selectedIndustry === 'restaurant' ? RESTAURANT_PRICELIST : HOTEL_PRICELIST)
    );

    setInvoices(freshInvoices);
    setPriceList(freshPriceList);

    const result = runInvoiceAudit(freshPriceList, freshInvoices);
    setFindings(result.findings);
    setSummary(result.summary);
    setRecalcBanner('Demo reset to initial baseline sample data.');
    setTimeout(() => setRecalcBanner(null), 3000);
  };

  // Toggle finding status (Reviewed / Dismissed / Potential)
  const handleUpdateFindingStatus = (findingId: string, nextStatus: FindingStatus) => {
    const updated = findings.map(f => {
      if (f.id === findingId) {
        return { ...f, status: nextStatus };
      }
      return f;
    });

    setFindings(updated);

    const newSummary = recalculateAuditSummary(
      updated,
      summary.totalInvoices,
      summary.totalInvoiceAmount,
      summary.totalLinesProcessed
    );
    setSummary(newSummary);
  };

  // Live Scenario comparison executor
  const handleRunScenario = (e: React.FormEvent) => {
    e.preventDefault();
    const invIndex = invoices.findIndex(i => i.id === scenarioInvoiceId);
    if (invIndex === -1) return;

    const parsedPrice = parseFloat(scenarioPrice);
    const parsedQty = parseFloat(scenarioQty);

    if (isNaN(parsedPrice) || isNaN(parsedQty) || parsedPrice < 0 || parsedQty < 0) {
      alert('Please enter valid positive numbers for price and quantity.');
      return;
    }

    // Clone invoices and apply edit
    const updatedInvoices: InvoiceDocument[] = JSON.parse(JSON.stringify(invoices));
    const targetLine = updatedInvoices[invIndex].lineItems[scenarioLineIndex];
    if (!targetLine) return;

    targetLine.invoicedUnitPrice = parsedPrice;
    targetLine.quantity = parsedQty;
    targetLine.lineTotal = Math.round(parsedPrice * parsedQty * 100) / 100;

    // Recalculate invoice total
    updatedInvoices[invIndex].totalAmount = updatedInvoices[invIndex].lineItems.reduce(
      (sum, li) => sum + li.lineTotal,
      0
    );

    setInvoices(updatedInvoices);

    // Run deterministic audit engine live
    const result = runInvoiceAudit(priceList, updatedInvoices);
    setFindings(result.findings);
    setSummary(result.summary);

    setRecalcBanner(
      `Audit recalculation completed. Tested ${targetLine.rawDescription} at $${parsedPrice.toFixed(2)} x ${parsedQty}.`
    );
    setActiveTab('findings');
    setTimeout(() => setRecalcBanner(null), 4500);
  };

  // Initialize scenario selection when opening scenario tab or clicking "Test Line"
  const handleOpenScenarioForLine = (invoiceId: string, lineIndex: number) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv || !inv.lineItems[lineIndex]) return;
    const item = inv.lineItems[lineIndex];

    setScenarioInvoiceId(invoiceId);
    setScenarioLineIndex(lineIndex);
    setScenarioPrice(item.invoicedUnitPrice.toString());
    setScenarioQty(item.quantity.toString());
    setActiveTab('scenario');
  };

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = [
      'Demo Notice',
      'Invoice Number',
      'Supplier',
      'Invoice Item Description',
      'Agreed SKU',
      'Agreed Product Name',
      'Agreed Unit Rate',
      'Billed Unit Rate',
      'Quantity',
      'Unit',
      'Unit Difference',
      'Potential Overcharge',
      'Category',
      'Status',
      'Calculation Formula'
    ];

    const rows = findings.map(f => [
      'PriceGuard Demonstration Report (Fictional Data)',
      f.invoiceNumber,
      `"${f.supplierName.replace(/"/g, '""')}"`,
      `"${f.invoiceItem.rawDescription.replace(/"/g, '""')}"`,
      f.matchedAgreedProduct?.sku || 'N/A',
      `"${(f.matchedAgreedProduct?.name || 'Unmatched').replace(/"/g, '""')}"`,
      f.agreedPrice.toFixed(2),
      f.invoicedPrice.toFixed(2),
      f.quantity,
      f.invoiceItem.unit,
      f.unitPriceDiff.toFixed(2),
      f.potentialOvercharge.toFixed(2),
      f.findingType,
      f.status,
      `"${f.evidence.calculationExplanation.replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `PriceGuard_Demo_Audit_${selectedIndustry}_Report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered findings list
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      // Type filter
      if (selectedFindingFilter === 'overcharge') {
        if (f.findingType !== 'price_mismatch') return false;
      } else if (selectedFindingFilter === 'duplicate') {
        if (f.findingType !== 'duplicate_invoice') return false;
      } else if (selectedFindingFilter === 'review') {
        if (
          f.findingType !== 'unmatched_product' &&
          f.findingType !== 'potential_mismatch' &&
          f.findingType !== 'pack_size_discrepancy'
        )
          return false;
      }

      // Invoice filter
      if (selectedInvoiceId !== 'all' && f.invoiceId !== selectedInvoiceId) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const desc = f.invoiceItem.rawDescription.toLowerCase();
        const supp = f.supplierName.toLowerCase();
        const invNum = f.invoiceNumber.toLowerCase();
        const sku = (f.matchedAgreedProduct?.sku || '').toLowerCase();
        if (
          !desc.includes(q) &&
          !supp.includes(q) &&
          !invNum.includes(q) &&
          !sku.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [findings, selectedFindingFilter, selectedInvoiceId, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202923] flex flex-col font-sans">
      {/* Top Demo Header */}
      <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-xs border-b border-[#E1E3DD]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="text-xl font-bold tracking-tight text-[#214B3D] hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
            >
              PriceGuard
            </button>
            <span className="hidden sm:inline-block text-xs font-medium text-[#202923]/40">
              /
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold text-[#202923]/70 uppercase tracking-wider">
              Interactive Product Demo
            </span>
          </div>

          {/* Industry Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-md border border-[#E1E3DD] shadow-2xs">
            <button
              onClick={() => handleSwitchIndustry('restaurant')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                selectedIndustry === 'restaurant'
                  ? 'bg-[#214B3D] text-white font-semibold shadow-xs'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              Restaurant (F&B)
            </button>
            <button
              onClick={() => handleSwitchIndustry('hotel')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                selectedIndustry === 'hotel'
                  ? 'bg-[#214B3D] text-white font-semibold shadow-xs'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              Hotel (Linen & Supplies)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDemo}
              className="hidden md:inline-flex px-3 py-1.5 text-xs font-medium text-[#202923]/80 hover:text-[#202923] bg-white border border-[#E1E3DD] rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              Reset Demo
            </button>

            <button
              onClick={onNavigateHome}
              className="hidden lg:inline-flex text-xs font-medium text-[#202923]/70 hover:text-[#214B3D] transition-colors cursor-pointer"
            >
              ← Back to Website
            </button>

            <button
              onClick={onRequestReview}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              Request an Invoice Review
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8 text-left">
        {/* Reassuring Subhead & Context Notice */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-white border border-[#E1E3DD] shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#214B3D]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#214B3D]">
                Interactive Audit Workspace
              </span>
              <span className="text-xs text-[#202923]/50">
                · {selectedIndustry === 'restaurant' ? 'The Brass Palm Group (3 Locations)' : 'The Grandview Hotel & Suites (140 Rooms)'}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#202923]/75">
              Interactive demonstration using fictional data. No registration, login, or document uploads required.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-medium text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] border border-[#E1E3DD] rounded-md transition-colors cursor-pointer"
            >
              Export CSV Report
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] border border-[#E1E3DD] rounded-md transition-colors cursor-pointer"
            >
              Print Summary
            </button>
          </div>
        </div>

        {/* Live Notification Banner */}
        {recalcBanner && (
          <div className="p-3.5 bg-[#F2F5F0] border border-[#214B3D]/30 rounded-md text-xs font-medium text-[#214B3D] flex items-center justify-between">
            <span>{recalcBanner}</span>
            <button
              onClick={() => setRecalcBanner(null)}
              className="text-[#202923]/50 hover:text-[#202923] p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Financial Metrics Cards (Strict Category Separation) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Invoiced */}
          <div className="p-5 bg-white rounded-lg border border-[#E1E3DD] shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#202923]/60">
              Total Invoiced Amount
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#202923]">
              ${summary.totalInvoiceAmount.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#202923]/60">
              Across {summary.totalInvoices} invoices ({summary.totalLinesProcessed} line items)
            </div>
          </div>

          {/* Card 2: Verified Rate Overcharges */}
          <div className="p-5 bg-white rounded-lg border border-[#A7443E]/30 bg-[#FBF1F0]/40 shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A7443E] flex items-center justify-between">
              <span>Potential Rate Overcharges</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#A7443E]/10 rounded-xs">Verified</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#A7443E]">
              ${summary.potentialPriceOvercharge.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#202923]/60">
              {summary.discrepancyCount} verified unit price discrepancies
            </div>
          </div>

          {/* Card 3: Duplicate Invoice Exposure (Separated) */}
          <div className="p-5 bg-white rounded-lg border border-[#BE825B]/30 bg-[#FAF4ED]/50 shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#BE825B] flex items-center justify-between">
              <span>Duplicate Invoice Exposure</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#BE825B]/15 rounded-xs">Separated</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#BE825B]">
              ${summary.duplicateInvoiceExposure.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#202923]/60">
              {summary.duplicateInvoiceCount} duplicate invoice submissions
            </div>
          </div>

          {/* Card 4: Items Requiring Review */}
          <div className="p-5 bg-white rounded-lg border border-[#E1E3DD] shadow-2xs space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#202923]/60">
              Items Requiring Review
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#202923]">
              {summary.needsReviewCount} Items
            </div>
            <div className="text-[11px] text-[#202923]/60">
              {summary.unmatchedProductsCount} unmatched catalog, pack size variances
            </div>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="border-b border-[#E1E3DD] flex items-center justify-between gap-4 overflow-x-auto">
          <nav className="flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('findings')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'findings'
                  ? 'border-[#214B3D] text-[#214B3D]'
                  : 'border-transparent text-[#202923]/60 hover:text-[#202923]'
              }`}
            >
              Audit Findings ({findings.length})
            </button>

            <button
              onClick={() => {
                if (!scenarioInvoiceId && invoices.length > 0) {
                  setScenarioInvoiceId(invoices[0].id);
                  setScenarioLineIndex(0);
                  setScenarioPrice(invoices[0].lineItems[0].invoicedUnitPrice.toString());
                  setScenarioQty(invoices[0].lineItems[0].quantity.toString());
                }
                setActiveTab('scenario');
              }}
              className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'scenario'
                  ? 'border-[#214B3D] text-[#214B3D]'
                  : 'border-transparent text-[#202923]/60 hover:text-[#202923]'
              }`}
            >
              <span>Test a Scenario (Live Recalculation)</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-[#214B3D]/10 text-[#214B3D] rounded-xs font-medium">
                Interactive
              </span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'border-[#214B3D] text-[#214B3D]'
                  : 'border-transparent text-[#202923]/60 hover:text-[#202923]'
              }`}
            >
              Audited Invoices ({invoices.length})
            </button>

            <button
              onClick={() => setActiveTab('pricelist')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'pricelist'
                  ? 'border-[#214B3D] text-[#214B3D]'
                  : 'border-transparent text-[#202923]/60 hover:text-[#202923]'
              }`}
            >
              Contract Price List ({priceList.length})
            </button>
          </nav>
        </div>

        {/* TAB 1: FINDINGS TABLE & FILTERS */}
        {activeTab === 'findings' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#202923]/60 font-medium">Category:</span>
                <button
                  onClick={() => setSelectedFindingFilter('all')}
                  className={`px-2.5 py-1 rounded-sm border cursor-pointer transition-colors ${
                    selectedFindingFilter === 'all'
                      ? 'bg-[#214B3D] text-white border-[#214B3D]'
                      : 'bg-white text-[#202923]/70 border-[#E1E3DD] hover:text-[#202923]'
                  }`}
                >
                  All Findings ({findings.length})
                </button>
                <button
                  onClick={() => setSelectedFindingFilter('overcharge')}
                  className={`px-2.5 py-1 rounded-sm border cursor-pointer transition-colors ${
                    selectedFindingFilter === 'overcharge'
                      ? 'bg-[#A7443E] text-white border-[#A7443E]'
                      : 'bg-white text-[#202923]/70 border-[#E1E3DD] hover:text-[#202923]'
                  }`}
                >
                  Rate Overcharges ({summary.discrepancyCount})
                </button>
                <button
                  onClick={() => setSelectedFindingFilter('duplicate')}
                  className={`px-2.5 py-1 rounded-sm border cursor-pointer transition-colors ${
                    selectedFindingFilter === 'duplicate'
                      ? 'bg-[#BE825B] text-white border-[#BE825B]'
                      : 'bg-white text-[#202923]/70 border-[#E1E3DD] hover:text-[#202923]'
                  }`}
                >
                  Duplicates ({summary.duplicateInvoiceCount})
                </button>
                <button
                  onClick={() => setSelectedFindingFilter('review')}
                  className={`px-2.5 py-1 rounded-sm border cursor-pointer transition-colors ${
                    selectedFindingFilter === 'review'
                      ? 'bg-[#202923] text-white border-[#202923]'
                      : 'bg-white text-[#202923]/70 border-[#E1E3DD] hover:text-[#202923]'
                  }`}
                >
                  Needs Review ({summary.needsReviewCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedInvoiceId}
                  onChange={e => setSelectedInvoiceId(e.target.value)}
                  className="p-1.5 bg-white border border-[#E1E3DD] rounded-sm text-xs text-[#202923]"
                >
                  <option value="all">All Invoices</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.supplierName}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search item, SKU, supplier..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="p-1.5 bg-white border border-[#E1E3DD] rounded-sm text-xs text-[#202923] w-48 focus:outline-hidden focus:border-[#214B3D]"
                />
              </div>
            </div>

            {/* Findings Table */}
            <div className="border border-[#E1E3DD] rounded-lg overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F7F3] border-b border-[#E1E3DD] text-[#202923]/70 font-semibold">
                      <th className="py-3 px-4">Invoice Line / Supplier</th>
                      <th className="py-3 px-4">Agreed Product (Catalog)</th>
                      <th className="py-3 px-4 text-right">Agreed Rate</th>
                      <th className="py-3 px-4 text-right">Billed Rate</th>
                      <th className="py-3 px-4 text-right">Qty</th>
                      <th className="py-3 px-4 text-right">Discrepancy</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E3DD]">
                    {filteredFindings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#202923]/50">
                          No findings match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredFindings.map(f => {
                        const isOver = f.findingType === 'price_mismatch';
                        const isDup = f.findingType === 'duplicate_invoice';
                        const isReview =
                          f.findingType === 'unmatched_product' ||
                          f.findingType === 'potential_mismatch' ||
                          f.findingType === 'pack_size_discrepancy';

                        return (
                          <tr key={f.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                            {/* Invoice Line / Supplier */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#202923]">
                                {f.invoiceItem.rawDescription}
                              </div>
                              <div className="text-[11px] text-[#202923]/60">
                                {f.invoiceNumber} · {f.supplierName}
                              </div>
                            </td>

                            {/* Agreed Catalog */}
                            <td className="py-3 px-4">
                              {f.matchedAgreedProduct ? (
                                <div>
                                  <span className="font-medium text-[#202923]">
                                    {f.matchedAgreedProduct.name}
                                  </span>
                                  <span className="text-[11px] font-mono text-[#202923]/60 block">
                                    SKU: {f.matchedAgreedProduct.sku}
                                  </span>
                                </div>
                              ) : isDup ? (
                                <span className="font-medium text-[#BE825B]">
                                  Duplicate Document Submission
                                </span>
                              ) : (
                                <span className="text-[#202923]/50 italic">
                                  Not in agreed price schedule
                                </span>
                              )}
                            </td>

                            {/* Agreed Rate */}
                            <td className="py-3 px-4 text-right font-mono">
                              {f.agreedPrice > 0 ? (
                                <span className="text-[#214B3D] font-semibold">
                                  ${f.agreedPrice.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-[#202923]/40">-</span>
                              )}
                            </td>

                            {/* Billed Rate */}
                            <td className="py-3 px-4 text-right font-mono font-semibold text-[#202923]">
                              ${f.invoicedPrice.toFixed(2)}
                            </td>

                            {/* Quantity */}
                            <td className="py-3 px-4 text-right font-mono">
                              {f.quantity} {f.invoiceItem.unit}
                            </td>

                            {/* Discrepancy Amount */}
                            <td className="py-3 px-4 text-right font-mono font-bold">
                              {isOver ? (
                                <span className="text-[#A7443E]">
                                  +${f.potentialOvercharge.toFixed(2)}
                                </span>
                              ) : isDup ? (
                                <span className="text-[#BE825B]">
                                  +${f.potentialOvercharge.toFixed(2)} (dup)
                                </span>
                              ) : isReview ? (
                                <span className="text-[#202923]/70 font-normal">
                                  Needs Review
                                </span>
                              ) : (
                                <span className="text-[#214B3D]">$0.00</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4 text-center">
                              {f.status === 'confirmed' ? (
                                <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 rounded-xs">
                                  Confirmed
                                </span>
                              ) : f.status === 'dismissed' ? (
                                <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-600 bg-gray-100 rounded-xs">
                                  Dismissed
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-semibold text-[#A7443E] bg-[#FBF1F0] rounded-xs">
                                  Action Needed
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => setEvidenceFinding(f)}
                                  className="px-2 py-1 text-[11px] font-medium text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] border border-[#E1E3DD] rounded-xs cursor-pointer"
                                  title="View exact calculation proof"
                                >
                                  Proof
                                </button>

                                {isOver && (
                                  <button
                                    onClick={() => setEmailFinding(f)}
                                    className="px-2 py-1 text-[11px] font-medium text-[#214B3D] bg-[#F2F5F0] hover:bg-[#E7EDE5] border border-[#214B3D]/30 rounded-xs cursor-pointer"
                                    title="Draft polite supplier email"
                                  >
                                    Email
                                  </button>
                                )}

                                {!isDup && (
                                  <button
                                    onClick={() =>
                                      handleOpenScenarioForLine(f.invoiceId, f.lineIndex)
                                    }
                                    className="px-2 py-1 text-[11px] font-medium text-[#202923]/70 hover:text-[#202923] border border-[#E1E3DD] rounded-xs cursor-pointer"
                                    title="Edit price/qty to test scenario"
                                  >
                                    Edit
                                  </button>
                                )}

                                {f.status !== 'dismissed' ? (
                                  <button
                                    onClick={() =>
                                      handleUpdateFindingStatus(f.id, 'dismissed')
                                    }
                                    className="px-1.5 py-1 text-[10px] text-[#202923]/50 hover:text-red-700 cursor-pointer"
                                    title="Dismiss finding"
                                  >
                                    Dismiss
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleUpdateFindingStatus(f.id, 'potential')
                                    }
                                    className="px-1.5 py-1 text-[10px] text-[#214B3D] hover:underline cursor-pointer"
                                    title="Restore finding"
                                  >
                                    Restore
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEST A SCENARIO (LIVE IN-BROWSER RECALCULATION) */}
        {activeTab === 'scenario' && (
          <div className="bg-white rounded-lg border border-[#E1E3DD] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#E1E3DD] pb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#214B3D] block mb-1">
                Deterministic Audit Sandbox
              </span>
              <h3 className="text-xl font-bold text-[#202923]">
                Test a Scenario with Live Recalculation
              </h3>
              <p className="mt-1 text-xs text-[#202923]/75 max-w-2xl">
                Change the billed unit rate or quantity on any invoice line to see how PriceGuard dynamically recomputes overcharges, separates duplicates, and evaluates contractual variances in real time.
              </p>
            </div>

            <form onSubmit={handleRunScenario} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select Invoice & Line Item */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#202923] mb-1">
                      Target Invoice
                    </label>
                    <select
                      value={scenarioInvoiceId}
                      onChange={e => {
                        const invId = e.target.value;
                        setScenarioInvoiceId(invId);
                        setScenarioLineIndex(0);
                        const inv = invoices.find(i => i.id === invId);
                        if (inv && inv.lineItems[0]) {
                          setScenarioPrice(inv.lineItems[0].invoicedUnitPrice.toString());
                          setScenarioQty(inv.lineItems[0].quantity.toString());
                        }
                      }}
                      className="w-full p-2.5 bg-[#F8F7F3] border border-[#E1E3DD] rounded-md text-xs text-[#202923]"
                    >
                      {invoices.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} - {inv.supplierName} (${inv.totalAmount.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#202923] mb-1">
                      Line Item to Modify
                    </label>
                    {(() => {
                      const curInv = invoices.find(i => i.id === scenarioInvoiceId) || invoices[0];
                      return (
                        <select
                          value={scenarioLineIndex}
                          onChange={e => {
                            const lIndex = parseInt(e.target.value, 10);
                            setScenarioLineIndex(lIndex);
                            const item = curInv?.lineItems[lIndex];
                            if (item) {
                              setScenarioPrice(item.invoicedUnitPrice.toString());
                              setScenarioQty(item.quantity.toString());
                            }
                          }}
                          className="w-full p-2.5 bg-[#F8F7F3] border border-[#E1E3DD] rounded-md text-xs text-[#202923]"
                        >
                          {curInv?.lineItems.map((item, idx) => (
                            <option key={item.id} value={idx}>
                              Line {idx + 1}: {item.rawDescription} (Currently ${item.invoicedUnitPrice.toFixed(2)} x {item.quantity})
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>
                </div>

                {/* Edit Billed Rate & Qty */}
                <div className="space-y-4 bg-[#F8F7F3] p-4 rounded-md border border-[#E1E3DD]">
                  <div className="text-xs font-semibold text-[#202923] mb-2">
                    Simulate New Invoice Values
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#202923]/70 mb-1">
                        Billed Unit Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={scenarioPrice}
                        onChange={e => setScenarioPrice(e.target.value)}
                        className="w-full p-2 bg-white border border-[#E1E3DD] rounded-sm text-xs font-mono font-semibold text-[#202923]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#202923]/70 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={scenarioQty}
                        onChange={e => setScenarioQty(e.target.value)}
                        className="w-full p-2 bg-white border border-[#E1E3DD] rounded-sm text-xs font-mono font-semibold text-[#202923]"
                      />
                    </div>
                  </div>

                  {(() => {
                    const curInv = invoices.find(i => i.id === scenarioInvoiceId) || invoices[0];
                    const targetLine = curInv?.lineItems[scenarioLineIndex];
                    if (!targetLine) return null;

                    // Match with price list to show difference preview
                    const matched = priceList.find(
                      p => p.sku === targetLine.rawCode || p.name.toLowerCase().includes(targetLine.rawCode?.toLowerCase() || '---')
                    );
                    const agreedRate = matched ? matched.agreedPrice : null;
                    const simPrice = parseFloat(scenarioPrice) || 0;
                    const simQty = parseFloat(scenarioQty) || 0;
                    const simDiff = agreedRate !== null ? (simPrice - agreedRate) * simQty : null;

                    return (
                      <div className="text-xs pt-2 border-t border-[#E1E3DD] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#202923]/60">Contract Agreed Rate:</span>
                          <span className="font-mono font-semibold text-[#214B3D]">
                            {agreedRate !== null ? `$${agreedRate.toFixed(2)}` : 'Unmatched'}
                          </span>
                        </div>
                        {simDiff !== null && (
                          <div className="flex justify-between">
                            <span className="text-[#202923]/60">Simulated Overcharge:</span>
                            <span
                              className={`font-mono font-bold ${
                                simDiff > 0 ? 'text-[#A7443E]' : 'text-[#214B3D]'
                              }`}
                            >
                              {simDiff > 0 ? `+$${simDiff.toFixed(2)}` : '$0.00 (Agreed or Lower)'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E1E3DD]">
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="px-4 py-2 text-xs font-medium text-[#202923]/70 hover:text-[#202923] cursor-pointer"
                >
                  Reset to Original Values
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors shadow-xs cursor-pointer"
                >
                  Run Comparison & Recalculate Audit →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: AUDITED INVOICES LIST */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="text-xs text-[#202923]/70">
              Reviewing {invoices.length} extracted supplier invoices in this demonstration session.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {invoices.map(inv => (
                <div
                  key={inv.id}
                  className="bg-white rounded-lg border border-[#E1E3DD] p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between border-b border-[#E1E3DD] pb-2.5">
                    <div>
                      <div className="font-mono font-bold text-xs text-[#202923]">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-xs text-[#202923]/70 font-medium">
                        {inv.supplierName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-[#202923]">
                        ${inv.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#202923]/50">{inv.invoiceDate}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-[11px] font-semibold text-[#202923]/60 uppercase">
                      Line Items ({inv.lineItems.length})
                    </div>
                    <div className="divide-y divide-[#E1E3DD]/60">
                      {inv.lineItems.map(item => (
                        <div key={item.id} className="py-1.5 flex justify-between items-baseline text-[11px]">
                          <span className="text-[#202923] truncate max-w-[180px]">
                            {item.rawDescription}
                          </span>
                          <span className="font-mono text-[#202923]/80">
                            {item.quantity} {item.unit} @ ${item.invoicedUnitPrice.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E1E3DD] flex items-center justify-between text-[11px]">
                    <span className="text-[#202923]/60 font-mono truncate max-w-[140px]">
                      {inv.sourceFileName}
                    </span>
                    <button
                      onClick={() => handleOpenScenarioForLine(inv.id, 0)}
                      className="text-[#214B3D] font-semibold hover:underline cursor-pointer"
                    >
                      Test in Sandbox
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTRACT PRICE LIST */}
        {activeTab === 'pricelist' && (
          <div className="border border-[#E1E3DD] rounded-lg overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F3] border-b border-[#E1E3DD] text-[#202923]/70 font-semibold">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Contract Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Agreed Rate</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Pack Specifications</th>
                    <th className="py-3 px-4">Effective Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E3DD]">
                  {priceList.map(p => (
                    <tr key={p.id} className="hover:bg-[#F8F7F3]/50">
                      <td className="py-3 px-4 font-mono font-bold text-[#202923]">{p.sku}</td>
                      <td className="py-3 px-4 font-medium text-[#202923]">{p.name}</td>
                      <td className="py-3 px-4 text-[#202923]/70">{p.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#214B3D]">
                        ${p.agreedPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#202923]">{p.unit}</td>
                      <td className="py-3 px-4 text-[#202923]/70">{p.packSize}</td>
                      <td className="py-3 px-4 text-[#202923]/60 font-mono text-[11px]">
                        {p.effectiveFrom} to {p.effectiveTo || '2026-12-31'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Immediate Post-Demo Conversion Strip */}
        <div className="p-6 sm:p-8 bg-white rounded-lg border border-[#E1E3DD] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#202923]">
              Ready to see what your own supplier invoices might reveal?
            </h3>
            <p className="text-xs sm:text-sm text-[#202923]/75">
              Send us 2 or 3 sample invoices alongside your agreed price schedule for a confidential pilot review.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateHome}
              className="px-4 py-2.5 text-xs font-medium text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] border border-[#E1E3DD] rounded-md transition-colors cursor-pointer"
            >
              Back to Website
            </button>
            <button
              onClick={onRequestReview}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              Request an Invoice Review
            </button>
          </div>
        </div>
      </main>

      {/* EVIDENCE PROOF MODAL */}
      {evidenceFinding && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-lg border border-[#E1E3DD] shadow-xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#202923]">
                  Audit Mathematical Proof & Evidence
                </h4>
                <p className="text-[11px] text-[#202923]/60">
                  Document line reference and calculation formula
                </p>
              </div>
              <button
                onClick={() => setEvidenceFinding(null)}
                className="text-xs text-[#202923]/60 hover:text-[#202923] p-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#202923]/50 block mb-1">
                  Source Document
                </span>
                <div className="p-2.5 bg-[#F8F7F3] rounded-sm border border-[#E1E3DD] text-[#202923]">
                  {evidenceFinding.evidence.sourceDocument}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#202923]/50 block mb-1">
                  Invoiced Line Reference
                </span>
                <div className="p-2.5 bg-[#F8F7F3] rounded-sm border border-[#E1E3DD] text-[#202923]">
                  {evidenceFinding.evidence.sourceLineRef}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#202923]/50 block mb-1">
                  Contract Agreement Reference
                </span>
                <div className="p-2.5 bg-[#F8F7F3] rounded-sm border border-[#E1E3DD] text-[#202923]">
                  {evidenceFinding.evidence.agreedRecordRef}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#202923]/50 block mb-1">
                  Deterministic Calculation
                </span>
                <div className="p-3 bg-[#F2F5F0] rounded-sm border border-[#214B3D]/30 text-[#214B3D] font-mono font-medium">
                  {evidenceFinding.evidence.calculationExplanation}
                </div>
              </div>

              {evidenceFinding.evidence.uncertaintyNotes && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#BE825B] block mb-1">
                    Review Consideration
                  </span>
                  <div className="p-2.5 bg-[#FAF4ED] rounded-sm border border-[#BE825B]/30 text-[#202923]/80">
                    {evidenceFinding.evidence.uncertaintyNotes}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setEvidenceFinding(null)}
                className="px-4 py-2 text-xs font-semibold text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] rounded-md transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER CORRECTION EMAIL MODAL */}
      {emailFinding && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-lg border border-[#E1E3DD] shadow-xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#202923]">
                  Polite Supplier Correction Request
                </h4>
                <p className="text-[11px] text-[#202923]/60 mt-0.5">
                  Factual, respectful inquiry draft for accounts payable
                </p>
              </div>
              <button
                onClick={() => setEmailFinding(null)}
                className="text-xs text-[#202923]/60 hover:text-[#202923] p-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            {(() => {
              const draft = generateSupplierEmailDraft(emailFinding);
              return (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#202923]/50 block mb-1">
                      Subject
                    </label>
                    <input
                      readOnly
                      value={draft.subject}
                      className="w-full p-2 bg-[#F8F7F3] border border-[#E1E3DD] rounded-sm text-[#202923] font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#202923]/50 block mb-1">
                      Email Body
                    </label>
                    <textarea
                      readOnly
                      rows={9}
                      value={draft.body}
                      className="w-full p-3 bg-[#F8F7F3] border border-[#E1E3DD] rounded-sm text-[#202923] leading-relaxed resize-none font-mono text-[11px]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#202923]/60">
                      PriceGuard does not contact suppliers automatically.
                    </span>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(draft.body);
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2200);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors cursor-pointer shadow-xs"
                    >
                      {copiedEmail ? 'Copied to Clipboard!' : 'Copy Email Draft'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
