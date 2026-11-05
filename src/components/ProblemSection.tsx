import React, { useState } from 'react';

export const ProblemSection: React.FC = () => {
  const [activeInvoice, setActiveInvoice] = useState<number>(0);

  const sampleInvoices = [
    {
      invoiceNum: 'INV-8841',
      supplier: 'Artisan Meats Co.',
      item: 'Ground Chuck 80/20 (100 KG)',
      agreed: 6.20,
      billed: 6.50,
      qty: 100,
      unit: 'KG',
      diff: 30.00,
      note: '+$0.30 per KG rate creep'
    },
    {
      invoiceNum: 'INV-9042',
      supplier: 'Pacific Harvest Seafood',
      item: 'Atlantic Salmon Fillet (5 Cases)',
      agreed: 120.00,
      billed: 135.00,
      qty: 5,
      unit: 'CASE',
      diff: 75.00,
      note: '+$15.00 per Case variance'
    },
    {
      invoiceNum: 'INV-9118',
      supplier: 'Coastal Pantry Supply',
      item: 'Extra Virgin Olive Oil (10 Cases)',
      agreed: 72.00,
      billed: 84.00,
      qty: 10,
      unit: 'CASE',
      diff: 120.00,
      note: '+$12.00 per Case variance'
    }
  ];

  const totalDiscrepancy = sampleInvoices.reduce((acc, curr) => acc + curr.diff, 0);

  return (
    <section id="problem" className="py-16 md:py-24 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-10 text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
            The Problem
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
            Small mistakes. Real money.
          </h2>
          <p className="mt-3 text-base text-[#202923]/80 leading-relaxed">
            Small pricing differences on weekly deliveries quietly accumulate across your suppliers and locations.
          </p>
        </div>

        {/* Visual Story: Individual Invoices Accumulating Into Real Money */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: 3 Invoice Cards */}
          <div className="lg:col-span-7 space-y-3">
            {sampleInvoices.map((inv, idx) => {
              const isSelected = activeInvoice === idx;
              return (
                <div
                  key={inv.invoiceNum}
                  onClick={() => setActiveInvoice(idx)}
                  className={`p-4 sm:p-5 rounded-lg border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-[#214B3D] bg-[#F2F5F0] shadow-xs'
                      : 'border-[#E1E3DD] bg-[#F8F7F3] hover:border-[#202923]/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#202923]">
                          {inv.invoiceNum}
                        </span>
                        <span className="text-xs text-[#202923]/60 truncate">
                          · {inv.supplier}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-[#202923] truncate">
                        {inv.item}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-mono tabular-nums font-bold text-[#A7443E]">
                        +${inv.diff.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-[#202923]/60">
                        {inv.note}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-[#E1E3DD] text-[11px] text-[#202923]/70 flex items-center justify-between">
                      <span>Agreed: ${inv.agreed.toFixed(2)} · Invoiced: ${inv.billed.toFixed(2)}</span>
                      <span className="font-mono text-[#214B3D] font-semibold">
                        (${inv.billed.toFixed(2)} - ${inv.agreed.toFixed(2)}) x {inv.qty} = ${inv.diff.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Cumulative Impact Card */}
          <div className="lg:col-span-5 bg-[#214B3D] text-white p-6 sm:p-8 rounded-lg shadow-xs flex flex-col justify-between text-left">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E7EDE5]/70 block">
                Accumulated Discrepancy
              </span>
              <div className="text-4xl sm:text-5xl font-mono tabular-nums font-bold text-white">
                ${totalDiscrepancy.toFixed(2)}
              </div>
              <p className="text-xs sm:text-sm text-[#E7EDE5]/80 leading-relaxed">
                Found across just 3 delivery invoices. Multiply this across dozens of weekly shipments, and unnoticed differences become thousands in lost margin every year.
              </p>
            </div>

            <div className="pt-6 border-t border-white/15 text-xs text-[#E7EDE5]/70">
              PriceGuard checks every line so your team does not have to.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
