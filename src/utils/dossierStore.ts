/**
 * Document Storage and Applicant Dossier Database Client
 * Manages uploading documents (Driver's License, TRN, NCJ License, Face Scans, Bank Letters, etc.)
 * and persisting/retrieving complete applicant dossiers from the central server SQLite database.
 */

export interface ApplicantDossier {
  id: string;
  userId?: string;
  nurseProfileId?: string;
  username?: string;
  email: string;
  role: 'nurse' | 'nurse_pending' | 'caregiver' | 'admin' | 'admin_pending' | 'client' | string;
  fullName: string;
  name?: string;
  phone?: string;
  address?: string;
  parish?: string;
  dateOfBirth?: string;
  gender?: string;
  type?: string;

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

  // Admin fields
  staffId?: string;
  department?: string;
  title?: string;

  // Document URLs (Stored in SQLite uploaded_documents + /uploads/...)
  photoUrl?: string;
  profilePhotoUrl?: string;
  driversLicenseFrontUrl?: string;
  driversLicenseBackUrl?: string;
  governmentIdUrl?: string;
  governmentIdBackUrl?: string;
  trnCertificateUrl?: string;
  licenseDocumentUrl?: string;
  diplomaDocumentUrl?: string;
  policeRecordUrl?: string;
  bankLetterUrl?: string;
  proofOfAddressUrl?: string;

  documents?: {
    profilePhotoUrl?: string;
    governmentIdUrl?: string;
    governmentIdBackUrl?: string;
    driversLicenseFrontUrl?: string;
    driversLicenseBackUrl?: string;
    trnCertificateUrl?: string;
    licenseDocumentUrl?: string;
    diplomaDocumentUrl?: string;
    policeRecordUrl?: string;
    bankLetterUrl?: string;
    proofOfAddressUrl?: string;
    [key: string]: string | undefined;
  };

  uploadedFiles?: Array<{
    fileId: string;
    category: string;
    fileName: string;
    mimeType?: string;
    url: string;
    createdAt?: string;
  }>;

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

  // Expanded Client Next of Kin / Authorized User details
  nextOfKin?: {
    name?: string;
    relation?: string;
    phone?: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
    dateOfBirth?: string;
    isAuthorizedUser?: boolean;
    canManageCare?: boolean;
    authorizedPermissions?: {
      canBookServices?: boolean;
      canCancelBookings?: boolean;
      canApproveVisitCodes?: boolean;
      canViewMedicalRecords?: boolean;
      canManagePayments?: boolean;
    };
    notes?: string;
  };
  bioData?: any;

  // Biometric and Signature
  signature?: any;
  biometricVerification?: {
    status?: string;
    verificationId?: string;
    capturedAt?: string;
    captureMethod?: 'auto_positioned' | 'manual' | string;
    livenessVerified?: boolean;
    photoUrl?: string;
  } | any;

  // Verification and Status
  status: 'pending_approval' | 'pending' | 'approved' | 'rejected' | string;
  approvalStatus?: string;
  submittedAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  rejection_reason?: string;
  rejected_documents?: string[];
  rejection_date?: string;
  resubmitted_at?: string;
}

export interface DossierIdentifiers {
  id?: string;
  userId?: string;
  nurseProfileId?: string;
  email?: string;
  username?: string;
}

export function isStockPlaceholderUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return true;
  return (
    trimmed.includes('images.unsplash.com') ||
    trimmed.startsWith('sample_') ||
    trimmed === 'undefined' ||
    trimmed === 'null'
  );
}

export function pickValidDocUrl(...candidates: Array<string | null | undefined>): string | undefined {
  // First pass: prefer non-stock real uploaded URLs (/uploads/, /api/documents/file/, https non-unsplash, data:, blob:)
  for (const c of candidates) {
    if (c && typeof c === 'string') {
      const trimmed = c.trim();
      if (trimmed && !isStockPlaceholderUrl(trimmed)) {
        return trimmed;
      }
    }
  }
  return undefined;
}

