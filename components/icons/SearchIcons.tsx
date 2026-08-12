import React from 'react';

interface IconProps {
  className?: string;
}

export const SearchIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
    <path d="m16 16 4.25 4.25" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </svg>
);

export const MicrophoneIcon: React.FC<IconProps> = ({ className = 'h-6 w-6' }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
  >
    <rect x="9" y="2.5" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M5.5 10.5v.75a6.5 6.5 0 0 0 13 0v-.75M12 17.75v3.75M8.5 21.5h7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);
