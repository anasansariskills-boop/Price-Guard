import React from 'react';

export const TrustPrivacy: React.FC = () => {
  const securityGuarantees = [
    {
      title: 'You choose what to upload',
      desc: 'Audit individual invoices or whole supplier batches on demand. There is no requirement to upload historical years or unrelated company records.'
    },
    {
      title: 'No banking credentials required',
      desc: 'PriceGuard is an independent auditing tool. We never ask for your bank logins, credit card processing credentials, or accounting passwords.'
    },
    {
      title: 'No automatic payments or vendor emails',
      desc: 'The platform never debits accounts or contacts suppliers automatically. You inspect every finding and decide whether to request a credit.'
    },
    {
      title: 'Evidence-backed calculations',
      desc: 'We never present black-box numbers. Every flagged variance displays the exact invoice line, agreed contract clause, and mathematical formula.'
    },
    {
      title: 'Isolated data storage',
      desc: 'Your audit records and price lists remain tied exclusively to your session or account. Documents are never exposed publicly or shared with competitors.'
    },
    {
      title: 'Full deletion controls',
      desc: 'You can delete your audits, uploaded invoices, and price lists permanently at any time directly from your workspace.'
    }
  ];

  return (
    <section className="py-20 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
            Data Governance & Trust
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202923] text-balance">
            Your invoices stay under your control.
          </h2>
          <p className="mt-3 text-base text-[#202923]/80 leading-relaxed">
            Supplier agreements and invoices contain sensitive commercial terms. We designed PriceGuard with clear boundaries and respect for your operational privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityGuarantees.map((item) => (
            <div
              key={item.title}
              className="bg-white p-6 rounded-lg border border-[#E1E3DD] space-y-2"
            >
              <h3 className="text-sm font-bold text-[#202923]">
                {item.title}
              </h3>
              <p className="text-xs text-[#202923]/70 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
