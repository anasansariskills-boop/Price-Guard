import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';
import { CostCalculator } from './components/CostCalculator';
import { SolutionWorkflow } from './components/SolutionWorkflow';
import { InteractiveSampleAudit } from './components/InteractiveSampleAudit';
import { DetectionGrid } from './components/DetectionGrid';
import { AudienceSplit } from './components/AudienceSplit';
import { TrustPrivacy } from './components/TrustPrivacy';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { PilotRequestModal } from './components/PilotRequestModal';
import { AuthModal } from './components/AuthModal';
import { AuditDashboard } from './components/AuditDashboard';
import { AIAssistantWidget } from './components/AIAssistantWidget';
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
    const el = document.getElementById('sample-audit');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    await logoutAccount();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#202923] flex flex-col selection:bg-[#214B3D]/15 selection:text-[#214B3D]">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onRequestAudit={() => setIsPilotModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' ? (
          <>
            {/* Hero Section */}
            <HeroSection
              onCheckInvoices={() => handleNavigate('dashboard')}
              onExploreSample={handleScrollToSample}
            />

            {/* Problem Section */}
            <ProblemSection />

            {/* Cost Exposure Calculator */}
            <CostCalculator
              onStartAudit={() => handleNavigate('new-audit')}
            />

            {/* Solution Workflow */}
            <SolutionWorkflow />

            {/* Interactive Sample Audit Demonstration */}
            <InteractiveSampleAudit
              onCheckOwnInvoices={() => handleNavigate('new-audit')}
            />

            {/* Detection Grid */}
            <DetectionGrid />

            {/* Audience Split: Restaurants & Hotels */}
            <AudienceSplit />

            {/* Trust and Privacy Section */}
            <TrustPrivacy />

            {/* FAQ Section */}
            <FAQSection />

            {/* Footer */}
            <Footer
              onCheckInvoices={() => handleNavigate('dashboard')}
              onExploreSample={handleScrollToSample}
              onRequestAudit={() => setIsPilotModalOpen(true)}
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

      {/* Pilot Request / Free Sample Audit Modal */}
      <PilotRequestModal
        isOpen={isPilotModalOpen}
        onClose={() => setIsPilotModalOpen(false)}
      />

      {/* Real User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          handleNavigate('dashboard');
        }}
      />

      {/* Floating PriceGuard AI Assistant & Navigator */}
      <AIAssistantWidget
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onScrollToSample={handleScrollToSample}
        onScrollToCalculator={() => {
          const el = document.getElementById('calculator');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}

export default App;
