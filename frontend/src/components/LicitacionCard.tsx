'use client';

import React from 'react';
import { Licitacion } from '@/lib/types';
import { SemaforoBadge } from './SemaforoBadge';
import { Building2, MapPin, Calendar, DollarSign, Star, ExternalLink, Sparkles } from 'lucide-react';

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

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group">
      <div>
        {/* Encabezado: Estado, Semáforo y Favorito */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {licitacion.fuente}
            </span>
            <SemaforoBadge status={licitacion.ai_semaforo} />
            {licitacion.match_score !== undefined && licitacion.match_score !== null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                ✨ {licitacion.match_score}% Match
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(licitacion.id_proceso, licitacion.is_favorite);
            }}
            className={`p-2 rounded-lg transition-colors ${
              licitacion.is_favorite
                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={licitacion.is_favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <Star className={`w-5 h-5 ${licitacion.is_favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Entidad */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{licitacion.entidad}</span>
        </div>

        {/* Título / Objeto */}
        <h3
          onClick={() => onSelect(licitacion)}
          className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer mb-3"
        >
          {licitacion.objeto}
        </h3>

        {/* Resumen IA si existe */}
        {licitacion.ai_resumen && (
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/60 mb-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Resumen Inteligente
            </div>
            <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
              {licitacion.ai_resumen}
            </p>
          </div>
        )}
      </div>

      {/* Metadatos y Pie */}
      <div>
        <div className="grid grid-cols-2 gap-2 py-3 border-t border-slate-100 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-900 truncate">{formattedCuantia}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{licitacion.departamento}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Cierre: <strong className="text-slate-800">{formattedDate}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(licitacion)}
            className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors text-center"
          >
            Ver Análisis y Pliegos
          </button>
          {licitacion.url_proceso && (
            <a
              href={licitacion.url_proceso}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Abrir en SECOP"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
