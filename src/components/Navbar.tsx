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
  onRequestReview
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-xs border-b border-[#E1E3DD]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single Clean Brand Wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xl font-bold tracking-tight text-[#214B3D] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 text-left focus:outline-hidden cursor-pointer"
        >
          PriceGuard
        </button>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        {currentView === 'landing' ? (
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#202923]/80">
            <a href="#problem" className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0">
              The Problem
            </a>
            <a href="#why-it-matters" className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0">
              Why It Matters
            </a>
            <a href="#how-it-works" className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#showcase" className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0">
              Showcase
            </a>
            <button
              onClick={onTryDemo}
              className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0 font-semibold text-[#214B3D] cursor-pointer"
            >
              Live Demo
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#202923]/70">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-[#214B3D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              ← Back to Website
            </button>
          </nav>
        )}

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser && currentUser.id !== 'demo-user' && currentView !== 'landing' ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:inline-flex text-xs font-semibold text-[#214B3D] hover:underline cursor-pointer whitespace-nowrap shrink-0"
            >
              {currentUser.name}
            </button>
          ) : null}

          <button
            onClick={onRequestReview}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-white bg-[#214B3D] hover:bg-[#1A3C31] rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
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
          <a
            href="#problem"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 hover:text-[#214B3D]"
          >
            The Problem
          </a>
          <a
            href="#why-it-matters"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 hover:text-[#214B3D]"
          >
            Why It Matters
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 hover:text-[#214B3D]"
          >
            How It Works
          </a>
          <a
            href="#showcase"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 hover:text-[#214B3D]"
          >
            Showcase
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onTryDemo();
            }}
            className="block py-1.5 font-semibold text-[#214B3D] text-left w-full cursor-pointer"
          >
            Try Live Demo
          </button>
          <div className="pt-2 border-t border-[#E1E3DD]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestReview();
              }}
              className="w-full px-4 py-2.5 text-xs font-semibold text-white bg-[#214B3D] rounded-md text-center cursor-pointer"
            >
              Request an Invoice Review
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
