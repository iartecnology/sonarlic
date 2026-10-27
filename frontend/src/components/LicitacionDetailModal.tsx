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
import { SemaforoBadge } from './SemaforoBadge';

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
        timeZone: 'America/Bogota',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' (COT / Hora Bogotá)';
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
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Barra superior con gradiente de marca IAR */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5]" />

        {/* Header Modal */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SemaforoBadge status={licitacion.ai_semaforo} />
              {licitacion.match_score !== undefined && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-[#D9465A]/10 to-[#3B6DB5]/10 text-[#9B4B75] border border-[#9B4B75]/20">
                  <Sparkles className="w-3 h-3 text-[#D9465A]" />
                  {licitacion.match_score}% Compatibilidad
                </span>
              )}
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                {licitacion.numero_proceso || licitacion.id_proceso}
              </span>
              {licitacion.estado && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#3B6DB5] border border-blue-100">
                  {licitacion.estado}
                </span>
              )}
            </div>
            
            {/* Nombre Completo de la Entidad */}
            <div className="flex items-start gap-2 text-xs font-black text-slate-800">
              <Building2 className="w-4 h-4 text-[#3B6DB5] shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="text-slate-900 font-extrabold text-sm">{licitacion.entidad}</span>
                {licitacion.nit_entidad && (
                  <span className="text-[11px] text-slate-500 font-normal ml-2 font-mono">NIT: {licitacion.nit_entidad}</span>
                )}
                {licitacion.orden_entidad && (
                  <span className="text-[10px] text-slate-400 font-medium ml-2">({licitacion.orden_entidad})</span>
                )}
              </div>
            </div>

            {/* Objeto Completo de la Licitación */}
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-relaxed pt-1">
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
                {licitacion.justificacion_modalidad && (
                  <div className="flex items-start gap-2 p-2.5 bg-slate-100/80 rounded-xl border border-slate-200 text-slate-700">
                    <Briefcase className="w-4 h-4 text-[#9B4B75] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Justificación Modalidad: </span>
                      <span>{licitacion.justificacion_modalidad}</span>
                    </div>
                  </div>
                )}
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Expediente Técnico y Documentos Oficiales
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Descarga directa de pliegos y especificaciones sin salir de SonarLIC.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Descarga Directa Asistida
                </span>
              </div>

              {/* Lista de Documentos con Descarga Directa */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Estudios Previos y Justificación del Gasto
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Documento Oficial Entidad • Formato Digital
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/api/v1/licitaciones/${licitacion.id_proceso}/descargar?tipo=estudios_previos`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] to-[#9B4B75] hover:opacity-95 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Directo</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#3B6DB5] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Pliego de Condiciones Definitivo & Requisitos
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Especificaciones Técnicas y Criterios Habilitantes
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/api/v1/licitaciones/${licitacion.id_proceso}/descargar?tipo=pliego`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] to-[#9B4B75] hover:opacity-95 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Directo</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Anexo Técnico y Matriz Económica
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Plantilla Oficial de Precios Unitarios
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/api/v1/licitaciones/${licitacion.id_proceso}/descargar?tipo=anexo_economico`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] to-[#9B4B75] hover:opacity-95 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Directo</span>
                  </a>
                </div>
              </div>

              {/* Visor Embebido de la Ficha Oficial SECOP II */}
              {licitacion.url_proceso && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-[#3B6DB5]" />
                      Expediente Transaccional Oficial (SECOP II)
                    </span>
                    <a
                      href={licitacion.url_proceso}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#3B6DB5] hover:underline"
                    >
                      Abrir en ventana externa ↗
                    </a>
                  </div>
                  <div className="w-full h-72 rounded-2xl border border-slate-300 overflow-hidden bg-slate-100 relative shadow-inner">
                    <iframe
                      src={licitacion.url_proceso}
                      title="Visor Oficial SECOP"
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  </div>
                </div>
              )}
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
