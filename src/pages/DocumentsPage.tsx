import React, { useState } from 'react';
import { FileText, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { FileUploader } from '../components/FileUploader';
import { Button } from '../components/Button';

export const DocumentsPage: React.FC = () => {
  const { state, setDocumentFile, removeDocumentFile, setStep, saveDraft } = useOnboarding();
  const [formError, setFormError] = useState<string | null>(null);

  const { licenseFront, licenseBack, vehicleRegistration, insurance } = state.documents;

  const handleNext = async () => {
    setFormError(null);

    if (!licenseFront.file && !licenseFront.uploadedUrl && !licenseFront.previewUrl) {
      setFormError("Please upload or capture your Driver's License (Front).");
      return;
    }
    if (!vehicleRegistration.file && !vehicleRegistration.uploadedUrl && !vehicleRegistration.previewUrl) {
      setFormError('Please upload your Vehicle Registration / Logbook document.');
      return;
    }
    if (!insurance.file && !insurance.uploadedUrl && !insurance.previewUrl) {
      setFormError('Please upload your Proof of Vehicle Insurance certificate.');
      return;
    }

    await saveDraft();
    setStep(6); // Step 6: Review Stage
  };

  const fillSampleDocuments = () => {
    setDocumentFile(
      'documents',
      'licenseFront',
      new File([''], 'drivers_license_front.jpg', { type: 'image/jpeg' }),
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop'
    );
    setDocumentFile(
      'documents',
      'licenseBack',
      new File([''], 'drivers_license_back.jpg', { type: 'image/jpeg' }),
      'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=800&auto=format&fit=crop'
    );
    setDocumentFile(
      'documents',
      'vehicleRegistration',
      new File([''], 'vehicle_registration_logbook.pdf', { type: 'application/pdf' }),
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop'
    );
    setDocumentFile(
      'documents',
      'insurance',
      new File([''], 'commercial_insurance_policy.pdf', { type: 'application/pdf' }),
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop'
    );
    setFormError(null);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
      <div className="logistics-card p-6 sm:p-8 space-y-6">
        {/* Step Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 05 / 06</span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
              Statutory Fleet Documentation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Upload compliance records. These are securely archived in Supabase Storage with Row-Level Security.
            </p>
          </div>
          <button
            type="button"
            onClick={fillSampleDocuments}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample Documents</span>
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs sm:text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Uploads List */}
        <div className="space-y-6">
          {/* Driver's License Front */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <FileUploader
              title="Driver's License (Front)"
              subtitle="Must display valid class classification and clear expiry date"
              item={licenseFront}
              required
              onFileSelect={(file, previewUrl) => setDocumentFile('documents', 'licenseFront', file, previewUrl)}
              onRemove={() => removeDocumentFile('documents', 'licenseFront')}
            />
          </div>

          {/* Driver's License Back */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <FileUploader
              title="Driver's License (Back)"
              subtitle="Reverse side showing license codes and endorsements"
              item={licenseBack}
              onFileSelect={(file, previewUrl) => setDocumentFile('documents', 'licenseBack', file, previewUrl)}
              onRemove={() => removeDocumentFile('documents', 'licenseBack')}
            />
          </div>

          {/* Vehicle Registration / Logbook */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <FileUploader
              title="Vehicle Registration / Logbook (ZINARA / CVR)"
              subtitle="Proof of vehicle ownership or authorized operating lease agreement"
              item={vehicleRegistration}
              required
              onFileSelect={(file, previewUrl) => setDocumentFile('documents', 'vehicleRegistration', file, previewUrl)}
              onRemove={() => removeDocumentFile('documents', 'vehicleRegistration')}
            />
          </div>

          {/* Proof of Insurance */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <FileUploader
              title="Proof of Vehicle Insurance"
              subtitle="Third-party or comprehensive commercial courier policy certificate"
              item={insurance}
              required
              onFileSelect={(file, previewUrl) => setDocumentFile('documents', 'insurance', file, previewUrl)}
              onRemove={() => removeDocumentFile('documents', 'insurance')}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setStep(4)}
            icon={ArrowLeft}
            iconPosition="left"
          >
            Back to Vehicle
          </Button>

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleNext}
            icon={ArrowRight}
            isLoading={state.isSaving}
          >
            Review Application
          </Button>
        </div>
      </div>
    </div>
  );
};
