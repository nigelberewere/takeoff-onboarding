import React, { useState } from 'react';
import { User, ShieldCheck, Car, FileText, Edit3, Send, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { Button } from '../components/Button';

export const ReviewPage: React.FC = () => {
  const { state, setStep, submitApplication } = useOnboarding();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { personal, vehicle, identity, documents } = state;

  const handleSubmit = async () => {
    setSubmitError(null);
    const success = await submitApplication();
    if (!success) {
      setSubmitError(state.error || 'Failed to submit application. Please check your internet connection.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="logistics-card p-6 sm:p-8">
          <div className="flex items-start justify-between border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 06 / 06</span>
              <h2 className="text-2xl font-display font-bold text-white mt-1">
                Final Review & Submission
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Please verify all profile details, vehicle specifications, and compliance documents before final transmission.
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
              <span>Ref ID:</span>
              <span className="text-brand-400 font-bold">{state.applicationReferenceId}</span>
            </div>
          </div>

          {submitError && (
            <div className="mt-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs sm:text-sm flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Review Sections */}
          <div className="mt-6 space-y-6">
            {/* 1. Personal & Contact Card */}
            <div className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base">Personal & Contact Details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-300 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-semibold text-slate-200">{personal.fullName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                  <span className="font-semibold text-slate-200">{personal.dob || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">National ID Number</span>
                  <span className="font-semibold font-mono text-slate-200">{personal.nationalId || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="font-semibold text-slate-200">{state.auth.email || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone Contact</span>
                  <span className="font-semibold text-slate-200">{state.auth.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Operating City</span>
                  <span className="font-semibold text-slate-200">{personal.city || '—'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Residential Address</span>
                  <span className="font-semibold text-slate-200">{personal.address || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                  <span className="font-semibold text-slate-200">
                    {personal.emergencyContactName} ({personal.emergencyContactPhone})
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Identity Verification Card */}
            <div className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base">Identity & Liveness Photos</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-300 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Photos</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Liveness Selfie', doc: identity.selfie },
                  { label: 'National ID (Front)', doc: identity.idFront },
                  { label: 'National ID (Back)', doc: identity.idBack },
                ].map(({ label, doc }, idx) => {
                  const url = doc.uploadedUrl || doc.previewUrl;
                  return (
                    <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                      <span className="text-[11px] font-medium text-slate-400 block">{label}</span>
                      {url ? (
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black relative border border-slate-700">
                          <img src={url} alt={label} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-video w-full rounded-lg bg-slate-950 border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                          Not Provided
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready for validation</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Vehicle Details Card */}
            <div className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                    <Car className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base">Vehicle Specifications</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-300 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Vehicle</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-[11px]">Type</span>
                  <span className="font-bold text-brand-400 uppercase">{vehicle.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Make & Model</span>
                  <span className="font-semibold text-slate-200">
                    {vehicle.make} {vehicle.model}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Year</span>
                  <span className="font-semibold text-slate-200">{vehicle.year}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Plate Number</span>
                  <span className="font-bold font-mono text-slate-100 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">
                    {vehicle.plateNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Documents Card */}
            <div className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base">Statutory Fleet Documents</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-300 font-medium px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Documents</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Driver's License (Front)", doc: documents.licenseFront },
                  { label: "Driver's License (Back)", doc: documents.licenseBack },
                  { label: 'Vehicle Registration / Logbook', doc: documents.vehicleRegistration },
                  { label: 'Vehicle Insurance Policy', doc: documents.insurance },
                ].map(({ label, doc }, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-medium text-slate-200 block">{label}</span>
                      <span className="text-slate-400 text-[11px] truncate max-w-[180px] block">
                        {doc.fileName || 'Verified Document'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Attached</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Final Submission Banner */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStep(5)}
              icon={ArrowLeft}
              iconPosition="left"
            >
              Back to Documents
            </Button>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleSubmit}
                isLoading={state.isSubmitting}
                icon={Send}
              >
                Submit Official Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
