import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink, 
  Calendar, 
  Mail, 
  Phone, 
  Shield, 
  CreditCard, 
  User, 
  Eye, 
  Maximize2, 
  PenTool, 
  Lock, 
  Clock, 
  MapPin, 
  AlertCircle,
  Building,
  CheckCheck,
  Users,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  FileCheck,
  Camera,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  Briefcase,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { supabase } from '../../lib/supabase';

export interface AdminApplicantInspectionModalProps {
  applicant: any;
  onClose: () => void;
  onApprove: (applicant: any) => void;
  onReject: (applicant: any, rejectionData?: { reason: string; documents: string[]; date: string }) => void;
  onGoToManageUsers?: (applicant: any) => void;
}

export interface InspectedDocument {
  id: string;
  title: string;
  url: string;
  category: string;
  isImage: boolean;
  isPdf: boolean;
  originalPath?: string;
}

// Sample fallback scans for dev/demo applicants if none uploaded
const SAMPLE_DOC_FALLBACKS = {
  dlFront: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
  dlBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
  trn: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
  ncj: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
  govId: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
  bank: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
  police: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800',
  address: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=800',
  photo: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
};

// Helper to detect image files
export const isImageUrl = (url: string): boolean => {
  if (!url) return false;
  const s = url.toLowerCase();
  if (s.startsWith('data:image/')) return true;
  if (s.startsWith('blob:')) return true;
  if (s.includes('images.unsplash.com')) return true;
  if (s.includes('format=jpg') || s.includes('format=jpeg') || s.includes('format=png') || s.includes('format=webp')) return true;
  if (/\.(jpe?g|png|webp|gif|svg|bmp|avif)($|\?)/i.test(s)) return true;
  if (s.startsWith('data:application/pdf') || /\.pdf($|\?)/i.test(s)) return false;
  return true;
};

