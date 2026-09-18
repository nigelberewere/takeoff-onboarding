import React, { useState } from 'react';
import { User, Calendar, CreditCard, Home, MapPin, Phone, ShieldAlert, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

export const PersonalDetailsPage: React.FC = () => {
  const { state, updatePersonal, setStep, saveDraft } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const personal = state.personal;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!personal.fullName.trim()) errs.fullName = 'Full legal name is required';
    if (!personal.dob) {
      errs.dob = 'Date of birth is required';
    } else {
      const birthYear = new Date(personal.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - birthYear < 18) {
        errs.dob = 'Drivers must be at least 18 years of age';
      }
    }
    if (!personal.nationalId.trim()) errs.nationalId = 'National ID number is required';
    if (!personal.address.trim()) errs.address = 'Residential street address is required';
    if (!personal.city.trim()) errs.city = 'City of delivery operations is required';
    if (!personal.emergencyContactName.trim()) errs.emergencyContactName = 'Emergency contact person is required';
    if (!personal.emergencyContactPhone.trim()) errs.emergencyContactPhone = 'Emergency contact telephone number is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await saveDraft();
    setStep(3); // Step 3: Identity Verification
  };

  const fillTestPreset = () => {
    updatePersonal({
      dob: '1996-08-24',
      nationalId: '63-198420-C42',
      address: '14 Enterprise Road, Newlands',
      city: 'Harare',
      emergencyContactName: 'Grace Moyo (Sister)',
      emergencyContactPhone: '+263 78 554 9012',
    });
    setErrors({});
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
      <div className="logistics-card p-6 sm:p-8 space-y-6">
        {/* Step Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 02 / 06</span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
              Personal & Contact Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Enter your official identity details for fleet compliance and background verification.
            </p>
          </div>
          <button
            type="button"
            onClick={fillTestPreset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Sample Data</span>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleNext} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Legal Full Name"
              required
              icon={User}
              placeholder="Full Name"
              value={personal.fullName}
              onChange={(e) => updatePersonal({ fullName: e.target.value })}
              error={errors.fullName}
              helperText="Prefilled from registration"
            />

            <InputField
              label="Date of Birth"
              required
              type="date"
              icon={Calendar}
              value={personal.dob}
              onChange={(e) => updatePersonal({ dob: e.target.value })}
              error={errors.dob}
              helperText="Must be 18 or older"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="National ID / Passport Number"
              required
              icon={CreditCard}
              placeholder="e.g. 63-198420-C42"
              value={personal.nationalId}
              onChange={(e) => updatePersonal({ nationalId: e.target.value })}
              error={errors.nationalId}
              helperText="Test format accepted"
            />

            <InputField
              label="Operating City"
              required
              icon={MapPin}
              placeholder="e.g. Harare, Bulawayo, Mutare"
              value={personal.city}
              onChange={(e) => updatePersonal({ city: e.target.value })}
              error={errors.city}
            />
          </div>

          <InputField
            label="Residential Address"
            required
            icon={Home}
            placeholder="Street name, house number, area"
            value={personal.address}
            onChange={(e) => updatePersonal({ address: e.target.value })}
            error={errors.address}
          />

          {/* Emergency Contact Group */}
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4 text-brand-500" />
              <span>Emergency Contact Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Emergency Contact Name"
                required
                icon={User}
                placeholder="e.g. Grace Moyo (Sister)"
                value={personal.emergencyContactName}
                onChange={(e) => updatePersonal({ emergencyContactName: e.target.value })}
                error={errors.emergencyContactName}
              />

              <InputField
                label="Emergency Contact Phone"
                required
                type="tel"
                icon={Phone}
                placeholder="+263 77 123 4567"
                value={personal.emergencyContactPhone}
                onChange={(e) => updatePersonal({ emergencyContactPhone: e.target.value })}
                error={errors.emergencyContactPhone}
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStep(1)}
              icon={ArrowLeft}
              iconPosition="left"
            >
              Back to OTP
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              isLoading={state.isSaving}
            >
              Save & Verify Identity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
