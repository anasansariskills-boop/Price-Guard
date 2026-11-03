import React from 'react';
import { UserAccount } from '../types/index.ts';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'new-audit';
  currentUser: UserAccount | null;
  onNavigate: (view: 'landing' | 'dashboard' | 'new-audit') => void;
  onRequestAudit: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentUser,
  onNavigate,
  onRequestAudit,
  onOpenAuth
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-xs border-b border-[#E1E3DD]">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xl font-bold tracking-tight text-[#214B3D] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 text-left focus:outline-hidden"
        >
          PriceGuard
        </button>

        {/* Zone 2: Navigation Links (Single-line text with subtle hover) */}
        {currentView === 'landing' ? (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#202923]/80">
            <a href="#how-it-works" className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#what-it-finds" className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0">
              What It Finds
            </a>
            <a href="#cost-calculator" className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0">
              Cost Exposure
            </a>
            <a href="#sample-audit" className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0">
              Sample Audit
            </a>
            <a href="#faq" className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#202923]/70">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0"
            >
              Public Website
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0 ${currentView === 'dashboard' ? 'text-[#214B3D] font-semibold' : ''}`}
            >
              Audit Workspace
            </button>
          </nav>
        )}

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser && currentUser.id !== 'demo-user' ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:inline-flex text-xs font-semibold text-[#214B3D] hover:underline whitespace-nowrap shrink-0"
            >
              {currentUser.name}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-medium text-[#202923]/75 hover:text-[#202923] px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          )}

          {currentView === 'landing' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onRequestAudit}
                className="hidden sm:inline-flex text-xs font-medium text-[#214B3D] hover:text-[#1A3C31] px-3 py-2 transition-colors whitespace-nowrap shrink-0"
              >
                Request Free Audit
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
              >
                Check Your Invoices
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('new-audit')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              New Invoice Audit
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
