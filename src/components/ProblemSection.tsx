import React from 'react';

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-20 border-b border-[#E1E3DD] bg-[#F8F7F3]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202923] text-balance">
            Your suppliers send the invoices. But who is checking the prices?
          </h2>
          <p className="mt-4 text-base text-[#202923]/80 leading-relaxed">
            Every invoice contains dozens of prices, quantities, and product descriptions. Checking them against supplier agreements takes time, especially when you are managing several locations. Even small differences can go unnoticed when your team is busy keeping the business running.
          </p>
        </div>

        {/* Multi-Location Purchasing Complexity Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-[#E1E3DD]">
            <div className="text-xs font-semibold text-[#BE825B] uppercase tracking-wider mb-2">
              The Reality
            </div>
            <h3 className="text-base font-semibold text-[#202923] mb-2">
              Dozens of Line Items per Delivery
            </h3>
            <p className="text-sm text-[#202923]/70 leading-relaxed">
              Food, beverage, housekeeping, and chemical suppliers invoice weekly. Individual prices fluctuate quietly, making line by line manual verification impractical during busy shifts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E1E3DD]">
            <div className="text-xs font-semibold text-[#BE825B] uppercase tracking-wider mb-2">
              The Leakage
            </div>
            <h3 className="text-base font-semibold text-[#202923] mb-2">
              Small Rates Accumulate Quickly
            </h3>
            <p className="text-sm text-[#202923]/70 leading-relaxed">
              A $0.50 price creep on poultry or $3.00 on a case of cooking oil seems negligible on one delivery ticket. Multiplied across 52 weeks and multiple sites, it represents thousands in lost margin.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#E1E3DD]">
            <div className="text-xs font-semibold text-[#BE825B] uppercase tracking-wider mb-2">
              The Gap
            </div>
            <h3 className="text-base font-semibold text-[#202923] mb-2">
              Agreements Locked in PDFs and Spreadsheets
            </h3>
            <p className="text-sm text-[#202923]/70 leading-relaxed">
              Price agreements usually sit in procurement email attachments or spreadsheets while kitchen managers and general managers approve invoices based on receipt of goods, not contract price fidelity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
