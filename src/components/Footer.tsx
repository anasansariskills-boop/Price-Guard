import React, { useState } from 'react';

interface FooterProps {
  onTryDemo: () => void;
  onRequestReview: () => void;
  onOpenAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onTryDemo, onRequestReview, onOpenAuth }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#202923] text-white">
      {/* Section 8: Final CTA */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 border-b border-white/10 text-left">
        <div className="max-w-2xl space-y-5">
          <div className="text-xs font-medium text-[#BE825B]">
            Supplier Invoice Auditing
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance leading-tight">
            See what your own supplier invoices might reveal.
          </h2>
          <p className="text-base text-[#E7EDE5]/85 leading-relaxed">
            If you manage purchasing for a hotel or restaurant group, we can walk you through how PriceGuard could work for your business.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={onRequestReview}
              className="px-6 py-3.5 text-xs font-semibold text-[#202923] bg-white hover:bg-[#F8F7F3] rounded-md transition-colors text-center cursor-pointer shadow-xs"
            >
              Request an Invoice Review
            </button>
            <button
              onClick={onTryDemo}
              className="px-6 py-3.5 text-xs font-medium text-white bg-transparent hover:bg-white/10 border border-white/25 rounded-md transition-colors text-center cursor-pointer"
            >
              Try Live Demo
            </button>
          </div>

          <p className="pt-1 text-xs text-[#E7EDE5]/65">
            Built by GTEX · Demo uses fictional data · Personalized pilots and invoice reviews available on request
          </p>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#E7EDE5]/65">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">PriceGuard</span>
          <span>by GTEX · Supplier invoice auditing for hospitality.</span>
        </div>

        <div className="flex flex-wrap items-center gap-5">
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
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Client Login
            </button>
          )}
          <button
            onClick={onRequestReview}
            className="hover:text-white transition-colors cursor-pointer text-[#E7EDE5]"
          >
            Request Review
          </button>
          <span>&copy; {new Date().getFullYear()} GTEX. All rights reserved.</span>
        </div>
      </div>

      {/* Lightbox for Privacy and Terms */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white text-[#202923] max-w-lg w-full rounded-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto text-left">
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

            <div className="text-xs text-[#202923]/80 space-y-2.5 leading-relaxed">
              {modalType === 'privacy' ? (
                <>
                  <p>
                    PriceGuard and GTEX are committed to confidentiality. Information submitted through this website is used exclusively to contact you about your invoice review request.
                  </p>
                  <p>
                    <strong>Data Privacy:</strong> We do not sell or share your contact information with suppliers, brokers, or competitors.
                  </p>
                  <p>
                    <strong>Fictional Demonstration:</strong> The public demonstration uses synthetic sample data for illustrative purposes.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    PriceGuard demonstrates supplier invoice auditing methods for hospitality businesses.
                  </p>
                  <p>
                    <strong>Independent Verification:</strong> Identified variances represent differences between reference price schedules and billed invoices for internal team review.
                  </p>
                  <p>
                    <strong>No Banking Integration:</strong> PriceGuard does not execute payments or alter accounting systems.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
