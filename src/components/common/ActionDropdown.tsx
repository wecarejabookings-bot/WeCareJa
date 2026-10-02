import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ActionDropdownItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  variant?: 'default' | 'danger' | 'success' | 'amber';
  disabled?: boolean;
  divider?: boolean;
  onClick: () => void;
}

export interface ActionDropdownProps {
  label: string;
  icon: React.ReactNode;
  items: ActionDropdownItem[];
  variant?: 'primary' | 'secondary' | 'emerald' | 'purple' | 'amber' | 'subtle' | 'outline' | 'tab' | 'activeTab';
  size?: 'xs' | 'sm' | 'md';
  align?: 'left' | 'right';
  badge?: string | number;
  className?: string;
  title?: string;
  hideLabelOnMobile?: boolean;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  label,
  icon,
  items,
  variant = 'secondary',
  size = 'sm',
  align = 'left',
  badge,
  className = '',
  title,
  hideLabelOnMobile = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sizeClasses = {
    xs: 'px-2 py-1 text-[10px] gap-1',
    sm: 'px-2.5 py-1.5 text-[11px] gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#1E1B4B] to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white border border-purple-400/40 shadow-sm',
    secondary: 'bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 shadow-xs',
    emerald: 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 shadow-xs',
    purple: 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 shadow-xs',
    amber: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 shadow-xs',
    subtle: 'bg-black/30 hover:bg-black/50 text-slate-300 hover:text-white border border-white/10',
    outline: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-white/15',
    tab: 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5',
    activeTab: 'bg-[#1E1B4B] text-white shadow-md shadow-purple-950/50 border border-purple-400/40'
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`rounded-xl font-bold transition flex items-center justify-between cursor-pointer select-none backdrop-blur-md ${sizeClasses[size]} ${variantClasses[variant]}`}
        title={title || label}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="shrink-0 text-current">{icon}</span>
          <span className={`truncate font-semibold tracking-tight ${hideLabelOnMobile ? 'hidden sm:inline' : ''}`}>{label}</span>
          {badge !== undefined && (
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 text-[9px] font-black shrink-0">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 shrink-0 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1.5 min-w-[210px] p-1.5 rounded-2xl bg-[#140622]/98 border border-purple-500/30 shadow-2xl backdrop-blur-2xl z-50 animate-fadeIn space-y-0.5`}
        >
          {items.map((item) => {
            const isDanger = item.variant === 'danger';
            const isSuccess = item.variant === 'success';
            const isAmber = item.variant === 'amber';

            return (
              <React.Fragment key={item.id}>
                {item.divider && <div className="my-1 border-t border-white/10" />}
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    setIsOpen(false);
                    item.onClick();
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition flex items-center justify-between gap-2.5 cursor-pointer ${
                    item.disabled
                      ? 'opacity-40 cursor-not-allowed text-slate-500'
                      : isDanger
                      ? 'hover:bg-red-500/20 text-red-300 hover:text-red-200'
                      : isSuccess
                      ? 'hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200'
                      : isAmber
                      ? 'hover:bg-amber-500/20 text-amber-300 hover:text-amber-200'
                      : 'hover:bg-white/10 text-slate-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0 text-slate-300">{item.icon}</span>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold leading-tight truncate">
                        {item.label}
                      </span>
                      {item.sublabel && (
                        <span className="block text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                          {item.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                        item.badgeColor || 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
