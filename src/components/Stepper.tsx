import React from 'react';
import { User, ShieldCheck, Camera, Car, FileText, CheckSquare, Flag } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';

interface StepConfig {
  step: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortLabel: string;
}

const STEPS: StepConfig[] = [
  { step: 1, label: 'Verification', shortLabel: 'OTP', icon: ShieldCheck },
  { step: 2, label: 'Personal Details', shortLabel: 'Personal', icon: User },
  { step: 3, label: 'Identity & Selfie', shortLabel: 'ID Check', icon: Camera },
  { step: 4, label: 'Vehicle Details', shortLabel: 'Vehicle', icon: Car },
  { step: 5, label: 'Driver Documents', shortLabel: 'Docs', icon: FileText },
  { step: 6, label: 'Review Application', shortLabel: 'Review', icon: CheckSquare },
  { step: 7, label: 'Status & Reference', shortLabel: 'Status', icon: Flag },
];

export const Stepper: React.FC = () => {
  const { state, setStep } = useOnboarding();
  const currentStep = state.currentStep;

  // Don't show full stepper on step 0 (initial sign-in/sign-up screen)
  if (currentStep === 0) return null;

  const totalSteps = STEPS.length;
  const activeIndex = Math.min(Math.max(currentStep - 1, 0), totalSteps - 1);
  const progressPercent = Math.round(((activeIndex) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full bg-slate-900/70 border-b border-slate-800/80 py-4 px-4 sm:px-6 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-brand-500 font-bold uppercase tracking-wider text-[11px]">
              Route Progress
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-medium">
              Stage {Math.min(currentStep, totalSteps)} of {totalSteps}: {STEPS[activeIndex]?.label}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-mono text-xs">{progressPercent}% Completed</span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Route Stops / Nodes */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            const isClickable = isCompleted || s.step <= currentStep;
            const Icon = s.icon;

            return (
              <button
                key={s.step}
                type="button"
                disabled={!isClickable || currentStep === 7}
                onClick={() => isClickable && setStep(s.step)}
                className={`group flex flex-col items-center text-center transition-all p-1 rounded-xl ${
                  isClickable && currentStep !== 7
                    ? 'cursor-pointer hover:bg-slate-800/50'
                    : 'cursor-default opacity-60'
                }`}
              >
                {/* Node circle */}
                <div
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isCurrent
                      ? 'bg-brand-500 text-white shadow-glow border border-brand-400 animate-route-pulse'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                {/* Step label */}
                <span
                  className={`mt-1.5 text-[10px] sm:text-xs font-medium tracking-tight truncate max-w-full ${
                    isCurrent
                      ? 'text-brand-400 font-semibold'
                      : isCompleted
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  <span className="hidden sm:inline">{s.shortLabel}</span>
                  <span className="sm:hidden">{s.step}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
