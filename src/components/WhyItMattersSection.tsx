import React, { useState } from 'react';

export const WhyItMattersSection: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'single' | 'recurring'>('recurring');

  const pricingDifferences = [
    {
      ref: 'INV-8841',
      supplier: 'Artisan Meats Co.',
      product: 'Ground Chuck 80/20',
      singleDiff: 30,
      recurringDiff: 120,
      detail: '$0.30/kg difference across 100 kg'
    },
    {
      ref: 'INV-9042',
      supplier: 'Pacific Harvest Seafood',
      product: 'Atlantic Salmon Fillet',
      singleDiff: 75,
      recurringDiff: 300,
      detail: '$15.00/case difference across 5 cases'
    },
    {
      ref: 'INV-9118',
      supplier: 'Coastal Pantry Supply',
      product: 'Extra Virgin Olive Oil',
      singleDiff: 120,
      recurringDiff: 480,
      detail: '$12.00/case difference across 10 cases'
    }
  ];

  const pricingTotal = pricingDifferences.reduce(
    (sum, item) => sum + (selectedPeriod === 'single' ? item.singleDiff : item.recurringDiff),
    0
  );

  return (
    <section id="why-it-matters" className="py-16 md:py-24 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-[#BE825B] mb-2">
              Why This Matters
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
              Small issues can become recurring costs.
            </h2>
            <p className="mt-3 text-base text-[#202923]/80 leading-relaxed">
              One missed invoice issue may be small. Repeated across suppliers and deliveries, it can add up.
            </p>
          </div>

          {/* Toggle between Single Delivery vs 4 Weekly Deliveries */}
          <div className="inline-flex items-center gap-1 p-1 bg-white rounded-md border border-[#E1E3DD] self-start md:self-end shrink-0">
            <button
              type="button"
              onClick={() => setSelectedPeriod('single')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                selectedPeriod === 'single'
                  ? 'bg-[#214B3D] text-white font-semibold'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              1 Delivery Cycle
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod('recurring')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                selectedPeriod === 'recurring'
                  ? 'bg-[#214B3D] text-white font-semibold'
                  : 'text-[#202923]/70 hover:text-[#202923]'
              }`}
            >
              Across 4 Deliveries
            </button>
          </div>
        </div>

        {/* Visual Accumulation & Category Separation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left">
          {/* Left 7 Cols: Potential Pricing Differences Ledger */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#E1E3DD] p-6 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-3">
                <div>
                  <span className="text-xs font-semibold text-[#A7443E]">
                    Potential pricing differences
                  </span>
                  <div className="text-xs text-[#202923]/60 mt-0.5">
                    {selectedPeriod === 'single'
                      ? 'Sample differences found in one set of deliveries'
                      : 'Illustrative impact if the same differences repeat for 4 weeks'}
                  </div>
                </div>
                <span className="font-mono tabular-nums text-2xl font-bold text-[#A7443E]">
                  +${pricingTotal.toFixed(2)}
                </span>
              </div>

              <div className="divide-y divide-[#E1E3DD]">
                {pricingDifferences.map((item) => {
                  const amount = selectedPeriod === 'single' ? item.singleDiff : item.recurringDiff;
                  return (
                    <div key={item.ref} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-sm font-semibold text-[#202923] truncate">
                          {item.product}
                        </div>
                        <div className="text-xs text-[#202923]/60 truncate">
                          {item.supplier} · {item.detail}
                        </div>
                      </div>
                      <div className="font-mono tabular-nums text-sm font-bold text-[#A7443E] shrink-0">
                        +${amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E1E3DD] text-xs text-[#202923]/65">
              Pricing differences are isolated from duplicate billing so your team sees an accurate picture.
            </div>
          </div>

          {/* Right 5 Cols: Separated Duplicate Warning & Items Needing Review */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {/* Separate Block 1: Possible Duplicate Billing */}
            <div className="bg-[#FAF4ED]/60 rounded-xl border border-[#BE825B]/35 p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#BE825B]">
                    Possible duplicate billing
                  </span>
                  <span className="text-[11px] font-medium text-[#BE825B]">
                    Separate warning
                  </span>
                </div>
                <div className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-[#202923]">
                  $4,897.50
                </div>
                <div className="text-xs font-semibold text-[#202923]">
                  LinenCraft Hospitality · Invoice #INV-4401
                </div>
                <p className="text-xs text-[#202923]/75 leading-relaxed">
                  Re-submitted invoice flagged separately before payment, never mixed into pricing totals.
                </p>
              </div>
            </div>

            {/* Separate Block 2: Items Needing Review */}
            <div className="bg-white rounded-xl border border-[#E1E3DD] p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#202923]">
                    Items needing review
                  </span>
                  <span className="text-[11px] font-medium text-[#202923]/60">
                    2 items flagged
                  </span>
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-[#E1E3DD]">
                    <span className="text-[#202923]/80">Unit or pack-size confusion</span>
                    <span className="font-medium text-[#202923]">1 line item</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#202923]/80">Product not in agreed schedule</span>
                    <span className="font-medium text-[#202923]">1 line item</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#202923]/60">
                Held for team confirmation rather than assumed to be an error.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