const CATEGORY_TO_DOSSIER_FIELD: Record<string, string> = {
  drivers_license_front: 'driversLicenseFrontUrl',
  dl_front: 'driversLicenseFrontUrl',
  drivers_license_back: 'driversLicenseBackUrl',
  dl_back: 'driversLicenseBackUrl',
  trn_certificate: 'trnCertificateUrl',
  trn: 'trnCertificateUrl',
  ncj_license: 'licenseDocumentUrl',
  license_document: 'licenseDocumentUrl',
  diploma: 'diplomaDocumentUrl',
  government_id: 'governmentIdUrl',
  government_id_front: 'governmentIdUrl',
  gov_id: 'governmentIdUrl',
  government_id_back: 'governmentIdBackUrl',
  police_record: 'policeRecordUrl',
  bank_letter: 'bankLetterUrl',
  proof_of_address: 'proofOfAddressUrl',
  biometric_face_scan: 'photoUrl',
  photo: 'photoUrl',
  profile_photo: 'photoUrl'
};

export function categoryToFieldName(category?: string): string | null {
  if (!category) return null;
  const norm = category.toLowerCase().trim();
  return CATEGORY_TO_DOSSIER_FIELD[norm] || null;
}

export function deepMergeDossiers(
  base?: Partial<ApplicantDossier> | null,
  incoming?: Partial<ApplicantDossier> | null
): Partial<ApplicantDossier> {
  const b = (base || {}) as Partial<ApplicantDossier>;
  const n = (incoming || {}) as Partial<ApplicantDossier>;

  const bDocs = (b.documents && typeof b.documents === 'object' && !Array.isArray(b.documents)) ? b.documents : {};
  const nDocs = (n.documents && typeof n.documents === 'object' && !Array.isArray(n.documents)) ? n.documents : {};

  const photoUrl = pickValidDocUrl(
    n.photoUrl,
    n.profilePhotoUrl,
    nDocs.profilePhotoUrl,
    n.biometricVerification?.photoUrl,
    b.photoUrl,
    b.profilePhotoUrl,
    bDocs.profilePhotoUrl,
    b.biometricVerification?.photoUrl
  );
  const driversLicenseFrontUrl = pickValidDocUrl(
    n.driversLicenseFrontUrl,
    nDocs.driversLicenseFrontUrl,
    b.driversLicenseFrontUrl,
    bDocs.driversLicenseFrontUrl
  );
  const driversLicenseBackUrl = pickValidDocUrl(
    n.driversLicenseBackUrl,
    nDocs.driversLicenseBackUrl,
    b.driversLicenseBackUrl,
    bDocs.driversLicenseBackUrl
  );
  const trnCertificateUrl = pickValidDocUrl(
    n.trnCertificateUrl,
    nDocs.trnCertificateUrl,
    b.trnCertificateUrl,
    bDocs.trnCertificateUrl
  );
  const licenseDocumentUrl = pickValidDocUrl(
    n.licenseDocumentUrl,
    nDocs.licenseDocumentUrl,
    b.licenseDocumentUrl,
    bDocs.licenseDocumentUrl
  );
  const diplomaDocumentUrl = pickValidDocUrl(
    n.diplomaDocumentUrl,
    nDocs.diplomaDocumentUrl,
    b.diplomaDocumentUrl,
    bDocs.diplomaDocumentUrl
  );
  const governmentIdUrl = pickValidDocUrl(
    n.governmentIdUrl,
    nDocs.governmentIdUrl,
    b.governmentIdUrl,
    bDocs.governmentIdUrl
  );
  const governmentIdBackUrl = pickValidDocUrl(
    n.governmentIdBackUrl,
    nDocs.governmentIdBackUrl,
    b.governmentIdBackUrl,
    bDocs.governmentIdBackUrl
  );
  const policeRecordUrl = pickValidDocUrl(
    n.policeRecordUrl,
    nDocs.policeRecordUrl,
    b.policeRecordUrl,
    bDocs.policeRecordUrl
  );
  const bankLetterUrl = pickValidDocUrl(
    n.bankLetterUrl,
    nDocs.bankLetterUrl,
    b.bankLetterUrl,
    bDocs.bankLetterUrl
  );
  const proofOfAddressUrl = pickValidDocUrl(
    n.proofOfAddressUrl,
    nDocs.proofOfAddressUrl,
    b.proofOfAddressUrl,
    bDocs.proofOfAddressUrl
  );

  const mergedDocs: NonNullable<ApplicantDossier['documents']> = {
    ...bDocs,
    ...nDocs,
    ...(photoUrl ? { profilePhotoUrl: photoUrl } : {}),
    ...(driversLicenseFrontUrl ? { driversLicenseFrontUrl } : {}),
    ...(driversLicenseBackUrl ? { driversLicenseBackUrl } : {}),
    ...(trnCertificateUrl ? { trnCertificateUrl } : {}),
    ...(licenseDocumentUrl ? { licenseDocumentUrl } : {}),
    ...(diplomaDocumentUrl ? { diplomaDocumentUrl } : {}),
    ...(governmentIdUrl ? { governmentIdUrl } : {}),
    ...(governmentIdBackUrl ? { governmentIdBackUrl } : {}),
    ...(policeRecordUrl ? { policeRecordUrl } : {}),
    ...(bankLetterUrl ? { bankLetterUrl } : {}),
    ...(proofOfAddressUrl ? { proofOfAddressUrl } : {})
  };

  const mergedEmergencyContact =
    n.emergencyContact?.name || b.emergencyContact?.name
      ? {
          name: n.emergencyContact?.name || b.emergencyContact?.name || '',
          phone: n.emergencyContact?.phone || b.emergencyContact?.phone || '',
          relation: n.emergencyContact?.relation || b.emergencyContact?.relation || ''
        }
      : undefined;

  const mergedNextOfKin =
    n.nextOfKin || b.nextOfKin
      ? {
          ...(b.nextOfKin || {}),
          ...(n.nextOfKin || {}),
          name: n.nextOfKin?.name || b.nextOfKin?.name || '',
          relation: n.nextOfKin?.relation || b.nextOfKin?.relation || '',
          phone: n.nextOfKin?.phone || b.nextOfKin?.phone || '',
          email: n.nextOfKin?.email || b.nextOfKin?.email || '',
          address: n.nextOfKin?.address || b.nextOfKin?.address || '',
          dateOfBirth: n.nextOfKin?.dateOfBirth || b.nextOfKin?.dateOfBirth || ''
        }
      : undefined;

  const merged: Partial<ApplicantDossier> = {
    ...b,
    ...n,
    fullName: n.fullName || b.fullName || n.name || b.name || '',
    name: n.name || n.fullName || b.name || b.fullName || '',
    email: (n.email || b.email || '').toLowerCase().trim(),
    gender: n.gender || b.gender || n.bioData?.gender || b.bioData?.gender,
    emergencyContact: mergedEmergencyContact,
    nextOfKin: mergedNextOfKin,
    photoUrl,
    profilePhotoUrl: photoUrl,
    driversLicenseFrontUrl,
    driversLicenseBackUrl,
    trnCertificateUrl,
    licenseDocumentUrl,
    diplomaDocumentUrl,
    governmentIdUrl,
    governmentIdBackUrl,
    policeRecordUrl,
    bankLetterUrl,
    proofOfAddressUrl,
    documents: mergedDocs,
    biometricVerification: n.biometricVerification || b.biometricVerification
      ? {
          ...(b.biometricVerification || {}),
          ...(n.biometricVerification || {}),
          ...(photoUrl ? { photoUrl } : {})
        }
      : undefined
  };

  // Merge uploadedFiles deduplicated by fileId/url
  const combinedFiles = [...(b.uploadedFiles || []), ...(n.uploadedFiles || [])];
  if (combinedFiles.length > 0) {
    const seen = new Set<string>();
    merged.uploadedFiles = combinedFiles.filter(f => {
      if (!f || !f.url) return false;
      const k = f.fileId || f.url;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  return merged;
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
 * Compresses large image files cleanly before uploading so mobile camera scans
 * stay compact and upload fast without quality loss on text/ID barcodes.
 */
async function compressImageBlobIfLarge(file: File | Blob): Promise<string> {
  const mime = (file as File).type || '';
  const isImage = mime.startsWith('image/') && !mime.includes('svg') && !mime.includes('gif');
  if (!isImage || file.size <= 1.2 * 1024 * 1024) {
    return fileToDataUrl(file);
  }

  try {
    const rawDataUrl = await fileToDataUrl(file);
    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  } catch {
    return fileToDataUrl(file);
  }
}

function cacheUploadedDocUrl(
  url: string,
  category?: string,
  userId?: string,
  email?: string
) {
  if (!url || isStockPlaceholderUrl(url)) return;
  const fieldName = categoryToFieldName(category);
  if (!fieldName) return;

  try {
    const keys = new Set<string>(['wecare_uploaded_docs_latest']);
    if (email && email.trim()) {
      keys.add(`wecare_uploaded_docs_${email.trim().toLowerCase()}`);
    }
    if (userId && userId.trim()) {
      keys.add(`wecare_uploaded_docs_${userId.trim()}`);
    }

    for (const k of keys) {
      let existing: Record<string, string> = {};
      try {
        existing = JSON.parse(localStorage.getItem(k) || '{}');
      } catch {}
      existing[fieldName] = url;
      localStorage.setItem(k, JSON.stringify(existing));
    }
  } catch {}
}

function getCachedUploadedDocs(identifiers: DossierIdentifiers): Partial<ApplicantDossier> {
  const result: Record<string, string> = {};
  try {
    const keys: string[] = [];
    if (identifiers.email) keys.push(`wecare_uploaded_docs_${identifiers.email.trim().toLowerCase()}`);
    if (identifiers.userId) keys.push(`wecare_uploaded_docs_${identifiers.userId.trim()}`);
    if (identifiers.id) keys.push(`wecare_uploaded_docs_${identifiers.id.trim()}`);
    if (identifiers.nurseProfileId) keys.push(`wecare_uploaded_docs_${identifiers.nurseProfileId.trim()}`);

    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          for (const [field, url] of Object.entries(parsed)) {
            if (typeof url === 'string' && !isStockPlaceholderUrl(url) && !result[field]) {
              result[field] = url;
            }
          }
        }
      }
    }
  } catch {}
  return result as Partial<ApplicantDossier>;
}

/**
 * Uploads a document or image to the central server SQLite database (/api/documents/upload)
 * Returns the permanent public URL (e.g. /uploads/doc_1731...jpg)
 */
export async function uploadDocument(
  fileOrDataUrl: File | Blob | string,
  fileName?: string,
  category?: string,
  userId?: string,
  email?: string
): Promise<{ url: string; fileId: string; fileName: string; storedInDatabase?: boolean }> {
  let dataUrl = '';
  let actualFileName = fileName || 'document';
  const cleanEmail = email ? email.trim().toLowerCase() : undefined;

  if (typeof fileOrDataUrl === 'string') {
    dataUrl = fileOrDataUrl;
  } else {
    actualFileName = (fileOrDataUrl as File).name || fileName || 'document';
    dataUrl = await compressImageBlobIfLarge(fileOrDataUrl);
  }

  // Try direct upload to central server SQLite database
  try {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dataUrl,
        fileName: actualFileName,
        category,
        userId,
        email: cleanEmail
      })
    });

    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.url) {
        cacheUploadedDocUrl(data.url, category, userId, cleanEmail);
        return {
          url: data.url,
          fileId: data.fileId || '',
          fileName: data.fileName || actualFileName,
          storedInDatabase: Boolean(data.storedInDatabase ?? true)
        };
      }
    }
  } catch (err) {
    console.warn('[DossierStore] Remote upload failed, using client fallback:', err);
  }

  // Fallback if server is temporarily unreachable or offline
  cacheUploadedDocUrl(dataUrl, category, userId, cleanEmail);
  return {
    url: dataUrl,
    fileId: `fallback_${Date.now()}`,
    fileName: actualFileName,
    storedInDatabase: false
  };
}

