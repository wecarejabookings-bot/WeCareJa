import { NurseSkillBadge, NurseProfile } from '../types';

export interface SpecializedSkillDefinition {
  id: string;
  name: string;
  category: 'surgical' | 'pediatric' | 'clinical' | 'geriatric' | 'critical' | 'specialized';
  description: string;
  recommendedCertifications: string[];
  suggestedProofDocument: string;
  iconName: string;
}

export const AVAILABLE_SPECIALIZED_SKILLS: SpecializedSkillDefinition[] = [
  {
    id: 'post-op-care',
    name: 'Post-Op Care',
    category: 'surgical',
    description: 'Post-surgical sterile dressing changes, surgical drain monitoring (Jackson-Pratt/Hemovac), suture/staple removal, mobilization, and acute post-anesthesia recovery.',
    recommendedCertifications: ['Post-Anesthesia / Surgical Nursing', 'AORN Clinical Guidelines', 'NCJ Registered General Nurse'],
    suggestedProofDocument: 'Hospital Surgical Ward Practicum / Post-Op Clinical Letter',
    iconName: 'Activity'
  },
  {
    id: 'pediatric-nursing',
    name: 'Pediatric Nursing',
    category: 'pediatric',
    description: 'Specialized neonatal, infant, and pediatric vital sign assessments, pediatric-weight drug calculations, gentle nebulization, and pediatric phlebotomy/cannulation.',
    recommendedCertifications: ['Pediatric Advanced Life Support (PALS)', 'Neonatal Resuscitation (NRP)', 'Bustamante Hospital for Children Practicum'],
    suggestedProofDocument: 'PALS Certificate / Bustamante Pediatric Ward Practicum Letter',
    iconName: 'Baby'
  },
  {
    id: 'advanced-wound-care',
    name: 'Advanced Wound Care',
    category: 'clinical',
    description: 'Complex diabetic ulcer management, pressure injury staging (Stages I-IV), negative pressure wound therapy (wound VAC), chemical/sharp debridement, and alginate dressings.',
    recommendedCertifications: ['WOCN Certified Wound Specialist', 'Advanced Wound Bed Preparation Certification'],
    suggestedProofDocument: 'Certified Wound Care Specialist Certificate',
    iconName: 'Bandage'
  },
  {
    id: 'iv-infusion-therapy',
    name: 'IV Infusion Therapy',
    category: 'clinical',
    description: 'Doctor-prescribed peripheral venous access (PIVC), saline locks, IV push medications, antibiotic infusions, IV electrolyte replacement, and midline catheter care.',
    recommendedCertifications: ['Infusion Nurses Society (INS) Standards', 'NCJ Approved IV Cannulation Certification'],
    suggestedProofDocument: 'IV Cannulation & Infusion Therapy Certification',
    iconName: 'Syringe'
  },
  {
    id: 'geriatric-dementia-care',
    name: 'Geriatric & Dementia Care',
    category: 'geriatric',
    description: 'Alzheimer’s disease care, non-pharmacological behavioral redirection, cognitive engagement, transfer safety, fall prevention algorithms, and gentle palliative ADL assistance.',
    recommendedCertifications: ['HEART/NTA Certified Geriatric Care', 'Dementia Care Specialist (DCS)'],
    suggestedProofDocument: 'Geriatric Caregiving Diploma / Memory Care Certification',
    iconName: 'HeartHandshake'
  },
  {
    id: 'palliative-care',
    name: 'Palliative & End-of-Life Care',
    category: 'clinical',
    description: 'Comprehensive hospice comfort care, breakthrough pain management, dyspnea protocols, mouth care, emotional bereavement, and dignifying family support.',
    recommendedCertifications: ['Hospice and Palliative Credential (CHPN)', 'End-of-Life Nursing Education (ELNEC)'],
    suggestedProofDocument: 'Palliative & Hospice Care Certification',
    iconName: 'HeartPulse'
  },
  {
    id: 'critical-care-monitoring',
    name: 'ICU & Critical Care Monitoring',
    category: 'critical',
    description: 'Multi-parameter clinical monitor analysis, tracheostomy management and sterile suctioning, enteral feeding pumps (PEG/NG tubes), and acute decompensation escalation.',
    recommendedCertifications: ['Critical Care Registered Nurse (CCRN)', 'Advanced Cardiovascular Life Support (ACLS)'],
    suggestedProofDocument: 'CCRN / ACLS Credential & Hospital ICU Experience Letter',
    iconName: 'Zap'
  },
  {
    id: 'stoma-ostomy-care',
    name: 'Stoma & Ostomy Management',
    category: 'specialized',
    description: 'Colostomy, ileostomy, and urostomy peristomal skin evaluation, barrier wafer sizing, stoma bag emptying and appliance sealing, and dietary patient counseling.',
    recommendedCertifications: ['Wound, Ostomy and Continence (WOC) Certification'],
    suggestedProofDocument: 'Stoma Care Practicum Certificate',
    iconName: 'ShieldCheck'
  }
];

