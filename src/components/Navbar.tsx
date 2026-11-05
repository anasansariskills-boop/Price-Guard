import React from 'react';
import { UserAccount } from '../types/index.ts';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'new-audit';
  currentUser: UserAccount | null;
  onNavigate: (view: 'landing' | 'dashboard' | 'new-audit') => void;
  onSeeInAction: () => void;
  onRequestReview: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentUser,
  onNavigate,
  onSeeInAction,
  onRequestReview,
  onOpenAuth
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-xs border-b border-[#E1E3DD]">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
        {/* Brand Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xl font-bold tracking-tight text-[#214B3D] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 text-left focus:outline-hidden cursor-pointer"
        >
          PriceGuard
        </button>

        {/* Navigation Links */}
        {currentView === 'landing' ? (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#202923]/80">
            <a href="#problem" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              The Problem
            </a>
            <a href="#cost-calculator" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              Financial Impact
            </a>
            <a href="#how-it-works" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              How It Works
            </a>
            <a href="#sample-audit" className="hover:text-[#214B3D] transition-colors whitespace-nowrap font-semibold text-[#214B3D]">
              Interactive Demo
            </a>
            <a href="#benefits" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              Benefits
            </a>
            <a href="#trust" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              Trust & Transparency
            </a>
            <a href="#faq" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              FAQ
            </a>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#202923]/70">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Public Product Overview
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'dashboard' ? 'text-[#214B3D] font-semibold' : ''
              }`}
            >
              Audit Workspace
            </button>
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser && currentUser.id !== 'demo-user' ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:inline-flex text-xs font-semibold text-[#214B3D] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              {currentUser.name}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex text-xs font-medium text-[#202923]/75 hover:text-[#202923] px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Client Sign In
            </button>
          )}

          {currentView === 'landing' ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onRequestReview}
                className="hidden sm:inline-flex text-xs font-medium text-[#214B3D] hover:text-[#1A3C31] px-3 py-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Request Free Review
              </button>
              <button
                onClick={onSeeInAction}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
              >
                See It in Action
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('new-audit')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              New Invoice Audit
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
