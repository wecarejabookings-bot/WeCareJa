import React from 'react';

interface HeartbeatLineProps {
  className?: string;
  height?: number;
  animated?: boolean;
  color?: string;
  strokeWidth?: number;
}

export const HeartbeatLine: React.FC<HeartbeatLineProps> = ({
  className = '',
  height = 32,
  animated = true,
  color = '#3B82F6',
  strokeWidth = 2.5
}) => {
  return (
    <div className={`w-full overflow-hidden flex items-center select-none ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 600 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 25 L 140 25 L 160 25 L 175 10 L 190 40 L 210 3 L 230 48 L 245 25 L 340 25 L 420 25 L 435 10 L 450 40 L 470 3 L 490 48 L 505 25 L 600 25"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-pulse' : ''}
        />
      </svg>
    </div>
  );
};
