import React, { useState } from 'react';
import { UserRole } from '../../types';
import { 
  User, 
  Stethoscope, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface LeftRoleSidebarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isMasterAdmin: boolean;
  userName?: string;
}

export const LeftRoleSidebar: React.FC<LeftRoleSidebarProps> = ({
  currentRole,
  onChangeRole,
  isMasterAdmin,
  userName = 'Sydney Mattis'
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSelect = (role: UserRole) => {
    soundFX.playStepComplete();
    onChangeRole(role);
  };

  return (
    <aside 
      aria-label="Role Switcher Sidebar"
      className={`fixed left-2 sm:left-4 top-24 z-40 transition-all duration-300 select-none ${
        isCollapsed ? 'w-11 sm:w-12' : 'w-44 sm:w-48'
      }`}
    >
      <div className="bg-[#1E1B4B]/95 backdrop-blur-xl border border-blue-400/30 rounded-2xl shadow-2xl p-2 sm:p-2.5 text-white flex flex-col gap-2">
        {/* Header / Collapse Toggle */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 px-1">
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 truncate">
                Role View
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition ml-auto cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Role Options */}
        <div className="flex flex-col gap-1.5">
          {/* Client Role */}
          <button
            type="button"
            onClick={() => handleSelect('client')}
            className={`w-full p-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              currentRole === 'client'
                ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-950/50 border border-blue-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-transparent'
            }`}
            title="Client Portal (Bookings & Vitals)"
          >
            <User className={`w-4 h-4 shrink-0 ${currentRole === 'client' ? 'text-white' : 'text-blue-300'}`} />
            {!isCollapsed && <span className="truncate">Client Portal</span>}
          </button>

          {/* Nurse Role */}
          <button
            type="button"
            onClick={() => handleSelect('nurse')}
            className={`w-full p-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              currentRole === 'nurse'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50 border border-emerald-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-transparent'
            }`}
            title="Nurse & Caregiver Portal"
          >
            <Stethoscope className={`w-4 h-4 shrink-0 ${currentRole === 'nurse' ? 'text-white' : 'text-emerald-300'}`} />
            {!isCollapsed && <span className="truncate">Nurse Portal</span>}
          </button>

          {/* Admin Role */}
          <button
            type="button"
            onClick={() => handleSelect('admin')}
            className={`w-full p-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-950/50 border border-amber-300 font-extrabold'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-transparent'
            }`}
            title="Admin Command Centre"
          >
            <ShieldCheck className={`w-4 h-4 shrink-0 ${currentRole === 'admin' ? 'text-slate-950' : 'text-amber-400'}`} />
            {!isCollapsed && <span className="truncate">Admin Centre</span>}
          </button>
        </div>

        {/* Bottom subtle indicator */}
        {!isCollapsed && isMasterAdmin && (
          <div className="pt-1.5 border-t border-white/10 text-[9px] text-blue-200/80 px-1 truncate flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span className="truncate font-mono">{userName}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
