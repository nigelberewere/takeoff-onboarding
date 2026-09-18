import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Truck, Sparkles, CheckCircle } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

export const AuthPage: React.FC = () => {
  const { signUp, signIn, state } = useOnboarding();
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+263 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Valid email address is required';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
        errs.fullName = 'Please provide your first and last name';
      }
      if (!phone.trim() || phone.length < 8) {
        errs.phone = 'Valid driver contact number is required';
      }
      if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!validate()) return;

    if (mode === 'register') {
      const res = await signUp(email.trim(), password, fullName.trim(), phone.trim());
      if (!res.success) {
        setAuthError(res.error || 'Failed to create account');
      }
    } else {
      const res = await signIn(email.trim(), password);
      if (!res.success) {
        setAuthError(res.error || 'Invalid email or password');
      }
    }
  };

  const fillQuickDemo = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFullName('Tinashe Moyo');
    setEmail(`tinashe.courier.${randomSuffix}@takeoff.test`);
    setPhone('+263 77 942 1085');
    setPassword('TakeOff2026!');
    setConfirmPassword('TakeOff2026!');
    setErrors({});
    setAuthError(null);
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 px-4">
      {/* Brand Hero Card */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Truck className="w-3.5 h-3.5" />
          <span>Express Delivery Fleet</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Drive With <span className="text-brand-500">TakeOFF</span>
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Join Africa's fastest-growing logistics network. Flexible deliveries, high payouts, and same-day verification.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="logistics-card p-6 sm:p-8 relative">
        {/* Toggle Mode Tabs */}
        <div className="flex bg-slate-950/70 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setAuthError(null);
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-brand-500 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Driver Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setAuthError(null);
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-brand-500 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Demo Fast Filler Badge */}
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={fillQuickDemo}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-medium bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full hover:bg-amber-500/20 transition-all"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Fill Demo Credentials</span>
          </button>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs sm:text-sm flex items-start space-x-2">
            <span className="text-base">⚠️</span>
            <div className="flex-1 font-medium">{authError}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <InputField
                label="Full Name (Legal Name)"
                required
                icon={User}
                placeholder="e.g. Tinashe Moyo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                helperText="Must match your official national identity card"
              />

              <InputField
                label="Driver Mobile Phone"
                required
                type="tel"
                icon={Phone}
                placeholder="+263 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                helperText="For dispatch calls and customer notifications"
              />
            </>
          )}

          <InputField
            label="Email Address"
            required
            type="email"
            icon={Mail}
            placeholder="driver@takeoff.co"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            helperText={mode === 'register' ? 'A real 6-digit OTP code will be sent to this email' : undefined}
          />

          <InputField
            label="Password"
            required
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          {mode === 'register' && (
            <InputField
              label="Confirm Password"
              required
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={state.isSaving}
              icon={ArrowRight}
            >
              {mode === 'register' ? 'Register & Send OTP' : 'Sign In to Driver Portal'}
            </Button>
          </div>
        </form>

        {/* Trust Badges */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>Supabase Authenticated & Row-Level Encrypted</span>
          </div>
          <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Real Email OTP</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Live DB Sync</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
