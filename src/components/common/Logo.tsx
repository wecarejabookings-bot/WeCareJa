import React from 'react';
import { LogoVariation } from '../../types';

interface LogoProps {
  variation?: LogoVariation;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtext?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variation = 'heart-cross',
  size = 'md',
  showText = true,
  className = '',
  subtext = 'Kingston & St Andrew'
}) => {
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const renderIcon = () => {
    switch (variation) {
      case 'heart-cross':
        return (
          <svg
            viewBox="0 0 100 100"
            className={`${sizeClasses[size]} shrink-0 drop-shadow-sm`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="heartCrossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="50%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>
              <filter id="shadow1" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#7C3AED" floodOpacity="0.4" />
              </filter>
            </defs>
            {/* Heart Background */}
            <path
              d="M50 88C50 88 15 65 15 36C15 22 25 12 37 12C44 12 48 16 50 20C52 16 56 12 63 12C75 12 85 22 85 36C85 65 50 88 50 88Z"
              fill="url(#heartCrossGrad)"
            />
            {/* Medical Cross Overlay inside Heart */}
            <rect x="44" y="27" width="12" height="34" rx="4" fill="#FFFFFF" />
            <rect x="33" y="38" width="34" height="12" rx="4" fill="#FFFFFF" />
            {/* Purple Accent Center (#7C3AED) */}
            <circle cx="50" cy="44" r="3.5" fill="#7C3AED" />
          </svg>
        );

      case 'hands-heart':
        return (
          <svg
            viewBox="0 0 100 100"
            className={`${sizeClasses[size]} shrink-0 drop-shadow-sm`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="handsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7209B7" />
                <stop offset="100%" stopColor="#5A0694" />
              </linearGradient>
              <linearGradient id="heartGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF4D6D" />
                <stop offset="100%" stopColor="#E63946" />
              </linearGradient>
            </defs>
            {/* Cradling Left Hand / Care Wing */}
            <path
              d="M18 72C18 72 26 50 42 58C36 68 28 82 18 82C12 82 10 76 18 72Z"
              fill="url(#handsGrad)"
              opacity="0.9"
            />
            <path
              d="M12 60C22 52 38 60 44 74C34 78 20 84 12 78C8 74 8 64 12 60Z"
              fill="#7209B7"
            />
            {/* Cradling Right Hand */}
            <path
              d="M82 72C82 72 74 50 58 58C64 68 72 82 82 82C88 82 90 76 82 72Z"
              fill="url(#handsGrad)"
              opacity="0.9"
            />
            <path
              d="M88 60C78 52 62 60 56 74C66 78 80 84 88 78C92 74 92 64 88 60Z"
              fill="#7209B7"
            />
            {/* Heart resting securely between hands */}
            <path
              d="M50 68C50 68 26 48 26 30C26 20 33 13 41 13C46 13 49 16 50 19C51 16 54 13 59 13C67 13 74 20 74 30C74 48 50 68 50 68Z"
              fill="url(#heartGradRed)"
            />
            {/* Inner gentle pulse line */}
            <path
              d="M40 31L46 31L48 26L52 36L54 31L60 31"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'icon-appstore':
        return (
          <div
            className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-[#7209B7] via-[#9D4EDD] to-[#E63946] p-1.5 shadow-md flex items-center justify-center shrink-0 border border-white/20`}
          >
            <svg
              viewBox="0 0 64 64"
              className="w-full h-full text-white"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stylized Modern W with Heart pulse curvature */}
              <path
                d="M12 18L22 46L32 26L42 46L52 18"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="32" cy="18" r="4.5" fill="#E63946" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {renderIcon()}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-tight text-white ${textClasses[size]}`}>
              We <span className="text-[#C77DFF]">Care</span>
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#E63946] shadow-xs shadow-red-500/50" />
          </div>
          {subtext && (
            <span className="text-[10px] font-semibold text-purple-200/70 tracking-wider uppercase mt-0.5">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
