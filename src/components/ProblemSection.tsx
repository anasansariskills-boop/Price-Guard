import React, { useState } from 'react';

export const ProblemSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'surface' | 'revealed'>('revealed');

  const weeklyInvoices = [
    {
      ref: 'INV-8841',
      supplier: 'Artisan Meats & Poultry',
      category: 'Kitchen & Protein · 18 lines',
      total: '$4,620.00',
      issueType: 'Price mismatch',
      issueTone: 'text-[#A7443E]',
      rowBg: 'bg-[#FBF1F0]/50 border-[#A7443E]/30',
      hiddenIssue: 'Chicken breast charged at $4.50/kg instead of agreed $4.00/kg'
    },
    {
      ref: 'INV-4401 (Copy)',
      supplier: 'LinenCraft Hospitality',
      category: 'Housekeeping · 12 lines',
      total: '$4,897.50',
      issueType: 'Duplicate invoice',
      issueTone: 'text-[#BE825B]',
      rowBg: 'bg-[#FAF4ED]/60 border-[#BE825B]/30',
      hiddenIssue: 'Same invoice number re-submitted two days after original delivery'
    },
    {
      ref: 'INV-9912',
      supplier: 'CleanStay Chemicals',
      category: 'Facility Supplies · 9 lines',
      total: '$1,032.00',
      issueType: 'Pack size or unit mismatch',
      issueTone: 'text-[#202923]',
      rowBg: 'bg-[#F8F7F3] border-[#202923]/25',
      hiddenIssue: 'Single 1-gallon bottle billed at the 4-gallon case price'
    },
    {
      ref: 'INV-90422',
      supplier: 'Pacific Coast Pantry',
      category: 'Dry Goods & Oil · 24 lines',
      total: '$2,944.00',
      issueType: 'Item requiring review',
      issueTone: 'text-[#202923]',
      rowBg: 'bg-[#F8F7F3] border-[#202923]/25',
      hiddenIssue: 'Product name changed on invoice and does not match catalog'
    }
  ];

  return (
    <section id="problem" className="py-16 md:py-24 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-[#BE825B] mb-2">
              The Problem
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
              When invoices pile up, small issues get missed.
            </h2>
            <p className="mt-3 text-base text-[#202923]/80 leading-relaxed">
              Multiple suppliers, recurring deliveries, varied formats, and busy teams make line-by-line checking hard to sustain.
            </p>
          </div>

          {/* Interactive Toggle: Total-Only Review vs Hidden Line Issues */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#F8F7F3] rounded-md border border-[#E1E3DD] self-start md:self-end shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('surface')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'surface'
                  ? 'bg-white text-[#202923] font-semibold shadow-2xs'
                  : 'text-[#202923]/65 hover:text-[#202923]'
              }`}
            >
              Routine approval view
            </button>
            <button
              type="button"
              onClick={() => setViewMode('revealed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'revealed'
                  ? 'bg-[#214B3D] text-white font-semibold shadow-2xs'
                  : 'text-[#202923]/65 hover:text-[#202923]'
              }`}
            >
              What slips through
            </button>
          </div>
        </div>

        {/* Visual Editorial Story */}
        <div className="border border-[#E1E3DD] rounded-xl bg-[#F8F7F3] p-5 sm:p-8 space-y-6 text-left">
          {/* Top Context Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E1E3DD] text-xs">
            <span className="font-semibold text-[#202923]">
              {viewMode === 'surface'
                ? 'At a glance, weekly supplier totals look routine.'
                : 'Inside the line items, four distinct billing problems sit unnoticed.'}
            </span>
            <span className="text-[#202923]/60">
              Sample weekly receiving across 4 suppliers
            </span>
          </div>

          {/* 4 Clean Rows Representing Weekly Invoices */}
          <div className="space-y-3">
            {weeklyInvoices.map((inv) => (
              <div
                key={inv.ref}
                className={`p-4 sm:p-5 rounded-lg border transition-colors ${
                  viewMode === 'revealed'
                    ? inv.rowBg
                    : 'bg-white border-[#E1E3DD]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-[#202923]">{inv.supplier}</span>
                      <span className="text-[#202923]/40">·</span>
                      <span className="font-mono text-[#202923]/70">{inv.ref}</span>
                      <span className="text-[#202923]/40">·</span>
                      <span className="text-[#202923]/60">{inv.category}</span>
                    </div>

                    {viewMode === 'revealed' ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                        <span className={`font-semibold ${inv.issueTone}`}>
                          {inv.issueType}:
                        </span>
                        <span className="text-[#202923]/80">
                          {inv.hiddenIssue}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-[#202923]/55 pt-0.5">
                        Invoice total checked against delivery slip. Line-item rates not cross-checked.
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                    <span className="font-mono tabular-nums text-sm sm:text-base font-bold text-[#202923]">
                      {inv.total}
                    </span>
                    <span className={`text-[11px] font-medium ${
                      viewMode === 'revealed' ? inv.issueTone : 'text-[#214B3D]'
                    }`}>
                      {viewMode === 'revealed' ? 'Flagged for review' : 'Approved for payment'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Summary Line */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#202923]/70">
            <span>
              Why manual checking breaks down: invoices arrive in different layouts, product names shift, and teams are stretched across daily operations.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
