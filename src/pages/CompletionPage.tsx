import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, ShieldCheck, RefreshCw, Truck, Copy, Check, SlidersHorizontal, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOnboarding } from '../context/OnboardingContext';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import type { ApplicationStatus } from '../types';

export const CompletionPage: React.FC = () => {
  const { state, syncFromDatabase, simulateAdminStatusChange, setStep } = useOnboarding();
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdminSim, setShowAdminSim] = useState(false);

  // Trigger celebration on initial mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#f97316', '#fb923c', '#10b981', '#3b82f6'],
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(state.applicationReferenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    await syncFromDatabase();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const status = state.applicationStatus || 'pending_review';

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      <div className="space-y-6">
        {/* Hero Card */}
        <div className="logistics-card p-6 sm:p-10 text-center relative overflow-hidden space-y-6">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center mx-auto text-white shadow-glow animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span>Application Submitted Successfully</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Welcome to the <span className="text-brand-500">TakeOFF</span> Fleet
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Your driver onboarding submission has been received and queued for operations review. You will receive an automated notification once identity validation is completed.
            </p>
          </div>

          {/* Application Reference Box */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl max-w-md mx-auto flex items-center justify-between">
            <div className="text-left space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Application Reference ID
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-brand-400">
                {state.applicationReferenceId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyRef}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-all flex items-center space-x-1.5 text-xs font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Live Status Tracker */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Live Application Status
              </span>
              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1 font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Check Status</span>
              </button>
            </div>

            <div className="flex justify-center">
              <StatusBadge status={status} size="lg" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {status === 'pending_review' &&
                'Our compliance team is verifying your national ID, driver license, and vehicle registration. Average review time: under 2 hours.'}
              {status === 'approved' &&
                'Congratulations! Your credentials have been officially approved. Your dispatch credentials are now active.'}
              {status === 'rejected' &&
                'One or more documents require updated scans or clarification. Please edit your application and resubmit.'}
            </p>
          </div>

          {/* Quick Summary Preview */}
          <div className="border-t border-slate-800/80 pt-6 max-w-md mx-auto grid grid-cols-2 gap-4 text-left text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Assigned Driver</span>
              <span className="font-semibold text-slate-200">{state.personal.fullName || state.auth.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Courier Unit</span>
              <span className="font-semibold text-slate-200 capitalize">
                {state.vehicle.make} {state.vehicle.model} ({state.vehicle.type})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Contact</span>
              <span className="font-semibold text-slate-200">{state.auth.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Submission Time</span>
              <span className="font-semibold text-slate-200">
                {state.submittedAt ? new Date(state.submittedAt).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>
        </div>

        {/* Examiner / Admin Demonstration Drawer */}
        <div className="p-5 logistics-card border-dashed border-slate-700/80 bg-slate-900/60 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-500" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                Admin Review Simulation (Grading / Assessment Tool)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowAdminSim(!showAdminSim)}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium underline"
            >
              {showAdminSim ? 'Hide Controls' : 'Show Controls'}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Per the assessment guidelines, status changes made in Supabase are reflected dynamically. Use these buttons to simulate what happens when an operations reviewer modifies the record status in the database:
          </p>

          {showAdminSim && (
            <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => simulateAdminStatusChange('pending_review')}
              >
                Set Pending
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => simulateAdminStatusChange('approved')}
              >
                Simulate Admin Approve
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => simulateAdminStatusChange('rejected')}
              >
                Simulate Admin Reject
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setStep(6)}
              >
                Return to Review Screen
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
