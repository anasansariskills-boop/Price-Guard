import React, { useState } from 'react';
import { SAMPLE_RESTAURANT_AUDIT, SAMPLE_HOTEL_AUDIT } from '../fixtures/sampleAudits';

interface InteractiveSampleAuditProps {
  onOpenDemo: (industry: 'restaurant' | 'hotel') => void;
}

export const InteractiveSampleAudit: React.FC<InteractiveSampleAuditProps> = ({ onOpenDemo }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<'restaurant' | 'hotel'>('restaurant');
  const [currentFindingIndex, setCurrentFindingIndex] = useState<number>(0);

  const currentAudit = selectedIndustry === 'restaurant' ? SAMPLE_RESTAURANT_AUDIT : SAMPLE_HOTEL_AUDIT;

  // Pick meaningful reviewable findings (pricing differences, duplicate invoices, pack discrepancies)
  const spotlightFindings = currentAudit.findings.filter(
    (f) =>
      f.findingType === 'price_mismatch' ||
      f.findingType === 'duplicate_invoice' ||
      f.findingType === 'pack_size_discrepancy'
  );

  const activeFinding = spotlightFindings[currentFindingIndex] || currentAudit.findings[0];

  const handleNextFinding = () => {
    setCurrentFindingIndex((prev) => (prev + 1) % spotlightFindings.length);
  };

  const getCategoryLabel = (type: string) => {
    if (type === 'price_mismatch') return 'Potential pricing difference';
    if (type === 'duplicate_invoice') return 'Possible duplicate invoice';
    if (type === 'pack_size_discrepancy') return 'Unit or pack-size review';
    return 'Needs review';
  };

  const getHumanTitle = (f: typeof activeFinding) => {
    if (f.findingType === 'duplicate_invoice') {
      return `${f.supplierName} (${f.invoiceNumber} Copy)`;
    }
    return f.matchedAgreedProduct?.name || f.invoiceItem.rawDescription;
  };

  return (
    <section id="sample-audit" className="py-16 md:py-24 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header + Industry Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-[#BE825B] mb-2">
              Live Demo Preview
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
              Try the live product demo.
            </h2>
            <p className="mt-2 text-base text-[#202923]/80">
              Explore a fictional restaurant or hotel audit and see how PriceGuard highlights issues step by step.
            </p>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-[#F8F7F3] rounded-md border border-[#E1E3DD] self-start md:self-end shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedIndustry('restaurant');
                setCurrentFindingIndex(0);
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                selectedIndustry === 'restaurant'
                  ? 'bg-white text-[#214B3D] font-semibold shadow-2xs'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              Restaurant example
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedIndustry('hotel');
                setCurrentFindingIndex(0);
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                selectedIndustry === 'hotel'
                  ? 'bg-white text-[#214B3D] font-semibold shadow-2xs'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              Hotel example
            </button>
          </div>
        </div>

        {/* Clean Guided Preview Frame */}
        {activeFinding && (
          <div className="bg-[#F8F7F3] rounded-xl border border-[#E1E3DD] p-6 sm:p-8 text-left space-y-6">
            {/* Top Context Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E3DD] pb-4 text-xs">
              <div className="font-semibold text-[#214B3D]">
                {spotlightFindings.length} findings worth reviewing in {selectedIndustry === 'restaurant' ? 'The Brass Palm Group' : 'The Grandview Hotel'}
              </div>
              <div className="text-[#202923]/60">
                No login required · Fictional sample data
              </div>
            </div>

            {/* Active Finding Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <div className="text-xs font-medium text-[#BE825B] mb-1">
                    Finding {currentFindingIndex + 1} of {spotlightFindings.length} · {getCategoryLabel(activeFinding.findingType)}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#202923]">
                    {getHumanTitle(activeFinding)}
                  </h3>
                  <div className="text-xs text-[#202923]/65 mt-1">
                    {activeFinding.supplierName} · Invoice #{activeFinding.invoiceNumber}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 max-w-md">
                  <div className="p-3.5 bg-white rounded-md border border-[#E1E3DD]">
                    <div className="text-[11px] text-[#202923]/60">Agreed rate</div>
                    <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-[#214B3D] mt-0.5">
                      {activeFinding.agreedPrice > 0
                        ? `$${activeFinding.agreedPrice.toFixed(2)}`
                        : 'Original on file'}
                    </div>
                  </div>
                  <div className="p-3.5 bg-white rounded-md border border-[#E1E3DD]">
                    <div className="text-[11px] text-[#202923]/60">Charged rate</div>
                    <div className="font-mono tabular-nums text-sm sm:text-base font-bold text-[#A7443E] mt-0.5">
                      ${activeFinding.invoicedPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#202923]/80 leading-relaxed max-w-xl">
                  {activeFinding.evidence.calculationExplanation}
                </p>
              </div>

              {/* Right: Clear Path into Full Interactive Demo */}
              <div className="lg:col-span-5 bg-white rounded-lg border border-[#E1E3DD] p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-[#202923]/60">
                    {activeFinding.findingType === 'duplicate_invoice'
                      ? 'Possible duplicate risk'
                      : activeFinding.findingType === 'pack_size_discrepancy'
                      ? 'Held for pack confirmation'
                      : 'Potential pricing difference'}
                  </div>
                  <div className="font-mono tabular-nums text-3xl font-bold text-[#202923]">
                    {activeFinding.potentialOvercharge > 0
                      ? `$${activeFinding.potentialOvercharge.toFixed(2)}`
                      : 'Needs review'}
                  </div>
                  <p className="text-xs text-[#202923]/70">
                    Open the interactive workspace to filter findings, edit invoice values, or draft a supplier email.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenDemo(selectedIndustry)}
                    className="w-full px-5 py-3 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors text-center cursor-pointer shadow-xs"
                  >
                    Open Live Demo
                  </button>

                  <button
                    type="button"
                    onClick={handleNextFinding}
                    className="w-full px-5 py-2.5 text-xs font-medium text-[#202923] bg-[#F8F7F3] hover:bg-[#E7EDE5] border border-[#E1E3DD] rounded-md transition-colors text-center cursor-pointer"
                  >
                    Next Finding →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
