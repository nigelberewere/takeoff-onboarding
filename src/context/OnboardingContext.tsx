import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, uploadDocumentFile, saveDriverApplication, getDriverApplication, updateDriverStatus } from '../lib/supabase';
import type {
  OnboardingState,
  VehicleType,
  DocumentUploadItem,
  ApplicationStatus,
} from '../types';

const INITIAL_DOC_ITEM = (type: any, label: string): DocumentUploadItem => ({
  type,
  label,
  file: undefined,
  previewUrl: undefined,
  uploadedUrl: undefined,
  fileName: undefined,
  fileSize: undefined,
  uploadedAt: undefined,
  isUploading: false,
  error: undefined,
});

const generateRefId = () => {
  return 'TKF-' + Math.floor(100000 + Math.random() * 900000);
};

const initialState: OnboardingState = {
  currentStep: 0,
  auth: {
    userId: null,
    email: '',
    fullName: '',
    phone: '',
    isVerified: false,
    sessionActive: false,
  },
  personal: {
    fullName: '',
    dob: '',
    nationalId: '',
    address: '',
    city: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  },
  identity: {
    idFront: INITIAL_DOC_ITEM('national_id_front', 'National ID (Front)'),
    idBack: INITIAL_DOC_ITEM('national_id_back', 'National ID (Back)'),
    selfie: INITIAL_DOC_ITEM('selfie', 'Driver Verification Selfie'),
  },
  vehicle: {
    type: 'car',
    make: '',
    model: '',
    year: '',
    plateNumber: '',
    color: '',
  },
  documents: {
    licenseFront: INITIAL_DOC_ITEM('license_front', "Driver's License (Front)"),
    licenseBack: INITIAL_DOC_ITEM('license_back', "Driver's License (Back)"),
    vehicleRegistration: INITIAL_DOC_ITEM('vehicle_registration', 'Vehicle Registration / Logbook'),
    insurance: INITIAL_DOC_ITEM('insurance', 'Proof of Vehicle Insurance'),
  },
  applicationStatus: 'draft',
  applicationReferenceId: generateRefId(),
  submittedAt: null,
  isSaving: false,
  isSubmitting: false,
  error: null,
};

