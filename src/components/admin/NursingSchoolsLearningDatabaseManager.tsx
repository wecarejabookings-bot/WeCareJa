import React, { useState } from 'react';
import { NursingSchool } from '../../types';
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface NursingSchoolsLearningDatabaseManagerProps {
  schools?: NursingSchool[];
  onApproveSchool: (schoolId: string) => void;
  onRejectSchool: (schoolId: string) => void;
  onAddSchool: (newSchool: NursingSchool) => void;
}

export const NursingSchoolsLearningDatabaseManager: React.FC<NursingSchoolsLearningDatabaseManagerProps> = ({
  schools = [],
  onApproveSchool,
  onRejectSchool,
  onAddSchool
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedParish, setSelectedParish] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New School Form State
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolShort, setNewSchoolShort] = useState('');
  const [newSchoolCategory, setNewSchoolCategory] = useState<NursingSchool['category']>('college');
  const [newSchoolParish, setNewSchoolParish] = useState('St. Andrew');
  const [newSchoolAccreditation, setNewSchoolAccreditation] = useState('Nursing Council of Jamaica (NCJ)');
  const [newSchoolNotes, setNewSchoolNotes] = useState('');

  const pendingSchools = (schools || []).filter((s) => s && s.status === 'pending_approval');
  const approvedSchools = (schools || []).filter((s) => s && s.status === 'approved');

  // Filter approved schools
  const filteredApprovedSchools = approvedSchools.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.shortName && s.shortName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.parish.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesParish = selectedParish === 'all' || s.parish === selectedParish;
    return matchesSearch && matchesCat && matchesParish;
  });

  const handleApprove = (schoolId: string) => {
    onApproveSchool(schoolId);
    soundFX.playSuccessPing();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#1E1B4B', '#10B981', '#FFD166']
    });
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    const newSchool: NursingSchool = {
      id: `sch-${Date.now()}`,
      name: newSchoolName.trim(),
      shortName: newSchoolShort.trim() || undefined,
      category: newSchoolCategory,
      parish: newSchoolParish,
      status: 'approved',
      accreditedBy: newSchoolAccreditation,
      approvedAt: new Date().toISOString(),
      notes: newSchoolNotes.trim()
    };

    onAddSchool(newSchool);
    soundFX.playSuccessPing();
    setIsAddModalOpen(false);
    setNewSchoolName('');
    setNewSchoolShort('');
    setNewSchoolNotes('');
  };

  const categoryLabels = {
    university: 'University (BSN / MScN)',
    college: 'Community College / Nursing School',
    vocational: 'HEART/NSTA Trust Academy',
    private_institute: 'Private Healthcare Institute',
    other: 'Other Certified Institution'
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-purple-600/20 to-teal-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-[#C77DFF] border border-purple-500/40">
                Self-Learning Education Directory
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {approvedSchools.length} Approved Institutions Active
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Nursing Schools &amp; Accredited Institutions Database
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              When nurses or caregivers submit unlisted schools during registration, they enter the pending verification queue. Once approved by the administrator, the school is automatically added to the master dropdown for all future applicants across Jamaica.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 hover:from-purple-600 hover:to-[#1E1B4B] text-white font-bold text-xs shadow-lg shadow-purple-950/60 border border-purple-400/40 transition flex items-center gap-2 shrink-0 self-start md:self-center"
          >
            <Plus className="w-4 h-4 text-[#C77DFF]" />
            <span>Add Accredited School</span>
          </button>
        </div>

        {/* 3 Quick Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">Pending Approval</span>
              <span className="text-2xl font-black text-white font-mono">{pendingSchools.length}</span>
            </div>
            <Clock className="w-6 h-6 text-amber-400" />
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">Approved Directory</span>
              <span className="text-2xl font-black text-white font-mono">{approvedSchools.length}</span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">Total Recorded</span>
              <span className="text-2xl font-black text-white font-mono">{schools.length}</span>
            </div>
            <Building2 className="w-6 h-6 text-[#C77DFF]" />
          </div>
        </div>
      </div>

      {/* SECTION 1: PENDING APPROVALS QUEUE */}
      {pendingSchools.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-amber-200">
              Pending Nursing Schools Awaiting Admin Approval ({pendingSchools.length})
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            These institutions were entered by applicant nurses/caregivers during registration because they were not found in the initial list. Approving them immediately integrates them into the live database.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {pendingSchools.map((school) => (
              <div
                key={school.id}
                className="p-5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-3 text-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-white text-sm block">{school.name}</span>
                    <span className="text-xs text-amber-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> Parish: {school.parish} • {categoryLabels[school.category]}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 uppercase">
                    Review Required
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1 text-slate-300">
                  {school.submittedByNurseName && (
                    <div>
                      <strong className="text-white">Submitted by:</strong> {school.submittedByNurseName}
                    </div>
                  )}
                  {school.submittedAt && (
                    <div>
                      <strong className="text-white">Date Submitted:</strong>{' '}
                      {new Date(school.submittedAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </div>
                  )}
                  {school.notes && (
                    <div>
                      <strong className="text-white">Notes:</strong> {school.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onRejectSchool(school.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(school.id)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-950/50 transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve &amp; Add to Master Signup List</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: APPROVED INSTITUTIONS MASTER DIRECTORY */}
      <div className="p-6 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white">Master Accredited Institutions Directory</h3>
            <p className="text-xs text-slate-300">
              Active in the nurse registration dropdown across all parishes in Jamaica.
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredApprovedSchools.length} of {approvedSchools.length} Approved
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search school name or parish..."
              className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex items-center gap-2 bg-black/40 border border-white/15 px-3 py-2 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full"
            >
              <option value="all" className="bg-[#170826]">All Categories</option>
              <option value="university" className="bg-[#170826]">Universities (NCU, UWI, UTech)</option>
              <option value="college" className="bg-[#170826]">Community Colleges (ExEd, KSN, Knox)</option>
              <option value="vocational" className="bg-[#170826]">HEART/NSTA Trust Academies</option>
              <option value="private_institute" className="bg-[#170826]">Private Healthcare Institutes</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-black/40 border border-white/15 px-3 py-2 rounded-xl text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedParish}
              onChange={(e) => setSelectedParish(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full"
            >
              <option value="all" className="bg-[#170826]">All Parishes</option>
              <option value="Kingston" className="bg-[#170826]">Kingston</option>
              <option value="St. Andrew" className="bg-[#170826]">St. Andrew</option>
              <option value="St. Catherine" className="bg-[#170826]">St. Catherine</option>
              <option value="Manchester" className="bg-[#170826]">Manchester (Mandeville)</option>
              <option value="St. Ann" className="bg-[#170826]">St. Ann</option>
              <option value="Westmoreland" className="bg-[#170826]">Westmoreland</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {filteredApprovedSchools.map((school) => (
            <div
              key={school.id}
              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-purple-500/40 transition space-y-2.5 text-white"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-white leading-tight block">
                      {school.name}
                    </span>
                    {school.shortName && (
                      <span className="text-[10px] text-purple-300 font-mono">
                        {school.shortName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-purple-400" /> {school.parish}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-200">
                  {categoryLabels[school.category]}
                </span>
              </div>

              {school.accreditedBy && (
                <div className="text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{school.accreditedBy}</span>
                </div>
              )}

              {school.notes && (
                <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                  {school.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD ACCREDITED SCHOOL DIRECTLY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="bg-[#170826] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-[#C77DFF]" />
                <h4 className="font-black text-base text-white">Add Accredited Nursing School</h4>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Official Institution Full Name</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="e.g. Northern Caribbean University (NCU)"
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Abbreviation / Short Name</label>
                  <input
                    type="text"
                    value={newSchoolShort}
                    onChange={(e) => setNewSchoolShort(e.target.value)}
                    placeholder="e.g. NCU Nursing"
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newSchoolCategory}
                    onChange={(e) => setNewSchoolCategory(e.target.value as NursingSchool['category'])}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none"
                  >
                    <option value="university" className="bg-[#170826]">University (BSN)</option>
                    <option value="college" className="bg-[#170826]">Community College</option>
                    <option value="vocational" className="bg-[#170826]">HEART/NSTA Trust</option>
                    <option value="private_institute" className="bg-[#170826]">Private Institute</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Parish</label>
                  <select
                    value={newSchoolParish}
                    onChange={(e) => setNewSchoolParish(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none"
                  >
                    <option value="Kingston" className="bg-[#170826]">Kingston</option>
                    <option value="St. Andrew" className="bg-[#170826]">St. Andrew</option>
                    <option value="St. Catherine" className="bg-[#170826]">St. Catherine</option>
                    <option value="Manchester" className="bg-[#170826]">Manchester</option>
                    <option value="St. Ann" className="bg-[#170826]">St. Ann</option>
                    <option value="Westmoreland" className="bg-[#170826]">Westmoreland</option>
                    <option value="St. James" className="bg-[#170826]">St. James</option>
                    <option value="Clarendon" className="bg-[#170826]">Clarendon</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Accrediting Authority</label>
                  <input
                    type="text"
                    value={newSchoolAccreditation}
                    onChange={(e) => setNewSchoolAccreditation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Program Notes</label>
                <textarea
                  rows={2}
                  value={newSchoolNotes}
                  onChange={(e) => setNewSchoolNotes(e.target.value)}
                  placeholder="e.g. Practical Nursing and BSN degree tracks with clinical rotations."
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-purple-600 text-white font-extrabold shadow-md shadow-purple-950/50"
                >
                  Save &amp; Publish School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
