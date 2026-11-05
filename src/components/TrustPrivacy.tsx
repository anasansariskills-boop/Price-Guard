import React from 'react';

export const TrustPrivacy: React.FC = () => {
  const principles = [
    {
      title: 'Every finding shows the source prices',
      desc: 'Each identified variance displays both your agreed contract price and the exact billed invoice line, side by side.'
    },
    {
      title: 'Review the exact calculation',
      desc: 'You can inspect the arithmetic behind every finding: (Billed Price - Agreed Price) x Invoiced Quantity.'
    },
    {
      title: 'Uncertain matches are marked for review',
      desc: 'When product descriptions or pack configurations are ambiguous, PriceGuard flags them for human review rather than guessing.'
    },
    {
      title: 'Differences are not automatically assumed to be overcharges',
      desc: 'Price changes may be authorized, items substituted, or discounts applied. The platform helps you review differences, not jump to conclusions.'
    },
    {
      title: 'PriceGuard never initiates payments',
      desc: 'We are an audit and analysis tool. We never connect to banking rails, execute disbursements, or alter your accounting ledgers.'
    },
    {
      title: 'No automatic vendor contact',
      desc: 'We never contact your suppliers without your instruction. You decide when, how, and whether to request an invoice adjustment.'
    },
    {
      title: 'Fictional public demonstration data',
      desc: 'Our interactive demonstration uses entirely fictional suppliers and products, so you can explore the workflow freely with no account needed.'
    }
  ];

  return (
    <section id="trust" className="py-20 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
            Transparency and Control
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
            Clear findings. Evidence you can check.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#202923]/80 leading-relaxed">
            Procurement relationships require accuracy, diplomacy, and trust. PriceGuard provides objective mathematical comparisons so your management team remains in complete control.
          </p>
        </div>

        {/* Clear Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((item, idx) => (
            <div
              key={item.title}
              className={`p-6 rounded-lg border border-[#E1E3DD] space-y-2.5 ${
                idx === 0 ? 'bg-[#F2F5F0] border-[#214B3D]/30' : 'bg-[#F8F7F3]'
              }`}
            >
              <h3 className="text-sm font-bold text-[#202923]">
                {item.title}
              </h3>
              <p className="text-xs text-[#202923]/75 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