/**
 * Lists uploaded documents stored in the central SQLite database for a user
 */
export async function fetchUserUploadedDocuments(identifier: string): Promise<Array<{
  fileId: string;
  category: string;
  fileName: string;
  mimeType?: string;
  url: string;
  createdAt?: string;
}>> {
  const clean = (identifier || '').trim().toLowerCase();
  if (!clean) return [];
  try {
    const res = await fetch(`/api/documents/by-user/${encodeURIComponent(clean)}`);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data.success && Array.isArray(data.documents)) {
        return data.documents;
      }
    }
  } catch (err) {
    console.warn('[DossierStore] fetchUserUploadedDocuments notice:', err);
  }
  return [];
}

/**
 * Saves or updates an applicant dossier in the central server SQLite database & local cache
 */
export async function saveApplicantDossier(dossier: Partial<ApplicantDossier>): Promise<ApplicantDossier | null> {
  const cleanEmail = (dossier.email || '').toLowerCase().trim();
  const id = dossier.id || dossier.userId || `applicant-${Date.now()}`;

  // Attach any cached uploaded documents matching this user/email in case a step completed earlier
  const cachedDocs = getCachedUploadedDocs({
    id,
    userId: dossier.userId,
    nurseProfileId: dossier.nurseProfileId,
    email: cleanEmail
  });

  const payload = deepMergeDossiers(cachedDocs, {
    ...dossier,
    id,
    userId: dossier.userId || id,
    email: cleanEmail,
    submittedAt: dossier.submittedAt || new Date().toISOString()
  });

  // Local caching for instant reactivity and offline resilience
  const writeLocalCopies = (record: Partial<ApplicantDossier>) => {
    try {
      if (cleanEmail) {
        localStorage.setItem(`wecare_dossier_${cleanEmail}`, JSON.stringify(record));
      }
      if (record.id) {
        localStorage.setItem(`wecare_dossier_${record.id}`, JSON.stringify(record));
      }
      if (record.userId && record.userId !== record.id) {
        localStorage.setItem(`wecare_dossier_${record.userId}`, JSON.stringify(record));
      }
      window.dispatchEvent(new CustomEvent('wecare_dossier_saved', { detail: record }));
    } catch {}
  };

  writeLocalCopies(payload);

  try {
    const res = await fetch('/api/applicants/dossier', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.dossier) {
        const synced = deepMergeDossiers(payload, data.dossier);
        writeLocalCopies(synced);
        return synced as ApplicantDossier;
      }
    }
  } catch (err) {
    console.warn('[DossierStore] Failed to save dossier to server:', err);
  }

  return payload as ApplicantDossier;
}

