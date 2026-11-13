import React, { useState } from 'react';

export const SolutionWorkflow: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(2);

  const stages = [
    {
      num: '01.',
      title: 'Agreed prices',
      caption: 'Your supplier rates and pack sizes.',
      fragmentTitle: 'Agreed price list',
      rows: [
        { label: 'Boneless Chicken Breast', value: '$4.00 / kg' },
        { label: 'Extra Virgin Olive Oil (4x5L)', value: '$72.00 / case' },
        { label: 'King Flat Sheet 300TC', value: '$16.50 / each' }
      ]
    },
    {
      num: '02.',
      title: 'Supplier invoices',
      caption: 'Weekly delivery bills as they arrive.',
      fragmentTitle: 'Incoming invoices',
      rows: [
        { label: 'Artisan Meats · INV-8841', value: '$4.50 / kg' },
        { label: 'Pacific Coast · INV-90422', value: '$84.00 / case' },
        { label: 'LinenCraft · INV-4401 (Copy)', value: '$4,897.50' }
      ]
    },
    {
      num: '03.',
      title: 'Findings and evidence',
      caption: 'Only the items worth investigating.',
      fragmentTitle: 'Flagged for review',
      rows: [
        { label: 'Chicken Breast rate difference', value: '+$300.00' },
        { label: 'Olive Oil case difference', value: '+$240.00' },
        { label: 'LinenCraft #4401 duplicate risk', value: 'Flagged' }
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12 text-left">
          <div className="text-xs font-medium text-[#BE825B] mb-2">
            How PriceGuard Works
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
            PriceGuard reviews what your team would otherwise have to check manually.
          </h2>
          <p className="mt-3 text-base text-[#202923]/80">
            It compares supplier invoices against agreed prices and surfaces what deserves attention.
          </p>
        </div>

        {/* Connected 3-Stage Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {stages.map((stage, idx) => {
            const isSelected = activeStage === idx;
            return (
              <div key={stage.num} className="relative flex flex-col">
                <button
                  type="button"
                  onClick={() => setActiveStage(idx)}
                  className={`flex-1 p-6 rounded-xl border transition-colors text-left flex flex-col justify-between space-y-6 cursor-pointer ${
                    isSelected
                      ? 'border-[#214B3D] bg-[#F2F5F0]/60'
                      : 'border-[#E1E3DD] bg-[#F8F7F3] hover:border-[#202923]/30'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#214B3D]">
                        {stage.num}
                      </span>
                      {idx < 2 && (
                        <span className="hidden md:inline-block text-xs text-[#202923]/35 font-mono">
                          →
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-[#202923]">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-[#202923]/75">
                      {stage.caption}
                    </p>
                  </div>

                  {/* Embedded Product Fragment */}
                  <div className="p-3.5 bg-white rounded-md border border-[#E1E3DD] space-y-2.5 text-xs">
                    <div className="text-[11px] font-medium text-[#202923]/60 border-b border-[#E1E3DD] pb-1.5">
                      {stage.fragmentTitle}
                    </div>
                    <div className="space-y-2">
                      {stage.rows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-2">
                          <span className="text-[#202923]/85 truncate">{row.label}</span>
                          <span
                            className={`font-mono tabular-nums shrink-0 font-semibold ${
                              idx === 2 ? 'text-[#A7443E]' : 'text-[#202923]'
                            }`}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
