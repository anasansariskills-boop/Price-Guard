import React, { useState } from 'react';

interface HeroSectionProps {
  onTryDemo: () => void;
  onRequestReview: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onTryDemo, onRequestReview }) => {
  const [activeIssueIndex, setActiveIssueIndex] = useState<number>(0);

  const incomingDocuments = [
    { supplier: 'Artisan Meats & Poultry', ref: 'INV-8841', lines: '18 lines', total: '$4,620.00', status: 'Price issue' },
    { supplier: 'Pacific Coast Pantry', ref: 'INV-90422', lines: '24 lines', total: '$2,944.00', status: 'Price issue' },
    { supplier: 'LinenCraft Supply', ref: 'INV-4401', lines: '12 lines', total: '$4,897.50', status: 'Duplicate risk' },
    { supplier: 'CleanStay Chemicals', ref: 'INV-9912', lines: '9 lines', total: '$1,032.00', status: 'Unit check' }
  ];

  const surfacedIssues = [
    {
      category: 'Potential pricing difference',
      categoryTone: 'text-[#A7443E]',
      surfaceTone: 'bg-[#FBF1F0]/50 border-[#A7443E]/30',
      product: 'Boneless Chicken Breast (1 KG)',
      supplier: 'Artisan Meats & Poultry · INV-8841',
      impact: '+$300.00',
      agreed: '$4.00 / kg',
      billed: '$4.50 / kg',
      reason: 'Charged $0.50 above agreed schedule across 600 kg.'
    },
    {
      category: 'Possible duplicate invoice',
      categoryTone: 'text-[#BE825B]',
      surfaceTone: 'bg-[#FAF4ED]/60 border-[#BE825B]/30',
      product: 'LinenCraft Invoice #4401 (Re-submitted)',
      supplier: 'LinenCraft Supply · INV-4401',
      impact: '$4,897.50 risk',
      agreed: 'Already received Oct 12',
      billed: 'Re-sent Oct 14',
      reason: 'Identical supplier and invoice number received twice.'
    },
    {
      category: 'Needs review',
      categoryTone: 'text-[#202923]',
      surfaceTone: 'bg-[#F8F7F3] border-[#E1E3DD]',
      product: 'Sanitizing Surface Cleaner (1 Gal)',
      supplier: 'CleanStay Chemicals · INV-9912',
      impact: 'Unit mismatch',
      agreed: '$44.00 / 4-gal case',
      billed: '$44.00 / single bottle',
      reason: 'Single bottle billed at the agreed four-gallon case rate.'
    }
  ];

  const activeIssue = surfacedIssues[activeIssueIndex];

  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Positioning & Direct Action */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="text-xs font-medium text-[#BE825B]">
              Supplier Invoice Auditing for Hospitality
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#202923] leading-[1.12] text-balance">
              Are your supplier invoices quietly costing you more than they should?
            </h1>

            <p className="text-base text-[#202923]/80 leading-relaxed max-w-lg">
              PriceGuard helps hotels and restaurants spot pricing discrepancies, duplicate invoices, and review-worthy charges before they go unnoticed.
            </p>

            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onTryDemo}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors text-center shadow-xs cursor-pointer whitespace-nowrap"
              >
                Try Live Demo
              </button>

              <button
                onClick={onRequestReview}
                className="px-6 py-3.5 text-sm font-medium text-[#202923] bg-white hover:bg-[#F2F5F0] border border-[#E1E3DD] rounded-md transition-colors text-center cursor-pointer shadow-2xs whitespace-nowrap"
              >
                Request an Invoice Review
              </button>
            </div>

            <p className="text-xs text-[#202923]/60">
              Interactive demonstration with fictional hospitality data. No login or uploads required.
            </p>
          </div>

          {/* Right Column: Visual Composition (Many Documents In -> 3 Issues Surfaced) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-[#E1E3DD] p-5 sm:p-6 shadow-xs space-y-5 text-left">
              {/* Top: Incoming Weekly Invoices Stream */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#202923]">
                    Weekly supplier invoices reviewed
                  </span>
                  <span className="font-mono tabular-nums text-[11px] text-[#202923]/60">
                    4 invoices · 63 lines checked
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {incomingDocuments.map((doc) => (
                    <div
                      key={doc.ref}
                      className="p-2.5 rounded-md bg-[#F8F7F3] border border-[#E1E3DD] space-y-1"
                    >
                      <div className="font-mono text-[11px] font-semibold text-[#202923] truncate">
                        {doc.ref}
                      </div>
                      <div className="text-[11px] text-[#202923]/75 truncate">
                        {doc.supplier}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-[#202923]/55 pt-1 border-t border-[#E1E3DD]/70">
                        <span>{doc.lines}</span>
                        <span>{doc.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funnel Divider */}
              <div className="flex items-center justify-between border-y border-[#E1E3DD] py-2.5 text-xs">
                <span className="font-semibold text-[#214B3D]">
                  3 issues worth reviewing surfaced
                </span>
                <span className="text-[11px] text-[#202923]/60">
                  Select an issue to inspect
                </span>
              </div>

              {/* Bottom: Interactive Surfaced Issues + Selected Detail */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                {/* Issue Selector List */}
                <div className="md:col-span-6 space-y-2">
                  {surfacedIssues.map((issue, idx) => {
                    const isSelected = activeIssueIndex === idx;
                    return (
                      <button
                        key={issue.product}
                        type="button"
                        onClick={() => setActiveIssueIndex(idx)}
                        className={`w-full text-left p-3 rounded-md border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#F2F5F0] border-[#214B3D]'
                            : 'bg-[#F8F7F3]/60 border-[#E1E3DD] hover:border-[#202923]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className={`font-semibold ${issue.categoryTone}`}>
                            {issue.category}
                          </span>
                          <span className="font-mono tabular-nums font-bold text-[#202923]">
                            {issue.impact}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-[#202923] mt-1 truncate">
                          {issue.product}
                        </div>
                        <div className="text-[11px] text-[#202923]/60 truncate">
                          {issue.supplier}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Issue Inspector */}
                <div className={`md:col-span-6 p-4 rounded-md border flex flex-col justify-between space-y-3 ${activeIssue.surfaceTone}`}>
                  <div className="space-y-2">
                    <div className={`text-[11px] font-semibold ${activeIssue.categoryTone}`}>
                      {activeIssue.category}
                    </div>
                    <div className="text-sm font-bold text-[#202923] leading-snug">
                      {activeIssue.product}
                    </div>
                    <div className="text-xs text-[#202923]/75">
                      {activeIssue.reason}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E1E3DD] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#202923]/65">Agreed rate</span>
                      <span className="font-mono tabular-nums font-semibold text-[#214B3D]">
                        {activeIssue.agreed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#202923]/65">Charged on invoice</span>
                      <span className="font-mono tabular-nums font-bold text-[#202923]">
                        {activeIssue.billed}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
