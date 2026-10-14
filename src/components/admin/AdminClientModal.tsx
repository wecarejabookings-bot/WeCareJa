import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  X, 
  Check, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Key, 
  ShieldAlert, 
  UserCheck,
  Building,
  Stethoscope,
  ShieldCheck,
  FileText,
  DollarSign,
  Briefcase,
  Award,
  Calendar,
  Sparkles
} from 'lucide-react';

interface AdminClientModalProps {
  client?: UserAccount | null; // Can be client, nurse, or admin user
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<UserAccount>) => void;
  defaultRole?: UserRole;
}

export const AdminClientModal: React.FC<AdminClientModalProps> = ({
  client,
  isOpen,
  onClose,
  onSave,
  defaultRole = 'client'
}) => {
  if (!isOpen) return null;

  const isEditing = !!client;
  const [role, setRole] = useState<UserRole>(client?.role || defaultRole);
  const [fullName, setFullName] = useState(client?.name || client?.full_name || '');
  const [username, setUsername] = useState(client?.username || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [address, setAddress] = useState(client?.address || '');
  const [gateCode, setGateCode] = useState(client?.gateCode || '');
  const [zone, setZone] = useState(client?.zone || 'St. Andrew');
  const [emergencyContact, setEmergencyContact] = useState(client?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(client?.emergencyContact?.phone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(client?.emergencyContact?.relation || 'Next of Kin');
  const [trn, setTrn] = useState(client?.trn || '');
  const [dateOfBirth, setDateOfBirth] = useState(client?.dateOfBirth || client?.patientBioData?.dateOfBirth || '');
  const [gender, setGender] = useState(client?.patientBioData?.gender || 'female');
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending_approval' | 'rejected'>(
    client?.approvalStatus || 'approved'
  );

  // Representative (person using app on behalf of client)
  const [repName, setRepName] = useState(
    client?.accountHolder?.name || client?.patientBioData?.trustedFamilyMember?.name || ''
  );
  const [repPhone, setRepPhone] = useState(
    client?.accountHolder?.phone || client?.patientBioData?.trustedFamilyMember?.phone || ''
  );
  const [repRelation, setRepRelation] = useState(
    client?.accountHolder?.relationshipToPatient || client?.patientBioData?.trustedFamilyMember?.relation || 'Child / Family Guardian'
  );

  // Illness selection with dropdown & Other box
  const initialKnown = client?.patientBioData?.knownIllnesses?.[0] || 'Hypertension';
  const isCustom = !['Hypertension', 'Diabetes Type 2', "Alzheimer's / Dementia", 'Arthritis', 'Post-Op Recovery', 'Stroke Recovery', 'None'].includes(initialKnown);
  const [knownIllness, setKnownIllness] = useState(isCustom ? 'Other' : initialKnown);
  const [customIllness, setCustomIllness] = useState(isCustom ? initialKnown : '');
  const [allergies, setAllergies] = useState((client?.patientBioData?.allergies || []).join(', '));

  // Nurse Specific Fields
  const [nursingCouncilLicense, setNursingCouncilLicense] = useState(client?.nursingCouncilLicense || 'NCJ-RN-ACTIVE');
  const [driversLicenseNumber, setDriversLicenseNumber] = useState(client?.driversLicenseNumber || 'DL-JAM-98214-A');
  const [specialty, setSpecialty] = useState(client?.title || 'Elderly & Geriatric Home Care');
  const [hourlyRate, setHourlyRate] = useState<number>(7500);
  const [nurseBio, setNurseBio] = useState(client?.medical_info || '');

  // Admin Specific Fields
  const [adminTitle, setAdminTitle] = useState(client?.title || 'Lead Operations Director');
  const [adminDepartment, setAdminDepartment] = useState(client?.department || 'Clinical Operations');
  const [staffId, setStaffId] = useState(client?.staffId || client?.id || 'ADM-WC-01');

  // Reset or initialize state when client changes
  useEffect(() => {
    if (client) {
      setRole(client.role);
      setFullName(client.name || client.full_name || '');
      setUsername(client.username || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setAddress(client.address || '');
      setGateCode(client.gateCode || '');
      setZone(client.zone || 'St. Andrew');
      setEmergencyContact(client.emergencyContact?.name || '');
      setEmergencyPhone(client.emergencyContact?.phone || '');
      setEmergencyRelation(client.emergencyContact?.relation || 'Next of Kin');
      setTrn(client.trn || '');
      setDateOfBirth(client.dateOfBirth || client.patientBioData?.dateOfBirth || '');
      setApprovalStatus(client.approvalStatus || 'approved');
      setRepName(client.accountHolder?.name || client.patientBioData?.trustedFamilyMember?.name || '');
      setRepPhone(client.accountHolder?.phone || client.patientBioData?.trustedFamilyMember?.phone || '');
      setRepRelation(client.accountHolder?.relationshipToPatient || client.patientBioData?.trustedFamilyMember?.relation || 'Child / Family Guardian');
      setNursingCouncilLicense(client.nursingCouncilLicense || 'NCJ-RN-ACTIVE');
      setDriversLicenseNumber(client.driversLicenseNumber || 'DL-JAM-98214-A');
      setAdminTitle(client.title || 'Lead Operations Director');
      setAdminDepartment(client.department || 'Clinical Operations');
      setStaffId(client.staffId || client.id || 'ADM-WC-01');
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    soundFX.playStepComplete();

    const resolvedIllness = knownIllness === 'Other' ? customIllness.trim() : knownIllness;
    const illnessesList = [resolvedIllness].filter(Boolean);
    const allergiesList = allergies.split(',').map(s => s.trim()).filter(Boolean);

    const userPayload: Partial<UserAccount> = {
      ...(client || {}),
      id: client?.id || `user-${role}-${Date.now()}`,
      username: username.trim() || client?.username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: fullName.trim(),
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      zone: zone.trim(),
      trn: trn.trim(),
      role: role,
      approvalStatus: approvalStatus,
      status: approvalStatus === 'approved' ? 'active' : approvalStatus,
      dateOfBirth: dateOfBirth,
      emergencyContact: emergencyContact.trim()
        ? {
            name: emergencyContact.trim(),
            phone: emergencyPhone.trim(),
            relation: emergencyRelation.trim() || 'Next of Kin'
          }
        : undefined
    };

    if (role === 'client') {
      userPayload.gateCode = gateCode.trim();
      userPayload.title = 'Family Client';
      userPayload.accountHolder = repName.trim()
        ? {
            name: repName.trim(),
            phone: repPhone.trim() || phone.trim(),
            email: '',
            country: 'Jamaica',
            billingAddress: address.trim(),
            relationshipToPatient: repRelation.trim() || 'Authorized Representative'
          }
        : undefined;
      userPayload.patientBioData = {
        ...(client?.patientBioData || {}),
        dateOfBirth: dateOfBirth || '1955-01-01',
        gender: gender as any,
        residentialAddress: address.trim(),
        zone: zone.trim(),
        knownIllnesses: illnessesList,
        allergies: allergiesList,
        trustedFamilyMember: {
          name: repName.trim() || emergencyContact.trim() || 'Family Caregiver',
          relation: repRelation.trim() || emergencyRelation.trim() || 'Next of Kin',
          phone: repPhone.trim() || emergencyPhone.trim() || phone.trim(),
          photoUrl: client?.repPhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
          canManageCare: true
        },
        medications: client?.patientBioData?.medications || []
      };
    } else if (role === 'nurse') {
      userPayload.title = specialty.trim();
      userPayload.nursingCouncilLicense = nursingCouncilLicense.trim();
      userPayload.driversLicenseNumber = driversLicenseNumber.trim();
      userPayload.medical_info = nurseBio.trim();
    } else if (role === 'admin') {
      userPayload.title = adminTitle.trim();
      userPayload.department = adminDepartment.trim();
      userPayload.staffId = staffId.trim();
    }

    onSave(userPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#1E1B4B] via-[#0F172A] to-[#0A0E1A] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              role === 'admin' 
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
                : role === 'nurse' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                  : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
            }`}>
              {role === 'admin' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : role === 'nurse' ? (
                <Stethoscope className="w-5 h-5" />
              ) : (
                <UserCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>{isEditing ? `Edit Profile: ${client?.name}` : 'Register New User Profile'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  role === 'nurse' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                }`}>
                  {role}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Admin master control: update profile credentials, status, next of kin, and clinical information.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="px-5 pt-3 flex items-center gap-2 bg-black/30 border-b border-white/5">
          <span className="text-[11px] font-bold text-slate-400 mr-2">Account Role:</span>
          {(['client', 'nurse', 'admin'] as UserRole[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 border-t border-x cursor-pointer ${
                role === r 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              {r === 'client' && <User className="w-3.5 h-3.5 text-purple-400" />}
              {r === 'nurse' && <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />}
              {r === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
              <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Status & Clearance Row */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">Approval / Access Status:</span>
              <select
                value={approvalStatus}
                onChange={e => setApprovalStatus(e.target.value as any)}
                className="px-3 py-1 rounded-xl bg-black/80 border border-white/20 text-white text-xs font-bold focus:border-purple-400 outline-none cursor-pointer"
              >
                <option value="approved">Approved / Active</option>
                <option value="pending_approval">Pending Approval (Restricted)</option>
                <option value="rejected">Suspended / Rejected</option>
              </select>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              User ID: {client?.id || 'Auto-generated'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Core Identification */}
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-bold block mb-1">
                Full Legal Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g., Nurse Beverly Campbell, RN or Donna Morris"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. bcampbell_nurse"
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:border-purple-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Telephone Number (+1 876) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(876) 555-0192"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Primary Jamaican Parish</label>
              <select
                value={zone}
                onChange={e => setZone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden cursor-pointer"
              >
                {[
                  'Kingston',
                  'St. Andrew',
                  'St. Catherine',
                  'Clarendon',
                  'Manchester',
                  'St. Elizabeth',
                  'Westmoreland',
                  'Hanover',
                  'St. James',
                  'Trelawny',
                  'St. Ann',
                  'St. Mary',
                  'Portland',
                  'St. Thomas'
                ].map(p => (
                  <option key={p} value={p} className="bg-[#0f0a26] text-white">{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">TRN (Tax Registration #)</label>
              <input
                type="text"
                value={trn}
                onChange={e => setTrn(e.target.value)}
                placeholder="109-847-382"
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:border-purple-400 focus:outline-hidden"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-bold block mb-1">
                Residential Address & Community <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 14 Hope Road, Half-Way-Tree"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium focus:border-purple-400 focus:outline-hidden"
                />
              </div>
            </div>

            {/* ROLE-SPECIFIC SECTIONS */}

            {/* 1. NURSE FIELDS */}
            {role === 'nurse' && (
              <div className="sm:col-span-2 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                <span className="text-emerald-400 font-bold text-xs flex items-center gap-2 uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4" />
                  Clinical Practitioner Credentials &amp; Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">NCJ License # (Nursing Council)</label>
                    <input
                      type="text"
                      value={nursingCouncilLicense}
                      onChange={e => setNursingCouncilLicense(e.target.value)}
                      placeholder="NCJ-RN-2024-XXXX"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Driver's License #</label>
                    <input
                      type="text"
                      value={driversLicenseNumber}
                      onChange={e => setDriversLicenseNumber(e.target.value)}
                      placeholder="DL-JAM-98214-A"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Primary Specialty / Title</label>
                    <select
                      value={specialty}
                      onChange={e => setSpecialty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs cursor-pointer"
                    >
                      <option value="Elderly & Geriatric Home Care">Elderly &amp; Geriatric Home Care</option>
                      <option value="Wound Dressing & Post-Op Recovery">Wound Dressing &amp; Post-Op Recovery</option>
                      <option value="IV Infusion & Injections">IV Infusion &amp; Injections</option>
                      <option value="Palliative & Respite Comfort Care">Palliative &amp; Respite Comfort Care</option>
                      <option value="Pediatric & Newborn Midwifery">Pediatric &amp; Newborn Midwifery</option>
                      <option value="Chronic Illness & Vitals Surveillance">Chronic Illness &amp; Vitals Surveillance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Hourly Rate (JMD)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={e => setHourlyRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Practitioner Bio / Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={nurseBio}
                    onChange={e => setNurseBio(e.target.value)}
                    placeholder="Brief background and clinical experience..."
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {/* 2. ADMIN FIELDS */}
            {role === 'admin' && (
              <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                <span className="text-amber-400 font-bold text-xs flex items-center gap-2 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  Administrator Role &amp; Department Credentials
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Admin Title / Position</label>
                    <input
                      type="text"
                      value={adminTitle}
                      onChange={e => setAdminTitle(e.target.value)}
                      placeholder="e.g. Lead Operations Director"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Department</label>
                    <select
                      value={adminDepartment}
                      onChange={e => setAdminDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs cursor-pointer"
                    >
                      <option value="Clinical Operations">Clinical Operations</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="Patient Services">Patient Services</option>
                      <option value="Finance & Payroll">Finance &amp; Payroll</option>
                      <option value="Executive Management">Executive Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Staff / Employee ID</label>
                    <input
                      type="text"
                      value={staffId}
                      onChange={e => setStaffId(e.target.value)}
                      placeholder="ADM-WC-01"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. CLIENT FIELDS */}
            {role === 'client' && (
              <>
                {/* Gate Code */}
                <div className="sm:col-span-2">
                  <label className="text-amber-300 font-bold block mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Gate Code / Complex Security Access Instructions</span>
                  </label>
                  <input
                    type="text"
                    value={gateCode}
                    onChange={e => setGateCode(e.target.value)}
                    placeholder="e.g. Call guard on arrival / Dial #402 at intercom / Keypad 8821#"
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-100 font-medium focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                {/* Authorized Representative / Next of Kin */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2.5">
                  <span className="text-purple-300 font-bold text-[11px] block uppercase">
                    Authorized Next of Kin / Person Using App on Behalf of Client
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Representative Full Name"
                      value={repName}
                      onChange={e => setRepName(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                    />
                    <input
                      type="tel"
                      placeholder="Representative Phone (+876)"
                      value={repPhone}
                      onChange={e => setRepPhone(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Relationship (e.g. Son, Daughter, Spouse)"
                      value={repRelation}
                      onChange={e => setRepRelation(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Illness Dropdown + Other Box */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-black/40 border border-white/15 space-y-2">
                  <span className="text-slate-300 font-bold text-[11px] block uppercase">
                    Primary Medical Illness / Health Conditions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <select
                        value={knownIllness}
                        onChange={e => setKnownIllness(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white text-xs cursor-pointer"
                      >
                        <option value="Hypertension">Hypertension (High Blood Pressure)</option>
                        <option value="Diabetes Type 2">Diabetes Type 2</option>
                        <option value="Alzheimer's / Dementia">Alzheimer's / Dementia</option>
                        <option value="Arthritis">Arthritis / Mobility Limitation</option>
                        <option value="Post-Op Recovery">Post-Op Recovery</option>
                        <option value="Stroke Recovery">Stroke Recovery</option>
                        <option value="Cardiovascular Condition">Cardiovascular / Heart Condition</option>
                        <option value="Respiratory Condition">Asthma / Respiratory Condition</option>
                        <option value="None">None / General Wellness</option>
                        <option value="Other">Other (Write in text box)</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="If Other or not listed, enter condition here..."
                        value={customIllness}
                        onChange={e => setCustomIllness(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Emergency Contact */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">Emergency Contact Person</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                placeholder="e.g. Michelle Campbell"
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium text-xs"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                placeholder="(876) 555-8910"
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-medium text-xs"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#1E1B4B] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-purple-950/50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{isEditing ? `Save ${role.toUpperCase()} Profile` : `Register ${role.toUpperCase()} Account`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
