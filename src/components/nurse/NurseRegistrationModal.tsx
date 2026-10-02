import React, { useState, useRef, useEffect } from 'react';
import { NurseProfile, LogoVariation, SignedContractAgreement, NurseCareLevel, NursingSchool } from '../../types';
import { KINGSTON_ZONES, PORTMORE_ZONES, SPANISH_TOWN_ZONES, ADMIN_PROFILE, INITIAL_NURSING_SCHOOLS } from '../../data/mockData';
import { soundFX } from '../../utils/soundEffects';
import { Logo } from '../common/Logo';
import { 
  UserPlus, 
  Upload, 
  Camera, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  FileText, 
  CreditCard, 
  DollarSign, 
  MapPin, 
  Stethoscope, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  X, 
  Check, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  FileCheck,
  Award,
  Fingerprint,
  PenTool,
  Eraser,
  Maximize2,
  ExternalLink,
  Printer,
  RotateCcw,
  HeartHandshake,
  Activity,
  CheckSquare,
  Layers,
  Scale,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { compressImageFile } from '../../utils/imageCompression';

export interface ProviderRoleOption {
  id: NurseCareLevel;
  title: string;
  shortLabel: string;
  badge: string;
  category: 'clinical_practitioner' | 'registered_nurse' | 'practical_nurse' | 'caregiver';
  qualificationTitle: string;
  defaultHourlyRateJMD: number;
  minRateJMD: number;
  maxRateJMD: number;
  description: string;
  licenseLabel: string;
  licensePlaceholder: string;
  licenseDocTitle: string;
  requiresNcjRegistration: boolean;
  canProvide: string[];
  cannotProvide: string[];
  recommendedSpecialties: string[];
  coreCompetencies: string[];
}

export const PROVIDER_ROLE_OPTIONS: ProviderRoleOption[] = [
  {
    id: 'nurse_practitioner',
    title: 'Advanced Practice Nurse Practitioner (APRN)',
    shortLabel: 'Nurse Practitioner',
    badge: 'MScN • Advanced Clinical Practice',
    category: 'clinical_practitioner',
    qualificationTitle: 'Advanced Practice Registered Nurse (APRN / MScN)',
    defaultHourlyRateJMD: 10500,
    minRateJMD: 7000,
    maxRateJMD: 18000,
    description: "Master's-prepared clinician qualified to provide independent clinical evaluations, chronic condition stabilization, palliative oncology consultations, and high-complexity home health care.",
    licenseLabel: 'Nursing Council of Jamaica (NCJ) APRN Registration No. *',
    licensePlaceholder: 'e.g. NCJ-APRN-2025-0482',
    licenseDocTitle: 'NCJ Advanced Practice Practicing Certificate',
    requiresNcjRegistration: true,
    canProvide: [
      'Comprehensive physical examinations & chronic disease stabilization (Hypertension, Diabetes, Cardiac)',
      'Advanced parenteral infusions, IV cannula placement & electrolyte fluid management',
      'Palliative & oncology symptom relief consultations, comfort titration & pain management',
      'Clinical care plan formulation for family and attending primary physicians',
      'Diagnostic lab review, blood glucose profiles & vital sign risk trend analyses',
      'Complex surgical wound debridement, vacuum dressings & surgical drain management'
    ],
    cannotProvide: [
      'Major surgical operations outside of an accredited hospital or surgical theater'
    ],
    recommendedSpecialties: [
      'Clinical Care Consultation',
      'Diabetic Management & Glucose',
      'Palliative & Comfort Care',
      'Post-Op Recovery',
      'IV Therapy & Infusions'
    ],
    coreCompetencies: [
      'Systemic Physical Assessment',
      'Chronic Disease Stabilization',
      'Advanced IV Cannulation',
      'Palliative Oncology Care',
      'Diagnostic Lab Interpretation',
      'Care Plan Formulation'
    ]
  },
  {
    id: 'registered_nurse',
    title: 'Registered General Nurse (RN / BSN)',
    shortLabel: 'Registered Nurse',
    badge: 'BScN • NCJ Licensed General Nurse',
    category: 'registered_nurse',
    qualificationTitle: 'Registered General Nurse (RN, BScN)',
    defaultHourlyRateJMD: 7500,
    minRateJMD: 5000,
    maxRateJMD: 14000,
    description: 'Licensed professional nurse authorized by NCJ to administer prescribed medications, sterile wound dressings, IV therapy, urinary catheterization, and acute post-surgical monitoring.',
    licenseLabel: 'Nursing Council of Jamaica (NCJ) RN License No. *',
    licensePlaceholder: 'e.g. NCJ-RN-2024-8192',
    licenseDocTitle: 'NCJ Annual Practicing Certificate (Nursing Council of Jamaica)',
    requiresNcjRegistration: true,
    canProvide: [
      'Intravenous (IV) cannulation, fluid infusions & injectable antibiotic therapies',
      'Sterile wound dressing changes, surgical debridement & suture/staple removal',
      'Urinary (Foley) catheter insertion, replacement & bladder washouts',
      'Subcutaneous & intramuscular injections (Insulin, Heparin, Analgesics)',
      'Enteral nutrition support (NG tube placement & PEG feed management)',
      'Tracheostomy care, airway suctioning & respiratory support'
    ],
    cannotProvide: [
      'Prescribing controlled Class A pharmaceuticals without physician order'
    ],
    recommendedSpecialties: [
      'Wound Care',
      'IV Therapy & Infusions',
      'Catheter & Stoma Care',
      'Elderly Care & Vitals',
      'Post-Op Recovery'
    ],
    coreCompetencies: [
      'Sterile Surgical Dressing',
      'IV Cannula & Infusions',
      'Foley Catheter Placement',
      'IM/SubQ Injections',
      'Post-Op Drain Care',
      'Vital Signs Trend Analysis'
    ]
  },
  {
    id: 'practical_nurse_aide',
    title: 'Licensed Practical Nurse (LPN) / Clinical Aide',
    shortLabel: 'Practical Nurse',
    badge: 'Practical Nursing Diploma • Bedside Care',
    category: 'practical_nurse',
    qualificationTitle: 'Licensed Practical Nurse / Certified Nursing Aide',
    defaultHourlyRateJMD: 5500,
    minRateJMD: 3500,
    maxRateJMD: 9000,
    description: 'Certified clinical healthcare provider delivering bedside patient care, routine vital signs documentation, blood glucose testing, simple wound dressings, and supervised medication administration.',
    licenseLabel: 'Practical Nurse Certificate / Registration No. *',
    licensePlaceholder: 'e.g. NCJ-LPN-2023-4109 or Practical Certificate #',
    licenseDocTitle: 'Practical Nursing Diploma / Vocational Certification',
    requiresNcjRegistration: false,
    canProvide: [
      'Point-of-care blood glucose monitoring & log documentation',
      'Blood pressure, pulse, SpO2 & temperature trend documentation',
      'Clean, non-sterile wound bandaging & simple dressing changes',
      'Supervised oral medication prompt & administration logging',
      'Assisted patient transfers & safe mobility exercise routines',
      'Nebulizer mask setup & breathing therapy support'
    ],
    cannotProvide: [
      'Invasive intravenous (IV) cannulation or push injections',
      'Deep surgical wound debridement or surgical drain removals'
    ],
    recommendedSpecialties: [
      'Elderly Care & Vitals',
      'Diabetic Management & Glucose',
      'Post-Op Recovery',
      'Palliative & Comfort Care'
    ],
    coreCompetencies: [
      'Vital Signs & Glucose Check',
      'Non-Sterile Bandaging',
      'Oral Medication Supervised',
      'Nebulizer Administration',
      'Bedside Patient Care',
      'Colostomy Pouch Emptying'
    ]
  },
  {
    id: 'geriatric_caregiver',
    title: 'Certified Geriatric Caregiver & Companion',
    shortLabel: 'Geriatric Caregiver',
    badge: 'HEART/NTA Certified • Elder Home Care & ADLs',
    category: 'caregiver',
    qualificationTitle: 'HEART/NTA Certified Geriatric Care Assistant',
    defaultHourlyRateJMD: 4500,
    minRateJMD: 2500,
    maxRateJMD: 7500,
    description: 'Trained professional caregiver specialized in Activities of Daily Living (ADLs), assisted bathing, meal preparation, medication prompting, fall prevention, and cognitive companionship.',
    licenseLabel: 'HEART/NTA Certificate No. or Caregiver ID No. *',
    licensePlaceholder: 'e.g. HEART-GER-2024-5921 or Caregiver ID #',
    licenseDocTitle: 'HEART/NTA Geriatric Care Certificate / Caregiver ID',
    requiresNcjRegistration: false,
    canProvide: [
      'Assisted shower, bed bath, oral hygiene & skin moisturizing',
      'Safe transfer assistance (bed to wheelchair/commode) & fall prevention',
      'Meal preparation, dietary assistance & assisted feeding',
      'Medication schedule prompting & hydration tracking',
      'Repositioning & gentle turn schedule (pressure sore prevention)',
      'Cognitive companionship, reading, conversation & mental stimulation',
      'Non-invasive routine vitals check (BP, pulse, oxygen)'
    ],
    cannotProvide: [
      'Intravenous (IV) cannulation or fluid infusions',
      'Insertion or manipulation of urethral catheters',
      'Deep surgical debridement or surgical staple removal',
      'Injecting prescription pharmaceuticals'
    ],
    recommendedSpecialties: [
      'Elderly Care & Vitals',
      'Palliative & Comfort Care',
      'Diabetic Management & Glucose'
    ],
    coreCompetencies: [
      'Assisted Bathing & ADLs',
      'Safe Transfers & Fall Prevention',
      'Elder Nutrition & Feeding',
      'Medication Prompting',
      'Bedbound Turn & Positioning',
      'Dementia Companionship'
    ]
  }
];

interface NurseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterNurse: (newNurse: NurseProfile) => void;
  onSwitchToAdminReview?: () => void;
  logoVariation?: LogoVariation;
  nursingSchools?: NursingSchool[];
  onAddNewSchoolPendingApproval?: (school: NursingSchool) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Clinical Portrait 1',
    url: 'https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Clinical Portrait 2',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Clinical Portrait 3',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Clinical Portrait 4',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
  }
];

const SAMPLE_CERTIFICATE_DOC = 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800';
const SAMPLE_GOV_ID_DOC = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800';
const SAMPLE_POA_DOC = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800';
const SAMPLE_TRN_DOC = 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800';
const SAMPLE_BANK_DOC = 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800';

