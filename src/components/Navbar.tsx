import React, { useState } from 'react';
import { UserAccount } from '../types/index.ts';

interface NavbarProps {
  currentView: 'landing' | 'demo' | 'dashboard' | 'new-audit';
  currentUser: UserAccount | null;
  onNavigate: (view: 'landing' | 'demo' | 'dashboard' | 'new-audit') => void;
  onTryDemo: () => void;
  onRequestReview: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentUser,
  onNavigate,
  onTryDemo,
  onRequestReview,
  onOpenAuth
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-xs border-b border-[#E1E3DD]">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">
        {/* Brand Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xl font-bold tracking-tight text-[#214B3D] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 text-left focus:outline-hidden cursor-pointer"
        >
          PriceGuard
        </button>

        {/* Sales Navigation Links */}
        {currentView === 'landing' ? (
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#202923]/80">
            <a href="#problem" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              The Problem
            </a>
            <a href="#how-it-works" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              How It Works
            </a>
            <a href="#showcase" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              Showcase
            </a>
            <button
              onClick={onTryDemo}
              className="hover:text-[#214B3D] transition-colors whitespace-nowrap font-semibold text-[#214B3D] cursor-pointer"
            >
              Interactive Demo
            </button>
            <a href="#benefits" className="hover:text-[#214B3D] transition-colors whitespace-nowrap">
              Benefits
            </a>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#202923]/70">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              ← Back to Product Showcase
            </button>
          </nav>
        )}

          {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onTryDemo}
            className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-[#214B3D] bg-white hover:bg-[#F2F5F0] border border-[#214B3D]/30 rounded-md transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          >
            Try Live Demo
          </button>

          {currentUser && currentUser.id !== 'demo-user' ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:inline-flex text-xs font-semibold text-[#214B3D] hover:underline cursor-pointer"
            >
              {currentUser.name}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex text-xs text-[#202923]/60 hover:text-[#202923] px-2 py-1 transition-colors cursor-pointer"
            >
              Client Login
            </button>
          )}

          <button
            onClick={onRequestReview}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            Request a Review
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#202923] hover:text-[#214B3D] cursor-pointer"
            aria-label="Toggle mobile navigation menu"
          >
            <span className="text-base font-mono">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E1E3DD] bg-white px-6 py-4 space-y-3 text-left text-xs font-medium text-[#202923]">
          <div>
            <a
              href="#problem"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#214B3D]"
            >
              The Problem
            </a>
          </div>
          <div>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#214B3D]"
            >
              How It Works
            </a>
          </div>
          <div>
            <a
              href="#showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#214B3D]"
            >
              Showcase
            </a>
          </div>
          <div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onTryDemo();
              }}
              className="block py-1 font-semibold text-[#214B3D] text-left w-full cursor-pointer"
            >
              Interactive Demo (Full Screen)
            </button>
          </div>
          <div>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#214B3D]"
            >
              Benefits
            </a>
          </div>
          <div className="pt-2 border-t border-[#E1E3DD] flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="text-[#202923]/70 hover:text-[#202923]"
            >
              Client Login
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestReview();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#214B3D] rounded-md"
            >
              Request a Review
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
