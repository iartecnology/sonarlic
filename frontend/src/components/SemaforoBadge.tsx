import React from 'react';

interface SemaforoBadgeProps {
  status?: 'VERDE' | 'AMARILLO' | 'ROJO' | 'PENDIENTE';
}

export const SemaforoBadge: React.FC<SemaforoBadgeProps> = ({ status = 'PENDIENTE' }) => {
  switch (status) {
    case 'VERDE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Viabilidad Alta (PYME)
        </span>
      );
    case 'AMARILLO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Requisitos Medios
        </span>
      );
    case 'ROJO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Alta Complejidad
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Pendiente Análisis
        </span>
      );
  }
};
