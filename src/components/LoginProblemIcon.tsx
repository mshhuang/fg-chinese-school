import React from 'react';

export function LoginProblemIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="lock-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9C64F" />
          <stop offset="100%" stopColor="#F29824" />
        </linearGradient>
      </defs>

      {/* Password Field (Pill shape) */}
      <rect x="50" y="34" width="105" height="40" rx="20" fill="white" stroke="#2A2A2A" strokeWidth="4" />
      
      {/* Asterisks */}
      <g stroke="#2A2A2A" strokeWidth="6" strokeLinecap="round">
        {/* Star 1 */}
        <line x1="75" y1="46" x2="75" y2="62" />
        <line x1="68" y1="50" x2="82" y2="58" />
        <line x1="68" y1="58" x2="82" y2="50" />

        {/* Star 2 */}
        <line x1="102" y1="46" x2="102" y2="62" />
        <line x1="95" y1="50" x2="109" y2="58" />
        <line x1="95" y1="58" x2="109" y2="50" />

        {/* Star 3 */}
        <line x1="129" y1="46" x2="129" y2="62" />
        <line x1="122" y1="50" x2="136" y2="58" />
        <line x1="122" y1="58" x2="136" y2="50" />
      </g>

      {/* Lock Shackle */}
      <path d="M28 32V20C28 11.1634 35.1634 4 44 4C52.8366 4 60 11.1634 60 20V32" stroke="#F9C64F" strokeWidth="8" strokeLinecap="round" />
      
      {/* Lock Body */}
      <rect x="16" y="32" width="56" height="44" rx="8" fill="url(#lock-grad)" />
      
      {/* Keyhole */}
      <path d="M44 46c-2.209 0-4 1.791-4 4 0 1.63 1.002 3.036 2.43 3.681l-1.2 5.569c-.19 1.01 1.026 1.75 1.83 1.75h1.88c.804 0 2.02-.74 1.83-1.75l-1.2-5.569C46.998 53.036 48 51.63 48 50c0-2.209-1.791-4-4-4z" fill="#2A2A2A" />
    </svg>
  );
}
