import React from 'react';
import { LogoVariation } from '../../types';

interface LogoProps {
  variation?: LogoVariation;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  subtext?: string;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variation = 'heart-cross',
  size = 'md',
  showText = true,
  className = '',
  subtext = 'HOME NURSING',
  inverted = true
}) => {
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textClasses = {
    sm: 'text-sm sm:text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const subtextClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  const navyColor = inverted ? '#FFFFFF' : '#1A1E4E';
  const orangeColor = '#F59E0B';
  const blueColor = '#3B82F6';

  // The House with Nurse Silhouette, Gold Cross & Blue EKG Heartbeat Line
  const renderNewBrandSymbol = () => (
    <div className={`${sizeClasses[size]} shrink-0 drop-shadow-sm select-none relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 512 512"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* House Outline (Navy Blue / White) */}
        {/* Chimney */}
        <path
          d="M 336 170 L 336 94 L 388 94 L 388 214"
          stroke={navyColor}
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Roof Gable & House Body */}
        <path
          d="M 68 238 L 256 68 L 444 238 L 444 430 C 444 454 426 470 404 470 L 108 470 C 86 470 68 454 68 430 Z"
          stroke={navyColor}
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* EKG Heartbeat Line (Electric Heartbeat Blue #3B82F6) */}
        <path
          d="M 8 284 L 114 284 L 134 250 L 154 334 L 184 180 L 214 362 L 236 284 L 272 284 M 356 284 L 382 284 L 396 254 L 410 324 L 424 216 L 440 334 L 454 284 L 504 284"
          stroke={blueColor}
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Nurse Profile Silhouette (Navy Blue / White) */}
        <path
          d="M 194 176 L 318 160 C 322 195 324 215 324 234 L 208 248 C 200 216 196 195 194 176 Z"
          fill={navyColor}
        />

        {/* Medical Cross on Nurse Cap (Accent Gold/Orange #F59E0B) */}
        <rect x="250" y="180" width="16" height="42" rx="4" fill={orangeColor} />
        <rect x="237" y="193" width="42" height="16" rx="4" fill={orangeColor} />

        {/* Nurse Head Profile & Collar */}
        <path
          d="M 218 252 C 200 262 188 282 188 306 C 188 336 210 354 234 354 C 234 366 226 384 206 414 L 286 450 C 290 416 304 380 326 348 C 328 342 332 330 326 322 C 320 314 316 316 314 310 C 310 298 322 284 322 270 C 322 258 316 250 306 248 Z"
          fill={navyColor}
        />
      </svg>
    </div>
  );

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {renderNewBrandSymbol()}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-black tracking-tight ${textClasses[size]} ${inverted ? 'text-white' : 'text-[#1A1E4E]'}`}>
              WeCare
            </span>
            <span className={`font-black tracking-tight ${textClasses[size]} text-[#F59E0B]`}>
              Track
            </span>
            <span className={`font-black tracking-tight ${textClasses[size]} ${inverted ? 'text-white' : 'text-[#1A1E4E]'}`}>
              Jamaica
            </span>
          </div>
          {subtext && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`font-bold ${subtextClasses[size]} tracking-[0.24em] uppercase ${inverted ? 'text-blue-300' : 'text-[#3B82F6]'}`}>
                {subtext}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
