import React from 'react';

export const DetectionGrid: React.FC = () => {
  const detections = [
    {
      title: 'Unexpected price increases',
      desc: 'Flags when an invoiced unit price exceeds your contracted rate schedule, even when the product description differs slightly from your contract.',
      example: 'Contract: $4.00/kg → Invoiced: $4.50/kg'
    },
    {
      title: 'Possible duplicate charges',
      desc: 'Detects duplicate invoice submissions, identical line totals, or repeated delivery charges entered across multiple weekly batches.',
      example: 'Duplicate invoice number or double-billed delivery run'
    },
    {
      title: 'Incorrect pack sizes',
      desc: 'Identifies when a vendor bills a single unit at a case price, or delivers an alternate pack configuration without updating unit rates.',
      example: 'Single gallon billed at 4x1 Gal case rate'
    },
    {
      title: 'Prices that differ between locations',
      desc: 'Highlights when separate restaurant branches or hotel properties in your group are billed divergent rates for the exact same contracted SKU.',
      example: 'Downtown charged $28.50/kg vs Westside charged $31.00/kg'
    }
  ];

  return (
    <section id="what-it-finds" className="py-20 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
            Discrepancy Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202923] text-balance">
            More than just an invoice scanner.
          </h2>
          <p className="mt-3 text-base text-[#202923]/80 leading-relaxed">
            PriceGuard checks for the specific pricing discrepancies that quietly erode margins in restaurant and hotel procurement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {detections.map((item) => (
            <div
              key={item.title}
              className="bg-white p-7 rounded-lg border border-[#E1E3DD] flex flex-col justify-between space-y-4"
            >
              <div>
                <h3 className="text-base font-semibold text-[#202923] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#202923]/75 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E1E3DD] text-xs font-mono text-[#214B3D] bg-[#F2F5F0] px-3 py-2 rounded-sm">
                {item.example}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
