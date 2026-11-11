/**
 * Document Storage and Applicant Dossier Database Client
 * Manages uploading documents (Driver's License, TRN, NCJ License, Face Scans, Bank Letters, etc.)
 * and persisting/retrieving complete applicant dossiers from the central server database.
 */

export interface ApplicantDossier {
  id: string;
  userId?: string;
  email: string;
  role: 'nurse' | 'nurse_pending' | 'caregiver' | 'admin' | 'admin_pending' | 'client' | string;
  fullName: string;
  name?: string;
  phone?: string;
  address?: string;
  parish?: string;
  dateOfBirth?: string;
  gender?: string;
  
  // Official Statutory Credentials
  trnNumber?: string;
  trn?: string;
  ncjLicense?: string;
  nursingCouncilLicense?: string;
  driversLicenseNumber?: string;
  institutionAttended?: string;
  yearsExperience?: number;
  hourlyRateJMD?: number;
  specialties?: string[];
  
  // Document URLs (Stored on server under /uploads/...)
  photoUrl?: string;
  profilePhotoUrl?: string;
  driversLicenseFrontUrl?: string;
  driversLicenseBackUrl?: string;
  governmentIdUrl?: string;
  governmentIdBackUrl?: string;
  trnCertificateUrl?: string;
  licenseDocumentUrl?: string;
  policeRecordUrl?: string;
  bankLetterUrl?: string;
  proofOfAddressUrl?: string;
  
  documents?: {
    profilePhotoUrl?: string;
    governmentIdUrl?: string;
    driversLicenseFrontUrl?: string;
    driversLicenseBackUrl?: string;
    trnCertificateUrl?: string;
    licenseDocumentUrl?: string;
    policeRecordUrl?: string;
    bankLetterUrl?: string;
    proofOfAddressUrl?: string;
    [key: string]: string | undefined;
  };
  
  // Bank Details
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountType?: string;
    lynkWallet?: string;
  };
  
  // Emergency Contact
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  
  // Biometric and Signature
  signature?: any;
  biometricVerification?: any;
  
  // Verification and Status
  status: 'pending_approval' | 'pending' | 'approved' | 'rejected' | string;
  approvalStatus?: string;
  submittedAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  rejection_reason?: string;
  rejected_documents?: string[];
  rejection_date?: string;
}

/**
 * Converts a File or Blob into a base64 Data URL
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a document or image to the server database (/api/documents/upload)
 * Returns the permanent public URL (e.g. /uploads/doc_1731...jpg)
 */
export async function uploadDocument(
  fileOrDataUrl: File | Blob | string,
  fileName?: string,
  category?: string,
  userId?: string
): Promise<{ url: string; fileId: string; fileName: string }> {
  try {
    let dataUrl: string;
    let actualFileName = fileName || 'document';

    if (typeof fileOrDataUrl === 'string') {
      dataUrl = fileOrDataUrl;
    } else {
      actualFileName = (fileOrDataUrl as File).name || fileName || 'document';
      dataUrl = await fileToDataUrl(fileOrDataUrl);
    }

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dataUrl,
        fileName: actualFileName,
        category,
        userId
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return {
          url: data.url,
          fileId: data.fileId || '',
          fileName: data.fileName || actualFileName
        };
      }
    }
  } catch (err) {
    console.warn('[DossierStore] Remote upload failed, using client fallback:', err);
  }

  // Fallback if server is temporarily unreachable or offline
  const fallbackUrl = typeof fileOrDataUrl === 'string' ? fileOrDataUrl : await fileToDataUrl(fileOrDataUrl);
  return {
    url: fallbackUrl,
    fileId: `fallback_${Date.now()}`,
    fileName: fileName || 'document.jpg'
  };
}

/**
 * Saves or updates an applicant dossier in the central server database
 */
export async function saveApplicantDossier(dossier: Partial<ApplicantDossier>): Promise<ApplicantDossier | null> {
  const cleanEmail = (dossier.email || '').toLowerCase().trim();
  const id = dossier.id || dossier.userId || `applicant-${Date.now()}`;

  const payload: Partial<ApplicantDossier> = {
    ...dossier,
    id,
    email: cleanEmail,
    submittedAt: dossier.submittedAt || new Date().toISOString()
  };

  // Local caching for instant reactivity and offline resilience
  try {
    if (cleanEmail) {
      localStorage.setItem(`wecare_dossier_${cleanEmail}`, JSON.stringify(payload));
    }
    if (id) {
      localStorage.setItem(`wecare_dossier_${id}`, JSON.stringify(payload));
    }
    window.dispatchEvent(new CustomEvent('wecare_dossier_saved', { detail: payload }));
  } catch {}

  try {
    const res = await fetch('/api/applicants/dossier', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.dossier) {
        return data.dossier;
      }
    }
  } catch (err) {
    console.warn('[DossierStore] Failed to save dossier to server:', err);
  }

  return payload as ApplicantDossier;
}

/**
 * Fetches all applicant dossiers from the central server database
 */
export async function fetchAllApplicantDossiers(): Promise<ApplicantDossier[]> {
  try {
    const res = await fetch('/api/applicants/dossiers');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.dossiers)) {
        return data.dossiers;
      }
    }
  } catch (err) {
    console.warn('[DossierStore] Failed to fetch dossiers from server:', err);
  }

  // Fallback to checking localStorage
  const localDossiers: ApplicantDossier[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wecare_dossier_')) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || '{}');
          if (val && (val.id || val.email)) {
            const exists = localDossiers.some(d => d.id === val.id || (d.email && d.email === val.email));
            if (!exists) localDossiers.push(val);
          }
        } catch {}
      }
    }
  } catch {}

  return localDossiers;
}

/**
 * Fetches an individual applicant dossier by ID, Email, or Username
 */
export async function fetchApplicantDossier(idOrEmail: string): Promise<ApplicantDossier | null> {
  const clean = (idOrEmail || '').trim().toLowerCase();
  if (!clean) return null;

  try {
    const res = await fetch(`/api/applicants/dossier/${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.dossier) {
        return data.dossier;
      }
    }
  } catch (err) {
    console.warn(`[DossierStore] Failed to fetch dossier for ${clean}:`, err);
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(`wecare_dossier_${clean}`);
    if (raw) return JSON.parse(raw);
  } catch {}

  return null;
}

/**
 * Updates applicant verification status (approve or reject) in the database
 */
export async function updateApplicantStatusInDb(
  idOrEmail: string,
  status: 'approved' | 'rejected',
  reasonOrData?: string | { reason?: string; documents?: string[] },
  documents?: string[]
): Promise<boolean> {
  const clean = (idOrEmail || '').trim();
  if (!clean) return false;

  let reason: string | undefined;
  let rejectedDocuments: string[] | undefined;

  if (typeof reasonOrData === 'string') {
    reason = reasonOrData;
    rejectedDocuments = documents;
  } else if (reasonOrData && typeof reasonOrData === 'object') {
    reason = reasonOrData.reason;
    rejectedDocuments = reasonOrData.documents;
  }

  try {
    const res = await fetch(`/api/applicants/dossier/${encodeURIComponent(clean)}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status,
        reason,
        rejectedDocuments
      })
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (err) {
    console.warn(`[DossierStore] Failed to update status for ${clean}:`, err);
  }

  return false;
}
