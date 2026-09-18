import React, { useState } from 'react';
import { Bike, Car, Truck, Sparkles, ArrowRight, ArrowLeft, Palette, Hash, Calendar, Tag } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import type { VehicleType } from '../types';

interface VehicleOption {
  type: VehicleType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    type: 'bike',
    label: 'Motorcycle / Scooter',
    description: 'Agile express parcels, food & document dispatches',
    icon: Bike,
  },
  {
    type: 'car',
    label: 'Sedan / Hatchback',
    description: 'Small parcels, multi-stop city packages & courier bags',
    icon: Car,
  },
  {
    type: 'van',
    label: 'Delivery Van',
    description: 'Medium cargo, eCommerce bulk drops & logistics routes',
    icon: Truck,
  },
  {
    type: 'truck',
    label: 'Heavy Cargo Truck',
    description: 'Pallets, freight deliveries & inter-city bulk haulage',
    icon: Truck,
  },
];

export const VehiclePage: React.FC = () => {
  const { state, updateVehicle, setStep, saveDraft } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vehicle = state.vehicle;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!vehicle.type) errs.type = 'Please select a vehicle category';
    if (!vehicle.make.trim()) errs.make = 'Vehicle manufacturer/make is required';
    if (!vehicle.model.trim()) errs.model = 'Vehicle model is required';
    if (!vehicle.year.trim()) {
      errs.year = 'Manufacturing year is required';
    } else {
      const yr = parseInt(vehicle.year, 10);
      if (isNaN(yr) || yr < 1995 || yr > 2027) {
        errs.year = 'Enter a valid year (1995 - 2026)';
      }
    }
    if (!vehicle.plateNumber.trim()) errs.plateNumber = 'License plate registration is required';
    if (!vehicle.color.trim()) errs.color = 'Vehicle exterior color is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await saveDraft();
    setStep(5); // Step 5: Documents
  };

  const fillTestVehicle = () => {
    updateVehicle({
      type: 'van',
      make: 'Toyota',
      model: 'HiAce High-Roof',
      year: '2020',
      plateNumber: 'AFX-7821',
      color: 'Silver Metallic',
    });
    setErrors({});
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
      <div className="logistics-card p-6 sm:p-8 space-y-6">
        {/* Step Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 04 / 06</span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
              Vehicle Fleet Profiling
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Select the transportation unit you will utilize for TakeOFF client fulfillment.
            </p>
          </div>
          <button
            type="button"
            onClick={fillTestVehicle}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preset Vehicle</span>
          </button>
        </div>

        <form onSubmit={handleNext} className="space-y-6">
          {/* Vehicle Type Selector Grid */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-200">
              Select Vehicle Category <span className="text-brand-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VEHICLE_OPTIONS.map((opt) => {
                const isSelected = vehicle.type === opt.type;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => updateVehicle({ type: opt.type })}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 shadow-glow'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-brand-500 text-white shadow-glow'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{opt.label}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.type && <p className="text-xs text-rose-400 mt-1">{errors.type}</p>}
          </div>

          {/* Vehicle Specifics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Vehicle Make / Manufacturer"
              required
              icon={Tag}
              placeholder="e.g. Toyota, Isuzu, Honda, Bajaj"
              value={vehicle.make}
              onChange={(e) => updateVehicle({ make: e.target.value })}
              error={errors.make}
            />

            <InputField
              label="Model Specification"
              required
              placeholder="e.g. HiAce, Fit, Corolla, Boxer 150"
              value={vehicle.model}
              onChange={(e) => updateVehicle({ model: e.target.value })}
              error={errors.model}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label="Manufacture Year"
              required
              icon={Calendar}
              placeholder="e.g. 2020"
              value={vehicle.year}
              onChange={(e) => updateVehicle({ year: e.target.value })}
              error={errors.year}
            />

            <InputField
              label="Registration / Number Plate"
              required
              icon={Hash}
              placeholder="e.g. AFX-7821"
              value={vehicle.plateNumber}
              onChange={(e) => updateVehicle({ plateNumber: e.target.value })}
              error={errors.plateNumber}
            />

            <InputField
              label="Exterior Color"
              required
              icon={Palette}
              placeholder="e.g. White, Silver, Black"
              value={vehicle.color}
              onChange={(e) => updateVehicle({ color: e.target.value })}
              error={errors.color}
            />
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setStep(3)}
              icon={ArrowLeft}
              iconPosition="left"
            >
              Back to Identity
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              isLoading={state.isSaving}
            >
              Continue to Document Uploads
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
