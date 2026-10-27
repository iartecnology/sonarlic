import React from 'react';

interface SemaforoBadgeProps {
  status?: 'VERDE' | 'AMARILLO' | 'ROJO' | 'PENDIENTE';
}

export const SemaforoBadge: React.FC<SemaforoBadgeProps> = ({ status = 'PENDIENTE' }) => {
  switch (status) {
    case 'VERDE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Viable PYME
        </span>
      );
    case 'AMARILLO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Requisitos Medios
        </span>
      );
    case 'ROJO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-[#D9465A] border border-rose-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#D9465A]" />
          Alta Complejidad
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Pendiente Análisis
        </span>
      );
  }
};
