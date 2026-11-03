import React, { useState } from 'react';

interface HeroSectionProps {
  onCheckInvoices: () => void;
  onExploreSample: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCheckInvoices, onExploreSample }) => {
  const [activeHighlight, setActiveHighlight] = useState<number>(0);

  const comparisonItems = [
    {
      name: 'Boneless Chicken Breast',
      code: 'POUL-001',
      unit: 'KG',
      qty: 600,
      agreedRate: 4.00,
      invoicedRate: 4.50,
      difference: 0.50,
      totalOvercharge: 300.00,
      status: 'Overcharged'
    },
    {
      name: 'Pure Cooking Oil (4x5L)',
      code: 'OIL-012',
      unit: 'CASE',
      qty: 20,
      agreedRate: 18.00,
      invoicedRate: 21.00,
      difference: 3.00,
      totalOvercharge: 60.00,
      status: 'Overcharged'
    },
    {
      name: 'Whole Milk Mozzarella Block',
      code: 'DAIRY-030',
      unit: 'KG',
      qty: 80,
      agreedRate: 6.00,
      invoicedRate: 6.00,
      difference: 0.00,
      totalOvercharge: 0.00,
      status: 'Matched'
    }
  ];

  const totalFlagged = 360.00;

  return (
    <section className="relative pt-12 pb-20 md:pt-18 md:pb-28 border-b border-[#E1E3DD]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Value Proposition & Copy */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#202923] leading-[1.15] text-balance">
              Are your suppliers charging you more than you agreed?
            </h1>

            <p className="text-base sm:text-lg text-[#202923]/80 leading-relaxed max-w-xl">
              Small differences in supplier invoices can add up across your restaurant or hotel. PriceGuard checks your invoices against agreed prices and shows you where something does not match, so you can review potential overcharges before they go unnoticed.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onCheckInvoices}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors text-center shadow-xs cursor-pointer"
              >
                Check My Supplier Invoices
              </button>

              <button
                onClick={onExploreSample}
                className="px-6 py-3.5 text-sm font-medium text-[#202923] bg-white hover:bg-[#F2F5F0] border border-[#E1E3DD] rounded-md transition-colors text-center cursor-pointer"
              >
                See How It Works
              </button>
            </div>

            <div className="pt-1 flex items-center gap-2 text-xs text-[#202923]/60">
              <span>Try a sample audit first. No accounting integration required.</span>
            </div>
          </div>

          {/* Right Column: Custom Interactive Comparison Visual */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg border border-[#E1E3DD] p-5 sm:p-6 shadow-xs">
              {/* Document Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E1E3DD] text-xs text-[#202923]/70 font-medium">
                <span className="font-semibold text-[#202923]">Agreed Contract Schedule</span>
                <span className="font-semibold text-[#202923]">Latest Supplier Invoice</span>
              </div>

              {/* Line Item Side-by-Side Comparison */}
              <div className="py-4 space-y-3">
                {comparisonItems.map((item, idx) => {
                  const isSelected = activeHighlight === idx;
                  const hasDiscrepancy = item.totalOvercharge > 0;

                  return (
                    <div
                      key={item.code}
                      onClick={() => setActiveHighlight(idx)}
                      className={`p-3 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#214B3D] bg-[#F2F5F0]'
                          : 'border-[#E1E3DD] hover:border-[#202923]/30 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#202923] truncate">{item.name}</div>
                          <div className="text-[11px] text-[#202923]/60 mt-0.5">
                            Qty: {item.qty} {item.unit} · SKU: {item.code}
                          </div>
                        </div>

                        {/* Agreed Price */}
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wider text-[#202923]/50">Agreed</div>
                          <div className="font-mono tabular-nums text-xs font-medium text-[#202923]">
                            ${item.agreedRate.toFixed(2)}/{item.unit.toLowerCase()}
                          </div>
                        </div>

                        {/* Invoiced Price */}
                        <div className="text-right pl-3 border-l border-[#E1E3DD]">
                          <div className="text-[10px] uppercase tracking-wider text-[#202923]/50">Charged</div>
                          <div className={`font-mono tabular-nums text-xs font-semibold ${
                            hasDiscrepancy ? 'text-[#A7443E]' : 'text-[#214B3D]'
                          }`}>
                            ${item.invoicedRate.toFixed(2)}/{item.unit.toLowerCase()}
                          </div>
                        </div>
                      </div>

                      {/* Line Difference Calculation Drawer */}
                      {isSelected && (
                        <div className="mt-3 pt-2.5 border-t border-[#E1E3DD] flex items-center justify-between text-xs">
                          <span className="text-[#202923]/70">
                            Calculation: (${item.invoicedRate.toFixed(2)} - ${item.agreedRate.toFixed(2)}) x {item.qty} {item.unit}
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${
                            hasDiscrepancy ? 'text-[#A7443E]' : 'text-[#214B3D]'
                          }`}>
                            {hasDiscrepancy ? `+$${item.totalOvercharge.toFixed(2)} overcharge` : 'Matches agreed price'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total Potential Overcharges Box */}
              <div className="mt-2 p-4 bg-[#F8F7F3] rounded-md border border-[#E1E3DD] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#202923]">
                    Potential overcharges found
                  </div>
                  <div className="text-[11px] text-[#202923]/60 mt-0.5">
                    Calculated across 3 verified invoice lines
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono tabular-nums text-[#A7443E]">
                    ${totalFlagged.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#202923]/50 uppercase tracking-wider mt-0.5">
                    Unnoticed Variance
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
