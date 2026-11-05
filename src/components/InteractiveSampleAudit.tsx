import React, { useState } from 'react';
import { SAMPLE_RESTAURANT_AUDIT, SAMPLE_HOTEL_AUDIT } from '../fixtures/sampleAudits';
import { DiscrepancyFinding } from '../types';
import { generateSupplierEmailDraft } from '../utils/auditEngine';

interface InteractiveSampleAuditProps {
  onCheckOwnInvoices: () => void;
}

export const InteractiveSampleAudit: React.FC<InteractiveSampleAuditProps> = ({ onCheckOwnInvoices }) => {
  const [selectedSample, setSelectedSample] = useState<'restaurant' | 'hotel'>('restaurant');
  const [activeEvidenceFinding, setActiveEvidenceFinding] = useState<DiscrepancyFinding | null>(null);
  const [activeEmailFinding, setActiveEmailFinding] = useState<DiscrepancyFinding | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const currentAudit = selectedSample === 'restaurant' ? SAMPLE_RESTAURANT_AUDIT : SAMPLE_HOTEL_AUDIT;

  const handleCopyEmail = (body: string) => {
    navigator.clipboard.writeText(body);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <section id="sample-audit" className="py-20 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
              Interactive Product Demonstration
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202923] text-balance">
              See what PriceGuard catches.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#202923]/70">
              Explore authentic sample audit results. All figures are calculated with our deterministic matching engine.
            </p>
          </div>

          {/* Sample Switcher Tabs (Functional filter controls) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8F7F3] rounded-md border border-[#E1E3DD]">
            <button
              onClick={() => setSelectedSample('restaurant')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                selectedSample === 'restaurant'
                  ? 'bg-white text-[#214B3D] shadow-xs font-semibold'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              Restaurant Sample (F&B)
            </button>
            <button
              onClick={() => setSelectedSample('hotel')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                selectedSample === 'hotel'
                  ? 'bg-white text-[#214B3D] shadow-xs font-semibold'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              Hotel Sample (Linen & Supplies)
            </button>
          </div>
        </div>

        {/* Audit Context Bar */}
        <div className="bg-[#F8F7F3] p-4 sm:p-5 rounded-lg border border-[#E1E3DD] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[#202923]">
              {currentAudit.title}
            </div>
            <div className="text-xs text-[#202923]/70">
              <span>{currentAudit.supplierName}</span>
              <span className="mx-2">·</span>
              <span>{currentAudit.invoices.length} Invoices Audited</span>
              <span className="mx-2">·</span>
              <span className="text-[#BE825B] font-medium">Illustrative sample data</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:text-right">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#202923]/50">Total Invoiced</div>
              <div className="font-mono tabular-nums text-sm font-semibold text-[#202923]">
                ${currentAudit.summary.totalInvoiceAmount.toFixed(2)}
              </div>
            </div>
            <div className="pl-4 sm:pl-6 border-l border-[#E1E3DD]">
              <div className="text-[10px] uppercase tracking-wider text-[#202923]/50">Verified Rate Overcharges</div>
              <div className="font-mono tabular-nums text-sm font-bold text-[#A7443E]">
                ${(currentAudit.summary.potentialPriceOvercharge ?? currentAudit.summary.totalPotentialOvercharge).toFixed(2)}
              </div>
            </div>
            {currentAudit.summary.duplicateInvoiceExposure > 0 && (
              <div className="pl-4 sm:pl-6 border-l border-[#E1E3DD]">
                <div className="text-[10px] uppercase tracking-wider text-[#BE825B]">Possible Duplicate Exposure</div>
                <div className="font-mono tabular-nums text-sm font-bold text-[#BE825B]">
                  ${currentAudit.summary.duplicateInvoiceExposure.toFixed(2)}
                </div>
                <div className="text-[9px] text-[#202923]/60">Separated from overcharges</div>
              </div>
            )}
            {((currentAudit.summary.unmatchedTotalAmount || 0) + (currentAudit.summary.needsReviewTotalAmount || 0)) > 0 && (
              <div className="pl-4 sm:pl-6 border-l border-[#E1E3DD]">
                <div className="text-[10px] uppercase tracking-wider text-[#202923]/50">Unmatched / Review</div>
                <div className="font-mono tabular-nums text-sm font-medium text-[#202923]/80">
                  ${((currentAudit.summary.unmatchedTotalAmount || 0) + (currentAudit.summary.needsReviewTotalAmount || 0)).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Findings Table */}
        <div className="border border-[#E1E3DD] rounded-lg overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F7F3] border-b border-[#E1E3DD] text-[#202923]/70 font-semibold">
                  <th className="py-3 px-4">Invoice Line / Product</th>
                  <th className="py-3 px-4">Matched Contract Item</th>
                  <th className="py-3 px-4 text-right">Agreed Rate</th>
                  <th className="py-3 px-4 text-right">Charged Rate</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4 text-right">Potential Diff</th>
                  <th className="py-3 px-4 text-center">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E3DD]">
                {currentAudit.findings.map((finding) => {
                  const isOvercharge = finding.potentialOvercharge > 0;
                  const isUncertain = finding.findingType === 'potential_mismatch' || finding.findingType === 'unmatched_product';
                  const isDuplicate = finding.findingType === 'duplicate_invoice';

                  return (
                    <tr key={finding.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                      {/* Invoiced Item */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#202923]">
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
                            <div className="text-[#202923]">
                              {finding.matchedAgreedProduct.name}
                            </div>
                            <div className="text-[11px] text-[#202923]/60 mt-0.5">
                              SKU: {finding.matchedAgreedProduct.sku} · Match: {finding.matchMethod.replace('_', ' ')}
                            </div>
                          </div>
                        ) : isDuplicate ? (
                          <span className="text-[#A7443E] font-medium">Duplicate Invoice Billing</span>
                        ) : (
                          <span className="text-[#BE825B] font-medium">No Contract Match Found</span>
                        )}
                      </td>

                      {/* Agreed Rate */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#202923]">
                        {finding.agreedPrice > 0 ? `$${finding.agreedPrice.toFixed(2)}` : 'N/A'}
                      </td>

                      {/* Charged Rate */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-[#202923]">
                        ${finding.invoicedPrice.toFixed(2)}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#202923]">
                        {finding.quantity} {finding.invoiceItem.unit}
                      </td>

                      {/* Variance */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {finding.unitPriceDiff > 0 ? (
                          <span className="text-[#A7443E] font-semibold">+${finding.unitPriceDiff.toFixed(2)}</span>
                        ) : finding.unitPriceDiff === 0 ? (
                          <span className="text-[#214B3D]">$0.00</span>
                        ) : (
                          <span className="text-[#202923]/60">${finding.unitPriceDiff.toFixed(2)}</span>
                        )}
                      </td>

                      {/* Potential Overcharge Total */}
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold">
                        {isOvercharge ? (
                          <span className="text-[#A7443E]">+${finding.potentialOvercharge.toFixed(2)}</span>
                        ) : isUncertain ? (
                          <span className="text-[#BE825B] text-[11px]">Review Required</span>
                        ) : (
                          <span className="text-[#214B3D]">$0.00</span>
                        )}
                      </td>

                      {/* Audit Actions */}
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

        {/* Conversion Prompt Banner */}
        <div className="mt-12 p-8 bg-[#F8F7F3] rounded-lg border border-[#E1E3DD] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-[#202923]">
              Ready to check your own invoices?
            </h3>
            <p className="text-sm text-[#202923]/70">
              Upload your agreed price list and test real invoices in seconds.
            </p>
          </div>
          <button
            onClick={onCheckOwnInvoices}
            className="px-6 py-3 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            Start My Invoice Check
          </button>
        </div>
      </div>

      {/* Evidence Inspector Modal */}
      {activeEvidenceFinding && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-lg border border-[#E1E3DD] shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-3">
              <h4 className="text-sm font-bold text-[#202923]">Supporting Audit Evidence</h4>
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
                className="px-4 py-2 text-xs font-medium text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] rounded-md transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Email Draft Modal */}
      {activeEmailFinding && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-lg border border-[#E1E3DD] shadow-lg p-6 space-y-4">
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
                      className="w-full p-3 bg-[#F8F7F3] border border-[#E1E3DD] rounded-sm text-[#202923] font-sans leading-relaxed resize-none font-mono text-[11px]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#202923]/60">
                      PriceGuard does not send automatic emails to your suppliers.
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
