'use client';

import React from 'react';
import { Licitacion } from '@/lib/types';
import { SemaforoBadge } from './SemaforoBadge';
import { Building2, MapPin, Calendar, DollarSign, Star, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

interface LicitacionCardProps {
  licitacion: Licitacion;
  onToggleFavorite: (id_proceso: string, currentStatus: boolean) => void;
  onSelect: (licitacion: Licitacion) => void;
}

export const LicitacionCard: React.FC<LicitacionCardProps> = ({
  licitacion,
  onToggleFavorite,
  onSelect,
}) => {
  const formattedCuantia = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(licitacion.cuantia);

  const formattedDate = licitacion.fecha_cierre
    ? new Date(licitacion.fecha_cierre).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'No especificada';

  const isMatched = licitacion.match_score !== undefined && licitacion.match_score !== null;

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between group hover:-translate-y-0.5 ${
        isMatched
          ? 'border-indigo-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 ring-1 ring-indigo-500/10'
          : 'border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* Indicador de Línea Superior con Gradiente IAR para Licitaciones con Match */}
      {isMatched && (
        <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] rounded-full" />
      )}

      <div>
        {/* Encabezado: Fuente, Semáforo, Match Score e Ícono Favorito */}
        <div className="flex items-center justify-between gap-2 mb-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60 uppercase">
              {licitacion.fuente}
            </span>
            <SemaforoBadge status={licitacion.ai_semaforo} />

            {/* Insignia de Match Corporativa iAR */}
            {isMatched && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-[#D9465A]/10 via-[#9B4B75]/10 to-[#3B6DB5]/10 text-[#6C5B8B] border border-[#9B4B75]/20 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#D9465A]" />
                {licitacion.match_score}% Match
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(licitacion.id_proceso, licitacion.is_favorite);
            }}
            className={`p-2 rounded-xl transition-all duration-200 ${
              licitacion.is_favorite
                ? 'text-amber-500 bg-amber-50 shadow-inner'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={licitacion.is_favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <Star className={`w-4 h-4 ${licitacion.is_favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Entidad Contratante */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#3B6DB5] shrink-0" />
          <span className="truncate">{licitacion.entidad}</span>
        </div>

        {/* Objeto de la Licitación */}
        <h3
          onClick={() => onSelect(licitacion)}
          className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#3B6DB5] transition-colors line-clamp-2 cursor-pointer mb-3 leading-snug"
        >
          {licitacion.objeto}
        </h3>

        {/* Razones de Match si aplican */}
        {licitacion.match_reasons && licitacion.match_reasons.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {licitacion.match_reasons.slice(0, 2).map((reason, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 rounded-md px-2 py-0.5"
              >
                <CheckCircle2 className="w-3 h-3 text-[#3B6DB5]" />
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Tarjeta de Resumen Cognitivo iAR */}
        {licitacion.ai_resumen && (
          <div className="p-3 bg-gradient-to-br from-slate-50/90 to-[#9B4B75]/5 rounded-xl border border-slate-200/70 mb-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6C5B8B] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D9465A]" />
              Resumen Inteligente iAR
            </div>
            <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
              {licitacion.ai_resumen}
            </p>
          </div>
        )}
      </div>

      {/* Metadatos Financieros y Territoriales */}
      <div>
        <div className="grid grid-cols-2 gap-2 py-3 border-t border-slate-100 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-extrabold text-slate-900 truncate">{formattedCuantia}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#D9465A] shrink-0" />
            <span className="truncate font-medium">{licitacion.departamento}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-4 h-4 text-[#3B6DB5] shrink-0" />
            <span className="text-[11px]">
              Cierre: <strong className="text-slate-900 font-semibold">{formattedDate}</strong>
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(licitacion)}
            className="flex-1 px-3 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all text-center shadow-xs hover:shadow-md"
          >
            Ver Diagnóstico y Pliegos
          </button>
          {licitacion.url_proceso && (
            <a
              href={licitacion.url_proceso}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#3B6DB5] hover:border-[#3B6DB5] hover:bg-blue-50/50 transition-all"
              title="Abrir directamente en SECOP"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