export const NurseRegistrationModal: React.FC<NurseRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterNurse,
  onSwitchToAdminReview,
  logoVariation = 'heart-cross',
  nursingSchools = INITIAL_NURSING_SCHOOLS,
  onAddNewSchoolPendingApproval
}) => {
  // Wizard steps (1 to 5)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredNurseId, setRegisteredNurseId] = useState<string>('');

  // Active Approved Schools from Learning Database
  const approvedSchools = nursingSchools.filter(s => s.status === 'approved');

  // Form Fields - Step 1: Personal, Photo & Confidential Bio Data (DOB, Emergency Contact, etc.)
  const [name, setName] = useState('');
  const [institutionAttended, setInstitutionAttended] = useState(() => approvedSchools[0]?.name || 'The UWI School of Nursing Mona (UWISON)');
  const [isCustomSchool, setIsCustomSchool] = useState(false);
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [customSchoolParish, setCustomSchoolParish] = useState('St. Andrew');
  const [dateOfBirth, setDateOfBirth] = useState('1993-06-14');
  const [gender, setGender] = useState<'female' | 'male' | 'other' | 'prefer_not_to_say'>('female');
  const [nationality, setNationality] = useState('Jamaican');
  const [placeOfBirth, setPlaceOfBirth] = useState('Kingston, Jamaica');
  const [address, setAddress] = useState('14 Hope Road, Liguanea, Kingston 6, St Andrew');
  const [residentialParish, setResidentialParish] = useState('St. Andrew');
  const [phone, setPhone] = useState('+1 (876) ');
  const [email, setEmail] = useState('');
  const [yearsExperience, setYearsExperience] = useState<number>(5);
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_PHOTO_PRESETS[0].url);
  const [photoFileName, setPhotoFileName] = useState<string>('');

  // Confidential Next of Kin / Emergency Contact (Admin & Own Profile Only)
  const [emergencyContactName, setEmergencyContactName] = useState('Michael Palmer');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+1 (876) 555-4912');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Spouse / Next of Kin');

  // Form Fields - Step 2: Confidential License & Attached Compliance Documents (ADMIN ONLY)
  const [nursingCouncilLicense, setNursingCouncilLicense] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('2027-12-31');
  const [licenseDocumentUrl, setLicenseDocumentUrl] = useState<string>(SAMPLE_CERTIFICATE_DOC);
  const [licenseDocFileName, setLicenseDocFileName] = useState<string>('NCJ_Practicing_Certificate_2026.pdf');
  const [diplomaDocumentUrl, setDiplomaDocumentUrl] = useState<string>(SAMPLE_CERTIFICATE_DOC);
  const [diplomaDocFileName, setDiplomaDocFileName] = useState<string>('UWI_BScN_Degree_Diploma_Honours.pdf');
  const [trnNumber, setTrnNumber] = useState('184-902-311');
  const [governmentIdType, setGovernmentIdType] = useState('Jamaican Passport');
  const [governmentIdUrl, setGovernmentIdUrl] = useState<string>(SAMPLE_GOV_ID_DOC);
  const [govIdFileName, setGovIdFileName] = useState<string>('Passport_Bio_Page.jpg');
  const [proofOfAddressUrl, setProofOfAddressUrl] = useState<string>(SAMPLE_POA_DOC);
  const [poaFileName, setPoaFileName] = useState<string>('JPS_Utility_Bill_Address.pdf');
  const [trnCertUrl, setTrnCertUrl] = useState<string>(SAMPLE_TRN_DOC);
  const [trnFileName, setTrnFileName] = useState<string>('TAJ_TRN_Registration_Card.pdf');
  const [bankLetterUrl, setBankLetterUrl] = useState<string>(SAMPLE_BANK_DOC);
  const [bankLetterFileName, setBankLetterFileName] = useState<string>('NCB_Bank_Account_Letter.pdf');

  // Form Fields - Step 3: Clinical Specialties & Zones
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'Wound Care',
    'Elderly Care & Vitals',
    'IV Therapy & Infusions'
  ]);
  const [selectedZones, setSelectedZones] = useState<string[]>([
    'New Kingston',
    'Barbican & Cherry Gardens',
    'Portmore - Greater Portmore',
    'Spanish Town - Town Centre & Cathedral'
  ]);
  const [hourlyRateJMD, setHourlyRateJMD] = useState<number>(7500);

  // Form Fields - Provider Role Selection & Scope of Practice (Nurses, Practitioners & Caregivers)
  const [providerRole, setProviderRole] = useState<NurseCareLevel>('registered_nurse');
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([
    'Sterile Surgical Dressing',
    'IV Cannula & Infusions',
    'Foley Catheter Placement',
    'IM/SubQ Injections',
    'Post-Op Drain Care',
    'Vital Signs Trend Analysis'
  ]);

  const currentRoleConfig = PROVIDER_ROLE_OPTIONS.find(r => r.id === providerRole) || PROVIDER_ROLE_OPTIONS[1];

  const handleSelectRole = (newRole: NurseCareLevel) => {
    setProviderRole(newRole);
    const cfg = PROVIDER_ROLE_OPTIONS.find(r => r.id === newRole);
    if (cfg) {
      setHourlyRateJMD(cfg.defaultHourlyRateJMD);
      setSelectedCompetencies(cfg.coreCompetencies);
      setSelectedSpecialties(prev => Array.from(new Set([...prev, ...cfg.recommendedSpecialties])));
      soundFX.playFilterSelect();
    }
  };

  const handleToggleCompetency = (comp: string) => {
    setSelectedCompetencies(prev =>
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    );
  };

  // Form Fields - Step 4: Jamaican Banking / Lynk Payouts
  const [bankName, setBankName] = useState('National Commercial Bank (NCB) Jamaica');
  const [accountNumber, setAccountNumber] = useState('•••• •••• 9102');
  const [accountType, setAccountType] = useState('Savings');
  const [lynkWallet, setLynkWallet] = useState('');

  // Form Fields - Step 5: Independent Contractor Agreement (Review & e-Sign)
  const [digitalSignature, setDigitalSignature] = useState('');
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [drawnSignatureDataUrl, setDrawnSignatureDataUrl] = useState<string>('');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [agreedToContractTerms, setAgreedToContractTerms] = useState(false);
  const [agreedToIndependentStatus, setAgreedToIndependentStatus] = useState(false);
  const [showFullAgreementModal, setShowFullAgreementModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const licenseFileInputRef = useRef<HTMLInputElement>(null);
  const diplomaFileInputRef = useRef<HTMLInputElement>(null);
  const govIdFileInputRef = useRef<HTMLInputElement>(null);
  const poaFileInputRef = useRef<HTMLInputElement>(null);
  const trnFileInputRef = useRef<HTMLInputElement>(null);
  const bankLetterFileInputRef = useRef<HTMLInputElement>(null);

  // Setup canvas resolution & baseline
  useEffect(() => {
    if (currentStep === 5 && signatureMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (!hasDrawnSignature && !drawnSignatureDataUrl) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else if (drawnSignatureDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = drawnSignatureDataUrl;
        }
      }
    }
  }, [currentStep, signatureMode]);

  // Canvas Drawing Handlers
  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#c084fc'; // Vibrant purple/indigo ink on dark canvas
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }
    const dataUrl = canvas.toDataURL('image/png');
    setDrawnSignatureDataUrl(dataUrl);
    if (!digitalSignature && name) {
      setDigitalSignature(name);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
    setDrawnSignatureDataUrl('');
  };

  const drawSampleSignatureCurve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#c084fc';

    // Draw stylized cursive initials and signature stroke
    ctx.beginPath();
    ctx.moveTo(40, 95);
    ctx.bezierCurveTo(60, 45, 85, 40, 110, 80);
    ctx.bezierCurveTo(125, 105, 140, 115, 160, 75);
    ctx.bezierCurveTo(175, 45, 195, 60, 220, 85);
    ctx.bezierCurveTo(245, 110, 280, 70, 310, 80);
    ctx.bezierCurveTo(340, 90, 370, 65, 420, 85);
    ctx.moveTo(90, 85);
    ctx.lineTo(440, 85);
    ctx.stroke();

    setHasDrawnSignature(true);
    const dataUrl = canvas.toDataURL('image/png');
    setDrawnSignatureDataUrl(dataUrl);
  };

  if (!isOpen) return null;

  // Handle Photo File Upload with automatic compression (prevents crashing on high-res camera shots)
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      try {
        const compressed = await compressImageFile(file, 800, 0.82);
        setPhotoUrl(compressed);
        soundFX.playSuccessPing();
      } catch (err) {
        console.warn('Image compression fallback', err);
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setPhotoUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle License Certificate File Upload
  const handleLicenseFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLicenseDocFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLicenseDocumentUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Diploma / Degree Certificate File Upload
  const handleDiplomaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDiplomaDocFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setDiplomaDocumentUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Government ID File Upload
  const handleGovIdFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGovIdFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setGovernmentIdUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Proof of Address File Upload
  const handlePoaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPoaFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProofOfAddressUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle TRN Certificate File Upload
  const handleTrnFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrnFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setTrnCertUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Bank Letter File Upload
  const handleBankLetterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBankLetterFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBankLetterUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Fast Auto-Fill for Testing
  const handleAutoFillSample = (targetRole: NurseCareLevel = providerRole) => {
    setProviderRole(targetRole);
    const cfg = PROVIDER_ROLE_OPTIONS.find(r => r.id === targetRole) || PROVIDER_ROLE_OPTIONS[1];
    setHourlyRateJMD(cfg.defaultHourlyRateJMD);
    setSelectedCompetencies(cfg.coreCompetencies);
    setSelectedSpecialties(cfg.recommendedSpecialties);

    if (targetRole === 'geriatric_caregiver') {
      setName('Caregiver Merlene Brown, Certified Aide');
      setInstitutionAttended('HEART/NTA Stony Hill Vocational Training Academy');
      setDateOfBirth('1988-11-20');
      setGender('female');
      setNationality('Jamaican');
      setPlaceOfBirth('Mandeville, Manchester, Jamaica');
      setAddress('34 Old Hope Road, Kingston 5, St. Andrew, Jamaica');
      setResidentialParish('St. Andrew');
      setEmergencyContactName('David Brown');
      setEmergencyContactPhone('+1 (876) 555-8120');
      setEmergencyContactRelation('Brother / Next of Kin');
      setPhone('+1 (876) 555-3921');
      setEmail('merlene.brown@wecare.jm');
      setYearsExperience(6);
      setBio('Dedicated Certified Geriatric Home Caregiver with 6 years experience in senior assisted daily living (ADLs), gentle mobility routines, medication prompting, and cognitive companionship.');
      setPhotoUrl(SAMPLE_PHOTO_PRESETS[3].url);
      setPhotoFileName('Merlene_Brown_Caregiver.jpg');
      setNursingCouncilLicense('HEART-GER-2024-5921');
      setLicenseExpiryDate('2028-06-30');
      setLicenseDocFileName('HEART_NTA_Geriatric_Certificate.pdf');
      setDiplomaDocFileName('Caregiving_Practical_Diploma.pdf');
    } else if (targetRole === 'nurse_practitioner') {
      setName('Dr. Andrew Grant, APRN, MScN');
      setInstitutionAttended('The UWI Faculty of Medical Sciences & UWISON');
      setDateOfBirth('1984-04-18');
      setGender('male');
      setNationality('Jamaican');
      setPlaceOfBirth('St. Andrew, Jamaica');
      setAddress('22 Millsborough Crescent, Kingston 6, Jamaica');
      setResidentialParish('St. Andrew');
      setEmergencyContactName('Dr. Camille Grant');
      setEmergencyContactPhone('+1 (876) 555-7731');
      setEmergencyContactRelation('Spouse / Next of Kin');
      setPhone('+1 (876) 555-9082');
      setEmail('andrew.grant@wecare.jm');
      setYearsExperience(12);
      setBio('Advanced Practice Registered Nurse (APRN) specializing in geriatric chronic disease stabilization, palliative symptom relief, oncology comfort care, and complex home treatments.');
      setPhotoUrl(SAMPLE_PHOTO_PRESETS[2].url);
      setPhotoFileName('Andrew_Grant_APRN.jpg');
      setNursingCouncilLicense('NCJ-APRN-2025-0482');
      setLicenseExpiryDate('2027-12-31');
      setLicenseDocFileName('NCJ_APRN_Certificate_2026.pdf');
      setDiplomaDocFileName('UWI_MScN_Advanced_Practice_Degree.pdf');
    } else {
      setName('Nurse Danielle Palmer, RN, BSN');
      setInstitutionAttended('The UWI School of Nursing, Mona (UWISON)');
      setDateOfBirth('1993-06-14');
      setGender('female');
      setNationality('Jamaican');
      setPlaceOfBirth('Kingston, Jamaica');
      setAddress('14 Hope Road, Liguanea, Kingston 6, St Andrew, Jamaica');
      setResidentialParish('St. Andrew');
      setEmergencyContactName('Michael Palmer');
      setEmergencyContactPhone('+1 (876) 555-4912');
      setEmergencyContactRelation('Spouse / Next of Kin');
      setPhone('+1 (876) 555-6821');
      setEmail('danielle.palmer@wecare.jm');
      setYearsExperience(7);
      setBio('Registered General Nurse with 7 years acute hospital and home clinical experience across Kingston and St. Catherine. Specializing in sterile surgical wound care, senior hypertension monitoring, and IV therapy.');
      setPhotoUrl(SAMPLE_PHOTO_PRESETS[1].url);
      setPhotoFileName('Danielle_Palmer_Headshot.jpg');
      setNursingCouncilLicense('NCJ-RN-2024-8192');
      setLicenseExpiryDate('2027-12-31');
      setLicenseDocFileName('NCJ_Annual_Certificate_2026.pdf');
      setDiplomaDocFileName('UWI_BScN_Degree_Diploma_Honours.pdf');
    }

    setLicenseDocumentUrl(SAMPLE_CERTIFICATE_DOC);
    setDiplomaDocumentUrl(SAMPLE_CERTIFICATE_DOC);
    setTrnNumber('192-883-401');
    setGovernmentIdType('Jamaican Passport');
    setGovernmentIdUrl(SAMPLE_GOV_ID_DOC);
    setGovIdFileName('Jamaican_Passport_Bio_Page.jpg');
    setProofOfAddressUrl(SAMPLE_POA_DOC);
    setPoaFileName('JPS_Utility_Bill_Liguanea.pdf');
    setTrnCertUrl(SAMPLE_TRN_DOC);
    setTrnFileName('TAJ_TRN_Registration_Card.pdf');
    setBankLetterUrl(SAMPLE_BANK_DOC);
    setBankLetterFileName('NCB_Bank_Account_Verification.pdf');
    setSelectedZones(['New Kingston', 'Liguanea & Mona', 'Portmore - Greater Portmore', 'Spanish Town - Town Centre & Cathedral']);
    setBankName('National Commercial Bank (NCB) Jamaica');
    setAccountNumber('•••• •••• 9841');
    setAccountType('Savings');
    setLynkWallet('lynk.me/wecare_provider');
    setDigitalSignature(targetRole === 'geriatric_caregiver' ? 'Merlene Brown' : targetRole === 'nurse_practitioner' ? 'Andrew Grant' : 'Danielle Palmer');
    setAgreedToContractTerms(true);
    setAgreedToIndependentStatus(true);
    setTimeout(() => {
      drawSampleSignatureCurve();
    }, 150);
  };

  const handleToggleSpecialty = (spec: string) => {
    setSelectedSpecialties(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleToggleZone = (zone: string) => {
    setSelectedZones(prev => 
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nursingCouncilLicense) return;

    const newNurseId = `nurse-${Date.now()}`;
    const formattedSignDate = new Date().toISOString().split('T')[0];

    const signedContractRecord: SignedContractAgreement = {
      id: `AGR-WCJ-${Date.now()}`,
      contractNumber: `WCJ-CONT-2026-${Date.now().toString().slice(-6)}`,
      agreementDate: formattedSignDate,
      effectiveDate: formattedSignDate,
      companyName: 'We Care Limited',
      companyNumber: '2026-WECARE-JA',
      companyAddress: '4 Claudete Drive, St. Catherine, Jamaica',
      companyRepName: ADMIN_PROFILE.name,
      companyRepTitle: ADMIN_PROFILE.title,
      companySignature: 'Sydney Mattis (Operations Director)',
      companySignedAt: new Date().toISOString(),
      nurseLegalName: name,
      nurseAddress: address || 'Kingston & St Andrew, Jamaica',
      nursingCouncilLicense,
      trnNumber: trnNumber || '184-902-311',
      bankName,
      bankAccountNumber: accountNumber,
      bankAccountType: accountType,
      nurseSignature: digitalSignature || name,
      nurseSignatureImage: drawnSignatureDataUrl || undefined,
      nurseSignedAt: new Date().toISOString(),
      ipAddressAudit: '190.213.82.14 (Flow Jamaica Gateway)',
      status: 'pending_admin_countersign',
      version: 'v2026.1-EN-PROFESSIONAL',
      attachedDocuments: {
        governmentId: {
          id: `doc-gov-${Date.now()}`,
          name: governmentIdType || 'Government Photo ID',
          type: 'government_id',
          fileUrl: governmentIdUrl,
          fileName: govIdFileName,
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'verified'
        },
        nursingCouncilLicense: {
          id: `doc-ncj-${Date.now()}`,
          name: 'Nursing Council of Jamaica Practicing Certificate',
          type: 'nursing_council_license',
          fileUrl: licenseDocumentUrl,
          fileName: licenseDocFileName,
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'verified'
        },
        diplomaCertificate: {
          id: `doc-dip-${Date.now()}`,
          name: 'Nursing / Caregiver Diploma or Degree Certificate',
          type: 'diploma_certificate',
          fileUrl: diplomaDocumentUrl,
          fileName: diplomaDocFileName,
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'verified'
        },
        proofOfAddress: {
          id: `doc-poa-${Date.now()}`,
          name: 'Proof of Address (Utility Bill)',
          type: 'proof_of_address',
          fileUrl: proofOfAddressUrl,
          fileName: poaFileName,
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'verified'
        },
        trnCertificate: {
          id: `doc-trn-${Date.now()}`,
          name: 'TRN Registration Certificate',
          type: 'trn_certificate',
          fileUrl: trnCertUrl,
          fileName: trnFileName,
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'verified'
        },
        bankAccountLetter: {
          id: `doc-bnk-${Date.now()}`,
          name: 'Bank Account Confirmation Letter',
          type: 'bank_account_letter',
          fileUrl: bankLetterUrl,
          fileName: bankLetterFileName,
          uploadedAt: new Date().toISOString(),
          verificationStatus: 'verified'
        }
      }
    };

    const resolvedInstitution = isCustomSchool && customSchoolName.trim()
      ? customSchoolName.trim()
      : (institutionAttended || 'Northern Caribbean University (NCU)');

    if (isCustomSchool && customSchoolName.trim() && onAddNewSchoolPendingApproval) {
      onAddNewSchoolPendingApproval({
        id: `sch-${Date.now()}`,
        name: customSchoolName.trim(),
        category: 'college',
        parish: customSchoolParish || 'St. Andrew',
        status: 'pending_approval',
        submittedByNurseName: name.trim(),
        submittedAt: new Date().toISOString(),
        notes: `Submitted by applicant practitioner ${name.trim()} during registration.`
      });
    }

    const newNurse: NurseProfile = {
      id: newNurseId,
      name,
      phone: phone || '+1 (876) 555-0100',
      email: email || `${String(name || 'nurse').toLowerCase().replace(/[^a-z]/g, '')}@wecare.jm`,
      photoUrl: photoUrl || SAMPLE_PHOTO_PRESETS[0].url,
      institutionAttended: resolvedInstitution,
      diplomaDocumentUrl,
      diplomaFileName: diplomaDocFileName,
      nursingCouncilLicense,
      licenseVerified: false, // Sent to Admin for NCJ Verification
      licenseExpiryDate,
      licenseDocumentUrl,
      trnNumber,
      governmentIdType,
      governmentIdUrl,
      proofOfAddressUrl,
      trnCertificateUrl: trnCertUrl,
      bankLetterUrl,
      signedContract: signedContractRecord, // Securely attached under nurse profile for Admin eyes only
      // Confidential Bio Data - Private to Owner and Admins
      dateOfBirth,
      gender,
      residentialAddress: address,
      emergencyContact: {
        name: emergencyContactName,
        phone: emergencyContactPhone,
        relation: emergencyContactRelation
      },
      bioData: {
        dateOfBirth,
        gender,
        nationality,
        placeOfBirth,
        residentialAddress: address,
        residentialParish: residentialParish || 'St. Andrew',
        institutionAttended: resolvedInstitution,
        emergencyContact: {
          name: emergencyContactName,
          phone: emergencyContactPhone,
          relation: emergencyContactRelation
        },
        nationalIdNumber: trnNumber,
        confidentialPrivacyNotice: 'Bio data is strictly confidential. Only visible to the registered practitioner and We Care Master Administrators.'
      },
      status: 'pending_approval',
      careLevel: providerRole,
      qualificationTitle: currentRoleConfig.qualificationTitle,
      requiresNcjRegistration: currentRoleConfig.requiresNcjRegistration,
      scopeOfCare: {
        canProvide: currentRoleConfig.canProvide,
        cannotProvide: currentRoleConfig.cannotProvide
      },
      certifications: selectedCompetencies,
      rating: 5.0,
      reviewCount: 0,
      yearsExperience,
      specialties: selectedSpecialties.length > 0 ? selectedSpecialties : ['General Clinical Care', 'Vitals'],
      zones: selectedZones.length > 0 ? selectedZones : ['New Kingston', 'Portmore - Greater Portmore'],
      hourlyRateJMD,
      currentLat: 18.0179,
      currentLng: -76.7845,
      bio: bio || 'Licensed Registered Nurse serving patients across Kingston, St. Andrew, Portmore, and Spanish Town.',
      bankDetails: {
        bankName,
        accountNumber,
        accountType,
        lynkWallet: lynkWallet || undefined
      },
      totalEarningsJMD: 0,
      pendingPayoutJMD: 0,
      completedVisitsCount: 0
    };

    onRegisterNurse(newNurse);
    setRegisteredNurseId(newNurseId);
    soundFX.playBookingConfirmed();

    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#10B981', '#F59E0B', '#C77DFF']
    });

    setIsSuccess(true);
  };

  const allAvailableSpecialties = [
    'Wound Care',
    'Post-Op Recovery',
    'Elderly Care & Vitals',
    'IV Therapy & Infusions',
    'Catheter & Stoma Care',
    'Postnatal & Newborn Midwifery',
    'Palliative & Comfort Care',
    'Diabetic Management & Glucose',
    'Emergency & Phlebotomy'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0212]/90 backdrop-blur-2xl animate-fadeIn overflow-y-auto">
      <div className="bg-[#120520] border border-purple-500/30 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/60 to-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-200">
              <UserPlus className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Licensed Jamaican Nurse Registration
                </span>
                <span className="text-slate-400 text-xs font-mono">Step {currentStep} of 5</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Join the We Care Independent Clinical Team
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Indicator */}
        {!isSuccess && (
          <div className="px-6 pt-4 pb-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl font-bold transition whitespace-nowrap ${
                currentStep === 1 
                  ? 'bg-purple-600/40 text-white border border-purple-400/40 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">1</span>
              <span>1. Profile &amp; Photo</span>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl font-bold transition whitespace-nowrap ${
                currentStep === 2 
                  ? 'bg-purple-600/40 text-white border border-purple-400/40 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">2</span>
              <span>2. Confidential Docs (Admin Only)</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl font-bold transition whitespace-nowrap ${
                currentStep === 3 
                  ? 'bg-purple-600/40 text-white border border-purple-400/40 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">3</span>
              <span>3. Specialties &amp; Zones</span>
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl font-bold transition whitespace-nowrap ${
                currentStep === 4 
                  ? 'bg-purple-600/40 text-white border border-purple-400/40 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">4</span>
              <span>4. Bank Payouts</span>
            </button>

            <button
              onClick={() => setCurrentStep(5)}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl font-bold transition whitespace-nowrap ${
                currentStep === 5 
                  ? 'bg-purple-600/40 text-white border border-purple-400/40 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">5</span>
              <span className="text-emerald-300 font-bold">5. Sign Agreement</span>
            </button>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {isSuccess ? (
            /* Success Completion Screen */
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Agreement Executed • In NCJ Verification Pipeline
                </span>
                <h3 className="text-2xl font-black text-white mt-3">
                  Welcome to We Care, {name}!
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                  Your <strong>Independent Nurse Contractor Agreement</strong> has been digitally executed and created as a secure legal file under your profile record. It has been transmitted along with your 5 compliance documents to Lead Administrator <strong>Sydney Mattis</strong> for confidential verification.
                </p>
              </div>

              {/* Privacy summary badge */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Admin-Only Confidentiality Vault</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Your signed contractor agreement, practicing certificate, TRN, and bank letter are strictly confidential and <strong>visible only to the Admin section</strong>. Public clients only see your verified clinical badges and ratings.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition border border-white/10"
                >
                  Return to Home
                </button>
                {onSwitchToAdminReview && (
                  <button
                    onClick={() => {
                      onClose();
                      onSwitchToAdminReview();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-emerald-600 hover:opacity-95 text-white text-xs font-black shadow-lg transition flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>View in Admin Section (Signed Contract File)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitRegistration} className="space-y-6">
              
              {/* Quick Auto-Fill Demo Helper with All Healthcare Roles */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#C77DFF] shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">Evaluating or Testing Onboarding?</span>
                    <span className="text-[11px] text-slate-300">Fast-fill realistic credentials for any Jamaican healthcare provider tier:</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAutoFillSample('registered_nurse')}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] font-bold transition border border-purple-400/40 flex items-center gap-1"
                    title="Populate Registered General Nurse (Danielle Palmer, RN)"
                  >
                    <span>RN Sample</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoFillSample('nurse_practitioner')}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-[11px] font-bold transition border border-indigo-400/40 flex items-center gap-1"
                    title="Populate Advanced Nurse Practitioner (Dr. Andrew Grant, APRN)"
                  >
                    <span>Practitioner (APRN)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoFillSample('geriatric_caregiver')}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-[11px] font-bold transition border border-emerald-400/40 flex items-center gap-1"
                    title="Populate Certified Geriatric Caregiver (Merlene Brown)"
                  >
                    <span>Caregiver Sample</span>
                  </button>
                </div>
              </div>

              {/* STEP 1: PERSONAL DETAILS & PHOTO UPLOAD */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-purple-400" />
                      <span>Step 1: Healthcare Role, Clinical Profile &amp; Photo</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Unified Nurse &amp; Caregiver Portal</span>
                  </div>

                  {/* Healthcare Role Classification Selector */}
                  <div className="space-y-3 p-4 rounded-3xl bg-gradient-to-r from-purple-950/40 via-black/40 to-slate-900/60 border border-purple-500/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div>
                        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#C77DFF]" />
                          <span>Select Your Clinical Role &amp; Level of Care *</span>
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          Nurses, practitioners, and home caregivers register through this synchronized portal.
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                        Jamaican Healthcare Standards
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {PROVIDER_ROLE_OPTIONS.map((role) => {
                        const isSelected = providerRole === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => handleSelectRole(role.id)}
                            className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between gap-2 ${
                              isSelected
                                ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-950/40 ring-1 ring-purple-400/80'
                                : 'bg-white/[0.02] border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-xs font-black block">{role.title}</span>
                                <span className="text-[10px] text-purple-300 font-semibold block mt-0.5">
                                  {role.badge}
                                </span>
                              </div>
                              {isSelected ? (
                                <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-white/20 shrink-0" />
                              )}
                            </div>

                            <p className="text-[11px] text-slate-300/90 line-clamp-2 leading-relaxed">
                              {role.description}
                            </p>

                            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/10 font-mono">
                              <span className="text-emerald-400 font-bold">Standard: JMD ${role.defaultHourlyRateJMD.toLocaleString()}/hr</span>
                              <span className="text-slate-400">85% Net Payout</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Photo Upload & Preview Section */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                    <label className="block text-xs font-bold text-white">
                      Professional Nurse Headshot / Profile Photo *
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Photo Circular Preview */}
                      <div className="relative group">
                        <img
                          src={photoUrl || SAMPLE_PHOTO_PRESETS[0].url}
                          alt="Nurse Preview"
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-purple-400 shadow-xl"
                        />
                        <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-500 text-white shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="file"
                            ref={photoFileInputRef}
                            onChange={handlePhotoFileUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => photoFileInputRef.current?.click()}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-purple-900/40"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Custom Photo (JPG/PNG)</span>
                          </button>
                        </div>

                        {photoFileName && (
                          <span className="text-[11px] text-emerald-300 block font-mono">
                            ✓ File Selected: {photoFileName}
                          </span>
                        )}

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] text-slate-400 block font-semibold">Or select a Jamaican nurse photo preset:</span>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setPhotoUrl(preset.url);
                                  setPhotoFileName(`Preset_${idx + 1}.jpg`);
                                }}
                                className={`p-1 rounded-xl border transition ${
                                  photoUrl === preset.url
                                    ? 'border-purple-400 bg-purple-500/20'
                                    : 'border-white/10 hover:border-white/30'
                                }`}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Legal Name &amp; Clinical Degrees *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Nurse Danielle Palmer, RN, BSN"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-medium"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Institution / Nursing School Attended *
                        </label>
                        <span className="text-[10px] text-purple-300 font-mono">
                          {approvedSchools.length} Accredited Schools
                        </span>
                      </div>

                      {/* Select from Approved Institutions or Type Custom */}
                      <select
                        value={isCustomSchool ? '__CUSTOM__' : institutionAttended}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomSchool(true);
                            setInstitutionAttended('');
                          } else {
                            setIsCustomSchool(false);
                            setInstitutionAttended(e.target.value);
                          }
                        }}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 font-medium cursor-pointer"
                      >
                        <optgroup label="Accredited Jamaican Universities & Colleges">
                          {approvedSchools.map((sch) => (
                            <option key={sch.id} value={sch.name} className="bg-[#170826]">
                              {sch.name} ({sch.parish})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="School Not In List?">
                          <option value="__CUSTOM__" className="bg-[#170826] font-bold text-amber-300">
                            Other (Write my school if not in the list)
                          </option>
                        </optgroup>
                      </select>

                      {/* If custom school selected, show text box and parish selector */}
                      {isCustomSchool && (
                        <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-purple-900/30 border-2 border-purple-400/50 space-y-3 animate-fadeIn shadow-lg">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span>Other: Write School Attended</span>
                          </div>
                          <p className="text-[11px] text-purple-200 leading-relaxed">
                            If your nursing school or training institution is not in the list above, write its name below. 
                            The app will learn this school and automatically add it to the accredited school directory once your registration is approved by the admin.
                          </p>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-200 mb-1">
                              Write School / Institution Attended *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Type your nursing school or training college name..."
                              value={customSchoolName}
                              onChange={(e) => setCustomSchoolName(e.target.value)}
                              className="w-full bg-black/60 border border-purple-400/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-300 mb-1">
                                Parish / Campus Location
                              </label>
                              <select
                                value={customSchoolParish}
                                onChange={(e) => setCustomSchoolParish(e.target.value)}
                                className="w-full bg-black/60 border border-purple-400/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-300"
                              >
                                <option value="Kingston" className="bg-[#170826]">Kingston</option>
                                <option value="St. Andrew" className="bg-[#170826]">St. Andrew</option>
                                <option value="St. Catherine" className="bg-[#170826]">St. Catherine</option>
                                <option value="Manchester" className="bg-[#170826]">Manchester</option>
                                <option value="St. Ann" className="bg-[#170826]">St. Ann</option>
                                <option value="St. James" className="bg-[#170826]">St. James</option>
                                <option value="Westmoreland" className="bg-[#170826]">Westmoreland</option>
                                <option value="Clarendon" className="bg-[#170826]">Clarendon</option>
                                <option value="Portland" className="bg-[#170826]">Portland</option>
                                <option value="St. Thomas" className="bg-[#170826]">St. Thomas</option>
                                <option value="St. Elizabeth" className="bg-[#170826]">St. Elizabeth</option>
                                <option value="Trelawny" className="bg-[#170826]">Trelawny</option>
                                <option value="Hanover" className="bg-[#170826]">Hanover</option>
                                <option value="St. Mary" className="bg-[#170826]">St. Mary</option>
                              </select>
                            </div>
                            <div className="flex items-center p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[10px] leading-snug">
                              <span>💡 Once approved by the administrator, this school will be permanently selectable for all future nurses.</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Jamaican Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (876) 555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-medium font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nurse@wecare.jm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Years of Professional Experience *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="45"
                        required
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* STRICTLY CONFIDENTIAL BIO DATA SECTION (PRIVATE TO LOGGED-IN NURSE & ADMIN) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-black/40 to-emerald-950/30 border border-purple-500/30 space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Confidential Bio Data &amp; Date of Birth
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Strictly Private
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Your Date of Birth, gender, home address, and emergency contact are protected under We Care privacy standards.
                        </p>
                      </div>
                    </div>

                    {/* Privacy Guarantee Notice Box */}
                    <div className="p-2.5 rounded-xl bg-purple-900/20 border border-purple-400/20 flex items-start gap-2.5 text-[11px] text-purple-200">
                      <ShieldCheck className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-semibold">Privacy Guarantee to Practitioners:</strong>
                        <span>This bio data will <u>never</u> be visible to clients, patients, or other nurses on public directory profiles. Only you (under your logged-in profile) and We Care verification administrators can access this information.</span>
                      </div>
                    </div>

                    {/* Bio Data Grid: DOB, Gender, Place of Birth */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-200">
                            Date of Birth (DOB) *
                          </label>
                          {dateOfBirth && (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              {(() => {
                                const b = new Date(dateOfBirth);
                                const diff = Date.now() - b.getTime();
                                const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                                return !isNaN(age) && age > 0 ? `${age} yrs` : '';
                              })()}
                            </span>
                          )}
                        </div>
                        <input
                          type="date"
                          required
                          max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Gender / Biological Sex *
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Place of Birth / Parish
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Kingston, Jamaica"
                          value={placeOfBirth}
                          onChange={(e) => setPlaceOfBirth(e.target.value)}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-medium"
                        />
                      </div>
                    </div>

                    {/* Residential Address & Parish */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Residential Physical Address * (Private to Admin &amp; Contract)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., 14 Hope Road, Liguanea, Kingston 6"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Parish *
                        </label>
                        <select
                          value={residentialParish}
                          onChange={(e) => setResidentialParish(e.target.value)}
                          className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                        >
                          <option value="St. Andrew">St. Andrew</option>
                          <option value="Kingston">Kingston</option>
                          <option value="St. Catherine">St. Catherine</option>
                          <option value="Clarendon">Clarendon</option>
                          <option value="Manchester">Manchester</option>
                          <option value="St. Ann">St. Ann</option>
                          <option value="St. James">St. James</option>
                          <option value="Other">Other Parish</option>
                        </select>
                      </div>
                    </div>

                    {/* Next of Kin / Emergency Contact */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 block">
                        Emergency Contact / Next of Kin (Private Record)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Contact Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Michael Palmer"
                            value={emergencyContactName}
                            onChange={(e) => setEmergencyContactName(e.target.value)}
                            className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Contact Phone</label>
                          <input
                            type="tel"
                            placeholder="+1 (876) 555-4912"
                            value={emergencyContactPhone}
                            onChange={(e) => setEmergencyContactPhone(e.target.value)}
                            className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Relationship</label>
                          <input
                            type="text"
                            placeholder="e.g. Spouse / Next of Kin"
                            value={emergencyContactRelation}
                            onChange={(e) => setEmergencyContactRelation(e.target.value)}
                            className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Professional Clinical Bio &amp; Care Philosophy
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe your nursing experience, hospital wards served (e.g. UHWI, KPH, Spanish Town Hospital), and approach to home patient comfort..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-medium"
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!name}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2"
                    >
                      <span>Next: Confidential Docs &amp; NCJ License</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CONFIDENTIAL LICENSE & 5 COMPLIANCE ATTACHMENTS (ADMIN ONLY) */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Step 2: Professional License / Certification &amp; Required Documents</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Strictly Admin Eyes Only
                    </span>
                  </div>

                  {/* Privacy Guarantee Callout Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/20 to-black/40 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>The 6 Compliance Documents Collected for Admin File</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      As required by Jamaican healthcare regulations and the Independent Contractor Agreement, We Care collects <strong>(1) {currentRoleConfig.shortLabel} License / Certificate</strong>, <strong>(2) Diploma / Vocational Certificate</strong>, <strong>(3) Government Photo ID</strong>, <strong>(4) Proof of Address</strong>, <strong>(5) TRN Certificate</strong>, and <strong>(6) Bank Account Letter</strong>. These files are encrypted and <strong>strictly visible only to the Admin section</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {currentRoleConfig.licenseLabel}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={currentRoleConfig.licensePlaceholder}
                        value={nursingCouncilLicense}
                        onChange={(e) => setNursingCouncilLicense(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Certificate / Practicing Expiry Renewal Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={licenseExpiryDate}
                        onChange={(e) => setLicenseExpiryDate(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  {/* 1. Upload NCJ License / Certificate */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-300" />
                        <span>1. Copy of {currentRoleConfig.licenseDocTitle} *</span>
                      </label>
                      <span className="text-[10px] text-emerald-300 font-bold">Admin Only</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="file" ref={licenseFileInputRef} onChange={handleLicenseFileUpload} className="hidden" />
                      <button
                        type="button"
                        onClick={() => licenseFileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-white text-xs font-bold border border-purple-400/40 transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-purple-300" /> Choose File
                      </button>
                      <span className="text-[11px] text-slate-300 truncate">{licenseDocFileName}</span>
                    </div>
                  </div>

                  {/* 2. Upload Diploma / Degree / Caregiver Certificate */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>2. Copy of Diploma or Degree Certificate (Upload Certificate Scan) *</span>
                      </label>
                      <span className="text-[10px] text-emerald-300 font-bold">Admin Only</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="file" ref={diplomaFileInputRef} onChange={handleDiplomaFileUpload} accept=".pdf,image/*" className="hidden" />
                      <button
                        type="button"
                        onClick={() => diplomaFileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-500/40 transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-300" /> Upload Diploma / Certificate
                      </button>
                      <span className="text-[11px] text-slate-300 truncate">{diplomaDocFileName || 'No file selected (e.g. UWI_Diploma.pdf)'}</span>
                    </div>
                  </div>

                  {/* 3. TRN & Government ID Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Tax Registration Number (TRN) * (Admin Only)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 184-902-311"
                        value={trnNumber}
                        onChange={(e) => setTrnNumber(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Government Identification Type
                      </label>
                      <select
                        value={governmentIdType}
                        onChange={(e) => setGovernmentIdType(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="Jamaican Passport" className="bg-[#150722] text-white">Jamaican Passport</option>
                        <option value="National Identification Card" className="bg-[#150722] text-white">National Identification Card (NID)</option>
                        <option value="Driver's License" className="bg-[#150722] text-white">Driver's License</option>
                      </select>
                    </div>
                  </div>

                  {/* 3. Upload Government ID Scan */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>3. Copy of Government Photo ID (Passport / Driver's License) *</span>
                      </label>
                      <span className="text-[10px] text-emerald-300 font-bold">Admin Only</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="file" ref={govIdFileInputRef} onChange={handleGovIdFileUpload} className="hidden" />
                      <button
                        type="button"
                        onClick={() => govIdFileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-400" /> Choose File
                      </button>
                      <span className="text-[11px] text-slate-300 truncate">{govIdFileName}</span>
                    </div>
                  </div>

                  {/* 4. Upload Proof of Address (Utility Bill) */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-purple-300" />
                        <span>4. Proof of Residential Address (JPS / NWC / Digicel / Flow Utility Bill) *</span>
                      </label>
                      <span className="text-[10px] text-emerald-300 font-bold">Admin Only</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="file" ref={poaFileInputRef} onChange={handlePoaFileUpload} accept=".pdf,image/*" className="hidden" />
                      <button
                        type="button"
                        onClick={() => poaFileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-purple-300" /> Choose Utility Bill File
                      </button>
                      <span className="text-[11px] text-slate-300 truncate">{poaFileName || 'No file selected (e.g. JPS_Bill.pdf)'}</span>
                    </div>
                  </div>

                  {/* 5 & 6. TRN Card & Bank Account Letter Uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* TRN Card Upload */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                          <span>5. TRN Registration Certificate Card *</span>
                        </label>
                        <span className="text-[10px] text-emerald-300 font-bold">Admin Only</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="file" ref={trnFileInputRef} onChange={handleTrnFileUpload} accept=".pdf,image/*" className="hidden" />
                        <button
                          type="button"
                          onClick={() => trnFileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-400" /> Upload TRN Card
                        </button>
                        <span className="text-[11px] text-slate-300 truncate">{trnFileName || 'TAJ_TRN_Card.pdf'}</span>
                      </div>
                    </div>

                    {/* Bank Account Confirmation Letter */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>6. Bank Confirmation Letter / Statement *</span>
                        </label>
                        <span className="text-[10px] text-emerald-300 font-bold">Admin Only</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="file" ref={bankLetterFileInputRef} onChange={handleBankLetterFileUpload} accept=".pdf,image/*" className="hidden" />
                        <button
                          type="button"
                          onClick={() => bankLetterFileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-purple-400" /> Upload Bank Letter
                        </button>
                        <span className="text-[11px] text-slate-300 truncate">{bankLetterFileName || 'Bank_Letter.pdf'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!nursingCouncilLicense}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2"
                    >
                      <span>Next: Clinical Specialties &amp; Zones</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: NURSE / PRACTITIONER / CAREGIVER ROLE, SCOPE OF CARE, SPECIALTIES & HOURLY RATE */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-purple-400" />
                      <span>Step 3: Healthcare Classification, Scope of Practice &amp; Hourly Rate</span>
                    </h3>
                    <span className="text-[11px] text-slate-400">Authorized Care &amp; Compensation</span>
                  </div>

                  {/* 1. Provider Role & Care Level Selector Bar */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>Confirm Provider Classification &amp; Level of Care:</span>
                      </label>
                      <span className="text-[11px] text-purple-300 font-mono font-bold">
                        {currentRoleConfig.badge}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PROVIDER_ROLE_OPTIONS.map((role) => {
                        const isSelected = providerRole === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => handleSelectRole(role.id)}
                            className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'bg-purple-600/35 text-white border-purple-400 shadow-md ring-1 ring-purple-400/80'
                                : 'bg-white/[0.02] text-slate-300 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black truncate">{role.shortLabel}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 shrink-0" />}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              JMD ${role.defaultHourlyRateJMD.toLocaleString()}/hr
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. What This Selected Nurse / Practitioner / Caregiver Can Do (Scope of Practice) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-black/40 to-slate-900/40 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>What a {currentRoleConfig.shortLabel} Can Do (Authorized Scope of Care)</span>
                      </h4>
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Authorized Protocols
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Based on Jamaican health regulations and We Care clinical standards, your approved clinical scope for home visits includes:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      {currentRoleConfig.canProvide.map((action, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white/[0.02] border border-emerald-500/20 flex items-start gap-2 text-xs text-slate-200"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{action}</span>
                        </div>
                      ))}
                    </div>

                    {/* Specific Procedure Endorsements Checklist */}
                    <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Clinical Competencies &amp; Procedures You Perform (Check to verify):</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedCompetencies.length} of {(currentRoleConfig?.coreCompetencies || []).length} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(currentRoleConfig?.coreCompetencies || []).map((comp) => {
                          const isChecked = selectedCompetencies.includes(comp);
                          return (
                            <button
                              key={comp}
                              type="button"
                              onClick={() => handleToggleCompetency(comp)}
                              className={`p-2 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                                isChecked
                                  ? 'bg-emerald-600/30 text-emerald-100 border-emerald-400/50 shadow-sm'
                                  : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20'
                              }`}
                            >
                              <span className="truncate">{comp}</span>
                              {isChecked ? (
                                <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded border border-white/20 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Regulated Boundaries / Referrals Alert */}
                    {((currentRoleConfig?.cannotProvide?.length || 0) > 0) && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Scope Boundaries &amp; Referral Protocol:</strong>
                          <ul className="list-disc list-inside mt-0.5 text-[11px] text-slate-300">
                            {(currentRoleConfig?.cannotProvide || []).map((bound, i) => (
                              <li key={i}>{bound}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Hourly Rate & Net Payout Configuration */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-black/30 to-emerald-950/30 border border-purple-500/30 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-400" />
                          <span>Set Your Base Clinical / Home Visit Hourly Rate (JMD):</span>
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Recommended range for {currentRoleConfig.shortLabel}: JMD ${currentRoleConfig.minRateJMD.toLocaleString()} – ${currentRoleConfig.maxRateJMD.toLocaleString()}/hr
                        </p>
                      </div>

                      {/* Direct Numeric Input with Currency Symbol */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/50 border border-white/20 rounded-xl px-3 py-1.5">
                        <span className="text-xs font-mono font-bold text-slate-400">JMD $</span>
                        <input
                          type="number"
                          min={currentRoleConfig.minRateJMD}
                          max={currentRoleConfig.maxRateJMD}
                          step={500}
                          value={hourlyRateJMD}
                          onChange={(e) => setHourlyRateJMD(Math.max(1000, Number(e.target.value)))}
                          className="w-24 bg-transparent text-sm font-black font-mono text-emerald-300 focus:outline-none text-right"
                        />
                        <span className="text-xs text-slate-400 font-mono">/hr</span>
                      </div>
                    </div>

                    {/* Interactive Slider */}
                    <input
                      type="range"
                      min={currentRoleConfig.minRateJMD}
                      max={currentRoleConfig.maxRateJMD}
                      step="500"
                      value={hourlyRateJMD}
                      onChange={(e) => setHourlyRateJMD(Number(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => setHourlyRateJMD(currentRoleConfig.defaultHourlyRateJMD)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${
                          hourlyRateJMD === currentRoleConfig.defaultHourlyRateJMD
                            ? 'bg-purple-600/40 text-purple-200 border-purple-400'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                        }`}
                      >
                        Standard: ${currentRoleConfig.defaultHourlyRateJMD.toLocaleString()}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHourlyRateJMD(Math.min(currentRoleConfig.maxRateJMD, currentRoleConfig.defaultHourlyRateJMD + 2000))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${
                          hourlyRateJMD === Math.min(currentRoleConfig.maxRateJMD, currentRoleConfig.defaultHourlyRateJMD + 2000)
                            ? 'bg-purple-600/40 text-purple-200 border-purple-400'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                        }`}
                      >
                        High Complexity: ${Math.min(currentRoleConfig.maxRateJMD, currentRoleConfig.defaultHourlyRateJMD + 2000).toLocaleString()}
                      </button>
                    </div>

                    {/* Earnings Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-slate-300">
                        <span className="block text-[10px] uppercase font-sans text-emerald-400 font-bold">Your Net Payout (85%)</span>
                        <strong className="text-emerald-300 text-sm font-black">
                          JMD ${Math.round(hourlyRateJMD * 0.85).toLocaleString()} / hour
                        </strong>
                        <span className="block text-[10px] text-slate-400 font-sans mt-0.5">Deposited directly to your Jamaican bank account every Friday</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-slate-400">
                        <span className="block text-[10px] uppercase font-sans text-slate-400 font-bold">We Care Platform Fee (15%)</span>
                        <strong className="text-slate-300 text-sm font-bold">
                          JMD ${Math.round(hourlyRateJMD * 0.15).toLocaleString()} / hour
                        </strong>
                        <span className="block text-[10px] text-slate-400 font-sans mt-0.5">Covers malpractice insurance, instant dispatch &amp; 24/7 security dispatch</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Specialties Checklist */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-200">
                      Clinical Practice Specialties &amp; Care Areas (Select all that apply):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {allAvailableSpecialties.map(spec => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => handleToggleSpecialty(spec)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                            selectedSpecialties.includes(spec)
                              ? 'bg-purple-600/30 text-white border-purple-400/50 shadow-sm'
                              : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span>{spec}</span>
                          {selectedSpecialties.includes(spec) && <Check className="w-3.5 h-3.5 text-purple-300" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Regional Coverage Zones */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-200">
                      Regional Coverage Zones (Where you accept home visits):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 bg-black/40 border border-white/10 rounded-2xl">
                      {[
                        'New Kingston',
                        'Liguanea & Mona',
                        'Barbican & Cherry Gardens',
                        'Half-Way-Tree',
                        'Constant Spring & Manor Park',
                        'Cross Roads & Vineyard Town',
                        'Portmore - Greater Portmore',
                        'Portmore - Braeton & Hellshire',
                        'Portmore - Portmore Pines & Caribbean Estate',
                        'Spanish Town - Town Centre & Cathedral',
                        'Spanish Town - Ensom City & Eltham'
                      ].map(zone => (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => handleToggleZone(zone)}
                          className={`p-2 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                            selectedZones.includes(zone)
                              ? 'bg-emerald-600/25 text-emerald-200 border-emerald-500/40'
                              : 'bg-white/[0.02] text-slate-400 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="truncate">{zone}</span>
                          {selectedZones.includes(zone) && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2"
                    >
                      <span>Next: Jamaican Banking &amp; Lynk Details</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: BANKING */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>Step 4: Direct Deposit Jamaican Bank / Lynk Details</span>
                    </h3>
                    <span className="text-[11px] text-emerald-300 font-bold">Every Friday 10:00 AM EST</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Jamaican Commercial Bank *
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400 font-medium"
                      >
                        <option value="National Commercial Bank (NCB) Jamaica" className="bg-[#150722] text-white">National Commercial Bank (NCB) Jamaica</option>
                        <option value="Scotiabank Jamaica" className="bg-[#150722] text-white">Scotiabank Jamaica</option>
                        <option value="JN Bank Jamaica" className="bg-[#150722] text-white">JN Bank Jamaica</option>
                        <option value="First Global Bank Jamaica" className="bg-[#150722] text-white">First Global Bank Jamaica</option>
                        <option value="CIBC FirstCaribbean Jamaica" className="bg-[#150722] text-white">CIBC FirstCaribbean Jamaica</option>
                        <option value="Sagicor Bank Jamaica" className="bg-[#150722] text-white">Sagicor Bank Jamaica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Account Type
                      </label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="Savings" className="bg-[#150722] text-white">Savings Account</option>
                        <option value="Chequing" className="bg-[#150722] text-white">Chequing Account</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="•••• •••• 9841"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Lynk Wallet Handle (Optional instant payouts)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., lynk.me/danielle_nurse"
                        value={lynkWallet}
                        onChange={(e) => setLynkWallet(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  {/* Bank Account Verification Upload in Step 4 */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Upload Bank Account Confirmation Letter / Statement / Voided Cheque *</span>
                      </label>
                      <span className="text-[10px] text-emerald-300 font-bold">Admin Only</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Upload a bank letter, header of account statement, or voided cheque confirming your Jamaican bank account name and account number for weekly Friday direct deposits.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => bankLetterFileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-white text-xs font-bold border border-purple-400/40 transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-purple-300" /> Choose Bank Document
                      </button>
                      <span className="text-[11px] text-slate-300 truncate">{bankLetterFileName || 'NCB_Bank_Account_Verification.pdf'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!digitalSignature && name) {
                          setDigitalSignature(name);
                        }
                        setCurrentStep(5);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:opacity-95 text-white text-xs font-black transition flex items-center gap-2 shadow-lg"
                    >
                      <span>Proceed to Agreement Review &amp; Sign</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: INDEPENDENT NURSE CONTRACTOR AGREEMENT (REVIEW & E-SIGN) */}
              {currentStep === 5 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span>Step 5: Review &amp; Sign Independent Contractor Agreement</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Formal 85% / 15% contractor agreement under the Laws of Jamaica.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFullAgreementModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 hover:text-white text-xs font-bold border border-purple-400/40 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-purple-300" />
                        <span>View Full Agreement in Window</span>
                      </button>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Admin File
                      </span>
                    </div>
                  </div>

                  {/* Agreement Banner Card with Full-Text Modal Window Launcher */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-emerald-950/60 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30">
                          Legal Instrument
                        </span>
                        <span className="text-xs font-bold text-white font-mono">
                          Ref: WCJ-CONT-2026
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white">
                        We Care Limited Independent Nurse Contractor Agreement
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        Governed by the Laws of Jamaica • 85% Nurse Payout / 15% Platform Fee • Jamaica Data Protection Act 2020
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFullAgreementModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-700 hover:opacity-95 text-white text-xs font-bold border border-purple-300/40 transition flex items-center gap-1.5 shadow-md shrink-0"
                    >
                      <FileText className="w-4 h-4 text-emerald-300" />
                      <span>Read Full 8 Sections ↗</span>
                    </button>
                  </div>

                  {/* Scrollable Summary Container of the Agreement */}
                  <div className="bg-slate-900/90 border border-white/15 rounded-2xl p-5 text-slate-300 text-xs max-h-64 overflow-y-auto space-y-4 font-sans leading-relaxed shadow-inner">
                    <div className="border-b border-white/10 pb-3 text-center">
                      <h4 className="font-extrabold text-white text-sm uppercase tracking-wide">
                        WE CARE LIMITED
                      </h4>
                      <h5 className="text-purple-300 font-bold text-xs uppercase">
                        INDEPENDENT NURSE CONTRACTOR AGREEMENT
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        Ref: WCJ-CONT-2026 • Registered Office: 4 Claudete Drive, St. Catherine, Jamaica
                      </span>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] space-y-1 text-slate-300">
                      <p><strong>This Agreement is made between:</strong></p>
                      <p><strong>We Care Limited</strong>, a company registered in Jamaica [Company #2026-WECARE-JA], with registered office in Kingston, St Andrew [<strong>"We Care"</strong> or <strong>"Company"</strong>]</p>
                      <p><strong>AND</strong></p>
                      <p><strong>{name || '{Nurse Full Name}'}</strong>, of {address || 'Kingston, Jamaica'}, Nursing Council License # <strong className="text-purple-300 font-mono">{nursingCouncilLicense || '{License #}'}</strong> [<strong>"Nurse"</strong> or <strong>"Contractor"</strong>]</p>
                    </div>

                    <div className="space-y-3 text-[11px] text-slate-300">
                      <div>
                        <strong className="text-white block">1. PURPOSE</strong>
                        We Care operates a digital platform that connects clients with independent licensed nurses for in-home services in Kingston &amp; St Andrew, Portmore, and Spanish Town. The Nurse agrees to provide services through the We Care platform on the terms below.
                      </div>

                      <div>
                        <strong className="text-white block">2. RELATIONSHIP</strong>
                        The Nurse is an independent contractor, not an employee of We Care. The Nurse controls their own schedule, accepts or declines bookings, and provides their own equipment/supplies unless otherwise agreed. Nothing in this Agreement creates an employer-employee relationship.
                      </div>

                      <div>
                        <strong className="text-white block">3. NURSE RESPONSIBILITIES</strong>
                        The Nurse warrants and represents that they hold an active license from the Nursing Council of Jamaica (NCJ) and will maintain valid registration throughout. The Nurse shall deliver care in accordance with Jamaican healthcare standards, complete visit notes in the application, and adhere to the 2-hour cancellation notice policy.
                      </div>

                      <div>
                        <strong className="text-white block">4. PAYMENT &amp; FEES</strong>
                        The platform fee is <strong>15%</strong> of each completed booking. The Nurse receives <strong>85%</strong> of the gross booking rate. Payouts are made weekly on Fridays directly to the Nurse's nominated Jamaican bank account or Lynk wallet. The Nurse is responsible for their own statutory obligations (NIS, NHT, and personal income tax).
                      </div>

                      <div>
                        <strong className="text-white block">5. SAFETY &amp; LIABILITY</strong>
                        We Care provides a booking technology platform and does not provide medical services directly. The Nurse maintains sole clinical responsibility for patient care delivered. The Nurse agrees to hold harmless and indemnify We Care Limited from claims arising from clinical performance.
                      </div>

                      <div>
                        <strong className="text-white block">6. DATA &amp; CONFIDENTIALITY</strong>
                        The Nurse shall strictly maintain client confidentiality in compliance with the <strong>Jamaica Data Protection Act 2020</strong>. Client medical and personal data obtained through the platform shall never be shared or used outside authorized care duties.
                      </div>

                      <div>
                        <strong className="text-white block">7. TERMINATION</strong>
                        Either party may terminate this agreement with <strong>7 days written notice</strong>. We Care reserves the right to immediately suspend platform access in cases of expired NCJ license, patient safety concerns, or professional misconduct.
                      </div>

                      <div>
                        <strong className="text-white block">8. GOVERNING LAW</strong>
                        This Agreement shall be governed by and construed in accordance with the <strong>Laws of Jamaica</strong>.
                      </div>
                    </div>
                  </div>

                  {/* Required Documents Checklist Confirmation */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Attached Compliance Documents for Admin File:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Copy of Government ID ({governmentIdType})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Copy of NCJ License ({nursingCouncilLicense || 'NCJ Certificate'})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Diploma / Degree ({diplomaDocFileName || 'Certificate Scan'})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Proof of Address ({poaFileName || 'Utility Bill'})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>TRN Certificate ({trnNumber})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Bank Account Letter ({bankName})</span>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE CONTRACTOR SIGNATURE SECTION (DRAW OR TYPE) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-black/60 to-emerald-950/40 border border-purple-400/40 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                      <div>
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <PenTool className="w-4 h-4 text-purple-300" />
                          <span>Contractor Signature Field *</span>
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Draw your signature below using your finger, stylus, or mouse.
                        </p>
                      </div>

                      {/* Signature Mode Toggle: Draw vs Type */}
                      <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setSignatureMode('draw')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            signatureMode === 'draw'
                              ? 'bg-[#1E1B4B] text-white shadow-sm'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <PenTool className="w-3 h-3" />
                          <span>Draw Signature</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureMode('type')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            signatureMode === 'type'
                              ? 'bg-[#1E1B4B] text-white shadow-sm'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Fingerprint className="w-3 h-3" />
                          <span>Type Name</span>
                        </button>
                      </div>
                    </div>

                    {/* DRAW SIGNATURE CANVAS PAD */}
                    {signatureMode === 'draw' && (
                      <div className="space-y-2">
                        <div className="relative rounded-2xl border-2 border-dashed border-purple-400/50 bg-slate-950/90 overflow-hidden shadow-inner p-1">
                          <canvas
                            ref={canvasRef}
                            width={560}
                            height={150}
                            onPointerDown={startDrawing}
                            onPointerMove={draw}
                            onPointerUp={stopDrawing}
                            onPointerLeave={stopDrawing}
                            style={{ touchAction: 'none' }}
                            className="w-full h-36 bg-slate-950 rounded-xl cursor-crosshair block"
                          />
                          
                          {/* Signature Guideline Overlay */}
                          <div className="absolute inset-x-6 bottom-6 border-b border-purple-500/30 flex items-center justify-between text-[10px] text-purple-400/50 font-mono pointer-events-none pb-0.5">
                            <span>✕ Sign on line above</span>
                            <span>{name || 'Contractor'}</span>
                          </div>

                          {!hasDrawnSignature && !drawnSignatureDataUrl && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-500 text-xs">
                              <PenTool className="w-6 h-6 text-purple-400/40 mb-1 animate-pulse" />
                              <span className="font-medium text-slate-400">Touch or click &amp; drag to draw your signature here</span>
                            </div>
                          )}
                        </div>

                        {/* Signature Canvas Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={clearSignature}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
                            >
                              <Eraser className="w-3.5 h-3.5 text-slate-400" />
                              <span>Clear / Redo</span>
                            </button>
                            <button
                              type="button"
                              onClick={drawSampleSignatureCurve}
                              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 transition flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                              <span>Auto-Draw Sample</span>
                            </button>
                          </div>

                          {hasDrawnSignature || drawnSignatureDataUrl ? (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Signature Captured</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-400 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Signature Required</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TYPE SIGNATURE FALLBACK */}
                    {signatureMode === 'type' && (
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="e.g., Danielle Palmer"
                            value={digitalSignature}
                            onChange={(e) => setDigitalSignature(e.target.value)}
                            className="w-full bg-black/60 border border-purple-400/50 rounded-xl px-3.5 py-3 text-base text-purple-200 font-serif italic focus:outline-none focus:border-emerald-400 font-bold tracking-wide"
                          />
                          <Fingerprint className="w-4 h-4 text-purple-300 absolute right-3.5 top-3.5" />
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Typing your full legal name serves as an authorized electronic signature under Jamaican Law.
                        </p>
                      </div>
                    )}

                    {/* MANDATORY CHECKBOXES */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      {/* Checkbox 1: Independent Contractor Agreement Terms */}
                      <label className="flex items-start gap-3 p-3 rounded-xl bg-purple-950/30 border border-purple-400/30 hover:border-purple-400/60 transition cursor-pointer group">
                        <input
                          type="checkbox"
                          required
                          checked={agreedToContractTerms}
                          onChange={(e) => setAgreedToContractTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded accent-[#10B981] cursor-pointer shrink-0"
                        />
                        <div className="space-y-1 text-xs">
                          <span className="text-white font-bold block group-hover:text-purple-200 transition">
                            I agree to the We Care Limited Independent Nurse Contractor Agreement (WCJ-CONT-2026) *
                          </span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            I confirm I have reviewed all 8 sections regarding the 85%/15% platform payment terms, Jamaican clinical standards, and 7-day termination notice.{' '}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowFullAgreementModal(true);
                              }}
                              className="text-purple-300 hover:text-purple-100 underline font-bold inline-flex items-center gap-0.5 ml-1"
                            >
                              [View Full Agreement in Window ↗]
                            </button>
                          </p>
                        </div>
                      </label>

                      {/* Checkbox 2: Independent Status & Statutory Obligations */}
                      <label className="flex items-start gap-3 p-3 rounded-xl bg-purple-950/30 border border-purple-400/30 hover:border-purple-400/60 transition cursor-pointer group">
                        <input
                          type="checkbox"
                          required
                          checked={agreedToIndependentStatus}
                          onChange={(e) => setAgreedToIndependentStatus(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded accent-[#10B981] cursor-pointer shrink-0"
                        />
                        <div className="space-y-1 text-xs">
                          <span className="text-white font-bold block group-hover:text-purple-200 transition">
                            I confirm my Independent Contractor status and Jamaican statutory obligations *
                          </span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            I acknowledge my status as an independent practitioner responsible for my professional indemnity, clinical delivery, and statutory NIS / NHT filings under Jamaican tax law.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition text-center"
                    >
                      ← Back to Banking
                    </button>

                    <button
                      type="submit"
                      disabled={
                        !agreedToContractTerms ||
                        !agreedToIndependentStatus ||
                        (signatureMode === 'draw' && !hasDrawnSignature && !drawnSignatureDataUrl) ||
                        (signatureMode === 'type' && !digitalSignature)
                      }
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-emerald-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-xl shadow-purple-900/50 transition flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4 h-4 text-emerald-300" />
                      <span>Sign, Return Agreement &amp; Submit Application</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* FULL-TEXT INDEPENDENT CONTRACTOR AGREEMENT SCROLLABLE MODAL WINDOW */}
      {showFullAgreementModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-purple-400/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-black/60 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#1E1B4B] text-white">
                  <Logo size="sm" variation={logoVariation} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Independent Nurse Contractor Agreement
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-mono text-purple-300">Ref: WCJ-CONT-2026</span>
                    <span>•</span>
                    <span>We Care Limited (Jamaica)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10 transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullAgreementModal(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Agreement Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-300 text-xs leading-relaxed bg-slate-950/50">
              
              {/* Document Header Letterhead */}
              <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md border border-slate-200">
                <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-black uppercase text-slate-950 tracking-tight">
                      WE CARE LIMITED
                    </h1>
                    <p className="text-[11px] font-semibold text-slate-700">
                      Incorporated under the Companies Act of Jamaica • Company #2026-WECARE-JA
                    </p>
                    <p className="text-[11px] text-slate-600">
                      4 Claudete Drive, St. Catherine, Jamaica
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-950 font-mono text-[10px] font-extrabold border border-purple-200 uppercase">
                      Official Contractor Instrument
                    </span>
                    <p className="text-[11px] font-mono font-bold text-slate-700 mt-1">
                      WCJ-CONT-2026
                    </p>
                  </div>
                </div>

                {/* Parties Preamble */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-800">
                  <p className="font-bold text-slate-950 uppercase text-[11px] tracking-wide">
                    THIS AGREEMENT is entered into as of {new Date().toISOString().split('T')[0]} by and between:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] font-extrabold uppercase text-purple-900 block">The Company</span>
                      <p className="font-bold text-slate-900">We Care Limited</p>
                      <p className="text-[11px] text-slate-600">4 Claudete Drive, St. Catherine, Jamaica</p>
                      <p className="text-[11px] text-slate-600">Rep: Sydney Mattis, Operations Director</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-900 block">The Nurse Contractor</span>
                      <p className="font-bold text-slate-900">{name || '[Contractor Full Legal Name]'}</p>
                      <p className="text-[11px] text-slate-600">{address || '[Residential Address, Jamaica]'}</p>
                      <p className="text-[11px] text-slate-600">NCJ License: <span className="font-mono font-bold">{nursingCouncilLicense || '[License #]'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Legal Clauses 1 to 8 */}
                <div className="space-y-5 text-xs text-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-950 uppercase text-xs border-b border-slate-200 pb-1 mb-1.5">
                      1. Purpose &amp; Platform Operation
                    </h3>
                    <p className="leading-relaxed">
                      We Care Limited operates an on-demand healthcare facilitation digital platform connecting independent licensed healthcare professionals with patients and families requiring in-home medical and nursing care in Kingston &amp; St Andrew, Portmore, and Spanish Town. The Contractor hereby engages with the Company to provide clinical services through the platform in accordance with the terms of this Agreement.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 uppercase text-xs border-b border-slate-200 pb-1 mb-1.5">
                      2. Independent Contractor Relationship
                    </h3>
                    <p className="leading-relaxed mb-1.5">
                      <strong>2.1</strong> The Contractor is an independent contractor and not an employee, agent, or partner of We Care Limited.
                    </p>
                    <p className="leading-relaxed mb-1.5">
                      <strong>2.2</strong> The Contractor retains complete discretion over working hours, acceptance or refusal of booking requests, and the autonomous execution of nursing care within the scope of their NCJ registration.
                    </p>
                    <p className="leading-relaxed">
                      <strong>2.3</strong> Nothing in this Agreement shall entitle the Contractor to employment benefits, paid leave, health insurance, pension contributions, or redundancy payments from the Company.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 uppercase text-xs border-b border-slate-200 pb-1 mb-1.5">
                      3. Professional Standards &amp; NCJ Licensing
                    </h3>
                    <p className="leading-relaxed mb-1.5">
                      <strong>3.1</strong> The Contractor represents and warrants that they hold a current, valid, and unrestricted practicing certificate issued by the <strong>Nursing Council of Jamaica (NCJ)</strong>.
                    </p>
                    <p className="leading-relaxed mb-1.5">
                      <strong>3.2</strong> The Contractor agrees to immediately notify the Company in writing of any disciplinary proceeding, suspension, revocation, or lapse of their NCJ practicing certificate.
                    </p>
                    <p className="leading-relaxed">
                      <strong>3.3</strong> The Contractor shall maintain the highest standards of clinical care, sterile technique, patient hygiene, and complete accurate clinical visit logs in the platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 uppercase text-xs border-b border-slate-200 pb-1 mb-1.5">
                      4. Financial Remuneration, Platform Fees &amp; Statutory Taxes
                    </h3>
                    <p className="leading-relaxed mb-1.5">
                      <strong>4.1 Fee Split:</strong> For each completed booking, the Contractor shall receive <strong>85% (eighty-five percent)</strong> of the gross service amount collected. The Company shall retain <strong>15% (fifteen percent)</strong> as a technology and administrative platform fee.
                    </p>
                    <p className="leading-relaxed mb-1.5">
                      <strong>4.2 Payout Schedule:</strong> Net earnings are calculated weekly and disbursed on Fridays directly via electronic direct deposit to the Contractor's designated Jamaican bank account ({bankName}) or Lynk digital wallet.
                    </p>
                    <p className="leading-relaxed">
                      <strong>4.3 Statutory Obligations:</strong> As an independent contractor, the Contractor acknowledges sole legal responsibility for the assessment and payment of all applicable Jamaican statutory deductions, including National Insurance Scheme (NIS), National Housing Trust (NHT), Education Tax, and General Consumption Tax (GCT) / Income Tax (PAYE/IT01) to Tax Administration Jamaica (TAJ).
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 uppercase text-xs border-b border-slate-200 pb-1 mb-1.5">
                      5. Professional Indemnity &amp; Clinical Liability
                    </h3>
                    <p className="leading-relaxed mb-1.5">
                      <strong>5.1</strong> We Care Limited provides software facilitation and booking coordination only; the Company does not practice medicine or furnish medical advice.
                    </p>
                    <p className="leading-relaxed">
                      <strong>5.2</strong> The Contractor maintains sole clinical liability for healthcare procedures performed. The Contractor agrees to indemnify and hold harmless We Care Limited, its officers, and directors from any and all claims, damages, or liabilities arising out of the Contractor’s acts or omissions.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 uppercase text-xs border-b border-slate-200 pb-1 mb-1.5">
                      6. Confidentiality &amp; Jamaica Data Protection Act 2020
                    </h3>
                    <p className="leading-relaxed">
                      The Contractor shall maintain strict confidentiality regarding all patient medical histories, clinical records, home addresses, and personal data accessed via the platform in accordance with the <strong>Data Protection Act 2020 of Jamaica</strong> and standard medical ethics. Breach of patient confidentiality shall result in immediate termination and legal referral.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 uppercase text-xs border-b border-slate-200 pb-1 mb-1.5">
                      7. Term &amp; Termination Notice
                    </h3>
                    <p className="leading-relaxed mb-1.5">
                      <strong>7.1</strong> Either party may terminate this Agreement at any time with <strong>7 (seven) days written notice</strong>.
                    </p>
                    <p className="leading-relaxed">
                      <strong>7.2</strong> The Company reserves the right to immediately suspend or terminate access without prior notice in the event of gross professional misconduct, expired credentials, safety infractions, or unexcused booking abandonment.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950 uppercase text-xs border-b border-slate-200 pb-1 mb-1.5">
                      8. Governing Law &amp; Jurisdiction
                    </h3>
                    <p className="leading-relaxed">
                      This Agreement shall be governed by, construed, and enforced in accordance with the <strong>Laws of Jamaica</strong>. The parties submit to the exclusive jurisdiction of the Supreme Court of Judicature of Jamaica.
                    </p>
                  </div>
                </div>

                {/* Schedule of Attached Compliance Documents */}
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-xs space-y-2">
                  <span className="font-bold text-slate-950 block uppercase text-[11px]">
                    Schedule A: Attached Mandatory Compliance Records (On Confidential Admin File)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <div>✓ Copy of Government ID ({governmentIdType})</div>
                    <div>✓ Copy of NCJ Practicing Certificate ({nursingCouncilLicense || 'NCJ-RN-2024'})</div>
                    <div>✓ Proof of Address Statement ({poaFileName || 'Utility Bill'})</div>
                    <div>✓ TRN Registration Certificate ({trnNumber || '184-902-311'})</div>
                    <div className="sm:col-span-2">✓ Commercial Bank Confirmation Letter ({bankName})</div>
                  </div>
                </div>

                {/* Signature Preview Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-900 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-extrabold text-slate-950 block uppercase text-[11px]">
                      For We Care Limited
                    </span>
                    <p><strong>Name:</strong> Sydney Mattis</p>
                    <p><strong>Title:</strong> Operations Director</p>
                    <div className="font-serif italic text-sm text-purple-900 font-bold py-1">
                      Sydney Mattis
                    </div>
                    <p className="text-[10px] text-slate-500">Authorized Corporate Representative</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                    <span className="font-extrabold text-purple-950 block uppercase text-[11px]">
                      For Nurse Contractor
                    </span>
                    <p><strong>Name:</strong> {name || '[Contractor Legal Name]'}</p>
                    <p><strong>NCJ License:</strong> {nursingCouncilLicense || '[License #]'}</p>
                    <div className="py-1">
                      {drawnSignatureDataUrl ? (
                        <img src={drawnSignatureDataUrl} alt="Drawn Signature" className="h-9 object-contain" />
                      ) : (
                        <div className="font-serif italic text-sm text-purple-900 font-bold">
                          {digitalSignature || name || '[Pending Signature]'}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">Timestamp: {new Date().toISOString().split('T')[0]}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="px-6 py-4 bg-black/70 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>By accepting, you agree to execute this legal instrument under Jamaican law.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowFullAgreementModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition"
                >
                  Close Window
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAgreedToContractTerms(true);
                    setAgreedToIndependentStatus(true);
                    setShowFullAgreementModal(false);
                    soundFX.playSuccessPing();
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-emerald-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-purple-900/50 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>I Agree to Independent Contractor Agreement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