/**
 * Fetches all applicant dossiers from the central server SQLite database merged with local cache
 */
export async function fetchAllApplicantDossiers(): Promise<ApplicantDossier[]> {
  let serverDossiers: ApplicantDossier[] = [];
  try {
    const res = await fetch('/api/applicants/dossiers');
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data.success && Array.isArray(data.dossiers)) {
        serverDossiers = data.dossiers;
      }
    }
  } catch (err) {
    console.warn('[DossierStore] Failed to fetch dossiers from server:', err);
  }

  // Gather any localStorage dossiers as well (offline resilience / instant visibility)
  const localDossiers: ApplicantDossier[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wecare_dossier_')) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || '{}');
          if (val && (val.id || val.email)) {
            localDossiers.push(val);
          }
        } catch {}
      }
    }
  } catch {}

  const mergedList: ApplicantDossier[] = [...serverDossiers];
  for (const ld of localDossiers) {
    const ldEmail = (ld.email || '').toLowerCase().trim();
    const idx = mergedList.findIndex(sd =>
      (sd.id && ld.id && sd.id === ld.id) ||
      (sd.userId && ld.userId && sd.userId === ld.userId) ||
      (ldEmail && sd.email && sd.email.toLowerCase().trim() === ldEmail)
    );
    if (idx >= 0) {
      mergedList[idx] = deepMergeDossiers(ld, mergedList[idx]) as ApplicantDossier;
    } else {
      mergedList.push(ld);
    }
  }

  return mergedList;
}

