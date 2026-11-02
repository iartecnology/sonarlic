import React from 'react';
import { Sparkles, CheckCircle2, Award, Clock, FileCheck } from 'lucide-react';

export type TipoEstadoContratacion = 'ACTIVO' | 'SUSCRITO' | 'ADJUDICADO' | 'OTRO';

interface EstadoBadgeProps {
  estado: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function clasificarEstadoContratacion(estadoRaw?: string): {
  tipo: TipoEstadoContratacion;
  label: string;
  sublabel: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  dotColor: string;
  icon: 'activo' | 'suscrito' | 'adjudicado' | 'otro';
} {
  const norm = (estadoRaw || '').toLowerCase().trim();

  // 1. Convocatorias y Licitaciones en Concurso / Activas (Abiertas para postularse)
  if (
    norm.includes('presentación de oferta') ||
    norm.includes('presentacion de oferta') ||
    norm.includes('fase de ofertas') ||
    norm.includes('oferta') ||
    norm.includes('abierto') ||
    norm.includes('publicado') ||
    norm.includes('convocatoria') ||
    norm.includes('en curso') ||
    norm.includes('manifestación') ||
    norm.includes('borrador')
  ) {
    return {
      tipo: 'ACTIVO',
      label: 'Convocatoria Activa',
      sublabel: estadoRaw || 'Presentación de ofertas',
      colorBg: 'bg-emerald-50',
      colorText: 'text-emerald-700',
      colorBorder: 'border-emerald-200/80',
      dotColor: 'bg-emerald-500 animate-pulse',
      icon: 'activo',
    };
  }

  // 2. Contratos Suscritos / En Ejecución / Aprobados
  if (
    norm.includes('suscrito') ||
    norm.includes('aprobado') ||
    norm.includes('en ejecución') ||
    norm.includes('en ejecucion') ||
    norm.includes('celebrado') ||
    norm.includes('modificado') ||
    norm.includes('activo') ||
    norm.includes('enviado proveedor')
  ) {
    return {
      tipo: 'SUSCRITO',
      label: 'Contrato Suscrito',
      sublabel: estadoRaw || 'En ejecución',
      colorBg: 'bg-blue-50',
      colorText: 'text-[#3B6DB5]',
      colorBorder: 'border-blue-200/80',
      dotColor: 'bg-[#3B6DB5]',
      icon: 'suscrito',
    };
  }

  // 3. Adjudicados / Seleccionados
  if (
    norm.includes('adjudicado') ||
    norm.includes('seleccionado') ||
    norm.includes('adjudicación') ||
    norm.includes('adjudicacion')
  ) {
    return {
      tipo: 'ADJUDICADO',
      label: 'Adjudicado',
      sublabel: estadoRaw || 'Adjudicación concluida',
      colorBg: 'bg-purple-50',
      colorText: 'text-purple-700',
      colorBorder: 'border-purple-200/80',
      dotColor: 'bg-purple-500',
      icon: 'adjudicado',
    };
  }

  // 4. Concluidos / Cerrados / Otros
  return {
    tipo: 'OTRO',
    label: estadoRaw || 'Finalizado',
    sublabel: estadoRaw || 'Cerrado',
    colorBg: 'bg-slate-100',
    colorText: 'text-slate-600',
    colorBorder: 'border-slate-200',
    dotColor: 'bg-slate-400',
    icon: 'otro',
  };
}

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, className = '', size = 'md' }) => {
  const info = clasificarEstadoContratacion(estado);

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border transition-all ${
        info.colorBg
      } ${info.colorText} ${info.colorBorder} ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'
      } ${className}`}
      title={`Estado oficial en SECOP: ${estado}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dotColor}`} />
      <span>{info.label}</span>
      {info.tipo === 'ACTIVO' && (
        <span className="hidden sm:inline-block text-[9px] font-black lowercase opacity-80 px-1 py-0.2 rounded bg-emerald-200/50 text-emerald-900">
          ofertar
        </span>
      )}
    </span>
  );
};
