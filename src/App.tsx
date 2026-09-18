import React from 'react';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { AuthPage } from './pages/AuthPage';
import { OtpPage } from './pages/OtpPage';
import { PersonalDetailsPage } from './pages/PersonalDetailsPage';
import { IdentityPage } from './pages/IdentityPage';
import { VehiclePage } from './pages/VehiclePage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ReviewPage } from './pages/ReviewPage';
import { CompletionPage } from './pages/CompletionPage';

const FlowController: React.FC = () => {
  const { state } = useOnboarding();

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return <AuthPage />;
      case 1:
        return <OtpPage />;
      case 2:
        return <PersonalDetailsPage />;
      case 3:
        return <IdentityPage />;
      case 4:
        return <VehiclePage />;
      case 5:
        return <DocumentsPage />;
      case 6:
        return <ReviewPage />;
      case 7:
        return <CompletionPage />;
      default:
        return <AuthPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <div>
        <Header />
        <Stepper />
        <main className="container mx-auto pb-12">
          {renderCurrentStep()}
        </main>
      </div>

      {/* Persistent Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>TakeOFF Courier Systems • Official Driver Portal</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Powered by Supabase Auth & RLS</span>
            <span>•</span>
            <span>256-Bit SSL Encryption</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <OnboardingProvider>
      <FlowController />
    </OnboardingProvider>
  );
}

export default App;
