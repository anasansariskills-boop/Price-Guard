import React, { useState } from 'react';

interface ProductShowcaseProps {
  onExploreDemo: () => void;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({ onExploreDemo }) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);

  const findings = [
    {
      id: 'f1',
      category: 'Potential pricing difference',
      categoryTone: 'text-[#A7443E]',
      productName: 'Boneless Chicken Breast 1 KG',
      supplier: 'Artisan Meats & Poultry Co.',
      agreedPrice: '$4.00 / kg',
      chargedPrice: '$4.50 / kg',
      quantity: '600 kg',
      difference: '+$300.00',
      howCalculated: '($4.50 charged - $4.00 agreed) x 600 kg = $300.00',
      whyFlagged: 'Invoice unit rate is $0.50 higher than your agreed 2026 supply schedule.',
      invoiceRef: 'Invoice #INV-2026-8841 · Line 1 (POUL-001)',
      sourceDetails: 'Agreed rate $4.00/kg in Poultry Schedule · Billed $2,700.00 for 600 kg',
      emailDraft:
        'Hi Artisan Meats Accounts Team,\n\nWe reviewed Invoice #INV-2026-8841 against our agreed pricing schedule. Line 1 for Boneless Chicken Breast (600 kg) was billed at $4.50/kg instead of our agreed rate of $4.00/kg, creating a $300.00 difference.\n\nCould you please review and confirm if a credit note can be issued?'
    },
    {
      id: 'f2',
      category: 'Potential pricing difference',
      categoryTone: 'text-[#A7443E]',
      productName: 'Extra Virgin Olive Oil (4x5L Case)',
      supplier: 'Pacific Coast Pantry & Produce',
      agreedPrice: '$72.00 / case',
      chargedPrice: '$84.00 / case',
      quantity: '20 cases',
      difference: '+$240.00',
      howCalculated: '($84.00 charged - $72.00 agreed) x 20 cases = $240.00',
      whyFlagged: 'Case price jumped by $12.00 per case compared to your dry goods schedule.',
      invoiceRef: 'Invoice #INV-90422 · Line 1 (OIL-012)',
      sourceDetails: 'Agreed rate $72.00/case · Billed $1,680.00 for 20 cases',
      emailDraft:
        'Hi Pacific Coast Accounts Team,\n\nOn Invoice #INV-90422, Extra Virgin Olive Oil (20 cases) was billed at $84.00/case rather than our agreed price of $72.00/case, a $240.00 difference.\n\nPlease let us know if this rate change can be credited or corrected.'
    },
    {
      id: 'f3',
      category: 'Possible duplicate invoice',
      categoryTone: 'text-[#BE825B]',
      productName: 'LinenCraft Invoice #INV-LC-4401 (Copy)',
      supplier: 'LinenCraft Hospitality Supply',
      agreedPrice: 'Processed Oct 12',
      chargedPrice: 'Re-sent Oct 14',
      quantity: 'Full invoice',
      difference: '$4,897.50 risk',
      howCalculated: 'Same supplier and invoice number (#INV-LC-4401) submitted twice.',
      whyFlagged: 'Kept separate from pricing differences so your team can block duplicate payment.',
      invoiceRef: 'Invoice #INV-LC-4401 · Re-issued PDF',
      sourceDetails: 'Original recorded Oct 12 ($4,897.50) · Duplicate copy received Oct 14',
      emailDraft:
        'Hi LinenCraft Accounts Team,\n\nWe received a second copy of Invoice #INV-LC-4401 dated Oct 14 for $4,897.50, matching the original invoice received Oct 12.\n\nCould you confirm this is a duplicate copy before we process payment?'
    },
    {
      id: 'f4',
      category: 'Needs review',
      categoryTone: 'text-[#202923]',
      productName: 'Sanitizing Surface Cleaner (1 Gal)',
      supplier: 'CleanStay Hospitality Chemicals',
      agreedPrice: '$44.00 / 4-gal case',
      chargedPrice: '$44.00 / single bottle',
      quantity: '8 bottles',
      difference: 'Pack review',
      howCalculated: 'Held for review until pack size (single gallon vs 4-gallon case) is confirmed.',
      whyFlagged: 'The billed unit is a single bottle, while the agreed rate is for a 4-gallon case.',
      invoiceRef: 'Invoice #INV-CS-9912 · Line 1 (CHEM-101)',
      sourceDetails: 'Single bottle billed at $44.00 · Agreed case of 4 gallons is $44.00 ($11.00/gal)',
      emailDraft:
        'Hi CleanStay Accounts Team,\n\nOn Invoice #INV-CS-9912, 8 single bottles of Sanitizing Surface Cleaner were billed at $44.00 each, which matches our 4-gallon case price rather than the $11.00 single-gallon rate.\n\nCould you confirm the unit quantity delivered and adjust if needed?'
    }
  ];

  const active = findings[selectedIdx];

  return (
    <section id="showcase" className="py-16 md:py-24 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-[#BE825B] mb-2">
              Product Showcase
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
              See what needs attention, and why.
            </h2>
            <p className="mt-2 text-base text-[#202923]/80 leading-relaxed">
              Not just a difference, but the invoice, the agreed rate, and the reason it was flagged.
            </p>
          </div>

          <button
            onClick={onExploreDemo}
            className="px-5 py-3 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors whitespace-nowrap self-start md:self-end shadow-xs cursor-pointer"
          >
            Open Live Demo
          </button>
        </div>

        {/* Interactive Findings Workspace */}
        <div className="border border-[#E1E3DD] rounded-xl bg-white p-5 sm:p-7 shadow-xs space-y-6 text-left">
          {/* Sample Audit Summary Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E1E3DD] pb-5">
            <div>
              <div className="text-sm font-bold text-[#202923]">
                Findings worth reviewing
              </div>
              <div className="text-xs text-[#202923]/60 mt-0.5">
                Sample hospitality review · Select any item to view details
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <div>
                <span className="text-[#202923]/60">Potential pricing differences: </span>
                <span className="font-mono tabular-nums font-bold text-[#A7443E]">2 items ($540.00)</span>
              </div>
              <div>
                <span className="text-[#202923]/60">Possible duplicate invoice: </span>
                <span className="font-mono tabular-nums font-bold text-[#BE825B]">1 invoice ($4,897.50)</span>
              </div>
              <div>
                <span className="text-[#202923]/60">Needs review: </span>
                <span className="font-mono tabular-nums font-bold text-[#202923]">1 pack issue</span>
              </div>
            </div>
          </div>

          {/* Two-Column Interactive Findings Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Findings List */}
            <div className="lg:col-span-5 space-y-2.5">
              {findings.map((f, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setSelectedIdx(idx);
                      setShowEmailPreview(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F2F5F0] border-[#214B3D]'
                        : 'bg-[#F8F7F3] border-[#E1E3DD] hover:border-[#202923]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className={`font-semibold ${f.categoryTone}`}>{f.category}</span>
                      <span className="font-mono tabular-nums font-bold text-[#202923]">
                        {f.difference}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#202923] mt-1">
                      {f.productName}
                    </div>
                    <div className="text-xs text-[#202923]/65 mt-0.5">
                      {f.supplier}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Selected Finding Details Panel */}
            <div className="lg:col-span-7 bg-[#F8F7F3] p-5 sm:p-6 rounded-lg border border-[#E1E3DD] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E1E3DD] pb-4">
                <div>
                  <div className={`text-xs font-semibold ${active.categoryTone}`}>
                    {active.category}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#202923] mt-0.5">
                    {active.productName}
                  </h3>
                  <div className="text-xs text-[#202923]/65 mt-0.5">
                    {active.supplier} · {active.quantity}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] text-[#202923]/60">Difference</div>
                  <div className={`font-mono tabular-nums text-xl font-bold ${active.categoryTone}`}>
                    {active.difference}
                  </div>
                </div>
              </div>

              {/* Agreed Price vs Charged Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-white rounded-md border border-[#E1E3DD]">
                  <div className="text-[11px] text-[#202923]/60">Agreed price</div>
                  <div className="font-mono tabular-nums text-base font-bold text-[#214B3D] mt-0.5">
                    {active.agreedPrice}
                  </div>
                </div>
                <div className="p-3.5 bg-white rounded-md border border-[#E1E3DD]">
                  <div className="text-[11px] text-[#202923]/60">Charged price</div>
                  <div className="font-mono tabular-nums text-base font-bold text-[#202923] mt-0.5">
                    {active.chargedPrice}
                  </div>
                </div>
              </div>

              {/* Supporting Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-semibold text-[#202923] mb-1">How this was calculated</div>
                  <div className="p-3 bg-white rounded-md border border-[#E1E3DD] font-mono text-[11px] text-[#214B3D]">
                    {active.howCalculated}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="font-semibold text-[#202923] mb-1">Invoice reference</div>
                    <div className="p-2.5 bg-white rounded-md border border-[#E1E3DD] text-[#202923]/80">
                      {active.invoiceRef}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-[#202923] mb-1">Source details</div>
                    <div className="p-2.5 bg-white rounded-md border border-[#E1E3DD] text-[#202923]/80">
                      {active.sourceDetails}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-[#202923] mb-1">Why it needs review</div>
                  <div className="p-3 bg-white rounded-md border border-[#E1E3DD] text-[#202923]/80">
                    {active.whyFlagged}
                  </div>
                </div>
              </div>

              {/* Draft Supplier Email Action */}
              <div className="pt-2 border-t border-[#E1E3DD] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="px-4 py-2 text-xs font-semibold text-[#214B3D] bg-white hover:bg-[#E7EDE5] border border-[#214B3D]/30 rounded-md transition-colors cursor-pointer"
                  >
                    {showEmailPreview ? 'Hide Supplier Draft Email' : 'Preview Draft Supplier Email'}
                  </button>

                  <button
                    type="button"
                    onClick={onExploreDemo}
                    className="text-xs font-semibold text-[#214B3D] hover:underline cursor-pointer"
                  >
                    Try full interactive demo →
                  </button>
                </div>

                {showEmailPreview && (
                  <pre className="p-3.5 bg-white border border-[#E1E3DD] rounded-md text-[11px] text-[#202923]/85 font-sans whitespace-pre-wrap leading-relaxed">
                    {active.emailDraft}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
