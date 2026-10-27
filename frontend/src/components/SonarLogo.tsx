import React from 'react';

interface SonarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const SonarLogo: React.FC<SonarLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Isotipo: Red Neuronal Cerebral iAR Tecnology con Gradiente Oficial */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform hover:scale-105 duration-300"
        >
          <defs>
            <linearGradient id="iarGradientBrain" x1="0%" y1="20%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#D9465A" />
              <stop offset="35%" stopColor="#9B4B75" />
              <stop offset="70%" stopColor="#6C5B8B" />
              <stop offset="100%" stopColor="#3B6DB5" />
            </linearGradient>
            <filter id="iarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Conexiones sinápticas (Red Neuronal) */}
          <path
            d="M20 40 L35 25 L55 20 L75 30 L85 45 L70 65 L48 68 L28 60 L18 48 Z"
            stroke="url(#iarGradientBrain)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d="M35 25 L45 42 L55 20 M45 42 L75 30 M45 42 L70 65 M45 42 L48 68 M45 42 L28 60 M20 40 L45 42 M75 30 L85 45 M85 45 L70 65"
            stroke="url(#iarGradientBrain)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Nodos Sinápticos (Neuronas de la imagen) */}
          <circle cx="20" cy="40" r="4.5" fill="#FFFFFF" stroke="#D9465A" strokeWidth="2.5" />
          <circle cx="35" cy="25" r="4" fill="#FFFFFF" stroke="#D9465A" strokeWidth="2.5" />
          <circle cx="55" cy="20" r="4.5" fill="#FFFFFF" stroke="#9B4B75" strokeWidth="2.5" />
          <circle cx="75" cy="30" r="4.5" fill="#FFFFFF" stroke="#6C5B8B" strokeWidth="2.5" />
          <circle cx="85" cy="45" r="4.5" fill="#FFFFFF" stroke="#3B6DB5" strokeWidth="2.5" />
          <circle cx="70" cy="65" r="4.5" fill="#FFFFFF" stroke="#3B6DB5" strokeWidth="2.5" />
          <circle cx="48" cy="68" r="4" fill="#FFFFFF" stroke="#6C5B8B" strokeWidth="2.5" />
          <circle cx="28" cy="60" r="4" fill="#FFFFFF" stroke="#D9465A" strokeWidth="2.5" />
          <circle cx="45" cy="42" r="5" fill="#FFFFFF" stroke="#9B4B75" strokeWidth="3" />
        </svg>
      </div>

      {/* Logotipo Tipográfico: SonarLIC iAR tecnology */}
      <div className="flex flex-col leading-none">
        <div className={`font-extrabold tracking-tight ${textSizes[size]}`}>
          <span className="text-slate-900">Sonar</span>
          <span className="bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] bg-clip-text text-transparent font-black ml-0.5">
            LIC
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider flex items-center gap-1 mt-0.5">
            <span>by</span>
            <span className="font-bold text-slate-800 tracking-normal">iAR tecnology</span>
          </span>
        )}
      </div>
    </div>
  );
};
