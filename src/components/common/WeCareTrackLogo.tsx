import React from 'react';

export interface WeCareTrackLogoProps {
  variant?: 'full' | 'icon' | 'watermark' | 'horizontal' | 'splash';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  inverted?: boolean; // When on dark Navy background vs clean white background
  subtitle?: string;
  animated?: boolean;
}

export const WeCareTrackLogo: React.FC<WeCareTrackLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  inverted = false,
  subtitle = 'HOME NURSING',
  animated = false
}) => {
  // Dimension mappings
  const iconDimensions = {
    xs: { w: 26, h: 26, textMain: 'text-sm', textSub: 'text-[9px]' },
    sm: { w: 34, h: 34, textMain: 'text-base', textSub: 'text-[10px]' },
    md: { w: 44, h: 44, textMain: 'text-lg', textSub: 'text-[11px]' },
    lg: { w: 56, h: 56, textMain: 'text-xl', textSub: 'text-xs' },
    xl: { w: 80, h: 80, textMain: 'text-2xl', textSub: 'text-sm' },
    hero: { w: 110, h: 110, textMain: 'text-3xl sm:text-4xl', textSub: 'text-xs sm:text-sm' }
  }[size];

  const navyColor = inverted ? '#FFFFFF' : '#1A1E4E';
  const orangeColor = '#F59E0B';
  const blueColor = '#3B82F6';

  // SVG Symbol: The House, Nurse Silhouette, Gold Cross & EKG Heartbeat
  const LogoSymbol = (
    <div
      className={`relative flex items-center justify-center shrink-0 ${animated ? 'transition-transform duration-300 hover:scale-105' : ''}`}
      style={{ width: iconDimensions.w, height: iconDimensions.h }}
    >
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
        aria-hidden="true"
      >
        {/* House Outline */}
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
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Nurse Profile Silhouette (Primary Navy) */}
        {/* Nurse Medical Cap */}
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

  // Icon only
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {LogoSymbol}
      </div>
    );
  }

  // Watermark for footer
  if (variant === 'watermark') {
    return (
      <div className={`inline-flex items-center gap-2 text-xs opacity-75 hover:opacity-100 transition-opacity select-none ${className}`}>
        <div style={{ width: 18, height: 18 }}>
          <svg viewBox="0 0 512 512" fill="none" className="w-full h-full">
            <path d="M 68 238 L 256 68 L 444 238 L 444 430 C 444 454 426 470 404 470 L 108 470 C 86 470 68 454 68 430 Z" stroke={navyColor} strokeWidth="36" fill="none" />
            <path d="M 8 284 L 184 180 L 214 362 L 236 284 L 504 284" stroke={blueColor} strokeWidth="32" strokeLinecap="round" />
            <rect x="237" y="193" width="38" height="14" rx="3" fill={orangeColor} />
            <rect x="249" y="181" width="14" height="38" rx="3" fill={orangeColor} />
          </svg>
        </div>
        <span className={inverted ? 'text-slate-300' : 'text-slate-600'}>
          Powered by <strong className="font-bold text-amber-500">WeCare Track Jamaica</strong>
          <span className="mx-1 text-slate-400">·</span>
          <span className="font-semibold tracking-wider text-[10px] uppercase text-blue-500">{subtitle}</span>
        </span>
      </div>
    );
  }

  // Splash Screen Variant with animated heartbeat
  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center justify-center text-center p-8 bg-white select-none ${className}`}>
        <div className="relative mb-6 animate-pulse" style={{ width: 140, height: 140 }}>
          <img
            src="/app-icon-1024.png"
            alt="WeCare Track Jamaica"
            className="w-full h-full object-contain rounded-3xl shadow-xl shadow-slate-200 border border-slate-100"
          />
        </div>
        <div className="space-y-2 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1E4E] flex items-center justify-center gap-2">
            <span>WeCare</span>
            <span className="text-[#F59E0B]">Track</span>
            <span className="text-[#1A1E4E]">Jamaica</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[2px] w-8 bg-[#3B82F6]" />
            <p className="text-xs sm:text-sm font-bold tracking-[0.28em] text-[#3B82F6] uppercase">
              {subtitle}
            </p>
            <div className="h-[2px] w-8 bg-[#3B82F6]" />
          </div>
          <p className="text-xs text-slate-500 pt-2 font-medium">
            Professional Home Nursing &amp; Live Vital Tracking at Your Doorstep
          </p>
        </div>
      </div>
    );
  }

  // Full / Horizontal Variant (Standard in Navbars, Headers, Login)
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {LogoSymbol}
      <div className="flex flex-col leading-none">
        <div className={`font-black tracking-tight ${iconDimensions.textMain} flex items-center gap-1`}>
          <span className={inverted ? 'text-white' : 'text-[#1A1E4E]'}>WeCare</span>
          <span className="text-[#F59E0B]">Track</span>
          <span className={inverted ? 'text-white' : 'text-[#1A1E4E]'}>Jamaica</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`font-bold uppercase tracking-[0.22em] ${iconDimensions.textSub} ${inverted ? 'text-blue-300' : 'text-[#3B82F6]'}`}>
            {subtitle}
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
        </div>
      </div>
    </div>
  );
};
