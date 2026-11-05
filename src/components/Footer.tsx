import React, { useState } from 'react';

interface FooterProps {
  onSeeInAction: () => void;
  onRequestReview: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSeeInAction, onRequestReview }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#202923] text-white">
      {/* Final Conversion Decision Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-b border-white/10">
        <div className="max-w-3xl space-y-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#BE825B]">
            Protect Your Purchasing Margins
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
            You negotiated the prices. Make sure your invoices reflect them.
          </h2>
          <p className="text-base sm:text-lg text-[#E7EDE5]/80 leading-relaxed max-w-2xl">
            PriceGuard helps hotel and restaurant teams spot supplier pricing discrepancies, understand the potential impact, and take action with confidence.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onSeeInAction}
              className="px-6 py-3.5 text-xs font-semibold text-[#202923] bg-white hover:bg-[#F8F7F3] rounded-md transition-colors text-center cursor-pointer shadow-xs"
            >
              See PriceGuard in Action
            </button>
            <button
              onClick={onRequestReview}
              className="px-6 py-3.5 text-xs font-medium text-white bg-transparent hover:bg-white/10 border border-white/20 rounded-md transition-colors text-center cursor-pointer"
            >
              Request a Free Invoice Review
            </button>
          </div>
        </div>
      </div>

      {/* Footer Utility & Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-[#E7EDE5]/60">
        <div className="space-y-1">
          <div className="font-bold text-white text-sm">PriceGuard</div>
          <div>Supplier invoice auditing and discrepancy review for hotels, restaurants, and hospitality groups.</div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <button
            onClick={() => setModalType('privacy')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy Notice
          </button>
          <button
            onClick={() => setModalType('terms')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms of Demonstration
          </button>
          <button
            onClick={onRequestReview}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Request Invoice Review
          </button>
          <span>&copy; {new Date().getFullYear()} PriceGuard. All rights reserved.</span>
        </div>
      </div>

      {/* Privacy & Terms Lightbox Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-[#202923] max-w-lg w-full rounded-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E1E3DD] pb-3">
              <h3 className="text-sm font-bold text-[#202923]">
                {modalType === 'privacy' ? 'Privacy Notice' : 'Terms of Demonstration'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-xs text-[#202923]/60 hover:text-[#202923] p-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="text-xs text-[#202923]/80 space-y-3 leading-relaxed">
              {modalType === 'privacy' ? (
                <>
                  <p>
                    PriceGuard is committed to protecting the confidentiality of your procurement contracts, agreed pricing schedules, and supplier invoices.
                  </p>
                  <p>
                    <strong>Data Privacy:</strong> Information submitted via the inquiry form is used exclusively to contact you regarding your invoice review request. We do not sell, rent, or share your contact or purchasing data with third parties or competitors.
                  </p>
                  <p>
                    <strong>Fictional Demonstration:</strong> The public interactive demonstration operates exclusively on synthetic and fictional supplier datasets.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    PriceGuard provides price auditing tools to assist hospitality operators in identifying potential pricing differences.
                  </p>
                  <p>
                    <strong>Independent Verification:</strong> Flagged discrepancies represent mathematical variances between reference price schedules and billed invoice lines. They are intended for internal operational review prior to requesting vendor credits.
                  </p>
                  <p>
                    <strong>No Banking Integration:</strong> PriceGuard does not execute payments, modify general ledgers, or send unauthorized dispute notices to your suppliers.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
