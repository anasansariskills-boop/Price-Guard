import React, { useState } from 'react';
import { SAMPLE_RESTAURANT_AUDIT, SAMPLE_HOTEL_AUDIT, RESTAURANT_PRICELIST, HOTEL_PRICELIST } from '../fixtures/sampleAudits';
import { DiscrepancyFinding } from '../types';
import { generateSupplierEmailDraft } from '../utils/auditEngine';

interface InteractiveSampleAuditProps {
  onRequestReview: () => void;
}

export const InteractiveSampleAudit: React.FC<InteractiveSampleAuditProps> = ({ onRequestReview }) => {
  const [selectedSample, setSelectedSample] = useState<'restaurant' | 'hotel'>('restaurant');
  const [activeTab, setActiveTab] = useState<'findings' | 'contract' | 'invoices'>('findings');
  const [findingFilter, setFindingFilter] = useState<'all' | 'overcharge' | 'duplicate' | 'review'>('all');
  const [activeEvidenceFinding, setActiveEvidenceFinding] = useState<DiscrepancyFinding | null>(null);
  const [activeEmailFinding, setActiveEmailFinding] = useState<DiscrepancyFinding | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const currentAudit = selectedSample === 'restaurant' ? SAMPLE_RESTAURANT_AUDIT : SAMPLE_HOTEL_AUDIT;
  const currentPriceList = selectedSample === 'restaurant' ? RESTAURANT_PRICELIST : HOTEL_PRICELIST;

  const handleCopyEmail = (body: string) => {
    navigator.clipboard.writeText(body);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleDownloadSampleCsv = () => {
    const headers = ['Invoice Number', 'Supplier', 'Invoice Item', 'Agreed SKU', 'Contract Name', 'Agreed Rate', 'Billed Rate', 'Quantity', 'Unit', 'Unit Difference', 'Potential Overcharge', 'Finding Type', 'Calculation'];
    const rows = currentAudit.findings.map(f => [
      f.invoiceNumber,
      `"${f.supplierName}"`,
      `"${f.invoiceItem.rawDescription}"`,
      f.matchedAgreedProduct?.sku || 'N/A',
      `"${f.matchedAgreedProduct?.name || 'Unmatched'}"`,
      f.agreedPrice.toFixed(2),
      f.invoicedPrice.toFixed(2),
      f.quantity,
      f.invoiceItem.unit,
      f.unitPriceDiff.toFixed(2),
      f.potentialOvercharge.toFixed(2),
      f.findingType,
      `"${f.evidence.calculationExplanation.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PriceGuard_Sample_Audit_${selectedSample}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFindings = currentAudit.findings.filter(f => {
    if (findingFilter === 'all') return true;
    if (findingFilter === 'overcharge') return f.findingType === 'price_mismatch' || f.findingType === 'pack_size_discrepancy';
    if (findingFilter === 'duplicate') return f.findingType === 'duplicate_invoice';
    if (findingFilter === 'review') return f.findingType === 'potential_mismatch' || f.findingType === 'unmatched_product';
    return true;
  });

  return (
    <section id="sample-audit" className="py-20 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
              Interactive Product Demonstration
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
              See what PriceGuard can find.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#202923]/80 leading-relaxed">
              Explore a sample supplier invoice audit and see how pricing discrepancies become clear, actionable findings.
            </p>
          </div>

          {/* Sample Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-md border border-[#E1E3DD] shadow-xs shrink-0">
            <button
              onClick={() => {
                setSelectedSample('restaurant');
                setFindingFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                selectedSample === 'restaurant'
                  ? 'bg-[#214B3D] text-white font-semibold'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              Restaurant Demo (F&B)
            </button>
            <button
              onClick={() => {
                setSelectedSample('hotel');
                setFindingFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                selectedSample === 'hotel'
                  ? 'bg-[#214B3D] text-white font-semibold'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              Hotel Demo (Linen & Supplies)
            </button>
          </div>
        </div>

        {/* Guided Introduction Note */}
        <div className="p-4 bg-white rounded-lg border border-[#E1E3DD] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#E7EDE5] text-[#214B3D] font-bold flex items-center justify-center shrink-0">
              i
            </span>
            <span className="text-[#202923]/80">
              <strong className="text-[#202923] font-semibold">Let's check a supplier invoice: </strong>
              Below is an actual audit generated by comparing real sample delivery bills against agreed price contracts.
            </span>
          </div>
          <span className="text-[11px] text-[#BE825B] font-medium shrink-0">
            Interactive demonstration using fictional sample data
          </span>
        </div>

        {/* Top Financial Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-5 bg-white rounded-lg border border-[#E1E3DD] shadow-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#202923]/60 mb-1">
              Total Invoiced Spend
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold text-[#202923]">
              ${currentAudit.summary.totalInvoiceAmount.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#202923]/60 mt-1">
              Across {currentAudit.invoices.length} supplier invoices
            </div>
          </div>

          <div className="p-5 bg-white rounded-lg border border-[#A7443E]/30 bg-[#FBF1F0]/40 shadow-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A7443E] mb-1">
              Verified Rate Overcharges
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold text-[#A7443E]">
              ${(currentAudit.summary.potentialPriceOvercharge ?? currentAudit.summary.totalPotentialOvercharge).toFixed(2)}
            </div>
            <div className="text-[11px] text-[#202923]/60 mt-1">
              Direct line item unit rate discrepancies
            </div>
          </div>

          <div className="p-5 bg-white rounded-lg border border-[#BE825B]/30 bg-[#FAF4ED]/50 shadow-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#BE825B] mb-1">
              Possible Duplicate Exposure
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold text-[#BE825B]">
              ${currentAudit.summary.duplicateInvoiceExposure.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#202923]/60 mt-1">
              Separated from line item rate variances
            </div>
          </div>

          <div className="p-5 bg-white rounded-lg border border-[#E1E3DD] shadow-xs">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#202923]/60 mb-1">
              Items Requiring Review
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold text-[#202923]">
              {currentAudit.summary.needsReviewCount}
            </div>
            <div className="text-[11px] text-[#202923]/60 mt-1">
              Unmatched items or pack changes
            </div>
          </div>
        </div>

        {/* View Selection & Action Bar */}
        <div className="bg-white rounded-t-lg border-t border-x border-[#E1E3DD] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('findings')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                activeTab === 'findings'
                  ? 'bg-[#214B3D] text-white shadow-xs'
                  : 'text-[#202923]/70 hover:text-[#202923] bg-[#F8F7F3]'
              }`}
            >
              Audit Findings ({currentAudit.findings.length})
            </button>
            <button
              onClick={() => setActiveTab('contract')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                activeTab === 'contract'
                  ? 'bg-[#214B3D] text-white shadow-xs'
                  : 'text-[#202923]/70 hover:text-[#202923] bg-[#F8F7F3]'
              }`}
            >
              Agreed Price Schedule ({currentPriceList.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-[#214B3D] text-white shadow-xs'
                  : 'text-[#202923]/70 hover:text-[#202923] bg-[#F8F7F3]'
              }`}
            >
              Supplier Invoices ({currentAudit.invoices.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadSampleCsv}
              className="px-3 py-1.5 text-xs font-medium text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] border border-[#E1E3DD] rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] border border-[#E1E3DD] rounded-sm transition-colors cursor-pointer"
            >
              Print Report
            </button>
          </div>
        </div>

        {/* Tab 1: Findings Table */}
        {activeTab === 'findings' && (
          <div className="border border-[#E1E3DD] rounded-b-lg overflow-hidden bg-white shadow-xs">
            {/* Filter Sub-bar */}
            <div className="p-3 bg-[#F8F7F3] border-b border-[#E1E3DD] flex items-center gap-2 text-xs">
              <span className="text-[#202923]/60 mr-1">Filter Findings:</span>
              <button
                onClick={() => setFindingFilter('all')}
                className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                  findingFilter === 'all'
                    ? 'bg-[#214B3D] text-white font-medium'
                    : 'text-[#202923]/70 hover:bg-white'
                }`}
              >
                All ({currentAudit.findings.length})
              </button>
              <button
                onClick={() => setFindingFilter('overcharge')}
                className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                  findingFilter === 'overcharge'
                    ? 'bg-[#A7443E] text-white font-medium'
                    : 'text-[#202923]/70 hover:bg-white'
                }`}
              >
                Rate Overcharges
              </button>
              <button
                onClick={() => setFindingFilter('duplicate')}
                className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                  findingFilter === 'duplicate'
                    ? 'bg-[#BE825B] text-white font-medium'
                    : 'text-[#202923]/70 hover:bg-white'
                }`}
              >
                Duplicate Invoices
              </button>
              <button
                onClick={() => setFindingFilter('review')}
                className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                  findingFilter === 'review'
                    ? 'bg-[#214B3D] text-white font-medium'
                    : 'text-[#202923]/70 hover:bg-white'
                }`}
              >
                Needs Review
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F3] border-b border-[#E1E3DD] text-[#202923]/70 font-semibold">
                    <th className="py-3 px-4">Invoice Line / Billed Item</th>
                    <th className="py-3 px-4">Matched Contract Product</th>
                    <th className="py-3 px-4 text-right">Agreed Rate</th>
                    <th className="py-3 px-4 text-right">Billed Rate</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Unit Diff</th>
                    <th className="py-3 px-4 text-right">Discrepancy</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E3DD]">
                  {filteredFindings.map((finding) => {
                    const isOvercharge = finding.potentialOvercharge > 0 && finding.findingType !== 'duplicate_invoice';
                    const isDuplicate = finding.findingType === 'duplicate_invoice';
                    const isUncertain = finding.findingType === 'potential_mismatch' || finding.findingType === 'unmatched_product';

                    return (
                      <tr key={finding.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                        {/* Invoiced Item */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#202923]">
                            {finding.invoiceItem.rawDescription}
                          </div>
                          <div className="text-[11px] text-[#202923]/60 mt-0.5">
                            Inv #{finding.invoiceNumber} · {finding.supplierName}
                          </div>
                        </td>

                        {/* Matched Contract Item */}
                        <td className="py-3.5 px-4">
                          {finding.matchedAgreedProduct ? (
                            <div>
                              <div className="text-[#202923] font-medium">
                                {finding.matchedAgreedProduct.name}
                              </div>
                              <div className="text-[11px] text-[#202923]/60 mt-0.5">
                                SKU: {finding.matchedAgreedProduct.sku}
                              </div>
                            </div>
                          ) : isDuplicate ? (
                            <span className="text-[#BE825B] font-semibold">Duplicate Invoice Submission</span>
                          ) : (
                            <span className="text-[#202923]/60 italic">Unmatched (Requires Review)</span>
                          )}
                        </td>

                        {/* Agreed Rate */}
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#202923]">
                          {finding.agreedPrice > 0 ? `$${finding.agreedPrice.toFixed(2)}` : 'None'}
                        </td>

                        {/* Billed Rate */}
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-[#202923]">
                          ${finding.invoicedPrice.toFixed(2)}
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#202923]">
                          {finding.quantity} {finding.invoiceItem.unit}
                        </td>

                        {/* Unit Diff */}
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                          {finding.unitPriceDiff > 0 ? (
                            <span className="text-[#A7443E] font-semibold">+${finding.unitPriceDiff.toFixed(2)}</span>
                          ) : finding.unitPriceDiff === 0 ? (
                            <span className="text-[#214B3D]">$0.00</span>
                          ) : (
                            <span className="text-[#202923]/60">${finding.unitPriceDiff.toFixed(2)}</span>
                          )}
                        </td>

                        {/* Discrepancy Total */}
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                          {isOvercharge ? (
                            <span className="text-[#A7443E]">+${finding.potentialOvercharge.toFixed(2)}</span>
                          ) : isDuplicate ? (
                            <span className="text-[#BE825B]">+${finding.potentialOvercharge.toFixed(2)} (dup)</span>
                          ) : isUncertain ? (
                            <span className="text-[#202923]/70 text-[11px] font-sans font-normal">Needs Review</span>
                          ) : (
                            <span className="text-[#214B3D]">$0.00</span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setActiveEvidenceFinding(finding)}
                              className="px-2.5 py-1 text-[11px] font-medium text-[#202923] hover:text-[#214B3D] bg-[#F8F7F3] hover:bg-[#E7EDE5] border border-[#E1E3DD] rounded-sm transition-colors cursor-pointer"
                            >
                              Evidence
                            </button>

                            {isOvercharge && (
                              <button
                                onClick={() => setActiveEmailFinding(finding)}
                                className="px-2.5 py-1 text-[11px] font-medium text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-sm transition-colors cursor-pointer"
                              >
                                Draft Email
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Agreed Price Schedule */}
        {activeTab === 'contract' && (
          <div className="border border-[#E1E3DD] rounded-b-lg overflow-hidden bg-white shadow-xs p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#202923]">Agreed Supplier Price Schedule</h3>
              <p className="text-xs text-[#202923]/70 mt-0.5">Reference prices negotiated by management for the current operating period.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F3] border-b border-[#E1E3DD] text-[#202923]/70 font-semibold">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Pack Specification</th>
                    <th className="py-2.5 px-3 text-right">Agreed Rate</th>
                    <th className="py-2.5 px-3">Effective Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E3DD]">
                  {currentPriceList.map(p => (
                    <tr key={p.id} className="hover:bg-[#F8F7F3]/50">
                      <td className="py-2.5 px-3 font-mono font-medium text-[#202923]">{p.sku}</td>
                      <td className="py-2.5 px-3 font-medium text-[#202923]">{p.name}</td>
                      <td className="py-2.5 px-3 text-[#202923]/70">{p.category || 'General'}</td>
                      <td className="py-2.5 px-3 text-[#202923]/70">{p.packSize || p.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-[#214B3D]">
                        ${p.agreedPrice.toFixed(2)} / {p.unit.toLowerCase()}
                      </td>
                      <td className="py-2.5 px-3 text-[#202923]/60 text-[11px]">
                        {p.effectiveFrom} to {p.effectiveTo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Sample Invoices */}
        {activeTab === 'invoices' && (
          <div className="border border-[#E1E3DD] rounded-b-lg overflow-hidden bg-white shadow-xs p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#202923]">Incoming Supplier Invoices</h3>
              <p className="text-xs text-[#202923]/70 mt-0.5">Itemized delivery tickets submitted by suppliers for payment approval.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentAudit.invoices.map((inv) => (
                <div key={inv.id} className="p-5 rounded-md border border-[#E1E3DD] bg-[#F8F7F3] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-2 text-xs">
                    <div>
                      <span className="font-bold text-[#202923]">Invoice #{inv.invoiceNumber}</span>
                      <div className="text-[11px] text-[#202923]/60">{inv.supplierName}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono tabular-nums font-bold text-[#202923]">
                        ${inv.totalAmount.toFixed(2)}
                      </span>
                      <div className="text-[11px] text-[#202923]/60">Date: {inv.invoiceDate}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {inv.lineItems.map((li) => (
                      <div key={li.id} className="flex items-center justify-between py-1 border-b border-[#E1E3DD]/60">
                        <span className="text-[#202923] truncate pr-2">{li.rawDescription}</span>
                        <span className="font-mono tabular-nums text-[#202923]/80 shrink-0">
                          {li.quantity} {li.unit} @ ${li.invoicedUnitPrice.toFixed(2)} = ${li.lineTotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Immediate Post-Demo Conversion Section */}
        <div className="mt-12 p-8 bg-white rounded-lg border border-[#E1E3DD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-[#202923]">
              Wonder what your own invoices might reveal?
            </h3>
            <p className="text-sm text-[#202923]/75 max-w-xl leading-relaxed">
              See how PriceGuard could help your team review supplier pricing more efficiently. Request an introductory invoice audit for your business.
            </p>
          </div>
          <button
            onClick={onRequestReview}
            className="px-6 py-3.5 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            Request Your Invoice Review
          </button>
        </div>
      </div>

      {/* Evidence Calculation Modal */}
      {activeEvidenceFinding && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-lg border border-[#E1E3DD] shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#202923]">Mathematical Audit Evidence</h4>
                <p className="text-[11px] text-[#202923]/60 mt-0.5">Every finding is supported by exact invoice and contract references</p>
              </div>
              <button
                onClick={() => setActiveEvidenceFinding(null)}
                className="text-xs text-[#202923]/60 hover:text-[#202923] px-2 py-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#202923]/50 uppercase tracking-wider block text-[10px] mb-1">Source Document</span>
                <div className="p-2.5 bg-[#F8F7F3] rounded-sm border border-[#E1E3DD] font-medium text-[#202923]">
                  {activeEvidenceFinding.evidence.sourceDocument}
                </div>
              </div>

              <div>
                <span className="text-[#202923]/50 uppercase tracking-wider block text-[10px] mb-1">Invoiced Line Reference</span>
                <div className="p-2.5 bg-[#F8F7F3] rounded-sm border border-[#E1E3DD] text-[#202923]">
                  {activeEvidenceFinding.evidence.sourceLineRef}
                </div>
              </div>

              <div>
                <span className="text-[#202923]/50 uppercase tracking-wider block text-[10px] mb-1">Contract Record Reference</span>
                <div className="p-2.5 bg-[#F8F7F3] rounded-sm border border-[#E1E3DD] text-[#202923]">
                  {activeEvidenceFinding.evidence.agreedRecordRef}
                </div>
              </div>

              <div>
                <span className="text-[#202923]/50 uppercase tracking-wider block text-[10px] mb-1">Calculation Method</span>
                <div className="p-2.5 bg-[#F2F5F0] rounded-sm border border-[#E1E3DD] text-[#214B3D] font-mono">
                  {activeEvidenceFinding.evidence.calculationExplanation}
                </div>
              </div>

              {activeEvidenceFinding.evidence.uncertaintyNotes && (
                <div className="p-3 bg-[#FBF1F0] rounded-sm border border-[#A7443E]/20 text-[#A7443E]">
                  <strong>Review Note:</strong> {activeEvidenceFinding.evidence.uncertaintyNotes}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveEvidenceFinding(null)}
                className="px-4 py-2 text-xs font-semibold text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] rounded-md transition-colors cursor-pointer"
              >
                Close Evidence Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Correction Email Modal */}
      {activeEmailFinding && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-lg border border-[#E1E3DD] shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-3">
              <div>
                <h4 className="text-sm font-bold text-[#202923]">Polite Supplier Correction Request</h4>
                <p className="text-[11px] text-[#202923]/60 mt-0.5">Editable draft prepared for your accounts payable team</p>
              </div>
              <button
                onClick={() => setActiveEmailFinding(null)}
                className="text-xs text-[#202923]/60 hover:text-[#202923] px-2 py-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            {(() => {
              const draft = generateSupplierEmailDraft(activeEmailFinding);
              return (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#202923]/50 block mb-1">Subject</label>
                    <input
                      readOnly
                      value={draft.subject}
                      className="w-full p-2 bg-[#F8F7F3] border border-[#E1E3DD] rounded-sm text-[#202923] font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#202923]/50 block mb-1">Email Body</label>
                    <textarea
                      readOnly
                      rows={10}
                      value={draft.body}
                      className="w-full p-3 bg-[#F8F7F3] border border-[#E1E3DD] rounded-sm text-[#202923] leading-relaxed resize-none font-mono text-[11px]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#202923]/60">
                      PriceGuard never contacts your suppliers automatically.
                    </span>

                    <button
                      onClick={() => handleCopyEmail(draft.body)}
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
    </section>
  );
};
