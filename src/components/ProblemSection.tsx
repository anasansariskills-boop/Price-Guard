import React from 'react';

export const ProblemSection: React.FC = () => {
  return (
    <section id="problem" className="py-20 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B] mb-2">
            The Operational Reality
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202923] text-balance">
            Your suppliers send the invoices. But who is checking every price?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#202923]/80 leading-relaxed">
            Restaurant and hotel teams receive dozens of supplier invoices every week covering food, beverages, linen, cleaning materials, and guest amenities. A finance team verifies invoice totals and payment details, but checking every product line against the original agreement is too time-consuming during busy operations.
          </p>
        </div>

        {/* Operational Workflow Reality Comparison */}
        <div className="border border-[#E1E3DD] rounded-lg bg-[#F8F7F3] p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1: Negotiated Agreement */}
            <div className="bg-white p-5 rounded-md border border-[#E1E3DD] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#214B3D]">
                01. The Agreement
              </div>
              <h3 className="text-sm font-semibold text-[#202923]">
                Prices are negotiated and filed away
              </h3>
              <p className="text-xs text-[#202923]/70 leading-relaxed">
                Management agrees on contracted rates for key ingredients, beverages, and operating supplies. The price schedule is saved in an email or spreadsheet.
              </p>
              <div className="pt-2 border-t border-[#E1E3DD] text-[11px] font-mono text-[#202923]/60">
                Poultry Contract: $4.00/kg
              </div>
            </div>

            {/* Step 2: Busy Operations */}
            <div className="bg-white p-5 rounded-md border border-[#E1E3DD] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#BE825B]">
                02. The Busy Delivery
              </div>
              <h3 className="text-sm font-semibold text-[#202923]">
                Kitchen checks boxes, not rates
              </h3>
              <p className="text-xs text-[#202923]/70 leading-relaxed">
                Deliveries arrive during busy prep hours. Chefs and receiving staff check physical counts and freshness, then sign the delivery ticket and move on.
              </p>
              <div className="pt-2 border-t border-[#E1E3DD] text-[11px] font-mono text-[#202923]/60">
                Received: 600 kg fresh boxes
              </div>
            </div>

            {/* Step 3: Later Invoicing */}
            <div className="bg-white p-5 rounded-md border border-[#E1E3DD] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#A7443E]">
                03. The Invoice Arrives
              </div>
              <h3 className="text-sm font-semibold text-[#202923]">
                Prices shift quietly by small amounts
              </h3>
              <p className="text-xs text-[#202923]/70 leading-relaxed">
                The supplier bills chicken at $4.50/kg instead of $4.00/kg. The total amount looks normal for a weekly food order, so the $0.50 difference passes unnoticed.
              </p>
              <div className="pt-2 border-t border-[#E1E3DD] text-[11px] font-mono text-[#A7443E]">
                Billed: $4.50/kg ($300 diff)
              </div>
            </div>

            {/* Step 4: Accounts Payable Approval */}
            <div className="bg-white p-5 rounded-md border border-[#E1E3DD] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#202923]/60">
                04. Payment Issued
              </div>
              <h3 className="text-sm font-semibold text-[#202923]">
                Totals balance, payment is approved
              </h3>
              <p className="text-xs text-[#202923]/70 leading-relaxed">
                Accounts payable checks that the arithmetic is correct and the delivery was signed. Without an automatic check against the contract, the payment goes out.
              </p>
              <div className="pt-2 border-t border-[#E1E3DD] text-[11px] font-mono text-[#202923]/60">
                Payment approved in full
              </div>
            </div>
          </div>

          {/* Bottom Clarifying Summary */}
          <div className="pt-4 border-t border-[#E1E3DD] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#202923]/80">
            <div>
              <strong className="text-[#202923] font-semibold">Not every discrepancy is intentional: </strong>
              Authorized price changes, emergency substitutions, and temporary discounts happen constantly. The problem is having no visibility into which items need review.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