// Helper to seed initial skill badges for any nurse if empty
export const getDefaultSkillBadgesForNurse = (nurse: NurseProfile): NurseSkillBadge[] => {
  if (nurse.skillBadges && nurse.skillBadges.length > 0) {
    return nurse.skillBadges;
  }

  // Pre-populate with realistic badges based on nurse's qualifications and specialties
  const badges: NurseSkillBadge[] = [];

  if (nurse.id === 'nurse-101') { // Nurse Althea Campbell (Senior RN)
    badges.push({
      id: 'post-op-care',
      skillName: 'Post-Op Care',
      category: 'surgical',
      status: 'verified',
      requestedAt: '2026-08-15T09:30:00.000Z',
      verifiedAt: '2026-08-16T14:20:00.000Z',
      verifiedByAdminName: 'Sydney Mattis, Master Administrator',
      supportingNote: '8 years clinical experience including UHWI Main Surgical Theater and private surgical homecare recovery.',
      documentProofName: 'UHWI_Surgical_Unit_Reference.pdf',
      iconName: 'Activity'
    });
    badges.push({
      id: 'advanced-wound-care',
      skillName: 'Advanced Wound Care',
      category: 'clinical',
      status: 'verified',
      requestedAt: '2026-08-15T09:35:00.000Z',
      verifiedAt: '2026-08-16T14:22:00.000Z',
      verifiedByAdminName: 'Sydney Mattis, Master Administrator',
      supportingNote: 'Certified in sterile VAC therapy, diabetic ulcer staging, and debridement.',
      documentProofName: 'Advanced_Wound_Care_Certified.pdf',
      iconName: 'Bandage'
    });
    badges.push({
      id: 'pediatric-nursing',
      skillName: 'Pediatric Nursing',
      category: 'pediatric',
      status: 'pending_review',
      requestedAt: '2026-09-08T11:45:00.000Z',
      supportingNote: 'Completed UWISON Pediatric Clinical Practicum and 2 years in Bustamante Hospital for Children ward. Requesting official verified badge to take pediatric home visits.',
      documentProofName: 'Bustamante_Children_Hospital_Letter.pdf',
      iconName: 'Baby'
    });
    badges.push({
      id: 'iv-infusion-therapy',
      skillName: 'IV Infusion Therapy',
      category: 'clinical',
      status: 'unverified',
      iconName: 'Syringe'
    });
  } else if (nurse.id === 'nurse-102') { // Nurse Marcus Sterling
    badges.push({
      id: 'iv-infusion-therapy',
      skillName: 'IV Infusion Therapy',
      category: 'clinical',
      status: 'verified',
      requestedAt: '2026-08-20T10:00:00.000Z',
      verifiedAt: '2026-08-21T11:15:00.000Z',
      verifiedByAdminName: 'Sydney Mattis, Master Administrator',
      supportingNote: 'UTech School of Nursing certified in peripheral venous cannulation & hydration infusion protocols.',
      documentProofName: 'UTech_IV_Cannulation_Cert.pdf',
      iconName: 'Syringe'
    });
    badges.push({
      id: 'post-op-care',
      skillName: 'Post-Op Care',
      category: 'surgical',
      status: 'pending_review',
      requestedAt: '2026-09-09T08:20:00.000Z',
      supportingNote: 'Managing post-op orthopedic patients in Kingston 8. Requesting official verified badge.',
      documentProofName: 'Post_Op_Ortho_Clinic_Cert.pdf',
      iconName: 'Activity'
    });
    badges.push({
      id: 'critical-care-monitoring',
      skillName: 'ICU & Critical Care Monitoring',
      category: 'critical',
      status: 'unverified',
      iconName: 'Zap'
    });
  } else if (nurse.id === 'nurse-103') { // Beverly Brown (Geriatric Caregiver)
    badges.push({
      id: 'geriatric-dementia-care',
      skillName: 'Geriatric & Dementia Care',
      category: 'geriatric',
      status: 'verified',
      requestedAt: '2026-08-10T14:10:00.000Z',
      verifiedAt: '2026-08-11T16:05:00.000Z',
      verifiedByAdminName: 'Sydney Mattis, Master Administrator',
      supportingNote: '12 years specialized experience in senior companion care, Alzheimer’s redirection, and mobility support.',
      documentProofName: 'HEART_Geriatric_Care_Diploma.pdf',
      iconName: 'HeartHandshake'
    });
    badges.push({
      id: 'palliative-care',
      skillName: 'Palliative & End-of-Life Care',
      category: 'clinical',
      status: 'pending_review',
      requestedAt: '2026-09-07T15:30:00.000Z',
      supportingNote: 'Completed St. Joseph’s Hospice Palliative Caregiver Module in Kingston.',
      documentProofName: 'Hospice_Module_Completion.pdf',
      iconName: 'HeartPulse'
    });
  } else {
    // Other nurses get standard sample badges based on their specialties
    if (nurse.specialties.some(s => s.toLowerCase().includes('post-op') || s.toLowerCase().includes('wound'))) {
      badges.push({
        id: 'post-op-care',
        skillName: 'Post-Op Care',
        category: 'surgical',
        status: 'pending_review',
        requestedAt: '2026-09-06T10:15:00.000Z',
        supportingNote: 'Experienced in general surgery recovery and suture removals.',
        documentProofName: 'Surgical_Nursing_Record.pdf',
        iconName: 'Activity'
      });
    }
    if (nurse.specialties.some(s => s.toLowerCase().includes('pediatric') || s.toLowerCase().includes('child') || s.toLowerCase().includes('infant'))) {
      badges.push({
        id: 'pediatric-nursing',
        skillName: 'Pediatric Nursing',
        category: 'pediatric',
        status: 'verified',
        requestedAt: '2026-08-18T12:00:00.000Z',
        verifiedAt: '2026-08-19T09:30:00.000Z',
        verifiedByAdminName: 'Sydney Mattis, Master Administrator',
        supportingNote: 'Certified in pediatric homecare.',
        documentProofName: 'PALS_Certification.pdf',
        iconName: 'Baby'
      });
    }
    if (nurse.specialties.some(s => s.toLowerCase().includes('senior') || s.toLowerCase().includes('elderly') || s.toLowerCase().includes('geriatric'))) {
      badges.push({
        id: 'geriatric-dementia-care',
        skillName: 'Geriatric & Dementia Care',
        category: 'geriatric',
        status: 'verified',
        requestedAt: '2026-08-12T10:00:00.000Z',
        verifiedAt: '2026-08-13T11:00:00.000Z',
        verifiedByAdminName: 'Sydney Mattis, Master Administrator',
        supportingNote: 'Specialized in elderly dementia companion care.',
        documentProofName: 'Elderly_Care_Accreditation.pdf',
        iconName: 'HeartHandshake'
      });
    }
  }

  // Ensure at least Post-Op Care and Pediatric Nursing are available in the badge list (either unverified or in state)
  const hasPostOp = badges.some(b => b.id === 'post-op-care');
  if (!hasPostOp) {
    badges.push({
      id: 'post-op-care',
      skillName: 'Post-Op Care',
      category: 'surgical',
      status: 'unverified',
      iconName: 'Activity'
    });
  }

  const hasPediatric = badges.some(b => b.id === 'pediatric-nursing');
  if (!hasPediatric) {
    badges.push({
      id: 'pediatric-nursing',
      skillName: 'Pediatric Nursing',
      category: 'pediatric',
      status: 'unverified',
      iconName: 'Baby'
    });
  }

  return badges;
};
