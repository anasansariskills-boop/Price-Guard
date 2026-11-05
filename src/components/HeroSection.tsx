import React, { useState } from 'react';

interface HeroSectionProps {
  onSeeInAction: () => void;
  onRequestReview: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSeeInAction, onRequestReview }) => {
  const [selectedItem, setSelectedItem] = useState<'chicken' | 'oil'>('chicken');

  const items = {
    chicken: {
      name: 'Boneless Chicken Breast 1 KG',
      code: 'POUL-001',
      unit: 'KG',
      qty: 600,
      agreedRate: 4.00,
      invoicedRate: 4.50,
      diff: 300.00,
      supplier: 'Artisan Meats & Poultry Co.',
      contractRef: 'Master Agreement Schedule B',
      invoiceRef: 'Invoice #INV-2026-8841'
    },
    oil: {
      name: 'Extra Virgin Olive Oil (4x5L)',
      code: 'OIL-012',
      unit: 'CASE',
      qty: 20,
      agreedRate: 72.00,
      invoicedRate: 84.00,
      diff: 240.00,
      supplier: 'Pacific Coast Pantry & Produce',
      contractRef: 'Contract Schedule 2026',
      invoiceRef: 'Invoice #INV-90422'
    }
  };

  const current = items[selectedItem];

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Direct Hook & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#202923] leading-[1.14] text-balance">
              Are your suppliers charging you more than you agreed?
            </h1>

            <p className="text-base sm:text-lg text-[#202923]/80 leading-relaxed max-w-xl">
              Spot pricing differences between supplier invoices and agreed rates before they go unnoticed.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onSeeInAction}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors text-center shadow-xs cursor-pointer"
              >
                See It in Action
              </button>

              <button
                onClick={onRequestReview}
                className="px-6 py-3.5 text-sm font-medium text-[#202923] bg-white hover:bg-[#F2F5F0] border border-[#E1E3DD] rounded-md transition-colors text-center cursor-pointer shadow-2xs"
              >
                Request an Invoice Review
              </button>
            </div>

            <div className="pt-1 text-xs text-[#202923]/60 flex items-center gap-2">
              <span>Interactive demonstration using fictional sample data. No accounting integration required.</span>
            </div>
          </div>

          {/* Right Column: Visual Document Comparison Preview */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg border border-[#E1E3DD] p-5 sm:p-7 shadow-xs space-y-4">
              {/* Item Toggle */}
              <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-3 text-xs">
                <span className="font-semibold text-[#202923] uppercase tracking-wider text-[11px]">
                  Live Document Comparison
                </span>
                <div className="flex items-center gap-1 bg-[#F8F7F3] p-1 rounded-md border border-[#E1E3DD]">
                  <button
                    onClick={() => setSelectedItem('chicken')}
                    className={`px-2.5 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                      selectedItem === 'chicken'
                        ? 'bg-white text-[#214B3D] font-semibold shadow-2xs'
                        : 'text-[#202923]/70 hover:text-[#202923]'
                    }`}
                  >
                    Fresh Poultry
                  </button>
                  <button
                    onClick={() => setSelectedItem('oil')}
                    className={`px-2.5 py-1 text-xs rounded-sm transition-colors cursor-pointer ${
                      selectedItem === 'oil'
                        ? 'bg-white text-[#214B3D] font-semibold shadow-2xs'
                        : 'text-[#202923]/70 hover:text-[#202923]'
                    }`}
                  >
                    Pantry Oil
                  </button>
                </div>
              </div>

              {/* Side-by-Side or Stacked Document Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Agreed Price Schedule Document */}
                <div className="p-4 rounded-md border border-[#E1E3DD] bg-[#F8F7F3]/70 space-y-2.5 text-left">
                  <div className="flex items-center justify-between text-[11px] text-[#202923]/60">
                    <span className="font-semibold text-[#202923]">Agreed Price List</span>
                    <span className="font-mono">{current.code}</span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-[#202923] truncate">{current.name}</div>
                    <div className="text-[11px] text-[#202923]/60 truncate">{current.contractRef}</div>
                  </div>

                  <div className="pt-2 border-t border-[#E1E3DD] flex items-baseline justify-between">
                    <span className="text-[11px] text-[#202923]/70">Agreed price:</span>
                    <span className="font-mono tabular-nums text-sm font-semibold text-[#214B3D]">
                      ${current.agreedRate.toFixed(2)} / {current.unit.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Billed Invoice Document */}
                <div className="p-4 rounded-md border border-[#A7443E]/30 bg-[#FBF1F0]/40 space-y-2.5 text-left">
                  <div className="flex items-center justify-between text-[11px] text-[#202923]/60">
                    <span className="font-semibold text-[#A7443E]">Supplier Invoice</span>
                    <span className="font-mono">{current.qty} {current.unit}</span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-[#202923] truncate">{current.name}</div>
                    <div className="text-[11px] text-[#202923]/60 truncate">{current.invoiceRef}</div>
                  </div>

                  <div className="pt-2 border-t border-[#A7443E]/20 flex items-baseline justify-between">
                    <span className="text-[11px] text-[#202923]/70">Billed price:</span>
                    <span className="font-mono tabular-nums text-sm font-bold text-[#A7443E]">
                      ${current.invoicedRate.toFixed(2)} / {current.unit.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Difference Banner */}
              <div className="p-4 bg-[#F8F7F3] rounded-md border border-[#E1E3DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#202923]">
                    Potential difference: ${current.diff.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-[#202923]/70">
                    (${current.invoicedRate.toFixed(2)} charged - ${current.agreedRate.toFixed(2)} agreed) x {current.qty} {current.unit}
                  </div>
                </div>

                <span className="self-start sm:self-center px-2.5 py-1 text-[11px] font-semibold text-[#A7443E] bg-[#FBF1F0] border border-[#A7443E]/30 rounded-sm">
                  +${(current.invoicedRate - current.agreedRate).toFixed(2)}/{current.unit.toLowerCase()} discrepancy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
