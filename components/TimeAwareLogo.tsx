import React, { useEffect, useMemo, useState } from 'react';

export type LogoPhase = 'dawn' | 'day' | 'evening' | 'night';

export const getLogoPhase = (date: Date): LogoPhase => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const phaseLabels: Record<LogoPhase, string> = {
  dawn: 'Aamunkoitto',
  day: 'Päivä',
  evening: 'Ilta',
  night: 'Yö',
};

interface TimeAwareLogoProps {
  className?: string;
  phase?: LogoPhase;
  isDarkMode?: boolean;
}

const TimeAwareLogo: React.FC<TimeAwareLogoProps> = ({ className = '', phase: phaseOverride, isDarkMode = false }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const phase = useMemo(() => phaseOverride ?? getLogoPhase(now), [now, phaseOverride]);
  const isDawn = phase === 'dawn';
  const isDay = phase === 'day';
  const isEvening = phase === 'evening';
  const isNight = phase === 'night';
  const skyFill = `url(#logo-sky-${phase}${isDarkMode ? '-dark' : ''})`;
  const waveTop = isDarkMode
    ? (isDawn ? '#4c1d0b' : isEvening ? '#17113f' : isNight ? '#020617' : '#0f2742')
    : (isDawn ? '#7c2d12' : isEvening ? '#1e1b4b' : isNight ? '#0a0a2a' : '#163050');
  const waveBottom = isDarkMode
    ? (isDawn ? '#1c0a04' : isEvening ? '#09051f' : isNight ? '#020617' : '#081827')
    : (isDawn ? '#431407' : isEvening ? '#12104f' : isNight ? '#05050f' : '#0f2035');
  const titleFill = isNight ? '#f8fafc' : '#ffffff';
  const subtitleFill = isDawn ? '#fed7aa' : isEvening ? '#ddd6fe' : isNight ? '#bfdbfe' : '#a8c8e8';
  const windowOpacity = isNight ? 0.95 : isEvening ? 0.75 : 0;
  const sunTransform = isDawn ? 'translate(0 16)' : isEvening ? 'translate(0 20)' : undefined;
  const sunOpacity = isNight ? 0 : isEvening ? 0.35 : 1;
  const cloudsOpacity = isDawn ? 0.45 : isDay ? 1 : isEvening ? 0.28 : 0;
  const starsOpacity = isNight ? 1 : isEvening ? 0.75 : 0;
  const smokeOpacity = isDawn || isDay ? 0.65 : 0;

  return (
    <svg
      viewBox="0 0 360 128"
      role="img"
      aria-label={`Aloitussivu, ${phaseLabels[phase]}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-sky-dawn" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="58%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>
        <linearGradient id="logo-sky-dawn-dark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c2d12" />
          <stop offset="58%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>
        <linearGradient id="logo-sky-day" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a3a5c" />
          <stop offset="100%" stopColor="#2a5a8c" />
        </linearGradient>
        <linearGradient id="logo-sky-day-dark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0f2742" />
          <stop offset="100%" stopColor="#1e3a5f" />
        </linearGradient>
        <linearGradient id="logo-sky-evening" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="52%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="logo-sky-evening-dark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#17113f" />
          <stop offset="58%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id="logo-sky-night" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#030712" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="logo-sky-night-dark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="logo-sun-day" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id="logo-sun-dawn" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
        <radialGradient id="logo-moon" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>
      </defs>

      <rect width="360" height="128" rx="20" fill={skyFill} />

      <g opacity={starsOpacity}>
        {[118, 148, 180, 212, 244, 278, 312, 336].map((cx, index) => (
          <circle key={cx} cx={cx} cy={[18, 10, 24, 14, 22, 12, 28, 16][index]} r={index % 3 === 0 ? 1.8 : 1.2} fill="white" opacity={0.6 + (index % 2) * 0.25} />
        ))}
        <circle cx="202" cy="18" r="2" fill="#fde68a">
          <animate attributeName="opacity" values="0.95;0.25;0.95" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="292" cy="24" r="1.6" fill="#fde68a">
          <animate attributeName="opacity" values="0.8;0.15;0.8" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>

      <g opacity={cloudsOpacity}>
        <ellipse cx="220" cy="26" rx="25" ry="10" fill="white" opacity="0.24" />
        <ellipse cx="238" cy="22" rx="15" ry="9" fill="white" opacity="0.2" />
        <ellipse cx="203" cy="23" rx="13" ry="8" fill="white" opacity="0.2" />
        <ellipse cx="308" cy="36" rx="20" ry="8" fill="white" opacity="0.18" />
        <ellipse cx="322" cy="33" rx="11" ry="7" fill="white" opacity="0.16" />
      </g>

      <g opacity={sunOpacity} transform={sunTransform}>
        <circle cx="70" cy="46" r="27" fill="#fde68a" opacity="0.15" />
        <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.72">
          <line x1="70" y1="14" x2="70" y2="7" />
          <line x1="70" y1="78" x2="70" y2="85" />
          <line x1="38" y1="46" x2="31" y2="46" />
          <line x1="102" y1="46" x2="109" y2="46" />
          <line x1="48" y1="24" x2="43" y2="19" />
          <line x1="92" y1="68" x2="97" y2="73" />
          <line x1="92" y1="24" x2="97" y2="19" />
          <line x1="48" y1="68" x2="43" y2="73" />
        </g>
        <circle cx="70" cy="46" r="18" fill={isDawn || isEvening ? 'url(#logo-sun-dawn)' : 'url(#logo-sun-day)'} />
        <circle cx="64" cy="43" r="2.5" fill="#92400e" />
        <circle cx="76" cy="43" r="2.5" fill="#92400e" />
        <path d="M63 51 Q70 56 77 51" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      <g opacity={isNight ? 1 : 0}>
        <circle cx="70" cy="46" r="27" fill="#e2e8f0" opacity="0.1" />
        <circle cx="70" cy="46" r="18" fill="url(#logo-moon)" />
        <circle cx="90" cy="30" r="2" fill="#fde68a">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="96" cy="43" r="1.2" fill="white" opacity="0.75">
          <animate attributeName="opacity" values="0.75;0.15;0.75" dur="3.5s" repeatCount="indefinite" />
        </circle>
      </g>

      <path d="M0 94 Q45 82 90 90 Q135 99 180 88 Q225 78 270 86 Q315 94 360 84 L360 128 L0 128 Z" fill={waveTop} opacity="0.62" />
      <path d="M0 104 Q55 92 110 100 Q165 107 220 96 Q275 86 360 98 L360 128 L0 128 Z" fill={waveBottom} opacity="0.55" />

      <rect x="34" y="66" width="38" height="28" rx="3" fill="#e8f0f8" />
      <polygon points="29,67 53,48 77,67" fill="#2a7d6f" />
      <rect x="62" y="50" width="7" height="11" rx="1" fill="#2a7d6f" />
      <g opacity={smokeOpacity}>
        <circle cx="66" cy="46" r="2.5" fill="#94a3b8" opacity="0">
          <animate attributeName="cy" values="46;38;30" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.3;0" dur="3s" repeatCount="indefinite" />
          <animate attributeName="r" values="2.5;3.5;5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="66" cy="46" r="2.5" fill="#94a3b8" opacity="0">
          <animate attributeName="cy" values="46;38;30" dur="3s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.3;0" dur="3s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="r" values="2.5;3.5;5" dur="3s" begin="1s" repeatCount="indefinite" />
        </circle>
      </g>
      <rect x="45" y="79" width="11" height="15" rx="2" fill="#c9963a" />
      <circle cx="54" cy="87" r="1.2" fill="#8a6020" />
      <rect x="37" y="71" width="9" height="8" rx="1" fill="#a8d4e6" />
      <rect x="59" y="71" width="9" height="8" rx="1" fill="#a8d4e6" />
      <rect x="37" y="71" width="9" height="8" rx="1" fill="#fde68a" opacity={windowOpacity} />
      <rect x="59" y="71" width="9" height="8" rx="1" fill="#fde68a" opacity={windowOpacity} />
      <line x1="41.5" y1="71" x2="41.5" y2="79" stroke="white" strokeWidth="0.8" />
      <line x1="37" y1="75" x2="46" y2="75" stroke="white" strokeWidth="0.8" />
      <line x1="63.5" y1="71" x2="63.5" y2="79" stroke="white" strokeWidth="0.8" />
      <line x1="59" y1="75" x2="68" y2="75" stroke="white" strokeWidth="0.8" />

      <text x="126" y="47" fontFamily="Georgia, 'Times New Roman', serif" fontSize="24" fontWeight="700" fill={titleFill}>Aloitussivu</text>
      <text x="126" y="75" fontFamily="Georgia, 'Times New Roman', serif" fontSize="24" fontWeight="700" fill={titleFill}>seniorille</text>
      <rect x="126" y="82" width="176" height="2.5" rx="1.5" fill="#c9963a" opacity="0.9" />
      <text x="127" y="101" fontFamily="Georgia, 'Times New Roman', serif" fontSize="11" fill={subtitleFill}>Helppo ja turvallinen pääsy nettiin</text>
    </svg>
  );
};

export default TimeAwareLogo;
