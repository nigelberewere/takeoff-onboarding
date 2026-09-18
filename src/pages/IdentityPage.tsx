import React, { useState } from 'react';
import { Camera, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { FileUploader } from '../components/FileUploader';
import { Button } from '../components/Button';

export const IdentityPage: React.FC = () => {
  const { state, setDocumentFile, removeDocumentFile, setStep, saveDraft } = useOnboarding();
  const [formError, setFormError] = useState<string | null>(null);

  const { idFront, idBack, selfie } = state.identity;

  const handleNext = async () => {
    setFormError(null);

    // Validation: Require front ID and selfie at minimum
    if (!idFront.file && !idFront.uploadedUrl && !idFront.previewUrl) {
      setFormError('Please upload or snap the Front of your National ID or Passport.');
      return;
    }
    if (!selfie.file && !selfie.uploadedUrl && !selfie.previewUrl) {
      setFormError('Please capture or upload a driver verification selfie.');
      return;
    }

    await saveDraft();
    setStep(4); // Step 4: Vehicle Details
  };

  const fillSamplePhotos = () => {
    setDocumentFile(
      'identity',
      'idFront',
      new File([''], 'national_id_front.jpg', { type: 'image/jpeg' }),
      'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=800&auto=format&fit=crop'
    );
    setDocumentFile(
      'identity',
      'idBack',
      new File([''], 'national_id_back.jpg', { type: 'image/jpeg' }),
      'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=800&auto=format&fit=crop'
    );
    setDocumentFile(
      'identity',
      'selfie',
      new File([''], 'liveness_selfie.jpg', { type: 'image/jpeg' }),
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop'
    );
    setFormError(null);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
      <div className="logistics-card p-6 sm:p-8 space-y-6">
        {/* Step Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 03 / 06</span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
              Identity & Liveness Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Secure identity validation. Use your camera or upload scanned document photos.
            </p>
          </div>
          <button
            type="button"
            onClick={fillSamplePhotos}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample Photos</span>
          </button>
        </div>

        {/* Liveness Simulation Guidance Banner */}
        <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
          <Camera className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-brand-400">Identity Match Protocol:</span>
            <p className="text-slate-400 text-xs">
              Take a clear front-facing selfie without sunglasses, hats, or strong glare. This is compared against your national document photo during administrative review.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs sm:text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Upload Components */}
        <div className="space-y-6">
          {/* Driver Selfie (Liveness) */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <FileUploader
              title="Driver Liveness Photo (Selfie)"
              subtitle="Capture a live photo using your phone or laptop webcam"
              item={selfie}
              isSelfie={true}
              required
              onFileSelect={(file, previewUrl) => setDocumentFile('identity', 'selfie', file, previewUrl)}
              onRemove={() => removeDocumentFile('identity', 'selfie')}
            />
          </div>

          {/* National ID Front */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <FileUploader
              title="National ID Card / Passport (Front)"
              subtitle="Ensure legal name, photo, and ID number are clearly legible"
              item={idFront}
              required
              onFileSelect={(file, previewUrl) => setDocumentFile('identity', 'idFront', file, previewUrl)}
              onRemove={() => removeDocumentFile('identity', 'idFront')}
            />
          </div>

          {/* National ID Back */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <FileUploader
              title="National ID Card / Passport (Back)"
              subtitle="Upload reverse side of ID card or secondary endorsement page"
              item={idBack}
              onFileSelect={(file, previewUrl) => setDocumentFile('identity', 'idBack', file, previewUrl)}
              onRemove={() => removeDocumentFile('identity', 'idBack')}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setStep(2)}
            icon={ArrowLeft}
            iconPosition="left"
          >
            Back to Personal
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleNext}
            icon={ArrowRight}
            isLoading={state.isSaving}
          >
            Continue to Vehicle Details
          </Button>
        </div>
      </div>
    </div>
  );
};