interface OnboardingContextType {
  state: OnboardingState;
  setStep: (step: number) => void;
  signUp: (email: string, pass: string, fullName: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePersonal: (data: Partial<OnboardingState['personal']>) => void;
  updateVehicle: (data: Partial<OnboardingState['vehicle']>) => void;
  setDocumentFile: (category: 'identity' | 'documents', key: string, file: File, previewUrl: string) => Promise<void>;
  removeDocumentFile: (category: 'identity' | 'documents', key: string) => void;
  saveDraft: () => Promise<boolean>;
  submitApplication: () => Promise<boolean>;
  syncFromDatabase: () => Promise<void>;
  fillTestData: () => void;
  simulateAdminStatusChange: (newStatus: ApplicationStatus) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    const cached = localStorage.getItem('takeoff_onboarding_draft');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return { ...initialState, ...parsed };
      } catch (e) {
        console.warn('Failed to parse cached onboarding draft:', e);
      }
    }
    return initialState;
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      const serializableState = {
        ...state,
        // Strip out file references before caching
        identity: {
          idFront: { ...state.identity.idFront, file: undefined },
          idBack: { ...state.identity.idBack, file: undefined },
          selfie: { ...state.identity.selfie, file: undefined },
        },
        documents: {
          licenseFront: { ...state.documents.licenseFront, file: undefined },
          licenseBack: { ...state.documents.licenseBack, file: undefined },
          vehicleRegistration: { ...state.documents.vehicleRegistration, file: undefined },
          insurance: { ...state.documents.insurance, file: undefined },
        },
      };
      localStorage.setItem('takeoff_onboarding_draft', JSON.stringify(serializableState));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }, [state]);

  // Initial Supabase Session Check
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user = session.user;
          const userMeta = user.user_metadata || {};
          setState((prev) => ({
            ...prev,
            auth: {
              userId: user.id,
              email: user.email || prev.auth.email,
              fullName: userMeta.full_name || prev.auth.fullName,
              phone: userMeta.phone || prev.auth.phone,
              isVerified: Boolean(user.email_confirmed_at),
              sessionActive: true,
            },
            personal: {
              ...prev.personal,
              fullName: prev.personal.fullName || userMeta.full_name || '',
            },
          }));

          // Load DB record
          await loadUserRecord(user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = session.user;
        const userMeta = user.user_metadata || {};
        setState((prev) => ({
          ...prev,
          auth: {
            userId: user.id,
            email: user.email || prev.auth.email,
            fullName: userMeta.full_name || prev.auth.fullName,
            phone: userMeta.phone || prev.auth.phone,
            isVerified: Boolean(user.email_confirmed_at),
            sessionActive: true,
          },
        }));
      } else if (event === 'SIGNED_OUT') {
        setState((prev) => ({
          ...prev,
          auth: {
            ...initialState.auth,
            sessionActive: false,
          },
          currentStep: 0,
        }));
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadUserRecord = async (userId: string) => {
    try {
      const res = await getDriverApplication(userId);
      if (res.data) {
        const d = res.data;
        // Check if application is already submitted
        const isSubmitted = d.application_status === 'pending_review' || d.application_status === 'approved' || d.status === 'submitted' || d.status === 'approved';

        setState((prev) => ({
          ...prev,
          currentStep: isSubmitted ? 7 : prev.currentStep === 0 ? 2 : prev.currentStep,
          applicationStatus: (d.application_status || (d.status === 'submitted' ? 'pending_review' : d.status) || 'draft') as ApplicationStatus,
          submittedAt: d.submitted_at || prev.submittedAt,
          personal: {
            fullName: d.full_name || prev.personal.fullName,
            dob: d.dob || d.date_of_birth || prev.personal.dob,
            nationalId: d.national_id || d.national_id_number || prev.personal.nationalId,
            address: d.address || d.residential_address || prev.personal.address,
            city: d.city || prev.personal.city,
            emergencyContactName: d.emergency_contact_name || prev.personal.emergencyContactName,
            emergencyContactPhone: d.emergency_contact_phone || prev.personal.emergencyContactPhone,
          },
          vehicle: d.vehicles?.[0]
            ? {
                type: d.vehicles[0].type || 'car',
                make: d.vehicles[0].make || '',
                model: d.vehicles[0].model || '',
                year: d.vehicles[0].year || '',
                plateNumber: d.vehicles[0].plate_number || '',
                color: d.vehicles[0].color || '',
              }
            : d.vehicle_type
            ? {
                type: (d.vehicle_type?.toLowerCase() as VehicleType) || 'car',
                make: d.vehicle_make || '',
                model: d.vehicle_model || '',
                year: d.vehicle_year || '',
                plateNumber: d.plate_number || '',
                color: prev.vehicle.color || '',
              }
            : prev.vehicle,
        }));
      }
    } catch (e) {
      console.error('Error loading DB record:', e);
    }
  };

  const setStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step, error: null }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const signUp = async (email: string, pass: string, fullName: string, phone: string) => {
    setState((prev) => ({ ...prev, isSaving: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) {
        setState((prev) => ({ ...prev, isSaving: false, error: error.message }));
        return { success: false, error: error.message };
      }

      setState((prev) => ({
        ...prev,
        isSaving: false,
        currentStep: 1, // Advance to OTP verification
        auth: {
          ...prev.auth,
          userId: data.user?.id || null,
          email,
          fullName,
          phone,
          isVerified: Boolean(data.user?.email_confirmed_at),
        },
        personal: {
          ...prev.personal,
          fullName,
        },
      }));

      return { success: true };
    } catch (err: any) {
      setState((prev) => ({ ...prev, isSaving: false, error: err.message }));
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  const signIn = async (email: string, pass: string) => {
    setState((prev) => ({ ...prev, isSaving: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        setState((prev) => ({ ...prev, isSaving: false, error: error.message }));
        return { success: false, error: error.message };
      }

      const user = data.user;
      const userMeta = user?.user_metadata || {};

      setState((prev) => ({
        ...prev,
        isSaving: false,
        auth: {
          userId: user.id,
          email: user.email || email,
          fullName: userMeta.full_name || prev.auth.fullName,
          phone: userMeta.phone || prev.auth.phone,
          isVerified: true,
          sessionActive: true,
        },
        personal: {
          ...prev.personal,
          fullName: prev.personal.fullName || userMeta.full_name || '',
        },
      }));

      // Check existing application in DB
      await loadUserRecord(user.id);

      setState((prev) => ({
        ...prev,
        currentStep: prev.applicationStatus === 'pending_review' || prev.applicationStatus === 'approved' ? 7 : 2,
      }));

      return { success: true };
    } catch (err: any) {
      setState((prev) => ({ ...prev, isSaving: false, error: err.message }));
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const verifyOtp = async (code: string) => {
    setState((prev) => ({ ...prev, isSaving: true, error: null }));
    try {
      // Supabase verifyOtp with type 'signup' (or fallback 'email')
      let res = await supabase.auth.verifyOtp({
        email: state.auth.email,
        token: code,
        type: 'signup',
      });

      if (res.error) {
        // Retry with type 'email'
        res = await supabase.auth.verifyOtp({
          email: state.auth.email,
          token: code,
          type: 'email',
        });
      }

      if (res.error) {
        setState((prev) => ({ ...prev, isSaving: false, error: res.error?.message || 'Invalid or expired OTP code' }));
        return { success: false, error: res.error.message };
      }

      const verifiedUser = res.data.user;

      setState((prev) => ({
        ...prev,
        isSaving: false,
        currentStep: 2, // Step 2: Personal Details
        auth: {
          ...prev.auth,
          userId: verifiedUser?.id || prev.auth.userId,
          isVerified: true,
          sessionActive: true,
        },
      }));

      // Autosave draft profile
      await saveDraft();

      return { success: true };
    } catch (err: any) {
      setState((prev) => ({ ...prev, isSaving: false, error: err.message }));
      return { success: false, error: err.message || 'Verification failed' };
    }
  };

  const resendOtp = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: state.auth.email,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend code' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('takeoff_onboarding_draft');
    setState(initialState);
  };

  const updatePersonal = (fields: Partial<OnboardingState['personal']>) => {
    setState((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...fields },
    }));
  };

  const updateVehicle = (fields: Partial<OnboardingState['vehicle']>) => {
    setState((prev) => ({
      ...prev,
      vehicle: { ...prev.vehicle, ...fields },
    }));
  };

  const setDocumentFile = async (
    category: 'identity' | 'documents',
    key: string,
    file: File,
    previewUrl: string
  ) => {
    // Set local file and preview immediately
    setState((prev) => {
      const section = { ...prev[category] } as any;
      section[key] = {
        ...section[key],
        file,
        previewUrl,
        fileName: file.name,
        fileSize: file.size,
        isUploading: true,
        error: undefined,
      };
      return { ...prev, [category]: section };
    });

    // Upload to Supabase Storage in background if userId exists
    const userId = state.auth.userId || 'demo_user';
    const uploadRes = await uploadDocumentFile(userId, key, file);

    setState((prev) => {
      const section = { ...prev[category] } as any;
      section[key] = {
        ...section[key],
        isUploading: false,
        uploadedUrl: uploadRes.url,
        error: uploadRes.error,
      };
      return { ...prev, [category]: section };
    });
  };

  const removeDocumentFile = (category: 'identity' | 'documents', key: string) => {
    setState((prev) => {
      const section = { ...prev[category] } as any;
      section[key] = INITIAL_DOC_ITEM(section[key].type, section[key].label);
      return { ...prev, [category]: section };
    });
  };

  const collectDocumentsList = () => {
    const list: { type: string; url: string; name?: string; size?: number }[] = [];
    const allDocs = [
      state.identity.idFront,
      state.identity.idBack,
      state.identity.selfie,
      state.documents.licenseFront,
      state.documents.licenseBack,
      state.documents.vehicleRegistration,
      state.documents.insurance,
    ];

    allDocs.forEach((doc) => {
      const url = doc.uploadedUrl || doc.previewUrl;
      if (url) {
        list.push({
          type: doc.type,
          url: url,
          name: doc.fileName,
          size: doc.fileSize,
        });
      }
    });

    return list;
  };

  const saveDraft = async (): Promise<boolean> => {
    const userId = state.auth.userId;
    if (!userId) return false;

    setState((prev) => ({ ...prev, isSaving: true }));
    try {
      const docs = collectDocumentsList();
      await saveDriverApplication(
        userId,
        {
          full_name: state.personal.fullName || state.auth.fullName,
          email: state.auth.email,
          phone: state.auth.phone,
          dob: state.personal.dob,
          national_id: state.personal.nationalId,
          address: state.personal.address,
          city: state.personal.city,
          emergency_contact_name: state.personal.emergencyContactName,
          emergency_contact_phone: state.personal.emergencyContactPhone,
          application_status: 'draft',
        },
        {
          type: state.vehicle.type,
          make: state.vehicle.make,
          model: state.vehicle.model,
          year: state.vehicle.year,
          plate_number: state.vehicle.plateNumber,
          color: state.vehicle.color,
        },
        docs,
        false
      );
      setState((prev) => ({ ...prev, isSaving: false }));
      return true;
    } catch (err) {
      console.error('saveDraft error:', err);
      setState((prev) => ({ ...prev, isSaving: false }));
      return false;
    }
  };

  const submitApplication = async (): Promise<boolean> => {
    const userId = state.auth.userId;
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const docs = collectDocumentsList();
      const now = new Date().toISOString();

      if (userId) {
        await saveDriverApplication(
          userId,
          {
            full_name: state.personal.fullName,
            email: state.auth.email,
            phone: state.auth.phone,
            dob: state.personal.dob,
            national_id: state.personal.nationalId,
            address: state.personal.address,
            city: state.personal.city,
            emergency_contact_name: state.personal.emergencyContactName,
            emergency_contact_phone: state.personal.emergencyContactPhone,
            application_status: 'pending_review',
          },
          {
            type: state.vehicle.type,
            make: state.vehicle.make,
            model: state.vehicle.model,
            year: state.vehicle.year,
            plate_number: state.vehicle.plateNumber,
            color: state.vehicle.color,
          },
          docs,
          true
        );
      }

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        applicationStatus: 'pending_review',
        submittedAt: now,
        currentStep: 7, // Completion screen
      }));

      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    } catch (err: any) {
      console.error('submitApplication error:', err);
      setState((prev) => ({ ...prev, isSubmitting: false, error: err.message || 'Submission error' }));
      return false;
    }
  };

  const syncFromDatabase = async () => {
    if (state.auth.userId) {
      await loadUserRecord(state.auth.userId);
    }
  };

  const fillTestData = () => {
    setState((prev) => ({
      ...prev,
      personal: {
        fullName: prev.personal.fullName || 'Alex Morgan',
        dob: '1995-06-15',
        nationalId: 'ID-8829410-B',
        address: '742 Evergreen Logistics Blvd, Suite 4B',
        city: 'Harare',
        emergencyContactName: 'Sarah Morgan (Spouse)',
        emergencyContactPhone: '+263 77 123 4567',
      },
      vehicle: {
        type: 'van',
        make: 'Toyota',
        model: 'HiAce High-Roof Express',
        year: '2021',
        plateNumber: 'TKF-8924',
        color: 'Arctic White',
      },
      identity: {
        ...prev.identity,
        idFront: {
          ...prev.identity.idFront,
          uploadedUrl: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=800&auto=format&fit=crop',
          previewUrl: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=800&auto=format&fit=crop',
          fileName: 'alex_national_id_front.jpg',
          fileSize: 1450230,
        },
        idBack: {
          ...prev.identity.idBack,
          uploadedUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=800&auto=format&fit=crop',
          previewUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=800&auto=format&fit=crop',
          fileName: 'alex_national_id_back.jpg',
          fileSize: 1320490,
        },
        selfie: {
          ...prev.identity.selfie,
          uploadedUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop',
          previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop',
          fileName: 'alex_liveness_selfie.jpg',
          fileSize: 980120,
        },
      },
      documents: {
        ...prev.documents,
        licenseFront: {
          ...prev.documents.licenseFront,
          uploadedUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop',
          previewUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop',
          fileName: 'drivers_license_class_4_front.jpg',
          fileSize: 1540200,
        },
        licenseBack: {
          ...prev.documents.licenseBack,
          uploadedUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=800&auto=format&fit=crop',
          previewUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?w=800&auto=format&fit=crop',
          fileName: 'drivers_license_back.jpg',
          fileSize: 1120000,
        },
        vehicleRegistration: {
          ...prev.documents.vehicleRegistration,
          uploadedUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
          previewUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
          fileName: 'hiace_vehicle_logbook.pdf',
          fileSize: 2450300,
        },
        insurance: {
          ...prev.documents.insurance,
          uploadedUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop',
          previewUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop',
          fileName: 'commercial_courier_insurance.pdf',
          fileSize: 1890400,
        },
      },
    }));
  };

  const simulateAdminStatusChange = async (newStatus: ApplicationStatus) => {
    setState((prev) => ({ ...prev, applicationStatus: newStatus }));
    if (state.auth.userId) {
      await updateDriverStatus(state.auth.userId, newStatus, 'Demo evaluation review');
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        setStep,
        signUp,
        signIn,
        verifyOtp,
        resendOtp,
        signOut,
        updatePersonal,
        updateVehicle,
        setDocumentFile,
        removeDocumentFile,
        saveDraft,
        submitApplication,
        syncFromDatabase,
        fillTestData,
        simulateAdminStatusChange,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
