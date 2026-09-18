export type VehicleType = 'bike' | 'car' | 'van' | 'truck';

export type DocumentType =
  | 'national_id_front'
  | 'national_id_back'
  | 'selfie'
  | 'license_front'
  | 'license_back'
  | 'vehicle_registration'
  | 'insurance';

export type ApplicationStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface DocumentUploadItem {
  type: DocumentType;
  label: string;
  file?: File;
  previewUrl?: string;
  uploadedUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
  isUploading?: boolean;
  error?: string;
}

export interface DriverData {
  id?: string;
  auth_user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  dob: string;
  national_id: string;
  address: string;
  city: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  application_status: ApplicationStatus;
  review_notes?: string;
  created_at?: string;
  submitted_at?: string;
}

export interface VehicleData {
  id?: string;
  driver_id?: string;
  type: VehicleType;
  make: string;
  model: string;
  year: string;
  plate_number: string;
  color: string;
}

export interface DocumentRecord {
  id?: string;
  driver_id?: string;
  document_type: DocumentType;
  file_url: string;
  file_name?: string;
  file_size?: number;
  uploaded_at?: string;
}

export interface OnboardingState {
  currentStep: number; // 0: Auth, 1: OTP, 2: Personal, 3: Identity, 4: Vehicle, 5: Documents, 6: Review, 7: Completion
  auth: {
    userId: string | null;
    email: string;
    fullName: string;
    phone: string;
    isVerified: boolean;
    sessionActive: boolean;
  };
  personal: {
    fullName: string;
    dob: string;
    nationalId: string;
    address: string;
    city: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };
  identity: {
    idFront: DocumentUploadItem;
    idBack: DocumentUploadItem;
    selfie: DocumentUploadItem;
  };
  vehicle: {
    type: VehicleType;
    make: string;
    model: string;
    year: string;
    plateNumber: string;
    color: string;
  };
  documents: {
    licenseFront: DocumentUploadItem;
    licenseBack: DocumentUploadItem;
    vehicleRegistration: DocumentUploadItem;
    insurance: DocumentUploadItem;
  };
  applicationStatus: ApplicationStatus;
  applicationReferenceId: string;
  submittedAt: string | null;
  isSaving: boolean;
  isSubmitting: boolean;
  error: string | null;
}
