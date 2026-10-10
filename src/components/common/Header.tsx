import React, { useState } from 'react';
import { UserRole, LogoVariation, Booking, UserAccount } from '../../types';
import { ADMIN_PROFILE } from '../../data/mockData';
import { soundFX } from '../../utils/soundEffects';
import { Logo } from './Logo';
import { QuickSOSButton } from './QuickSOSButton';
import { ActionDropdown } from './ActionDropdown';
import { 
  ShieldAlert, 
  FileText, 
  Palette, 
  User, 
  ShieldCheck, 
  Stethoscope, 
  Lock, 
  Bell,
  ChevronDown,
  PhoneCall,
  Volume2,
  VolumeX,
  UserPlus,
  Users,
  KeyRound,
  LogIn,
  LogOut,
  Share2,
  Smartphone,
  Fingerprint,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  HardDrive,
  Crown,
  Sparkles,
  Menu,
  ShoppingBag,
  Package
} from 'lucide-react';
import { useNetworkStatus } from '../../utils/offlineSyncManager';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  logoVariation: LogoVariation;
  onOpenLogoStudio: () => void;
  onOpenLaunchKit: () => void;
  onOpenNurseSignUp: () => void;
  onOpenClientSignUp?: () => void;
  onOpenPanic: () => void;
  onOpenShareApp?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  activeBookingCount: number;
  activeBooking?: Booking | null;
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  onTriggerNotification?: (
    type: any,
    title: string,
    description: string,
    bookingId?: string
  ) => void;
  currentUser?: UserAccount;
  isAuthenticated: boolean;
  onOpenAuthModal?: (initialTab?: 'profile' | 'signin' | 'register') => void;
  onSignOut: () => void;
  onOpenTestOnPhone?: () => void;
  onOpenBiometricAuth?: () => void;
  onForceSync?: () => void;
  isMasterAdmin?: boolean;
  onNavigateView?: (view: 'portal' | 'store' | 'admin_orders' | 'admin_store' | 'nurse_signup' | 'admin_qr_generator') => void;
  currentView?: 'portal' | 'store' | 'admin_orders' | 'admin_store' | 'nurse_signup' | 'admin_qr_generator';
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onChangeRole,
  logoVariation,
  onOpenLogoStudio,
  onOpenLaunchKit,
  onOpenNurseSignUp,
  onOpenClientSignUp,
  onOpenPanic,
  onOpenShareApp,
  onOpenNotifications,
  unreadNotificationCount = 0,
  activeBookingCount,
  activeBooking,
  onUpdateBookingStatus,
  onTriggerNotification,
  currentUser,
  isAuthenticated,
  onOpenAuthModal,
  onSignOut,
  onOpenTestOnPhone,
  onOpenBiometricAuth,
  onForceSync,
  isMasterAdmin,
  onNavigateView,
  currentView = 'portal'
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(soundFX.getMuted());
  const [isSyncPopoverOpen, setIsSyncPopoverOpen] = useState(false);
  const { 
    isOnline, 
    isSimulatedOffline, 
    toggleSimulatedOffline, 
    pendingCount, 
    pendingQueue,
    lastSyncedAt 
  } = useNetworkStatus();

  const handleToggleSound = () => {
    const nextMuted = soundFX.toggleMuted();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundFX.playRandomDelightChime();
    }
  };

  const handleManualSync = () => {
    if (onForceSync) {
      onForceSync();
    }
    soundFX.playSuccessPing();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Parish Tag */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div onClick={onOpenLogoStudio} className="cursor-pointer group flex items-center gap-2">
            <Logo variation={logoVariation} size="md" />
          </div>

          {/* Cascading App Tools Dropdown (Integrates Logo Studio, Launch Kit, Test on Phone, Share App) */}
          <ActionDropdown
            label="Tools"
            icon={<Sparkles className="w-4 h-4 text-purple-300" />}
            size="xs"
            variant="secondary"
            hideLabelOnMobile={true}
            items={[
              {
                id: 'tool-logo',
                label: 'Logo Studio',
                sublabel: 'Switch between 3 logo variations',
                icon: <Palette className="w-4 h-4 text-purple-400" />,
                onClick: onOpenLogoStudio
              },
              {
                id: 'tool-launchkit',
                label: '1-Page Launch Kit',
                sublabel: 'Printable operations & protocol PDF',
                icon: <FileText className="w-4 h-4 text-[#C77DFF]" />,
                onClick: onOpenLaunchKit
              },
              ...(onOpenTestOnPhone ? [{
                id: 'tool-phone',
                label: 'Test on Phone',
                sublabel: 'Open private mobile PWA QR pass',
                icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
                onClick: onOpenTestOnPhone
              }] : []),
              ...(onOpenShareApp ? [{
                id: 'tool-share',
                label: 'Share & Earn',
                sublabel: 'Give $500, get $500 care credit',
                icon: <Share2 className="w-4 h-4 text-emerald-400" />,
                badge: '+$500',
                badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                onClick: onOpenShareApp
              }] : [])
            ]}
          />
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Activity Notifications Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-200 border border-white/10 transition"
              title="View live activity notifications stream & sound alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F59E0B] text-white font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Sound & Chimes Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl border backdrop-blur-md text-[11px] font-bold transition flex items-center gap-1.5 ${
              !isMuted 
                ? 'bg-purple-500/20 text-purple-200 border-purple-400/30 hover:bg-purple-500/30' 
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
            title={!isMuted ? 'Sound active (Click to mute)' : 'Sound muted (Click to enable)'}
          >
            {!isMuted ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden xl:inline">Sound</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden xl:inline">Mute</span>
              </>
            )}
          </button>

          {/* Local State & Network Status Indicator */}
          <div className="relative">
            <button
              onClick={() => setIsSyncPopoverOpen(prev => !prev)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border backdrop-blur-md text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 shadow-xs'
              }`}
              title={isOnline ? 'Online • Synchronized' : 'Offline • Saving to localStorage'}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isOnline ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </span>
              <span className="hidden sm:inline">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 text-[9px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
            {/* Offline Sync Popover Dropdown */}
            {isSyncPopoverOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 sm:w-80 p-4 rounded-2xl bg-[#140622]/98 border border-white/15 backdrop-blur-2xl shadow-2xl text-white z-50 animate-fadeIn space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    <span className="text-xs font-black uppercase tracking-wider">
                      {isOnline ? 'Online & Synchronized' : 'Offline Mode (Local Storage)'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSyncPopoverOpen(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed">
                  {isOnline ? (
                    <p className="flex items-start gap-1.5 text-emerald-200">
                      <Wifi className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Live connectivity verified. Clinical notes, vitals, and visit check-ins are actively synced in real time.</span>
                    </p>
                  ) : (
                    <p className="flex items-start gap-1.5 text-amber-200">
                      <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Currently operating offline. Clinical notes and doorstep visit check-ins are saved directly to <strong>localStorage</strong> and queued for automatic state synchronization.</span>
                    </p>
                  )}
                </div>

                {/* Queue Summary */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-purple-300" />
                    <span className="text-slate-300 text-[11px]">Queued offline actions:</span>
                  </div>
                  <span className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                    pendingCount > 0 
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {pendingCount} pending
                  </span>
                </div>

                {pendingCount > 0 && (
                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                    {pendingQueue.map((item) => (
                      <div key={item.id} className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] flex items-center justify-between">
                        <span className="capitalize text-slate-200 font-bold">
                          {String(item?.actionType || 'action').replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-400 font-mono">#{item.bookingId}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Controls */}
                {pendingCount > 0 && isOnline && (
                  <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                    <button
                      onClick={handleManualSync}
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Push &amp; Synchronize Now</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Booking Quick-SOS Instant Button */}
          {activeBooking && (
            <QuickSOSButton
              booking={activeBooking}
              userRole={currentRole as 'nurse' | 'client' | 'admin'}
              onUpdateBookingStatus={onUpdateBookingStatus}
              onTriggerNotification={onTriggerNotification}
              size="sm"
              showArrivalAutoNotifyBadge={true}
            />
          )}

          {/* 119 Emergency Panic Button (Compact) */}
          <button
            onClick={onOpenPanic}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-red-600 text-white text-[11px] font-extrabold shadow-sm border border-red-400/30 transition group cursor-pointer"
            title="Immediate Speed Dial to 119 Emergency Dispatch"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden xs:inline">119</span>
          </button>

          {/* Public Medical Supplies Store (/store) */}
          <button
            onClick={() => onNavigateView?.(currentView === 'store' ? 'portal' : 'store')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition shadow-xs cursor-pointer ${
              currentView === 'store'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-emerald-950/40'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
            }`}
            title="Public Medical Supplies Store (/store)"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentView === 'store' ? 'Dashboard' : 'Store'}</span>
          </button>

          {/* Admin Supply Orders Manager (/admin/orders) */}
          {(isMasterAdmin || currentRole === 'admin') && (
            <button
              onClick={() => onNavigateView?.(currentView === 'admin_orders' ? 'portal' : 'admin_orders')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition shadow-xs cursor-pointer ${
                currentView === 'admin_orders'
                  ? 'bg-purple-600 text-white border-purple-400 font-black shadow-purple-950/40'
                  : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/30'
              }`}
              title="Admin Supply Orders Management (/admin/orders)"
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Orders</span>
            </button>
          )}

          {/* Admin Marketing QR Ad Flyers (/admin/qr-generator) */}
          {(isMasterAdmin || currentRole === 'admin') && (
            <button
              onClick={() => onNavigateView?.(currentView === 'admin_qr_generator' ? 'portal' : 'admin_qr_generator')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition shadow-xs cursor-pointer ${
                currentView === 'admin_qr_generator'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-amber-950/40'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
              }`}
              title="Public Marketing QR Code Ad Flyers (/admin/qr-generator)"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Ad QR Flyers</span>
            </button>
          )}

          {/* AUTHENTICATED USER CONTROLS */}
          {isAuthenticated ? (
            <>
              {/* Role Indicator Badge (Role Switcher is housed in left sidebar for spacious UX) */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-[11px] font-bold text-white shadow-xs">
                {currentRole === 'client' && <User className="w-3.5 h-3.5 text-blue-400" />}
                {currentRole === 'nurse' && <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />}
                {currentRole === 'admin' && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                <span className="capitalize">{currentRole === 'admin' ? 'Admin' : currentRole === 'nurse' ? 'Nurse' : 'Client'}</span>
              </div>

              {/* User Profile & Account Authentication Button */}
              {currentUser && onOpenAuthModal && (
                <button
                  onClick={() => onOpenAuthModal('profile')}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-white transition group cursor-pointer"
                  title={`Logged in as ${currentUser.name} (@${currentUser.username})`}
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-lg object-cover border border-purple-400"
                  />
                  <span className="hidden md:inline text-[11px] font-bold text-white">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <KeyRound className="w-3 h-3 text-[#C77DFF] opacity-70 group-hover:opacity-100 transition" />
                </button>
              )}

              {/* Sign Out Button */}
              <button
                onClick={onSignOut}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-white border border-red-500/30 text-[11px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            /* UNAUTHENTICATED GUEST ACTIONS - Clean Cascading Dropdown */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ActionDropdown
                label="Explore"
                icon={<Sparkles className="w-4 h-4 text-purple-300" />}
                size="xs"
                variant="purple"
                items={[
                  {
                    id: 'guest-nurse-signup',
                    label: 'Nurse Sign Up',
                    sublabel: 'Earn 85% net as verified home nurse',
                    icon: <UserPlus className="w-4 h-4 text-[#C77DFF]" />,
                    badge: '85%',
                    badgeColor: 'bg-emerald-400 text-slate-950 font-black',
                    onClick: onOpenNurseSignUp
                  },
                  ...(onOpenClientSignUp ? [{
                    id: 'guest-patient-signup',
                    label: 'Patient Sign Up',
                    sublabel: 'Family caregiver & patient account',
                    icon: <User className="w-4 h-4 text-[#C77DFF]" />,
                    onClick: onOpenClientSignUp
                  }] : []),
                  ...(onOpenBiometricAuth ? [{
                    id: 'guest-passkey',
                    label: 'Biometric Passkey',
                    sublabel: 'Sign in with Touch ID / Face ID',
                    icon: <Fingerprint className="w-4 h-4 text-emerald-400" />,
                    onClick: onOpenBiometricAuth
                  }] : [])
                ]}
              />

              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('signin')}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/20 backdrop-blur-md transition flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-purple-300" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                className="px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-r from-[#1E1B4B] to-[#F59E0B] hover:opacity-95 text-white text-[11px] font-extrabold shadow-sm transition flex items-center gap-1 cursor-pointer"
              >
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
