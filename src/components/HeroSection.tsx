import React, { useState } from 'react';

interface HeroSectionProps {
  onSeeInAction: () => void;
  onRequestReview: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSeeInAction, onRequestReview }) => {
  const [selectedExample, setSelectedExample] = useState<'chicken' | 'oil'>('chicken');

  const examples = {
    chicken: {
      item: 'Boneless Chicken Breast 1 KG',
      code: 'POUL-001',
      unit: 'KG',
      quantity: 600,
      agreedRate: 4.00,
      invoicedRate: 4.50,
      unitDiff: 0.50,
      totalDiff: 300.00,
      supplier: 'Artisan Meats & Poultry Co.',
      contractRef: 'Master Supply Agreement Schedule B',
      invoiceRef: 'Invoice #INV-2026-8841 (Line 1)'
    },
    oil: {
      item: 'Extra Virgin Olive Oil (4x5L)',
      code: 'OIL-012',
      unit: 'CASE',
      quantity: 20,
      agreedRate: 72.00,
      invoicedRate: 84.00,
      unitDiff: 12.00,
      totalDiff: 240.00,
      supplier: 'Pacific Coast Pantry & Produce',
      contractRef: 'Q4 Contract Price Schedule 2026',
      invoiceRef: 'Invoice #INV-90422 (Line 1)'
    }
  };

  const active = examples[selectedExample];

  return (
    <section className="relative pt-12 pb-20 md:pt-18 md:pb-28 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Clear Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#202923] leading-[1.15] text-balance">
              Are your suppliers charging you more than you agreed?
            </h1>

            <p className="text-base sm:text-lg text-[#202923]/80 leading-relaxed max-w-xl">
              Between daily deliveries, busy teams, and dozens of supplier invoices, small pricing differences can go unnoticed. PriceGuard helps you spot where an invoice doesn't match your agreed prices, so your team knows exactly what needs a second look.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onSeeInAction}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors text-center shadow-xs cursor-pointer"
              >
                See PriceGuard in Action
              </button>

              <button
                onClick={onRequestReview}
                className="px-6 py-3.5 text-sm font-medium text-[#202923] bg-white hover:bg-[#F2F5F0] border border-[#E1E3DD] rounded-md transition-colors text-center cursor-pointer"
              >
                Request a Free Invoice Review
              </button>
            </div>

            <div className="pt-1 flex items-center gap-2 text-xs text-[#202923]/60">
              <span>Interactive demonstration using fictional sample data. No accounting integration required.</span>
            </div>
          </div>

          {/* Right Column: Visual Document Comparison Proof */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg border border-[#E1E3DD] p-5 sm:p-7 shadow-xs space-y-5">
              {/* Selector Tabs */}
              <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-3">
                <span className="text-xs font-semibold text-[#202923] uppercase tracking-wider">
                  Live Price Comparison
                </span>
                <div className="flex items-center gap-1.5 p-1 bg-[#F8F7F3] rounded-md border border-[#E1E3DD]">
                  <button
                    onClick={() => setSelectedExample('chicken')}
                    className={`px-2.5 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                      selectedExample === 'chicken'
                        ? 'bg-white text-[#214B3D] font-semibold shadow-xs'
                        : 'text-[#202923]/70 hover:text-[#202923]'
                    }`}
                  >
                    Fresh Poultry
                  </button>
                  <button
                    onClick={() => setSelectedExample('oil')}
                    className={`px-2.5 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                      selectedExample === 'oil'
                        ? 'bg-white text-[#214B3D] font-semibold shadow-xs'
                        : 'text-[#202923]/70 hover:text-[#202923]'
                    }`}
                  >
                    Pantry Oil
                  </button>
                </div>
              </div>

              {/* Side-by-Side Document Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Document 1: Supplier Price Agreement */}
                <div className="p-4 rounded-md border border-[#E1E3DD] bg-[#F8F7F3]/70 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#202923]/60">
                    <span className="font-semibold text-[#202923]">Agreed Price List</span>
                    <span className="font-mono">{active.code}</span>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-[#202923]">{active.item}</div>
                    <div className="text-[11px] text-[#202923]/60 mt-0.5">{active.contractRef}</div>
                  </div>

                  <div className="pt-2 border-t border-[#E1E3DD] flex items-baseline justify-between">
                    <span className="text-[11px] text-[#202923]/70">Agreed Rate:</span>
                    <span className="font-mono tabular-nums text-sm font-semibold text-[#214B3D]">
                      ${active.agreedRate.toFixed(2)} / {active.unit.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Document 2: Supplier Invoice */}
                <div className="p-4 rounded-md border border-[#A7443E]/30 bg-[#FBF1F0]/50 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#202923]/60">
                    <span className="font-semibold text-[#A7443E]">Supplier Invoice</span>
                    <span className="font-mono">{active.quantity} {active.unit} billed</span>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-[#202923]">{active.item}</div>
                    <div className="text-[11px] text-[#202923]/60 mt-0.5">{active.invoiceRef}</div>
                  </div>

                  <div className="pt-2 border-t border-[#A7443E]/20 flex items-baseline justify-between">
                    <span className="text-[11px] text-[#202923]/70">Billed Rate:</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-[#A7443E]">
                      ${active.invoicedRate.toFixed(2)} / {active.unit.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Revealed Discrepancy Banner */}
              <div className="p-4 bg-[#F8F7F3] rounded-md border border-[#E1E3DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#202923]">
                    Potential discrepancy: ${active.totalDiff.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-[#202923]/70">
                    (${active.invoicedRate.toFixed(2)} billed - ${active.agreedRate.toFixed(2)} agreed) x {active.quantity} {active.unit}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 text-[11px] font-semibold text-[#A7443E] bg-[#FBF1F0] border border-[#A7443E]/30 rounded-sm">
                    +${active.unitDiff.toFixed(2)}/{active.unit.toLowerCase()} variance
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
