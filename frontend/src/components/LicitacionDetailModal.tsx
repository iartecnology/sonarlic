'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Building2, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Download, 
  DollarSign, 
  MapPin, 
  ShieldCheck, 
  Tag, 
  Briefcase,
  Layers,
  FileCheck2
} from 'lucide-react';
import { Licitacion } from '@/lib/types';
import SemaforoBadge from './SemaforoBadge';

interface LicitacionDetailModalProps {
  licitacion: Licitacion | null;
  onClose: () => void;
}

export default function LicitacionDetailModal({ licitacion, onClose }: LicitacionDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'diagnostico' | 'pliegos' | 'cronograma' | 'documentos'>('diagnostico');

  if (!licitacion) return null;

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No definido';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Requisitos habilitantes parseados
  const renderRequisitos = () => {
    if (!licitacion.requisitos_habilitantes && !licitacion.ai_pliegos_requisitos) {
      return (
        <div className="text-center py-8 text-slate-400 text-xs">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
          No se detectaron requisitos habilitantes específicos para esta licitación.
        </div>
      );
    }

    const reqText = licitacion.requisitos_habilitantes || licitacion.ai_pliegos_requisitos || '';
    const items = reqText.includes('|') ? reqText.split('|').map(s => s.trim()) : [reqText];

    return (
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed font-medium">
              {item}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Barra superior con gradiente de marca IAR */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5]" />

        {/* Header Modal */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <SemaforoBadge status={licitacion.ai_semaforo} />
              {licitacion.match_score !== undefined && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-[#D9465A]/10 to-[#3B6DB5]/10 text-[#9B4B75] border border-[#9B4B75]/20">
                  <Sparkles className="w-3 h-3 text-[#D9465A]" />
                  {licitacion.match_score}% Compatibilidad
                </span>
              )}
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {licitacion.numero_proceso || licitacion.id_proceso}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Building2 className="w-4 h-4 text-[#3B6DB5]" />
              <span>{licitacion.entidad}</span>
              {licitacion.orden_entidad && (
                <span className="text-[10px] text-slate-400 font-normal">({licitacion.orden_entidad})</span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-2">
              {licitacion.objeto}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación 360° */}
        <div className="flex items-center border-b border-slate-100 px-6 bg-slate-50/50 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('diagnostico')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'diagnostico'
                ? 'border-[#D9465A] text-[#D9465A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Diagnóstico Cognitivo
          </button>

          <button
            onClick={() => setActiveTab('pliegos')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'pliegos'
                ? 'border-[#9B4B75] text-[#9B4B75]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Requisitos Habilitantes
          </button>

          <button
            onClick={() => setActiveTab('cronograma')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'cronograma'
                ? 'border-[#3B6DB5] text-[#3B6DB5]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Cronograma & Fechas
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'documentos'
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Documentos & Anexos
          </button>
        </div>

        {/* Cuerpo del Contenido por Pestaña */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* 1. Diagnóstico Cognitivo */}
          {activeTab === 'diagnostico' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-[#9B4B75]/5 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-black text-[#6C5B8B] mb-2">
                  <Sparkles className="w-4 h-4 text-[#D9465A]" />
                  Resumen Analítico para PYMEs
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {licitacion.ai_resumen || 'Análisis predictivo de pliegos y semáforo generado en base a cuantía, objeto y antecedentes del comprador.'}
                </p>
              </div>

              {/* Métricas y Datos Clave */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Presupuesto Oficial</span>
                  <span className="font-black text-slate-900 text-sm">{formatCOP(licitacion.cuantia)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Plazo de Ejecución</span>
                  <span className="font-bold text-slate-900">{licitacion.duracion || 'Según cronograma'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Modalidad</span>
                  <span className="font-bold text-slate-900 truncate block" title={licitacion.modalidad}>
                    {licitacion.modalidad || 'Régimen Especial'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Ubicación</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {licitacion.municipio ? `${licitacion.municipio}, ` : ''}{licitacion.departamento}
                  </span>
                </div>
              </div>

              {/* Justificación y Clasificación */}
              <div className="space-y-2 text-xs">
                {licitacion.codigo_unspsc && (
                  <div className="flex items-start gap-2 p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-slate-700">
                    <Tag className="w-4 h-4 text-[#3B6DB5] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Clasificación UNSPSC: </span>
                      <span>{licitacion.codigo_unspsc}</span>
                    </div>
                  </div>
                )}
                {licitacion.documentos_tipo && (
                  <div className="flex items-start gap-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-slate-700">
                    <FileCheck2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Pliegos Tipo / Regla Aplicable: </span>
                      <span>{licitacion.documentos_tipo}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. Pliegos y Requisitos Habilitantes */}
          {activeTab === 'pliegos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Matriz de Requisitos Habilitantes Detectados
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Extraído de Pliegos
                </span>
              </div>
              {renderRequisitos()}
            </div>
          )}

          {/* 3. Cronograma & Fechas */}
          {activeTab === 'cronograma' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                Hitos y Fechas Clave del Proceso
              </h3>
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-5 py-2">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
                  <span className="text-[11px] font-bold text-slate-400 block">Fecha de Publicación de Convocatoria</span>
                  <span className="text-xs font-black text-slate-800">{formatDate(licitacion.fecha_publicacion)}</span>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-xs" />
                  <span className="text-[11px] font-bold text-slate-400 block">Plazo para Observaciones a Pliegos</span>
                  <span className="text-xs font-black text-slate-800">
                    {formatDate(licitacion.fecha_publicacion)} (+ 3 días hábiles)
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#D9465A] border-2 border-white shadow-xs" />
                  <span className="text-[11px] font-bold text-[#D9465A] block">Fecha y Hora Límite de Presentación de Ofertas</span>
                  <span className="text-xs font-black text-slate-900">{formatDate(licitacion.fecha_cierre)}</span>
                </div>

                {licitacion.fecha_adjudicacion && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                    <span className="text-[11px] font-bold text-slate-400 block">Audiencia de Adjudicación</span>
                    <span className="text-xs font-black text-slate-800">{formatDate(licitacion.fecha_adjudicacion)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Documentos & Anexos */}
          {activeTab === 'documentos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Documentación del Proceso
                </h3>
                <span className="text-[10px] text-slate-500">Expediente Oficial</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Estudios Previos y Análisis del Sector</span>
                      <span className="text-[10px] text-slate-400">PDF • Oficial Entidad</span>
                    </div>
                  </div>
                  {licitacion.url_proceso ? (
                    <a
                      href={licitacion.url_proceso}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#3B6DB5] hover:underline flex items-center gap-1"
                    >
                      <span>Descargar</span>
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Pliego de Condiciones Definitivo</span>
                      <span className="text-[10px] text-slate-400">PDF • Requisitos Técnicos</span>
                    </div>
                  </div>
                  {licitacion.url_proceso ? (
                    <a
                      href={licitacion.url_proceso}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#3B6DB5] hover:underline flex items-center gap-1"
                    >
                      <span>Descargar</span>
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Anexo Técnico & Formato Económico</span>
                      <span className="text-[10px] text-slate-400">XLSX • Matriz de Precios</span>
                    </div>
                  </div>
                  {licitacion.url_proceso ? (
                    <a
                      href={licitacion.url_proceso}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#3B6DB5] hover:underline flex items-center gap-1"
                    >
                      <span>Descargar</span>
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con Acciones */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
          >
            Cerrar Expediente
          </button>

          {licitacion.url_proceso && (
            <a
              href={licitacion.url_proceso}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] hover:opacity-95 text-white shadow-md shadow-[#9B4B75]/25 flex items-center gap-2 transition"
            >
              <span>Radicar Oferta en SECOP</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
