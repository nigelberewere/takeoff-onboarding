import { createClient } from '@supabase/supabase-js';
import type { DriverData, VehicleData, DocumentRecord, ApplicationStatus } from '../types';

// Fallback values provided from configured project settings if environment is not set
const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://borevtusklgdgatnlzdl.supabase.co';

const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcmV2dHVza2xnZGdhdG5semRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MzI2MzMsImV4cCI6MjEwNTIwODYzM30.8eJEkfLvmHMlphRZAQzJ12nZjsCJTzB9IooOe1fHcQ0';

export const STORAGE_BUCKET = 
  import.meta.env.VITE_STORAGE_BUCKET || 'driver-documents';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Upload a document or photo file to Supabase Storage bucket.
 * Returns public or accessible URL of the uploaded asset.
 */
export async function uploadDocumentFile(
  userId: string,
  docType: string,
  file: File
): Promise<{ url: string; path: string; error?: string }> {
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${docType}-${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn(`Direct upload to ${STORAGE_BUCKET} encountered:`, uploadError.message);
      // If error is bucket not found or permissions, create preview object URL fallback
      const objectUrl = URL.createObjectURL(file);
      return { url: objectUrl, path: filePath, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, path: filePath };
  } catch (err: any) {
    console.error('File upload exception:', err);
    return { url: URL.createObjectURL(file), path: '', error: err?.message || 'Upload failed' };
  }
}

/**
 * Persist application data to Supabase.
 * Writes to `drivers`, `vehicles`, and `documents` tables, and maintains 
 * synchronization with `applications` table for compatibility.
 */
export async function saveDriverApplication(
  authUserId: string,
  driverData: DriverData,
  vehicleData: VehicleData,
  documents: { type: string; url: string; name?: string; size?: number }[],
  isSubmitting = false
): Promise<{ success: boolean; driverId?: string; error?: string }> {
  try {
    const status: ApplicationStatus = isSubmitting ? 'pending_review' : (driverData.application_status || 'draft');
    const now = new Date().toISOString();

    let driverId: string | undefined = driverData.id;

    // 1. Upsert into public.drivers
    const { data: existingDriver } = await supabase
      .from('drivers')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (existingDriver?.id) {
      driverId = existingDriver.id;
      await supabase
        .from('drivers')
        .update({
          full_name: driverData.full_name,
          email: driverData.email,
          phone: driverData.phone,
          dob: driverData.dob || null,
          national_id: driverData.national_id,
          address: driverData.address,
          city: driverData.city,
          emergency_contact_name: driverData.emergency_contact_name,
          emergency_contact_phone: driverData.emergency_contact_phone,
          application_status: status,
          submitted_at: isSubmitting ? now : undefined,
          updated_at: now,
        })
        .eq('id', driverId);
    } else {
      const { data: newDriver, error: insertError } = await supabase
        .from('drivers')
        .insert({
          auth_user_id: authUserId,
          full_name: driverData.full_name,
          email: driverData.email,
          phone: driverData.phone,
          dob: driverData.dob || null,
          national_id: driverData.national_id,
          address: driverData.address,
          city: driverData.city,
          emergency_contact_name: driverData.emergency_contact_name,
          emergency_contact_phone: driverData.emergency_contact_phone,
          application_status: status,
          submitted_at: isSubmitting ? now : null,
          updated_at: now,
        })
        .select('id')
        .maybeSingle();

      if (newDriver) {
        driverId = newDriver.id;
      }
    }

    // 2. Upsert into public.vehicles (if driverId exists)
    if (driverId) {
      const { data: existingVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('driver_id', driverId)
        .maybeSingle();

      if (existingVehicle?.id) {
        await supabase
          .from('vehicles')
          .update({
            type: vehicleData.type,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            plate_number: vehicleData.plate_number,
            color: vehicleData.color,
            updated_at: now,
          })
          .eq('id', existingVehicle.id);
      } else {
        await supabase
          .from('vehicles')
          .insert({
            driver_id: driverId,
            type: vehicleData.type,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            plate_number: vehicleData.plate_number,
            color: vehicleData.color,
          });
      }

      // 3. Upsert into public.documents
      for (const doc of documents) {
        if (!doc.url) continue;
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('id')
          .eq('driver_id', driverId)
          .eq('document_type', doc.type)
          .maybeSingle();

        if (existingDoc?.id) {
          await supabase
            .from('documents')
            .update({
              file_url: doc.url,
              file_name: doc.name || '',
              file_size: doc.size || 0,
              uploaded_at: now,
            })
            .eq('id', existingDoc.id);
        } else {
          await supabase
            .from('documents')
            .insert({
              driver_id: driverId,
              document_type: doc.type,
              file_url: doc.url,
              file_name: doc.name || '',
              file_size: doc.size || 0,
              uploaded_at: now,
            });
        }
      }
    }

    // 4. Also synchronize with `applications` table for maximum backward compatibility
    try {
      const docMap: Record<string, string> = {};
      documents.forEach(d => {
        docMap[d.type] = d.url;
      });

      const appPayload = {
        user_id: authUserId,
        email: driverData.email,
        phone: driverData.phone,
        full_name: driverData.full_name,
        date_of_birth: driverData.dob || null,
        residential_address: driverData.address,
        city: driverData.city,
        emergency_contact_name: driverData.emergency_contact_name,
        emergency_contact_phone: driverData.emergency_contact_phone,
        national_id_number: driverData.national_id,
        national_id_photo_url: docMap['national_id_front'] || docMap['selfie'] || null,
        vehicle_type: vehicleData.type,
        vehicle_make: vehicleData.make,
        vehicle_model: vehicleData.model,
        vehicle_year: vehicleData.year,
        plate_number: vehicleData.plate_number,
        drivers_license_url: docMap['license_front'] || null,
        vehicle_registration_url: docMap['vehicle_registration'] || null,
        insurance_url: docMap['insurance'] || null,
        status: status === 'pending_review' ? 'submitted' : status,
        submitted_at: isSubmitting ? now : null,
      };

      await supabase
        .from('applications')
        .upsert(appPayload, { onConflict: 'user_id' });
    } catch (compatErr) {
      console.log('Compat table sync note:', compatErr);
    }

    return { success: true, driverId };
  } catch (err: any) {
    console.error('saveDriverApplication error:', err);
    return { success: false, error: err?.message || 'Database write error' };
  }
}

/**
 * Fetch existing application by auth user id
 */
export async function getDriverApplication(authUserId: string) {
  try {
    // Check drivers table first
    const { data: driver } = await supabase
      .from('drivers')
      .select('*, vehicles(*), documents(*)')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (driver) {
      return { data: driver, source: 'drivers' };
    }

    // Fallback to applications table if drivers not yet created
    const { data: application } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', authUserId)
      .maybeSingle();

    if (application) {
      return { data: application, source: 'applications' };
    }

    return { data: null };
  } catch (err) {
    console.error('getDriverApplication error:', err);
    return { data: null };
  }
}

/**
 * Update application status (used for demoing admin review or status check)
 */
export async function updateDriverStatus(
  authUserId: string,
  newStatus: ApplicationStatus,
  notes?: string
) {
  try {
    const now = new Date().toISOString();
    await supabase
      .from('drivers')
      .update({
        application_status: newStatus,
        review_notes: notes || null,
        reviewed_at: now,
      })
      .eq('auth_user_id', authUserId);

    await supabase
      .from('applications')
      .update({
        status: newStatus === 'pending_review' ? 'submitted' : newStatus,
        review_notes: notes || null,
        reviewed_at: now,
      })
      .eq('user_id', authUserId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
