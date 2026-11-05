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
  Package,
  Video,
  Play,
  Search,
  QrCode
} from 'lucide-react';
import { useNetworkStatus } from '../../utils/offlineSyncManager';
import { getDisplayName, getProfileDropdownLabel } from '../../utils/privacy';

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
  onNavigateView?: (view: 'portal' | 'store' | 'admin_orders' | 'admin_store' | 'nurse_signup' | 'admin_qr_generator' | 'admin_users' | 'admin_topics' | 'auth') => void;
  currentView?: 'portal' | 'store' | 'admin_orders' | 'admin_store' | 'nurse_signup' | 'admin_qr_generator' | 'admin_users' | 'admin_topics' | 'auth';
  onOpenHowItWorks?: () => void;
  onOpenProcedures?: () => void;
  onOpenVideoTutorial?: () => void;
  onOpenSearch?: () => void;
  onOpenQRGuide?: () => void;
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
  currentView = 'portal',
  onOpenHowItWorks,
  onOpenProcedures,
  onOpenVideoTutorial,
  onOpenSearch,
  onOpenQRGuide
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

  const isAdmin = isAuthenticated && (currentRole === 'admin' || !!isMasterAdmin);

  const handleProceduresClick = () => {
    if (onOpenProcedures) {
      onOpenProcedures();
      return;
    }
    const el = document.getElementById('clinical_services') || document.querySelector('[data-topic-id="clinical_services"]') || document.getElementById('topics-directory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onNavigateView?.('portal');
    }
  };

  const handleHowItWorksClick = () => {
    if (onOpenHowItWorks) {
      onOpenHowItWorks();
      return;
    }
    const el = document.getElementById('how_it_works') || document.querySelector('[data-topic-id="how_it_works"]');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onOpenLaunchKit();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1A1E4E]/95 backdrop-blur-xl border-b border-[#3B82F6]/25 shadow-lg shadow-[#1A1E4E]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Parish Tag */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div onClick={onOpenLogoStudio} className="cursor-pointer group flex items-center gap-2">
            <Logo variation={logoVariation} size="md" subtext="HOME NURSING" />
          </div>

          {/* Quick In-App Feature Search Bar */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 hover:border-amber-400/40 text-slate-300 text-xs transition cursor-pointer group shadow-inner"
              title="Search all features, clinical procedures, tools (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition" />
              <span className="hidden md:inline text-slate-300 font-medium">Search features...</span>
              <kbd className="hidden lg:inline-flex items-center px-1 py-0.5 text-[9px] font-mono font-bold bg-white/10 border border-white/15 rounded text-slate-400 group-hover:text-amber-300">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Cascading App Tools Dropdown - ONLY for Admin */}
          {isAdmin && (
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
          )}
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Activity Notifications Bell (Logged-In Users Only) */}
          {isAuthenticated && onOpenNotifications && (
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

          {/* Sound & Chimes Toggle - ONLY for Admin */}
          {isAdmin && (
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
          )}

          {/* Local State & Network Status Indicator - ONLY for Admin */}
          {isAdmin && (
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
          )}

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

          {/* 119 Emergency Panic Button (Always Visible) */}
          <button
            onClick={onOpenPanic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md border border-red-400/40 transition group cursor-pointer shrink-0"
            title="Immediate Speed Dial to 119 Emergency Dispatch"
          >
            <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            <span>SOS 119</span>
          </button>

          {/* Medical Supplies Store (/store) - Rendered for Authenticated Users */}
          {isAuthenticated && (
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
          )}

          {/* Admin Supply Orders Manager (/admin/orders) - ONLY for Admin */}
          {isAdmin && (
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

          {/* Admin User Management (/admin/users) - ONLY for Admin */}
          {isAdmin && (
            <button
              onClick={() => onNavigateView?.(currentView === 'admin_users' ? 'portal' : 'admin_users')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition shadow-xs cursor-pointer ${
                currentView === 'admin_users'
                  ? 'bg-blue-600 text-white border-blue-400 font-black shadow-blue-950/40'
                  : 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30'
              }`}
              title="Admin User Management (/admin/users)"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Manage Users</span>
            </button>
          )}

          {/* Admin Topics Directory & Homepage CMS (/admin/topics) - ONLY for Admin */}
          {isAdmin && (
            <button
              onClick={() => onNavigateView?.(currentView === 'admin_topics' ? 'portal' : 'admin_topics')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition shadow-xs cursor-pointer ${
                currentView === 'admin_topics'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 font-black shadow-blue-950/40'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
              }`}
              title="Manage Topics Directory (#01-#10) and Homepage CMS (/admin/topics)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">Topics Directory</span>
            </button>
          )}

          {/* Admin Marketing QR Ad Flyers (/admin/qr-generator) - ONLY for Admin */}
          {isAdmin && (
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
              {/* Video Tour Quick Button */}
              {onOpenVideoTutorial && (
                <button
                  type="button"
                  onClick={onOpenVideoTutorial}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition shadow-xs cursor-pointer bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30"
                  title="Watch App Video Walkthrough"
                >
                  <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="hidden lg:inline">Video Tour</span>
                </button>
              )}

              {/* Easy QR Check-in Quick Button */}
              {onOpenQRGuide && (
                <button
                  type="button"
                  onClick={onOpenQRGuide}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition shadow-xs cursor-pointer bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30"
                  title="Easy QR Doorstep Check-in Guide"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden lg:inline">QR Guide</span>
                </button>
              )}

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
                  title={`Logged in as ${getDisplayName(currentUser, currentUser)} (@${currentUser.username})`}
                >
                  <img loading="lazy" decoding="async"
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={getDisplayName(currentUser, currentUser)}
                    className="w-6 h-6 rounded-lg object-cover border border-purple-400"
                  />
                  <span className="hidden md:inline text-[11px] font-bold text-white">
                    {getProfileDropdownLabel(currentUser, currentUser)}
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
            /* PUBLIC NAVIGATION ONLY FOR LOGGED-OUT USERS */
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handleProceduresClick}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer whitespace-nowrap"
              >
                Procedures
              </button>
              <button
                type="button"
                onClick={() => onNavigateView?.('store')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer whitespace-nowrap"
              >
                Medical Store
              </button>
              <button
                type="button"
                onClick={handleHowItWorksClick}
                className="hidden md:inline-flex px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer whitespace-nowrap"
              >
                How It Works
              </button>
              {onOpenVideoTutorial && (
                <button
                  type="button"
                  onClick={onOpenVideoTutorial}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition cursor-pointer whitespace-nowrap"
                  title="Watch 3-minute Video Tour"
                >
                  <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Video Tour</span>
                </button>
              )}
              {onOpenQRGuide && (
                <button
                  type="button"
                  onClick={onOpenQRGuide}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-blue-300 hover:text-white hover:bg-white/10 transition cursor-pointer whitespace-nowrap"
                  title="Easy QR Doorstep Check-in Guide"
                >
                  <QrCode className="w-3 h-3 text-amber-400" />
                  <span>QR Guide</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenNurseSignUp}
                className="hidden sm:inline-flex px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 transition cursor-pointer whitespace-nowrap"
              >
                Join as Nurse
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal('signin')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-300" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs shadow-md shadow-amber-950/40 hover:scale-[1.02] transition cursor-pointer whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
