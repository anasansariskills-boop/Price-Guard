import React from 'react';

export const DetectionGrid: React.FC = () => {
  const benefits = [
    {
      num: '01',
      title: 'Spot pricing discrepancies',
      desc: 'Identify potential differences between invoice prices and agreed supplier rates.',
      detail: 'Flags line item unit rate variations across thousands of invoiced goods without needing to check every row manually.'
    },
    {
      num: '02',
      title: 'Protect purchasing margins',
      desc: 'Help prevent unnoticed supplier price differences from affecting business costs.',
      detail: 'Catches gradual price creep on core food, beverage, and housekeeping items before they quietly erode kitchen or property margins.'
    },
    {
      num: '03',
      title: 'Reduce repetitive checking',
      desc: 'Help purchasing and finance teams focus on invoices that need attention.',
      detail: 'Instead of inspecting invoices where prices matched perfectly, teams only spend time reviewing highlighted differences.'
    },
    {
      num: '04',
      title: 'Understand supplier pricing',
      desc: 'See which products, suppliers, and locations repeatedly generate discrepancies within available audit data.',
      detail: 'Identify patterns across multiple properties or recurring delivery runs to prepare for quarterly vendor renegotiations.'
    },
    {
      num: '05',
      title: 'Resolve issues with evidence',
      desc: 'Give teams the invoice details and agreed prices they need to request clarification or corrections.',
      detail: 'Generate polite, factual dispute emails and calculation sheets containing exact contract clauses and invoice numbers.'
    }
  ];

  return (
    <section id="benefits" className="py-20 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
            Business Outcomes
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
            Better control of your supplier costs, without more manual work.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#202923]/80 leading-relaxed">
            PriceGuard is designed to deliver immediate clarity to hospitality finance and management teams without adding administrative burden.
          </p>
        </div>

        {/* Thoughtful Editorial Outcome Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={b.num}
              className={`p-7 rounded-lg border border-[#E1E3DD] flex flex-col justify-between space-y-4 ${
                idx === 0 ? 'bg-[#F2F5F0] border-[#214B3D]/30 lg:col-span-2' : 'bg-[#F8F7F3]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#214B3D]">
                    {b.num}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#BE825B]">
                    Outcome
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#202923]">
                  {b.title}
                </h3>

                <p className="text-sm text-[#202923]/80 leading-relaxed font-medium">
                  {b.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E1E3DD] text-xs text-[#202923]/60 leading-normal">
                {b.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
