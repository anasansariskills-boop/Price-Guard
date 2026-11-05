import React from 'react';

export const SolutionWorkflow: React.FC = () => {
  const stages = [
    {
      num: '1',
      title: 'Your agreed supplier prices',
      desc: 'PriceGuard uses the prices your business has negotiated with suppliers.',
      detail: 'Add your existing price lists or supplier agreements from spreadsheets, catalog files, or contract documents.'
    },
    {
      num: '2',
      title: 'Your incoming invoices',
      desc: 'The system reads the products, quantities, and prices listed on each invoice.',
      detail: 'Takes the itemized PDF or digital invoices your suppliers send and identifies each billed item line by line.'
    },
    {
      num: '3',
      title: 'Clear findings for your team',
      desc: 'PriceGuard highlights possible differences and shows the supporting information so your team can review them.',
      detail: 'Your team gets an organized summary showing agreed price, billed price, exact difference, and reference document lines.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
            The Solution
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
            Every invoice checked against what you agreed.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#202923]/80 leading-relaxed">
            A straightforward process that turns stacks of delivery invoices and contract sheets into clear, actionable findings for your management team.
          </p>
        </div>

        {/* Cohesive Visual Workflow Container */}
        <div className="border border-[#E1E3DD] rounded-lg bg-[#F8F7F3] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E1E3DD]">
            {stages.map((stage) => (
              <div key={stage.num} className="p-7 sm:p-8 flex flex-col justify-between space-y-6 bg-white hover:bg-[#F8F7F3]/40 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-[#214B3D] text-white text-xs font-bold font-mono flex items-center justify-center">
                      {stage.num}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#BE825B]">
                      Stage {stage.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#202923]">
                    {stage.title}
                  </h3>

                  <p className="text-sm text-[#202923]/80 leading-relaxed font-medium">
                    {stage.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E1E3DD] text-xs text-[#202923]/60 leading-normal">
                  {stage.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
