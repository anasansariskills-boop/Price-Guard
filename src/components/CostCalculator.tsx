import React, { useState } from 'react';

interface CostCalculatorProps {
  onStartAudit: () => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({ onStartAudit }) => {
  const [monthlySpend, setMonthlySpend] = useState<number>(50000);
  const [overchargeRate, setOverchargeRate] = useState<number>(1.0);

  const annualSpend = monthlySpend * 12;
  const potentialAnnualExposure = Math.round(annualSpend * (overchargeRate / 100));
  const potentialMonthlyExposure = Math.round(monthlySpend * (overchargeRate / 100));

  const presets = [25000, 50000, 100000, 200000];

  return (
    <section id="cost-calculator" className="py-20 border-b border-[#E1E3DD] bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202923] text-balance">
            Small price differences can become expensive.
          </h2>
          <p className="mt-3 text-base text-[#202923]/80 leading-relaxed">
            Adjust your monthly supplier purchasing volume to see the potential annual financial exposure of unverified invoices.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-[#F8F7F3] p-6 sm:p-8 rounded-lg border border-[#E1E3DD] space-y-7">
            {/* Monthly Spend Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#202923]">
                  Monthly Supplier Spend
                </label>
                <span className="font-mono tabular-nums text-lg font-bold text-[#214B3D]">
                  ${monthlySpend.toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min="10000"
                max="300000"
                step="5000"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full accent-[#214B3D] cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-[#202923]/50 mt-1">
                <span>$10,000 / mo</span>
                <span>$300,000 / mo</span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-[#202923]/60 mr-1">Presets:</span>
                {presets.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setMonthlySpend(amt)}
                    className={`text-xs px-2.5 py-1 rounded-sm border transition-colors ${
                      monthlySpend === amt
                        ? 'bg-[#214B3D] text-white border-[#214B3D]'
                        : 'bg-white text-[#202923] border-[#E1E3DD] hover:bg-[#F2F5F0]'
                    }`}
                  >
                    ${amt / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* Overcharge Rate Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#202923]">
                  Illustrative Overcharge Rate
                </label>
                <span className="font-mono tabular-nums text-lg font-bold text-[#BE825B]">
                  {overchargeRate.toFixed(1)}%
                </span>
              </div>

              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={overchargeRate}
                onChange={(e) => setOverchargeRate(Number(e.target.value))}
                className="w-full accent-[#BE825B] cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] text-[#202923]/50 mt-1">
                <span>0.2% (Conservative)</span>
                <span>3.0% (Higher Discrepancy)</span>
              </div>
            </div>

            {/* Explanatory disclaimer */}
            <div className="p-4 bg-white rounded-md border border-[#E1E3DD] text-xs text-[#202923]/70 leading-relaxed">
              <strong className="text-[#202923] font-medium">Please note: </strong>
              This is an illustration, not an estimate of your actual overcharges. An invoice audit is needed to identify real discrepancies.
            </div>
          </div>

          {/* Results Display Column */}
          <div className="lg:col-span-5 bg-[#214B3D] text-white p-7 sm:p-8 rounded-lg shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-[#E7EDE5]/70 mb-1">
                Hypothetical Exposure
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-white">
                ${potentialAnnualExposure.toLocaleString()}
              </div>
              <div className="text-xs text-[#E7EDE5]/80 mt-1">
                Potential annual exposure based on {overchargeRate.toFixed(1)}% discrepancy
              </div>

              <div className="mt-8 pt-6 border-t border-white/15 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#E7EDE5]/80">Estimated Monthly Exposure:</span>
                  <span className="font-mono tabular-nums font-semibold text-white">
                    ${potentialMonthlyExposure.toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#E7EDE5]/80">Annual Supplier Purchasing:</span>
                  <span className="font-mono tabular-nums font-semibold text-white">
                    ${annualSpend.toLocaleString()} / yr
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15">
              <button
                onClick={onStartAudit}
                className="w-full py-3 px-4 text-xs font-semibold text-[#214B3D] bg-[#F8F7F3] hover:bg-white rounded-md transition-colors text-center cursor-pointer shadow-xs"
              >
                Audit Your First Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
