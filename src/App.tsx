import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { SolutionWorkflow } from './components/SolutionWorkflow';
import { InteractiveSampleAudit } from './components/InteractiveSampleAudit';
import { DetectionGrid } from './components/DetectionGrid';
import { Footer } from './components/Footer';
import { PilotRequestModal } from './components/PilotRequestModal';
import { AuthModal } from './components/AuthModal';
import { AuditDashboard } from './components/AuditDashboard';
import { getStoredAuth, logoutAccount } from './services/api';
import { UserAccount } from './types/index.ts';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'new-audit'>('landing');
  const [isPilotModalOpen, setIsPilotModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Restore stored session on mount
  useEffect(() => {
    const { user } = getStoredAuth();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleNavigate = (view: 'landing' | 'dashboard' | 'new-audit') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSample = () => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById('sample-audit');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('sample-audit');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await logoutAccount();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202923] flex flex-col selection:bg-[#214B3D]/15 selection:text-[#214B3D]">
      {/* Minimal Top Navigation */}
      <Navbar
        currentView={currentView}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onSeeInAction={handleScrollToSample}
        onRequestReview={() => setIsPilotModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' ? (
          <>
            {/* Section 1: Hero */}
            <HeroSection
              onSeeInAction={handleScrollToSample}
              onRequestReview={() => setIsPilotModalOpen(true)}
            />

            {/* Section 2: The Problem (Small mistakes. Real money.) */}
            <ProblemSection />

            {/* Section 3: How PriceGuard Works (From invoices to answers.) */}
            <SolutionWorkflow />

            {/* Section 4: Interactive Demo Centerpiece (See what PriceGuard finds.) */}
            <InteractiveSampleAudit
              onRequestReview={() => setIsPilotModalOpen(true)}
            />

            {/* Section 5: Business Benefits (Know where your money goes.) */}
            <DetectionGrid />

            {/* Section 6: Final Conversion & Minimal Footer */}
            <Footer
              onSeeInAction={handleScrollToSample}
              onRequestReview={() => setIsPilotModalOpen(true)}
            />
          </>
        ) : (
          <AuditDashboard
            initialMode={currentView}
            currentUser={currentUser}
            onNavigateHome={() => handleNavigate('landing')}
            onRequestPilot={() => setIsPilotModalOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Verified Lead Capture Modal */}
      <PilotRequestModal
        isOpen={isPilotModalOpen}
        onClose={() => setIsPilotModalOpen(false)}
      />

      {/* Client Sign In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          handleNavigate('dashboard');
        }}
      />
    </div>
  );
}

export default App;