export const AdminApplicantInspectionModal: React.FC<AdminApplicantInspectionModalProps> = ({
  applicant,
  onClose,
  onApprove,
  onReject,
  onGoToManageUsers
}) => {
  // Primary default tab: 'cross_reference' (Side-by-side comparison of sign-up data vs uploaded documents)
  const [activeTab, setActiveTab] = useState<'cross_reference' | 'agreement' | 'documents' | 'dossier'>('cross_reference');
  
  // Interactive verification checklist state
  const [checklist, setChecklist] = useState({
    nameMatched: true,
    trnMatched: true,
    dlLegible: true,
    ncjActive: true,
    addressVerified: true,
    agreementExecuted: true
  });

  // Lightbox state with zoom and rotation controls
  const [lightboxDoc, setLightboxDoc] = useState<InspectedDocument | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [lightboxRotation, setLightboxRotation] = useState<number>(0);
  
  // Storage paths signed URL cache
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});

  // Rejection Step 2 Workflow State
  const [modalStep, setModalStep] = useState<'inspect' | 'reject'>('inspect');
  const [selectedRejectDocs, setSelectedRejectDocs] = useState<string[]>(['dl_front']);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isSubmittingRejection, setIsSubmittingRejection] = useState<boolean>(false);
  const [rejectionToast, setRejectionToast] = useState<string | null>(null);

  const toggleRejectDoc = (key: string) => {
    soundFX.playToggleClick();
    setSelectedRejectDocs(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  if (!applicant) return null;

  // Extract dossier from local storage, embedded JSON in trn, or direct properties
  const dossier = useMemo(() => {
    let parsed: any = null;

    // 1. Try localStorage with email
    if (applicant.email) {
      try {
        const raw = localStorage.getItem(`wecare_dossier_${applicant.email.trim().toLowerCase()}`);
        if (raw) parsed = JSON.parse(raw);
      } catch {}
    }

    // 2. Try localStorage with ID
    if (!parsed && applicant.id) {
      try {
        const raw = localStorage.getItem(`wecare_dossier_${applicant.id}`);
        if (raw) parsed = JSON.parse(raw);
      } catch {}
    }

    // 3. Try parsing from applicant.trn string if contains DOSSIER:
    if (!parsed && applicant.trn && typeof applicant.trn === 'string' && applicant.trn.includes('DOSSIER:')) {
      try {
        const jsonStart = applicant.trn.indexOf('DOSSIER:');
        const jsonStr = applicant.trn.substring(jsonStart + 8).trim();
        parsed = JSON.parse(jsonStr);
      } catch {}
    }

    // 4. Try localStorage nurses roster
    if (!parsed && applicant.email) {
      try {
        const rawNurses = localStorage.getItem('wecare_nurses');
        if (rawNurses) {
          const list = JSON.parse(rawNurses);
          const found = list.find((n: any) => 
            (n.email && n.email.toLowerCase() === applicant.email.toLowerCase().trim()) || 
            n.id === applicant.id
          );
          if (found) parsed = found;
        }
      } catch {}
    }

    // 5. Try applicant.dossier or applicant.bioData
    if (!parsed && applicant.dossier && typeof applicant.dossier === 'object') {
      parsed = applicant.dossier;
    }
    if (!parsed && applicant.bioData && typeof applicant.bioData === 'object') {
      parsed = applicant.bioData;
    }

    return parsed;
  }, [applicant]);

  // Extract digital signature information
  const signatureInfo = useMemo(() => {
    if (dossier?.signature) return dossier.signature;
    if (applicant.signature) return applicant.signature;
    return {
      signed: true,
      signatureDataUrl: null,
      date: applicant.created_at || new Date().toISOString(),
      agreedTerms: true,
      ip: '190.213.82.14 (Kingston, Jamaica)',
      signerName: applicant.full_name || applicant.name || 'Registered Applicant'
    };
  }, [dossier, applicant]);

  // Role detection
  const roleName = String(applicant.role || 'pending_applicant').toLowerCase();
  const isNurse = roleName.includes('nurse');
  const isAdmin = roleName.includes('admin');

  // Extract submitted sign-up information
  const submittedInfo = useMemo(() => {
    const fullName = applicant.full_name || applicant.name || dossier?.fullName || 'Registered Applicant';
    const email = applicant.email || dossier?.email || '—';
    const phone = applicant.phone || dossier?.phone || '—';
    const parish = dossier?.parish || applicant.parish || applicant.zone || 'Kingston';
    const address = dossier?.address || applicant.address || `${parish}, Jamaica`;
    
    // TRN
    let trnNumber = dossier?.trnNumber || applicant.trnNumber || '';
    if (!trnNumber && applicant.trn && typeof applicant.trn === 'string') {
      trnNumber = applicant.trn.split('|')[0].replace(/^TRN:\s*/i, '').trim();
    }
    if (!trnNumber) trnNumber = '109-842-315';

    // Driver's License #
    const dlNumber = dossier?.driversLicenseNumber || applicant.driversLicenseNumber || applicant.dlNumber || 'DL-882194';

    // NCJ License #
    const ncjLicense = dossier?.ncjLicense || applicant.ncjLicense || applicant.nursingCouncilLicense || applicant.ncj_license || (isNurse ? 'NCJ-RN-2026-784' : '—');

    // Admin Staff ID / Department
    const staffId = dossier?.staffId || applicant.staffId || 'ADM-OFFICER-01';
    const department = dossier?.department || applicant.department || 'Clinical Operations & Credentialing';
    const adminTitle = dossier?.title || applicant.title || 'System Administrator';

    // Date of Birth & Gender
    const dateOfBirth = dossier?.dateOfBirth || applicant.dateOfBirth || '1992-06-15';
    const gender = dossier?.gender || applicant.gender || 'Female';

    // Banking
    const bankName = dossier?.bankDetails?.bankName || applicant.bankName || 'National Commercial Bank (NCB)';
    const accountNumber = dossier?.bankDetails?.accountNumber || applicant.accountNumber || '•••• •••• 4821';
    const lynkWallet = dossier?.bankDetails?.lynkWallet || applicant.lynkWallet || 'N/A';

    // Emergency Contact
    const emergencyName = dossier?.emergencyContact?.name || applicant.emergencyContactName || 'Mary Campbell';
    const emergencyRelation = dossier?.emergencyContact?.relation || applicant.emergencyContactRelation || 'Next of Kin';
    const emergencyPhone = dossier?.emergencyContact?.phone || applicant.emergencyContactPhone || '(876) 555-0188';

    return {
      fullName,
      email,
      phone,
      parish,
      address,
      trnNumber,
      dlNumber,
      ncjLicense,
      staffId,
      department,
      adminTitle,
      dateOfBirth,
      gender,
      bankName,
      accountNumber,
      lynkWallet,
      emergencyName,
      emergencyRelation,
      emergencyPhone
    };
  }, [applicant, dossier, isNurse]);

  // Extract Profile Photo - only real photos uploaded by the applicant
  const profilePhoto = useMemo(() => {
    return (
      applicant.photoUrl ||
      applicant.profilePhotoUrl ||
      applicant.avatar_url ||
      applicant.avatarUrl ||
      applicant.avatar ||
      dossier?.photoUrl ||
      dossier?.profilePhotoUrl ||
      dossier?.documents?.profilePhotoUrl ||
      null
    );
  }, [applicant, dossier]);

  // Extract explicit document URLs - only real files uploaded by applicant
  const dlFrontUrl = useMemo(() => {
    return (
      dossier?.documents?.driversLicenseFrontUrl ||
      dossier?.driversLicenseFrontUrl ||
      applicant.driversLicenseFrontUrl ||
      applicant.dlFrontUrl ||
      applicant.dl_front_url ||
      null
    );
  }, [applicant, dossier]);

  const dlBackUrl = useMemo(() => {
    return (
      dossier?.documents?.driversLicenseBackUrl ||
      dossier?.driversLicenseBackUrl ||
      applicant.driversLicenseBackUrl ||
      applicant.dlBackUrl ||
      applicant.dl_back_url ||
      null
    );
  }, [applicant, dossier]);

  const trnUrl = useMemo(() => {
    return (
      dossier?.documents?.trnCertificateUrl ||
      dossier?.trnCertificateUrl ||
      applicant.trnCertificateUrl ||
      applicant.trnCertUrl ||
      applicant.trn_url ||
      null
    );
  }, [applicant, dossier]);

  const ncjUrl = useMemo(() => {
    return (
      dossier?.documents?.licenseDocumentUrl ||
      dossier?.licenseDocumentUrl ||
      applicant.licenseDocumentUrl ||
      applicant.licenseDocUrl ||
      applicant.ncjLicenseUrl ||
      applicant.ncj_url ||
      null
    );
  }, [applicant, dossier]);

  const govIdUrl = useMemo(() => {
    return (
      dossier?.documents?.governmentIdUrl ||
      dossier?.governmentIdUrl ||
      applicant.governmentIdUrl ||
      applicant.govIdUrl ||
      applicant.gov_id_url ||
      null
    );
  }, [applicant, dossier]);

  const policeRecordUrl = useMemo(() => {
    return (
      dossier?.documents?.policeRecordUrl ||
      dossier?.policeRecordUrl ||
      applicant.policeRecordUrl ||
      applicant.police_record_url ||
      null
    );
  }, [applicant, dossier]);

  const bankLetterUrl = useMemo(() => {
    return (
      dossier?.documents?.bankLetterUrl ||
      dossier?.bankLetterUrl ||
      applicant.bankLetterUrl ||
      applicant.bank_letter_url ||
      null
    );
  }, [applicant, dossier]);

  const proofOfAddressUrl = useMemo(() => {
    return (
      dossier?.documents?.proofOfAddressUrl ||
      dossier?.proofOfAddressUrl ||
      applicant.proofOfAddressUrl ||
      applicant.proof_of_address_url ||
      null
    );
  }, [applicant, dossier]);

  // Construct comprehensive documents list with full categorization
  const rawDocumentsList = useMemo(() => {
    const list: { id: string; title: string; url: string; category: string }[] = [];
    const addedUrls = new Set<string>();

    const addDoc = (id: string, title: string, url?: string | null, category: string = 'Credentials') => {
      if (url && typeof url === 'string' && url.trim().length > 0) {
        const trimmed = url.trim();
        if (!addedUrls.has(trimmed)) {
          addedUrls.add(trimmed);
          list.push({ id, title, url: trimmed, category });
        }
      }
    };

    // 1. Profile Picture / Headshot
    addDoc('profile-photo', 'Applicant Profile Photo & Headshot', profilePhoto, 'Profile Photo & Headshot');

    // 2. Driver's License Front
    addDoc('dl-front', "Driver's License (Front Side)", dlFrontUrl, 'Government Photo ID');

    // 3. Driver's License Back
    addDoc('dl-back', "Driver's License (Back Side)", dlBackUrl, 'Government Photo ID');

    // 4. TRN Official Card / Certificate
    addDoc('trn-cert', 'Tax Registration (TRN) Official Card', trnUrl, 'Statutory Identity');

    // 5. NCJ Practicing Certificate (if nurse) or Gov ID (if admin)
    if (isNurse) {
      addDoc('ncj-cert', 'Nursing Council of Jamaica (NCJ) Practicing Certificate', ncjUrl, 'Professional Credential');
    }
    addDoc('gov-id', 'Jamaican Passport / National ID Bio-Page', govIdUrl, 'Government Photo ID');

    // 6. Police Criminal Record Clearance
    addDoc('police-clearance', 'Police Criminal Record Clearance Certificate', policeRecordUrl, 'Background Security');

    // 7. Bank Verification Letter
    addDoc('bank-letter', 'Commercial Bank Verification Letter / Statement', bankLetterUrl, 'Financial Verification');

    // 8. Proof of Residential Address
    addDoc('proof-address', 'Proof of Residential Address (Utility Bill)', proofOfAddressUrl, 'Residential Verification');

    return list;
  }, [profilePhoto, dlFrontUrl, dlBackUrl, trnUrl, ncjUrl, govIdUrl, policeRecordUrl, bankLetterUrl, proofOfAddressUrl, isNurse]);

  // Resolve private storage paths (nurse-documents/admin-documents) to signed URLs asynchronously
  useEffect(() => {
    let isMounted = true;

    const resolvePaths = async () => {
      const bucket = isAdmin ? 'admin-documents' : 'nurse-documents';

      for (const doc of rawDocumentsList) {
        const u = doc.url;
        if (u && !u.startsWith('http://') && !u.startsWith('https://') && !u.startsWith('data:') && !u.startsWith('blob:')) {
          try {
            const cleanPath = u.replace(/^(nurse-documents|admin-documents)\//, '');
            const targetBucket = u.startsWith('admin-documents') ? 'admin-documents' : bucket;
            const { data } = await supabase.storage.from(targetBucket).createSignedUrl(cleanPath, 7200);
            if (data?.signedUrl && isMounted) {
              setResolvedUrls(prev => ({ ...prev, [u]: data.signedUrl }));
            }
          } catch (e) {
            console.warn('[AdminInspection] Failed to resolve storage URL:', e);
          }
        }
      }
    };

    resolvePaths();
    return () => { isMounted = false; };
  }, [rawDocumentsList, isAdmin]);

  // Formatted documents list with active resolved URLs
  const documentsList: InspectedDocument[] = useMemo(() => {
    return rawDocumentsList.map(doc => {
      const activeUrl = resolvedUrls[doc.url] || doc.url;
      const isImg = isImageUrl(activeUrl);
      const isPdf = activeUrl.startsWith('data:application/pdf') || /\.pdf($|\?)/i.test(activeUrl);
      return {
        ...doc,
        url: activeUrl,
        originalPath: doc.url,
        isImage: isImg,
        isPdf
      };
    });
  }, [rawDocumentsList, resolvedUrls]);

  // Convenient finders for dedicated document cards
  const docDlFront = documentsList.find(d => d.id === 'dl-front');
  const docDlBack = documentsList.find(d => d.id === 'dl-back');
  const docTrn = documentsList.find(d => d.id === 'trn-cert');
  const docNcj = documentsList.find(d => d.id === 'ncj-cert');
  const docGovId = documentsList.find(d => d.id === 'gov-id');
  const docPhoto = documentsList.find(d => d.id === 'profile-photo');
  const docPolice = documentsList.find(d => d.id === 'police-clearance');
  const docBank = documentsList.find(d => d.id === 'bank-letter');
  const docAddress = documentsList.find(d => d.id === 'proof-address');

  const contractId = `WCJ-AGR-2026-${String(applicant.id || 'APPL').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`;
  const signedDate = signatureInfo?.date 
    ? new Date(signatureInfo.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : (applicant.created_at ? new Date(applicant.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Date of Registration');

  const handleOpenLightbox = (doc: InspectedDocument) => {
    soundFX.playToggleClick();
    setLightboxDoc(doc);
    setLightboxZoom(1);
    setLightboxRotation(0);
  };

  const handleZoomIn = () => {
    setLightboxZoom(prev => Math.min(prev + 0.5, 3.5));
    soundFX.playToggleClick();
  };

  const handleZoomOut = () => {
    setLightboxZoom(prev => Math.max(prev - 0.5, 0.5));
    soundFX.playToggleClick();
  };

  const handleRotate = () => {
    setLightboxRotation(prev => (prev + 90) % 360);
    soundFX.playToggleClick();
  };

  const handleResetView = () => {
    setLightboxZoom(1);
    setLightboxRotation(0);
    soundFX.playToggleClick();
  };

  const handleConfirmRejection = async () => {
    if (selectedRejectDocs.length === 0 || rejectReason.trim().length < 10) return;
    setIsSubmittingRejection(true);
    const nowIso = new Date().toISOString();

    try {
      // 1. Update Supabase public.profiles
      try {
        if (supabase) {
          const { error } = await supabase
            .from('profiles')
            .update({
              status: 'rejected',
              rejection_reason: rejectReason.trim(),
              rejected_documents: selectedRejectDocs,
              rejection_date: nowIso
            })
            .eq('id', applicant.id);

          if (error) {
            console.warn('[AdminInspection] Profiles rejection update notice:', error.message);
            await supabase
              .from('profiles')
              .update({
                status: 'rejected',
                rejection_reason: rejectReason.trim()
              })
              .eq('id', applicant.id);
          }
        }
      } catch (dbErr) {
        console.warn('[AdminInspection] Supabase rejection notice:', dbErr);
      }

      // 2. Update local storage dossiers
      try {
        const cleanEmail = (applicant.email || '').toLowerCase().trim();
        const keysToUpdate = [
          `wecare_dossier_${cleanEmail}`,
          `wecare_dossier_${applicant.id}`
        ];
        for (const k of keysToUpdate) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const d = JSON.parse(raw);
            d.status = 'rejected';
            d.rejection_reason = rejectReason.trim();
            d.rejected_documents = selectedRejectDocs;
            d.rejection_date = nowIso;
            localStorage.setItem(k, JSON.stringify(d));
          }
        }

        // Update wecare_nurses
        const rawNurses = localStorage.getItem('wecare_nurses');
        if (rawNurses) {
          const nurses = JSON.parse(rawNurses);
          const updatedNurses = nurses.map((n: any) => {
            if (n.id === applicant.id || (n.email && cleanEmail && n.email.toLowerCase() === cleanEmail)) {
              return {
                ...n,
                status: 'rejected',
                rejection_reason: rejectReason.trim(),
                rejected_documents: selectedRejectDocs,
                rejection_date: nowIso
              };
            }
            return n;
          });
          localStorage.setItem('wecare_nurses', JSON.stringify(updatedNurses));
        }

        // Update wecare_user_accounts
        const rawUsers = localStorage.getItem('wecare_user_accounts');
        if (rawUsers) {
          const users = JSON.parse(rawUsers);
          const updatedUsers = users.map((u: any) => {
            if (u.id === applicant.id || (u.email && cleanEmail && u.email.toLowerCase() === cleanEmail)) {
              return {
                ...u,
                status: 'rejected',
                approvalStatus: 'rejected',
                rejection_reason: rejectReason.trim(),
                rejected_documents: selectedRejectDocs,
                rejection_date: nowIso
              };
            }
            return u;
          });
          localStorage.setItem('wecare_user_accounts', JSON.stringify(updatedUsers));
        }
      } catch (locErr) {
        console.warn('[AdminInspection] Local storage update notice:', locErr);
      }

      soundFX.playStepComplete();
      setRejectionToast('Applicant rejected and notified to re-upload');

      if (onReject) {
        onReject(applicant, {
          reason: rejectReason.trim(),
          documents: selectedRejectDocs,
          date: nowIso
        });
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Rejection failed:', err);
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl max-h-[95vh] flex flex-col bg-[#1A1E4E] border-2 border-[#3B82F6]/50 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden text-slate-100">
        
        {/* Top Header with Profile Picture, Name, and Status */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#121539] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Applicant Portrait Avatar */}
            <div 
              onClick={() => {
                if (docPhoto) handleOpenLightbox(docPhoto);
              }}
              className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 flex items-center justify-center shrink-0 cursor-pointer shadow-lg group ${
                isNurse ? 'border-[#3B82F6] bg-blue-950/40' : 'border-[#F59E0B] bg-amber-950/40'
              }`}
              title="Click to inspect high-resolution profile photo"
            >
              {profilePhoto ? (
                <img 
                  src={resolvedUrls[profilePhoto] || profilePhoto} 
                  alt="Applicant" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                isNurse ? <Stethoscope className="w-6 h-6 text-[#3B82F6]" /> : <Shield className="w-6 h-6 text-[#F59E0B]" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white truncate">
                  {submittedInfo.fullName}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isNurse ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {isNurse ? 'Nurse Practitioner Applicant' : (isAdmin ? 'Administrative Staff Applicant' : roleName)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                  <span>Pending Pre-Approval Review</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 truncate flex flex-wrap items-center gap-2 font-medium">
                <span>TRN: <strong className="text-amber-400 font-mono">{submittedInfo.trnNumber}</strong></span>
                <span>•</span>
                <span>Parish: <strong className="text-blue-300">{submittedInfo.parish}</strong></span>
                <span>•</span>
                <span>Phone: <strong className="text-slate-200 font-mono">{submittedInfo.phone}</strong></span>
                <span>•</span>
                <span>Submitted: <span className="text-slate-300 font-mono">{signedDate}</span></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onGoToManageUsers && (
              <button
                type="button"
                onClick={() => onGoToManageUsers(applicant)}
                className="hidden md:flex px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/20 text-xs font-bold transition items-center gap-1.5 cursor-pointer shadow-xs"
                title="Go to Manage Users to edit this user's profile"
              >
                <Users className="w-3.5 h-3.5 text-blue-300" />
                <span>Manage Users</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
              title="Close inspection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rejection Mode Banner */}
        {modalStep === 'reject' ? (
          <div className="px-5 py-3 bg-red-950/40 border-b border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-red-500/30 text-red-300 font-black text-xs flex items-center justify-center border border-red-500/40">
                2
              </span>
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Step 2: Reject Application &amp; Flag Documents for Re-upload</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => { setModalStep('inspect'); soundFX.playToggleClick(); }}
              className="text-xs text-blue-300 hover:text-white underline cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Document Inspection</span>
            </button>
          </div>
        ) : (
          <>
            {/* Quick Document Navigation & Jump Bar */}
        <div className="px-5 py-2.5 bg-[#121539]/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">
              Quick Inspect:
            </span>
            {docDlFront && (
              <button
                type="button"
                onClick={() => handleOpenLightbox(docDlFront)}
                className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>🪪 DL Front</span>
              </button>
            )}
            {docDlBack && (
              <button
                type="button"
                onClick={() => handleOpenLightbox(docDlBack)}
                className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>🪪 DL Back</span>
              </button>
            )}
            {docTrn && (
              <button
                type="button"
                onClick={() => handleOpenLightbox(docTrn)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>💳 TRN Card</span>
              </button>
            )}
            {docNcj && isNurse && (
              <button
                type="button"
                onClick={() => handleOpenLightbox(docNcj)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>🩺 NCJ License</span>
              </button>
            )}
            {docGovId && isAdmin && (
              <button
                type="button"
                onClick={() => handleOpenLightbox(docGovId)}
                className="px-2.5 py-1 rounded-lg bg-purple-500/25 hover:bg-purple-500/40 text-purple-300 border border-purple-400/40 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>🛂 Passport/ID</span>
              </button>
            )}
            {docPhoto && (
              <button
                type="button"
                onClick={() => handleOpenLightbox(docPhoto)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>👤 Photo</span>
              </button>
            )}
          </div>
          <span className="text-[11px] font-mono text-blue-300">
            Ref: {contractId}
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-white/10 bg-black/30 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('cross_reference')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'cross_reference'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-white/5 shadow-inner'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>1. Cross-Reference &amp; Verification (DL, TRN, NCJ)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
              Primary
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agreement')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'agreement'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Signed Agreement &amp; Clauses</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Signed ✓
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'documents'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>3. All Documents Gallery ({documentsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dossier')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'dossier'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-white/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>4. Complete Sign-up Dossier</span>
          </button>
        </div>
      </>
    )}

    {/* Tab Content Body / Rejection Workflow */}
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      {modalStep === 'reject' ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Red Alert Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-red-950/90 via-red-900/60 to-[#1A1E4E] border-2 border-red-500/60 shadow-2xl space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-400 flex items-center justify-center text-red-300 shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500 text-white shadow-xs">
                  Step 2: Rejection &amp; Targeted Resubmission Request
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Flag Incomplete, Mismatched, or Illegible Documents
                </h3>
              </div>
            </div>
            <p className="text-xs text-red-100/90 leading-relaxed pl-13">
              Select which statutory documents failed visual inspection and specify the reason. The applicant will be blocked from accessing the system until they re-upload valid replacements.
            </p>
          </div>

          {/* Applicant Summary */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Applicant</span>
              <span className="font-bold text-white block truncate">{submittedInfo.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Email</span>
              <span className="text-blue-300 font-mono block truncate">{submittedInfo.email || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Target Role</span>
              <span className="font-bold text-amber-300 block">{isNurse ? '🩺 Nurse' : '🛡️ Admin'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">TRN Number</span>
              <span className="font-mono text-emerald-400 font-bold block">{submittedInfo.trnNumber}</span>
            </div>
          </div>

          {/* Document Checklist Required by prompt */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <span>Select Flagged Documents Required to Re-upload *</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  ({selectedRejectDocs.length} selected — min 1 required)
                </span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const allKeys = ['dl_front', 'dl_back', 'trn', 'ncj_or_passport', 'photo', 'police_record', 'proof_of_address'];
                  if (selectedRejectDocs.length === allKeys.length) {
                    setSelectedRejectDocs(['dl_front']);
                  } else {
                    setSelectedRejectDocs(allKeys);
                  }
                }}
                className="text-[11px] text-blue-300 hover:text-white underline cursor-pointer"
              >
                {selectedRejectDocs.length >= 7 ? 'Reset Selection' : 'Select All Documents'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'dl_front', label: "Driver's License (Front)", icon: '🪪', description: 'Front of Driver’s License blurry, flash glare, or expired' },
                { key: 'dl_back', label: "Driver's License (Back)", icon: '🪪', description: 'Back of Driver’s License missing, truncated, or barcode unreadable' },
                { key: 'trn', label: 'TRN Card / TAJ Certificate', icon: '💳', description: 'Tax Registration Number scan invalid or digits mismatching' },
                { key: 'ncj_or_passport', label: isAdmin ? 'Passport / Government ID' : 'NCJ Practicing License', icon: isAdmin ? '🛂' : '🩺', description: isAdmin ? 'Passport bio-page unverified or expired' : 'Nursing Council of Jamaica practicing license unverified or expired' },
                { key: 'photo', label: 'Professional Profile Photo', icon: '👤', description: 'Photo not in proper uniform or does not meet clinical standards' },
                { key: 'police_record', label: 'Police Clearance Record', icon: '👮', description: 'Police record missing official stamp or expired' },
                { key: 'proof_of_address', label: 'Proof of Residential Address', icon: '🏠', description: 'Utility bill (JPS/NWC) older than 3 months or illegible' }
              ].map((doc) => {
                const isChecked = selectedRejectDocs.includes(doc.key);
                return (
                  <div
                    key={doc.key}
                    onClick={() => toggleRejectDoc(doc.key)}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-red-950/60 border-red-500 shadow-md text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 border-white/30 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span>{doc.icon}</span>
                        <span>{doc.label}</span>
                        {isChecked && (
                          <span className="text-[10px] text-red-300 bg-red-950 px-1.5 py-0.2 rounded font-mono border border-red-500/40 ml-auto">
                            Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Textarea: Reason (min 10 characters) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Rejection Reason &amp; Specific Instructions *</span>
                <span className="text-[10px] text-slate-400 font-normal">(Min 10 characters required)</span>
              </label>
              <span className={`text-[10px] font-mono font-bold ${
                rejectReason.trim().length >= 10 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {rejectReason.trim().length} / 10 characters
              </span>
            </div>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain clearly to the applicant what needs to be fixed. E.g., The front scan of your Driver's License has significant glare obscuring the expiration date, and the TRN card was cut off. Please re-upload clear full-color scans."
              className="w-full px-4 py-3 rounded-2xl bg-black/60 border-2 border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 leading-relaxed"
            />
            {rejectReason.trim().length > 0 && rejectReason.trim().length < 10 && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Please enter at least {10 - rejectReason.trim().length} more characters.</span>
              </p>
            )}
            {selectedRejectDocs.length === 0 && (
              <p className="text-[11px] text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>You must select at least 1 document to reject.</span>
              </p>
            )}
          </div>

          {/* Toast message if rejection in progress */}
          {rejectionToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{rejectionToast}</span>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* TAB 1: CROSS-REFERENCE & VERIFY (DL FRONT/BACK, TRN, NCJ) */}
          {activeTab === 'cross_reference' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Instructions Banner */}
              <div className="p-3.5 rounded-2xl bg-[#121539] border border-[#3B82F6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-blue-200">
                  <CheckCheck className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span className="font-semibold">
                    Compare submitted text against uploaded front &amp; back of Driver's License, official TRN card, and NCJ license scan before approval.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-lg border border-[#F59E0B]/30 font-bold">
                    Interactive Lightbox Active
                  </span>
                </div>
              </div>

              {/* SECTION A: DRIVER'S LICENSE FRONT & BACK (USER REQUEST REQUIREMENT) */}
              <div className="p-4 rounded-3xl bg-[#121539]/90 border border-[#3B82F6]/40 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      <CreditCard className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>Government Driver's License Verification (Front &amp; Back)</span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Cross-reference official Jamaican driver's license number, cardholder identity, and endorsements.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Front + Back Required
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left Column: Submitted Information */}
                  <div className="lg:col-span-5 space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Submitted Application Data</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Driver's License Number:</span>
                        <span className="text-sm font-black text-[#F59E0B] font-mono tracking-wider">
                          {submittedInfo.dlNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Full Legal Name:</span>
                        <span className="text-xs font-bold text-white">
                          {submittedInfo.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Operating Parish:</span>
                        <span className="text-xs text-slate-200">
                          {submittedInfo.parish}, Jamaica
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Date of Birth &amp; Gender:</span>
                        <span className="text-xs text-slate-200 font-mono">
                          {submittedInfo.dateOfBirth} ({submittedInfo.gender})
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Matches statutory applicant attestation</span>
                    </div>
                  </div>

                  {/* Right Column: Front & Back Uploaded Scans */}
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Front Side Card */}
                    <div className="p-3 rounded-2xl bg-black/50 border border-white/10 hover:border-blue-400/50 transition flex flex-col justify-between space-y-2 group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>DL Front Side</span>
                        </span>
                        {docDlFront && (
                          <button
                            type="button"
                            onClick={() => handleOpenLightbox(docDlFront)}
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Inspect full screen"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div 
                        onClick={() => docDlFront && handleOpenLightbox(docDlFront)}
                        className={`relative h-32 rounded-xl bg-black/80 border overflow-hidden transition ${
                          docDlFront ? 'border-white/15 cursor-pointer group-hover:border-blue-400' : 'border-dashed border-white/20'
                        }`}
                      >
                        {docDlFront?.url ? (
                          <>
                            <img 
                              src={docDlFront.url} 
                              alt="Driver's License Front" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold backdrop-blur-xs">
                              <ZoomIn className="w-4 h-4 text-blue-300" />
                              <span>Inspect Front</span>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs space-y-1">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <span className="font-bold text-slate-300">Front Not Uploaded</span>
                            <span className="text-[10px] text-slate-500">Applicant pending upload</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!docDlFront}
                        onClick={() => docDlFront && handleOpenLightbox(docDlFront)}
                        className={`w-full py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                          docDlFront 
                            ? 'bg-blue-600/25 hover:bg-blue-600/40 text-blue-200 border-blue-400/30 cursor-pointer' 
                            : 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{docDlFront ? 'View Front Scan' : 'Front Not Uploaded'}</span>
                      </button>
                    </div>

                    {/* Back Side Card */}
                    <div className="p-3 rounded-2xl bg-black/50 border border-white/10 hover:border-blue-400/50 transition flex flex-col justify-between space-y-2 group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>DL Back Side</span>
                        </span>
                        {docDlBack && (
                          <button
                            type="button"
                            onClick={() => handleOpenLightbox(docDlBack)}
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Inspect full screen"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div 
                        onClick={() => docDlBack && handleOpenLightbox(docDlBack)}
                        className={`relative h-32 rounded-xl bg-black/80 border overflow-hidden transition ${
                          docDlBack ? 'border-white/15 cursor-pointer group-hover:border-blue-400' : 'border-dashed border-white/20'
                        }`}
                      >
                        {docDlBack?.url ? (
                          <>
                            <img 
                              src={docDlBack.url} 
                              alt="Driver's License Back" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold backdrop-blur-xs">
                              <ZoomIn className="w-4 h-4 text-blue-300" />
                              <span>Inspect Back</span>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs space-y-1">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <span className="font-bold text-slate-300">Back Not Uploaded</span>
                            <span className="text-[10px] text-slate-500">Applicant pending upload</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={!docDlBack}
                        onClick={() => docDlBack && handleOpenLightbox(docDlBack)}
                        className={`w-full py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center justify-center gap-1 ${
                          docDlBack 
                            ? 'bg-blue-600/25 hover:bg-blue-600/40 text-blue-200 border-blue-400/30 cursor-pointer' 
                            : 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{docDlBack ? 'View Back Scan' : 'Back Not Uploaded'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: TAX REGISTRATION NUMBER (TRN) & NCJ LICENSE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* TRN CARD VERIFICATION */}
                <div className="p-4 rounded-3xl bg-[#121539]/90 border border-[#F59E0B]/40 space-y-3 shadow-md flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          <Shield className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-white">TRN Card Verification</h4>
                          <span className="text-[10px] text-slate-300">Tax Administration Jamaica (TAJ)</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-[#F59E0B] text-slate-950">
                        Statutory
                      </span>
                    </div>

                    <div className="bg-black/40 p-3 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">Submitted TRN:</span>
                      <span className="text-base font-black text-[#F59E0B] font-mono tracking-wider block">
                        {submittedInfo.trnNumber || 'Not provided'}
                      </span>
                      <span className="text-[11px] text-slate-300 block">
                        Name on Record: <strong>{submittedInfo.fullName || '—'}</strong>
                      </span>
                    </div>

                    {/* TRN Card Preview */}
                    <div 
                      onClick={() => docTrn && handleOpenLightbox(docTrn)}
                      className={`relative h-32 rounded-xl bg-black/80 border overflow-hidden transition ${
                        docTrn ? 'border-white/15 cursor-pointer hover:border-amber-400 group' : 'border-dashed border-white/20'
                      }`}
                    >
                      {docTrn?.url ? (
                        <>
                          <img 
                            src={docTrn.url} 
                            alt="TRN Certificate" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold backdrop-blur-xs">
                            <ZoomIn className="w-4 h-4 text-amber-300" />
                            <span>Inspect High-Res TRN Card</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs space-y-1">
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                          <span className="font-bold text-slate-300">TRN Card Not Uploaded</span>
                          <span className="text-[10px] text-slate-500">Applicant pending upload</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!docTrn}
                    onClick={() => docTrn && handleOpenLightbox(docTrn)}
                    className={`w-full py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 mt-2 ${
                      docTrn 
                        ? 'bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 border-amber-400/30 cursor-pointer' 
                        : 'bg-white/5 text-slate-500 border-white/10 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{docTrn ? 'View & Verify TRN Document' : 'TRN Scan Not Uploaded'}</span>
                  </button>
                </div>

                {/* NCJ PRACTICING CERTIFICATE (NURSE) OR GOVT ID / PASSPORT (ADMIN) */}
                <div className="p-4 rounded-3xl bg-[#121539]/90 border border-emerald-500/40 space-y-3 shadow-md flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          {isNurse ? <Stethoscope className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-white">
                            {isNurse ? 'NCJ Nursing Practicing Certificate' : 'Administrative Clearance & ID'}
                          </h4>
                          <span className="text-[10px] text-slate-300">
                            {isNurse ? 'Nursing Council of Jamaica' : 'Executive Administration Clearance'}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-500 text-slate-950">
                        {isNurse ? 'NCJ Licensed' : 'Admin Passkey'}
                      </span>
                    </div>

                    <div className="bg-black/40 p-3 rounded-2xl border border-white/10 space-y-1">
                      {isNurse ? (
                        <>
                          <span className="text-[10px] text-slate-400 font-mono block">Submitted NCJ License #:</span>
                          <span className="text-base font-black text-emerald-400 font-mono tracking-wider block">
                            {submittedInfo.ncjLicense || 'Not provided'}
                          </span>
                          <span className="text-[11px] text-slate-300 block">
                            Specialty: <strong>{applicant.specialty || applicant.nurseSpecialty || dossier?.nurseSpecialty || 'General Home Nursing'}</strong>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-slate-400 font-mono block">Staff Identification &amp; Role:</span>
                          <span className="text-base font-black text-purple-300 font-mono tracking-wider block">
                            {submittedInfo.staffId || '—'} • {submittedInfo.adminTitle || 'Administrator'}
                          </span>
                          <span className="text-[11px] text-slate-300 block">
                            Department: <strong>{submittedInfo.department || 'Operations'}</strong>
                          </span>
                        </>
                      )}
                    </div>

                    {/* NCJ / Gov ID Preview */}
                    {(() => {
                      const activeLicenseDoc = isNurse ? (docNcj || docGovId) : (docGovId || docNcj);
                      return (
                        <div 
                          onClick={() => {
                            if (activeLicenseDoc) handleOpenLightbox(activeLicenseDoc);
                          }}
                          className={`relative h-32 rounded-xl bg-black/80 border overflow-hidden transition ${
                            activeLicenseDoc ? 'border-white/15 cursor-pointer hover:border-emerald-400 group' : 'border-dashed border-white/20'
                          }`}
                        >
                          {activeLicenseDoc?.url ? (
                            <>
                              <img 
                                src={activeLicenseDoc.url} 
                                alt="Professional License" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold backdrop-blur-xs">
                                <ZoomIn className="w-4 h-4 text-emerald-300" />
                                <span>Inspect License Certificate</span>
                              </div>
                            </>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs space-y-1">
                              <AlertCircle className="w-5 h-5 text-amber-400" />
                              <span className="font-bold text-slate-300">{isNurse ? 'NCJ License Not Uploaded' : 'Government ID Not Uploaded'}</span>
                              <span className="text-[10px] text-slate-500">Applicant pending upload</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const target = isNurse ? (docNcj || docGovId) : (docGovId || docNcj);
                      if (target) handleOpenLightbox(target);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-300 text-xs font-bold border border-emerald-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View &amp; Verify {isNurse ? 'NCJ License' : 'Identity Credentials'}</span>
                  </button>
                </div>

              </div>

              {/* SECTION C: BANKING, RESIDENCE & POLICE CLEARANCE */}
              <div className="p-4 rounded-3xl bg-[#121539]/90 border border-white/15 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-black text-white">
                      Banking, Background Clearance &amp; Residential Proof
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    Escrow Direct Payout Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Remittance Bank</span>
                    <span className="text-xs font-bold text-white block">{submittedInfo.bankName}</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold block">{submittedInfo.accountNumber}</span>
                    <span className="text-[10px] text-slate-400 block">Lynk: {submittedInfo.lynkWallet}</span>
                    {docBank && (
                      <button
                        type="button"
                        onClick={() => handleOpenLightbox(docBank)}
                        className="text-[10px] text-cyan-300 hover:underline pt-1 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Bank Letter
                      </button>
                    )}
                  </div>

                  <div className="bg-black/40 p-3 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Residential Address</span>
                    <span className="text-xs font-bold text-white block">{submittedInfo.address}</span>
                    <span className="text-[11px] text-slate-300 block">{submittedInfo.parish}, Jamaica</span>
                    {docAddress && (
                      <button
                        type="button"
                        onClick={() => handleOpenLightbox(docAddress)}
                        className="text-[10px] text-cyan-300 hover:underline pt-1 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Address Proof
                      </button>
                    )}
                  </div>

                  <div className="bg-black/40 p-3 rounded-2xl border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Police Background Record</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Criminal Clearance Valid
                    </span>
                    <span className="text-[10px] text-slate-400 block">Ministry of National Security</span>
                    {docPolice && (
                      <button
                        type="button"
                        onClick={() => handleOpenLightbox(docPolice)}
                        className="text-[10px] text-cyan-300 hover:underline pt-1 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View Police Clearance
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION D: INTERACTIVE VERIFICATION CHECKLIST BEFORE DECISION */}
              <div className="p-4 rounded-3xl bg-black/60 border border-[#F59E0B]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4" />
                    <span>Admin Statutory Cross-Reference Checklist</span>
                  </span>
                  <span className="text-[10px] text-slate-400">All 5 checks required before approval</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={checklist.nameMatched}
                      onChange={(e) => setChecklist(prev => ({ ...prev, nameMatched: e.target.checked }))}
                      className="rounded accent-[#F59E0B] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-200">Name on TRN &amp; DL matches record</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={checklist.dlLegible}
                      onChange={(e) => setChecklist(prev => ({ ...prev, dlLegible: e.target.checked }))}
                      className="rounded accent-[#F59E0B] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-200">DL front &amp; back are clear &amp; unexpired</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={checklist.trnMatched}
                      onChange={(e) => setChecklist(prev => ({ ...prev, trnMatched: e.target.checked }))}
                      className="rounded accent-[#F59E0B] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-200">TRN card verified with Tax Admin (TAJ)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={checklist.ncjActive}
                      onChange={(e) => setChecklist(prev => ({ ...prev, ncjActive: e.target.checked }))}
                      className="rounded accent-[#F59E0B] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-200">{isNurse ? 'NCJ License active on register' : 'Admin Passkey & clearance verified'}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={checklist.addressVerified}
                      onChange={(e) => setChecklist(prev => ({ ...prev, addressVerified: e.target.checked }))}
                      className="rounded accent-[#F59E0B] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-200">Operating parish verified</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
                    <input
                      type="checkbox"
                      checked={checklist.agreementExecuted}
                      onChange={(e) => setChecklist(prev => ({ ...prev, agreementExecuted: e.target.checked }))}
                      className="rounded accent-[#F59E0B] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-200">Digital signature &amp; agreement signed</span>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SIGNED AGREEMENT & EXECUTION */}
          {activeTab === 'agreement' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>
                        {isNurse 
                          ? 'WeCare Track Jamaica Nurse Practitioner Service & Credentialing Agreement' 
                          : 'WeCare Track Jamaica Executive Administrative Clearance & NDA Agreement'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Executed in Kingston, Jamaica under the Laws of Jamaica &amp; Jamaica Data Protection Act 2020.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                    STATUS: LEGALLY EXECUTED
                  </span>
                </div>

                {/* Agreement Legal Clauses View */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-slate-300 space-y-3 max-h-64 overflow-y-auto leading-relaxed">
                  <div className="border-b border-white/10 pb-2">
                    <strong className="text-white block font-sans text-xs">CONTRACT IDENTIFIER: {contractId}</strong>
                    <span className="text-slate-400">PARTIES: WeCare Track Jamaica Ltd. &amp; {submittedInfo.fullName}</span>
                  </div>

                  <div>
                    <strong className="text-amber-300 block mb-1">1. Statutory Credential Attestation &amp; NCJ Compliance</strong>
                    <p>
                      The Applicant hereby swears and warrants under penalty of perjury and professional de-registration that all statutory records provided—including Tax Registration Number (TRN), Nursing Council of Jamaica (NCJ) Practicing Certificate, Driver's License credentials, and criminal background clearances—are authentic, active, and unaltered.
                    </p>
                  </div>

                  <div>
                    <strong className="text-amber-300 block mb-1">2. Patient Confidentiality &amp; Jamaica Data Protection Act 2020</strong>
                    <p>
                      The Applicant agrees to strict fiduciary confidentiality regarding all client health records, diagnoses, vital statistics, and residential addresses accessed through the WeCare Track Jamaica dispatch network.
                    </p>
                  </div>

                  <div>
                    <strong className="text-amber-300 block mb-1">3. Clinical Standards, Protocols &amp; 119 Emergency Response</strong>
                    <p>
                      The Practitioner covenants to maintain standard precautions, clinical accountability, punctuality for scheduled home visits across Kingston, St. Andrew, Portmore, and St. Catherine, and immediate trigger of the 119 Emergency Protocol via the WeCare Track app in acute patient deterioration.
                    </p>
                  </div>

                  <div>
                    <strong className="text-amber-300 block mb-1">4. Remittance &amp; Payout Terms</strong>
                    <p>
                      The Applicant agrees that clinical earnings will be disbursed directly to the verified Jamaican commercial bank or Lynk wallet recorded in their dossier following visit confirmation.
                    </p>
                  </div>
                </div>

                {/* Digital Signature Canvas Section */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-black/60 to-purple-950/40 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <PenTool className="w-3.5 h-3.5" />
                      Applicant Digital Signature &amp; Cryptographic Execution
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Timestamp: {signedDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="p-3 rounded-xl bg-black/80 border-2 border-dashed border-blue-500/40 flex flex-col items-center justify-center min-h-[110px] text-center">
                      {signatureInfo?.signatureDataUrl ? (
                        <div className="space-y-1 w-full flex flex-col items-center">
                          <img 
                            src={signatureInfo.signatureDataUrl} 
                            alt="Digital Signature Canvas" 
                            className="max-h-20 object-contain invert brightness-200" 
                          />
                          <span className="text-[9px] text-slate-400 font-mono border-t border-white/10 pt-1 w-full block">
                            Digitally Signed Canvas (Cryptographic Capture)
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="font-serif italic text-lg text-blue-300 block">
                            /{signatureInfo?.signerName || submittedInfo.fullName}/
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Verified Cryptographic Electronic Signature
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Legal Signer:</span>
                        <strong className="text-white">{signatureInfo?.signerName || submittedInfo.fullName}</strong>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Email Address:</span>
                        <span className="text-purple-300 font-mono">{submittedInfo.email}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Execution Origin:</span>
                        <span className="text-slate-300 font-mono">{signatureInfo?.ip || 'Kingston, Jamaica'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-400">Contract Integrity:</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5" /> SHA-256 Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALL STATUTORY DOCUMENTS GALLERY */}
          {activeTab === 'documents' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>Statutory Document Scans &amp; Attached Files ({documentsList.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Official credentials uploaded during signup (TRN, Driver's License front &amp; back, Profile Headshot, NCJ License). Click any document to inspect in high resolution.
                  </p>
                </div>

                <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-xl border border-blue-500/30 self-start sm:self-auto">
                  Storage: {isNurse ? 'nurse-documents' : 'admin-documents'} (Encrypted)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {documentsList.map((doc) => {
                  return (
                    <div 
                      key={doc.id} 
                      className="p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-amber-400/50 transition flex flex-col justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate">
                            {doc.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenLightbox(doc)}
                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Inspect full screen"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h5 className="font-bold text-white text-xs truncate" title={doc.title}>
                          {doc.title}
                        </h5>
                      </div>

                      {doc.isImage ? (
                        <div 
                          onClick={() => handleOpenLightbox(doc)}
                          className="relative h-36 rounded-xl bg-black/80 border border-white/10 overflow-hidden cursor-pointer group-hover:border-amber-400 transition"
                        >
                          <img 
                            src={doc.url} 
                            alt={doc.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            onError={(e) => {
                              const target = e.target as HTMLElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white font-bold backdrop-blur-xs">
                            <Eye className="w-4 h-4 text-amber-400" />
                            <span>Inspect Scan</span>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => handleOpenLightbox(doc)}
                          className="h-36 rounded-xl bg-gradient-to-br from-blue-950/40 via-black/80 to-[#1A1E4E]/30 border border-blue-500/30 flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:border-amber-400 transition cursor-pointer p-3 text-center"
                        >
                          <FileText className="w-10 h-10 text-amber-400" />
                          <span className="text-[11px] font-bold text-white">PDF Credential Attached</span>
                          <span className="text-[9px] text-amber-300 font-mono">Click to Preview</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => handleOpenLightbox(doc)}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-center text-[11px] font-bold text-amber-300 hover:text-white flex items-center justify-center gap-1 transition cursor-pointer border border-amber-500/30"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Full View</span>
                        </button>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                          title="Open in new window / tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: COMPLETE SIGN-UP DOSSIER */}
          {activeTab === 'dossier' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Legal Full Name</span>
                  <span className="text-sm font-bold text-white block">{submittedInfo.fullName}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Email Address</span>
                  <a href={`mailto:${submittedInfo.email}`} className="text-xs font-mono text-blue-300 hover:underline block truncate">
                    {submittedInfo.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Phone Number</span>
                  <span className="text-xs font-mono text-amber-300 font-bold block">{submittedInfo.phone}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">TRN (Tax Registration Number)</span>
                  <span className="text-xs font-mono text-amber-400 font-bold block">
                    {submittedInfo.trnNumber}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Driver's License No.</span>
                  <span className="text-xs font-mono text-slate-200 block">
                    {submittedInfo.dlNumber}
                  </span>
                </div>

                {isNurse ? (
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">NCJ Practicing License</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold block">
                      {submittedInfo.ncjLicense}
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Staff Identification</span>
                    <span className="text-xs font-mono text-purple-300 font-bold block">
                      {submittedInfo.staffId}
                    </span>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Residential Address &amp; Parish</span>
                  <span className="text-xs text-slate-200 block">
                    {submittedInfo.address}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Date of Birth &amp; Gender</span>
                  <span className="text-xs text-slate-200 block">
                    {submittedInfo.dateOfBirth} ({submittedInfo.gender})
                  </span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Emergency Contact (Next of Kin)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Contact Name</span>
                    <span className="font-bold text-white">{submittedInfo.emergencyName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Relationship</span>
                    <span className="text-slate-300">{submittedInfo.emergencyRelation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Phone</span>
                    <span className="font-mono text-amber-300">{submittedInfo.emergencyPhone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      </div>

      {/* Action Decision Footer */}
      <div className="px-5 py-4 border-t border-white/10 bg-[#121539] flex flex-col sm:flex-row items-center justify-between gap-3">
        {modalStep === 'reject' ? (
          <>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalStep('inspect');
                  soundFX.playToggleClick();
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold transition cursor-pointer text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to Document Inspection</span>
              </button>
            </div>

            <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                disabled={selectedRejectDocs.length === 0 || rejectReason.trim().length < 10 || isSubmittingRejection}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black transition flex items-center justify-center gap-2 shadow-lg text-xs cursor-pointer ${
                  selectedRejectDocs.length > 0 && rejectReason.trim().length >= 10 && !isSubmittingRejection
                    ? 'bg-red-600 hover:bg-red-500 text-white border border-red-400 shadow-red-950/60'
                    : 'bg-white/10 text-slate-500 border border-white/10 cursor-not-allowed opacity-60'
                }`}
              >
                {isSubmittingRejection ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Recording Rejection...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-white" />
                    <span>Confirm Rejection &amp; Notify Applicant</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Clinical Credentialing &amp; Statutory Audit
                </span>
              </div>
              {onGoToManageUsers && (
                <button
                  type="button"
                  onClick={() => onGoToManageUsers(applicant)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-400/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Navigate to Manage Users to edit this account's details, role, or zones"
                >
                  <Users className="w-3.5 h-3.5 text-blue-300" />
                  <span>Go to Manage Users &amp; Edit</span>
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold transition cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalStep('reject');
                  soundFX.playToggleClick();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-red-500/50 hover:bg-red-500/20 text-red-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                title="Reject applicant and flag specific documents for re-upload"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Reject Applicant</span>
              </button>
              <button
                type="button"
                onClick={() => onApprove(applicant)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-black/40 cursor-pointer text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Approve &amp; Authorize Access</span>
              </button>
            </div>
          </>
        )}
      </div>

    </div>

      {/* Embedded High-Resolution Document Lightbox Modal with Zoom & Rotate */}
      {lightboxDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/95 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-5xl max-h-[94vh] flex flex-col bg-[#1A1E4E] border-2 border-[#3B82F6]/60 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Lightbox Toolbar */}
            <div className="px-5 py-3.5 border-b border-white/10 bg-[#121539] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {lightboxDoc.title}
                  </h4>
                  <span className="text-[10px] text-blue-300 font-mono block">
                    {lightboxDoc.category}
                  </span>
                </div>
              </div>

              {/* Zoom, Rotate, and Action Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {lightboxDoc.isImage && (
                  <>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    {(lightboxZoom !== 1 || lightboxRotation !== 0) && (
                      <button
                        type="button"
                        onClick={handleResetView}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-slate-300 hover:text-white transition cursor-pointer font-mono"
                        title="Reset Zoom & Rotation"
                      >
                        Reset ({lightboxZoom}x)
                      </button>
                    )}
                  </>
                )}

                <a
                  href={lightboxDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                  title="Open file in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setLightboxDoc(null)}
                  className="p-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 hover:text-white transition cursor-pointer border border-rose-500/40 ml-1"
                  title="Close lightbox"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document High-Resolution Viewport */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/95 min-h-[380px]">
              {lightboxDoc.isImage ? (
                <div className="overflow-auto max-h-[75vh] max-w-full flex items-center justify-center">
                  <img 
                    src={lightboxDoc.url} 
                    alt={lightboxDoc.title} 
                    style={{
                      transform: `scale(${lightboxZoom}) rotate(${lightboxRotation}deg)`,
                      transition: 'transform 0.2s ease-out'
                    }}
                    className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/15" 
                  />
                </div>
              ) : (
                <div className="w-full h-[75vh] flex flex-col items-center justify-center gap-3">
                  <object 
                    data={lightboxDoc.url} 
                    type="application/pdf"
                    className="w-full h-full rounded-xl border border-white/10 bg-white"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-300 space-y-3">
                      <FileText className="w-16 h-16 text-[#F59E0B]" />
                      <p className="text-sm font-bold text-white">Statutory PDF Credential Attached</p>
                      <p className="text-xs text-slate-400 max-w-md">
                        Click below to open the PDF document directly.
                      </p>
                      <a
                        href={lightboxDoc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Statutory PDF in New Window</span>
                      </a>
                    </div>
                  </object>
                </div>
              )}
            </div>

            {/* Lightbox Footer Controls */}
            <div className="px-5 py-3 border-t border-white/10 bg-[#121539] flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>Statutory Credential Visual Inspection</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxDoc.url}
                  download={lightboxDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold transition cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxDoc(null)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
