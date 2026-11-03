import React, { useState } from 'react';

interface FooterProps {
  onCheckInvoices: () => void;
  onExploreSample: () => void;
  onRequestAudit: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onCheckInvoices, onExploreSample, onRequestAudit }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-[#202923] text-white">
      {/* Final Conversion Decision Block */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-b border-white/10">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
            You negotiated the prices. Make sure your invoices reflect them.
          </h2>
          <p className="text-base text-[#E7EDE5]/80 leading-relaxed max-w-2xl">
            See where your supplier invoices may not match your agreements. Start with a sample audit and decide what deserves a closer look.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onCheckInvoices}
              className="px-6 py-3.5 text-xs font-semibold text-[#202923] bg-[#F8F7F3] hover:bg-white rounded-md transition-colors text-center cursor-pointer shadow-xs"
            >
              Check My Supplier Invoices
            </button>
            <button
              onClick={onExploreSample}
              className="px-6 py-3.5 text-xs font-medium text-white bg-transparent hover:bg-white/10 border border-white/20 rounded-md transition-colors text-center cursor-pointer"
            >
              Explore a Sample Audit
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-[#E7EDE5]/60">
        <div className="space-y-1">
          <div className="font-bold text-white text-sm">PriceGuard</div>
          <div>Independent supplier invoice auditing for restaurants, hotels, and hospitality operators.</div>
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
            Terms of Service
          </button>
          <button
            onClick={onRequestAudit}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Pilot Program Inquiries
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
                {modalType === 'privacy' ? 'Privacy Notice' : 'Terms of Service'}
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
                    PriceGuard is committed to protecting the confidentiality of your procurement contracts, agreed pricing sheets, and supplier invoices.
                  </p>
                  <p>
                    <strong>Data Isolation:</strong> All documents processed in your audit session are stored in secure private storage associated only with your account. We never monetize, publicly display, or resell your commercial pricing terms.
                  </p>
                  <p>
                    <strong>No Third-Party Advertising:</strong> We do not share your purchasing data with supplier networks, competitors, or marketing brokers.
                  </p>
                  <p>
                    <strong>Data Deletion:</strong> You retain the right to delete your uploaded documents, extracted line items, and audit reports at any time.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    PriceGuard provides price auditing tools to assist hospitality operators in identifying potential pricing differences.
                  </p>
                  <p>
                    <strong>Independent Verification:</strong> Flagged discrepancies represent mathematical variances between uploaded invoices and reference price schedules. They are intended for internal operational review prior to requesting vendor credits.
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