/**
 * Fetches an individual applicant dossier by ID, UserID, Email, or Username.
 * Supports multi-identifier lookup so mismatched UUID / email never misses uploaded documents.
 */
export async function fetchApplicantDossier(
  idOrEmailOrIdentifiers: string | DossierIdentifiers,
  extraIdentifiers?: DossierIdentifiers
): Promise<ApplicantDossier | null> {
  const ids: DossierIdentifiers =
    typeof idOrEmailOrIdentifiers === 'string'
      ? { id: idOrEmailOrIdentifiers, ...extraIdentifiers }
      : { ...idOrEmailOrIdentifiers, ...extraIdentifiers };

  const candidates = [
    ids.id,
    ids.userId,
    ids.nurseProfileId,
    ids.email,
    ids.username
  ]
    .map(v => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean);

  if (candidates.length === 0) return null;

  const primary = candidates[0];
  let remoteDossier: Partial<ApplicantDossier> | null = null;

  try {
    const params = new URLSearchParams();
    if (ids.id) params.set('id', ids.id.trim());
    if (ids.userId) params.set('userId', ids.userId.trim());
    if (ids.nurseProfileId) params.set('nurseProfileId', ids.nurseProfileId.trim());
    if (ids.email) params.set('email', ids.email.trim().toLowerCase());
    if (ids.username) params.set('username', ids.username.trim().toLowerCase());

    const qs = params.toString();
    const res = await fetch(`/api/applicants/dossier/${encodeURIComponent(primary)}${qs ? `?${qs}` : ''}`);
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.dossier) {
        remoteDossier = data.dossier;
      }
    }
  } catch (err) {
    console.warn(`[DossierStore] Failed to fetch dossier for ${primary}:`, err);
  }

  // If no dossier object returned, still query /api/documents/by-user across candidate identifiers
  if (!remoteDossier) {
    for (const c of candidates) {
      const docs = await fetchUserUploadedDocuments(c);
      if (docs.length > 0) {
        const extracted: Record<string, any> = {
          id: ids.id || ids.userId || c,
          email: ids.email || (c.includes('@') ? c.toLowerCase() : ''),
          uploadedFiles: docs,
          documents: {}
        };
        for (const d of docs) {
          const field = categoryToFieldName(d.category);
          if (field && !extracted[field]) {
            extracted[field] = d.url;
            extracted.documents[field] = d.url;
          }
        }
        remoteDossier = extracted;
        break;
      }
    }
  }

  // Merge any local storage copies matching any candidate identifier
  let localMerged: Partial<ApplicantDossier> = getCachedUploadedDocs(ids);
  try {
    for (const c of candidates) {
      const lower = c.toLowerCase();
      for (const k of [`wecare_dossier_${lower}`, `wecare_dossier_${c}`]) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          localMerged = deepMergeDossiers(localMerged, parsed);
        }
      }
    }
  } catch {}

  if (!remoteDossier && Object.keys(localMerged).length === 0) {
    return null;
  }

  return deepMergeDossiers(localMerged, remoteDossier) as ApplicantDossier;
}

/**
 * Updates applicant verification status (approve or reject) in the database
 */
export async function updateApplicantStatusInDb(
  idOrEmail: string,
  status: 'approved' | 'rejected' | 'pending' | 'pending_approval',
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

    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      return Boolean(data.success);
    }
  } catch (err) {
    console.warn(`[DossierStore] Failed to update status for ${clean}:`, err);
  }

  return false;
}
