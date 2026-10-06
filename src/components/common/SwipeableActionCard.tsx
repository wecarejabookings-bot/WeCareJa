import React, { useState, useRef, useEffect } from 'react';
import { soundFX } from '../../utils/soundEffects';

export interface SwipeAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string; // Tailwind background classes, e.g. "bg-emerald-600 hover:bg-emerald-500 text-white"
  onClick: () => void;
  title?: string;
}

interface SwipeableActionCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[]; // Revealed when swiping left (card moves left)
  rightActions?: SwipeAction[]; // Revealed when swiping right (card moves right)
  className?: string;
  disabled?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export const SwipeableActionCard: React.FC<SwipeableActionCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  className = '',
  disabled = false,
  onSwipeStart,
  onSwipeEnd
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Maximum swipe threshold
  const maxLeftOffset = -Math.max(60, leftActions.length * 64);
  const maxRightOffset = Math.max(60, rightActions.length * 64);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    // Don't intercept if clicking an interactive element (button, input, select, link)
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a, [data-no-swipe]')) {
      return;
    }

    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setIsDragging(true);
    if (onSwipeStart) onSwipeStart();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || disabled) return;
    const diffX = e.clientX - startXRef.current;

    // Apply resistance if swiping beyond action limits
    let newOffset = diffX;
    if (diffX < 0) {
      if (leftActions.length === 0) {
        newOffset = diffX * 0.15; // heavy resistance
      } else if (diffX < maxLeftOffset) {
        newOffset = maxLeftOffset + (diffX - maxLeftOffset) * 0.2;
      }
    } else if (diffX > 0) {
      if (rightActions.length === 0) {
        newOffset = diffX * 0.15; // heavy resistance
      } else if (diffX > maxRightOffset) {
        newOffset = maxRightOffset + (diffX - maxRightOffset) * 0.2;
      }
    }

    setOffsetX(newOffset);
  };

  const handlePointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    // Snap to open or close
    const thresholdLeft = maxLeftOffset / 2;
    const thresholdRight = maxRightOffset / 2;

    if (offsetX < thresholdLeft && leftActions.length > 0) {
      setOffsetX(maxLeftOffset);
      soundFX.playPop();
    } else if (offsetX > thresholdRight && rightActions.length > 0) {
      setOffsetX(maxRightOffset);
      soundFX.playPop();
    } else {
      // Snap back to 0
      setOffsetX(0);
    }

    if (onSwipeEnd) onSwipeEnd();
  };

  const handleReset = () => {
    setOffsetX(0);
  };

  // Close swipe when clicking outside or pressing Escape
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (offsetX !== 0 && cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOffsetX(0);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [offsetX]);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl select-none group touch-pan-y ${className}`}
    >
      {/* BACKGROUND ACTIONS LAYER */}
      <div className="absolute inset-0 flex items-stretch justify-between pointer-events-auto">
        {/* Right actions (revealed when swiping right) */}
        <div className="flex items-center gap-1.5 pl-3 pr-4 bg-purple-950/90 border-r border-purple-500/30">
          {rightActions.map(action => (
            <button
              key={action.id}
              type="button"
              title={action.title || action.label}
              onClick={(e) => {
                e.stopPropagation();
                soundFX.playSuccessPing();
                action.onClick();
                handleReset();
              }}
              className={`h-10 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black shadow-md transition transform active:scale-95 ${action.color}`}
            >
              {action.icon}
              <span className="hidden sm:inline whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Left actions (revealed when swiping left) */}
        <div className="flex items-center gap-1.5 pr-3 pl-4 bg-purple-950/90 border-l border-purple-500/30">
          {leftActions.map(action => (
            <button
              key={action.id}
              type="button"
              title={action.title || action.label}
              onClick={(e) => {
                e.stopPropagation();
                soundFX.playSuccessPing();
                action.onClick();
                handleReset();
              }}
              className={`h-10 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black shadow-md transition transform active:scale-95 ${action.color}`}
            >
              {action.icon}
              <span className="hidden sm:inline whitespace-nowrap">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FOREGROUND CARD CONTENT LAYER */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        className="relative z-10 w-full will-change-transform"
      >
        {children}

        {/* Quick Swipe Indicator Badge (Visible on hover/hint) */}
        {(leftActions.length > 0 || rightActions.length > 0) && offsetX === 0 && (
          <div className="absolute top-2 right-2.5 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 text-[9px] font-bold text-slate-300 backdrop-blur-xs">
            <span>↔️ Swipe</span>
          </div>
        )}
      </div>
    </div>
  );
};
