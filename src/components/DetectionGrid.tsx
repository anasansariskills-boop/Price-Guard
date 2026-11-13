import React from 'react';

export const DetectionGrid: React.FC = () => {
  const outcomes = [
    {
      num: '01.',
      title: 'Spot pricing issues',
      desc: 'Catch supplier charges that differ from your agreed price schedules before they repeat across deliveries.',
      highlightLabel: 'Chicken Breast · INV-8841',
      highlightValue: '+$0.50 / kg above agreement'
    },
    {
      num: '02.',
      title: 'Catch duplicate invoice risks',
      desc: 'Identify re-submitted invoices separately so your accounts team can investigate before paying twice.',
      highlightLabel: 'LinenCraft · INV-4401 Copy',
      highlightValue: 'Flagged before payment'
    },
    {
      num: '03.',
      title: 'Review charges with evidence',
      desc: 'Give your team the exact invoice reference, agreed rate, and prepared supplier draft in one place.',
      highlightLabel: 'Ready for supplier follow-up',
      highlightValue: 'Draft email & summary included'
    }
  ];

  return (
    <section id="benefits" className="py-16 md:py-24 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-10 text-left">
          <div className="text-xs font-medium text-[#BE825B] mb-2">
            Business Benefits
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
            More visibility. Less manual checking.
          </h2>
          <p className="mt-2 text-base text-[#202923]/80">
            Focus your team on the few issues worth investigating instead of checking every row by hand.
          </p>
        </div>

        {/* Compact Editorial Outcome Strips */}
        <div className="bg-white rounded-xl border border-[#E1E3DD] divide-y divide-[#E1E3DD] text-left">
          {outcomes.map((item) => (
            <div
              key={item.num}
              className="p-6 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 max-w-2xl">
                <span className="font-mono text-xs font-bold text-[#214B3D] pt-1 shrink-0">
                  {item.num}
                </span>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#202923]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#202923]/75 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="md:text-right shrink-0 pl-8 md:pl-0">
                <div className="text-[11px] text-[#202923]/55">{item.highlightLabel}</div>
                <div className="text-xs font-mono font-semibold text-[#214B3D] mt-0.5">
                  {item.highlightValue}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
