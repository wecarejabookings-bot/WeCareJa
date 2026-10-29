import React, { useState, useRef, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  ChevronDown, 
  ExternalLink, 
  Copy, 
  Check, 
  Compass, 
  Car
} from 'lucide-react';
import { 
  getGoogleMapsUrl, 
  getAppleMapsUrl, 
  getWazeUrl, 
  resolveLocationCoordinates, 
  openInDeviceMaps 
} from '../../utils/navigationMaps';
import { soundFX } from '../../utils/soundEffects';

export interface NavigateToLocationButtonProps {
  address: string;
  zone?: string;
  lat?: number;
  lng?: number;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'primary' | 'secondary' | 'subtle' | 'compact';
  label?: string;
  className?: string;
  showDropdown?: boolean;
}

export const NavigateToLocationButton: React.FC<NavigateToLocationButtonProps> = ({
  address,
  zone,
  lat,
  lng,
  size = 'sm',
  variant = 'primary',
  label = 'Maps',
  className = '',
  showDropdown = true
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const coords = resolveLocationCoordinates(address, zone, lat, lng);
  const googleMapsUrl = getGoogleMapsUrl(address, zone, lat, lng);
  const appleMapsUrl = getAppleMapsUrl(address, zone, lat, lng);
  const wazeUrl = getWazeUrl(address, zone, lat, lng);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handlePrimaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    openInDeviceMaps(address, zone, lat, lng);
  };

  const handleCopyCoords = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const coordString = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    const fullLocationString = `${address}, ${zone || 'Kingston'}, Jamaica (${coordString})`;
    try {
      await navigator.clipboard.writeText(fullLocationString);
      setCopied(true);
      soundFX.playSuccessPing();
      setTimeout(() => setCopied(false), 2500);
      setIsMenuOpen(false);
    } catch {
      // fallback
    }
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px] rounded-lg gap-1',
    sm: 'px-2.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-3.5 py-2 text-xs font-bold rounded-xl gap-2'
  }[size];

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-950/30 border border-blue-400/40',
    secondary: 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 backdrop-blur-md',
    subtle: 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-400/30',
    compact: 'bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30'
  }[variant];

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* Main button to launch Maps */}
      <button
        type="button"
        onClick={handlePrimaryClick}
        className={`inline-flex items-center font-bold transition-all cursor-pointer ${sizeClasses} ${variantClasses} ${
          showDropdown ? 'rounded-r-none border-r-0' : ''
        }`}
        title={`Open turn-by-turn directions to ${address} in device Maps`}
      >
        <Navigation className="w-3.5 h-3.5 text-cyan-300 animate-pulse shrink-0" />
        <span className="whitespace-nowrap">{label}</span>
      </button>

      {/* Dropdown toggle for specific apps (Google Maps / Apple Maps / Waze / Copy Coords) */}
      {showDropdown && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`inline-flex items-center justify-center p-1.5 text-xs rounded-r-xl transition cursor-pointer border ${variantClasses} border-l-white/20`}
          title="Choose navigation provider (Google Maps, Apple Maps, Waze, GPS Coordinates)"
          aria-expanded={isMenuOpen}
        >
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Maps Provider Picker Dropdown Menu */}
      {isMenuOpen && (
        <div 
          className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl bg-[#170829]/95 backdrop-blur-xl border border-white/20 shadow-2xl p-2 z-50 animate-fadeIn text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 mb-1 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="truncate">{zone || 'Destination'}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              GPS: {coords.lat.toFixed(4)}°N, {Math.abs(coords.lng).toFixed(4)}°W
            </div>
          </div>

          <div className="space-y-0.5 text-xs">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                soundFX.playClick();
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition group"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
                  G
                </span>
                <div>
                  <span className="font-semibold block leading-tight">Google Maps</span>
                  <span className="text-[10px] text-slate-400">Live traffic &amp; routing</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </a>

            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                soundFX.playClick();
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition group"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black">
                  A
                </span>
                <div>
                  <span className="font-semibold block leading-tight">Apple Maps</span>
                  <span className="text-[10px] text-slate-400">iOS turn-by-turn</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </a>

            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                soundFX.playClick();
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition group"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-black">
                  W
                </span>
                <div>
                  <span className="font-semibold block leading-tight">Waze</span>
                  <span className="text-[10px] text-slate-400">Community road alerts</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </a>

            <button
              type="button"
              onClick={handleCopyCoords}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition text-left cursor-pointer border-t border-white/5 mt-1 pt-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Copy className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-semibold block leading-tight">
                    {copied ? 'Copied to Clipboard!' : 'Copy Coordinates & Address'}
                  </span>
                  <span className="text-[10px] text-slate-400">For GPS navigator / taxi</span>
                </div>
              </div>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : null}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
