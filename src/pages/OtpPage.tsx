import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { Button } from '../components/Button';

export const OtpPage: React.FC = () => {
  const { state, verifyOtp, resendOtp, setStep } = useOnboarding();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // 60s countdown timer
  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    setErrorMessage(null);
    const cleaned = val.replace(/\D/g, ''); // Numbers only

    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Single digit input
    const single = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = single;
    setDigits(newDigits);

    // Auto advance to next box
    if (index < 5 && single) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if last digit is filled
    const fullCode = newDigits.join('');
    if (index === 5 && fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeOverride?: string) => {
    const code = codeOverride || digits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    const res = await verifyOtp(code);
    setIsVerifying(false);

    if (!res.success) {
      setErrorMessage(
        res.error?.includes('expired')
          ? 'This verification code has expired. Please request a new code below.'
          : res.error || 'Invalid 6-digit code. Please verify against your email.'
      );
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setErrorMessage(null);
    setResendSuccess(false);

    const res = await resendOtp();
    if (res.success) {
      setResendSuccess(true);
      setCanResend(false);
      setTimer(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setResendSuccess(false), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4">
      <div className="logistics-card p-6 sm:p-8 text-center space-y-6">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-500 shadow-glow">
          <ShieldCheck className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            Verify Your Email
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            We sent a secure 6-digit authentication code to:
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-brand-400">
            <Mail className="w-3.5 h-3.5" />
            <span className="font-semibold">{state.auth.email || 'your-email@domain.com'}</span>
          </div>
        </div>

        {/* Error / Resend Alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs sm:text-sm flex items-start space-x-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 justify-center">
            <CheckCircle2 className="w-4 h-4" />
            <span>A fresh 6-digit code has been dispatched to your inbox!</span>
          </div>
        )}

        {/* 6-Digit Auto-Advancing Input Boxes */}
        <div className="flex justify-center items-center space-x-2 sm:space-x-3 py-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl bg-slate-950 border transition-all duration-200 focus:outline-none ${
                digit
                  ? 'border-brand-500 text-brand-400 bg-brand-500/5 shadow-glow'
                  : 'border-slate-800 text-white focus:border-brand-500/80'
              }`}
            />
          ))}
        </div>

        {/* Verify Action Button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isVerifying}
          onClick={() => handleVerify()}
          icon={ArrowRight}
          disabled={digits.join('').length !== 6}
        >
          Verify & Continue Onboarding
        </Button>

        {/* Resend Cooldown Timer */}
        <div className="pt-2 text-xs text-slate-400 flex flex-col items-center space-y-2">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center space-x-1.5 focus:outline-none underline underline-offset-4"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Verification Code</span>
            </button>
          ) : (
            <p className="flex items-center space-x-1.5 text-slate-400">
              <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />
              <span>Resend available in <strong className="text-slate-300 font-mono">{timer}s</strong></span>
            </p>
          )}

          <button
            type="button"
            onClick={() => setStep(0)}
            className="text-[11px] text-slate-400 hover:text-slate-300 transition-colors pt-2"
          >
            Wrong email address? Return to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
