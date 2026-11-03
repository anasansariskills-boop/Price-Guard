import React from 'react';

export const SolutionWorkflow: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload your supplier prices',
      desc: 'Add the agreed price list or supplier agreement you already use in CSV, Excel, or PDF document format.',
      detail: 'Includes product codes, contracted rates, pack specifications, and contract effective windows.'
    },
    {
      num: '02',
      title: 'Add your invoices',
      desc: 'PriceGuard reads invoice details and matches the itemized products directly against your agreed price schedule.',
      detail: 'Standardizes supplier abbreviations and verifies units, pack sizes, and billed quantities.'
    },
    {
      num: '03',
      title: 'Review the differences',
      desc: 'See possible overcharges, inspect supporting document evidence, and download a clear, professional report.',
      detail: 'Distinguishes between confirmed price creep, pack discrepancies, and items requiring clarification.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202923] text-balance">
            Know exactly which invoices need a second look.
          </h2>
          <p className="mt-3 text-base text-[#202923]/80 leading-relaxed">
            PriceGuard replaces hours of tedious manual cross-referencing with a structured, transparent review workflow.
          </p>
        </div>

        {/* Cohesive 3-Stage Workflow Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#E1E3DD] rounded-lg bg-white overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#E1E3DD]">
          {steps.map((s) => (
            <div key={s.num} className="p-7 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="font-mono text-xs font-bold text-[#BE825B] tracking-wider mb-3">
                  STAGE {s.num}
                </div>
                <h3 className="text-lg font-semibold text-[#202923] mb-3">
                  {s.title}
                </h3>
                <p className="text-sm text-[#202923]/80 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E1E3DD] text-xs text-[#202923]/60 leading-normal">
                {s.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
