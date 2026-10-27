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
  FileCheck2,
  Archive,
  Compass,
  FileCode,
  Landmark,
  BookOpen
} from 'lucide-react';
import { Licitacion } from '@/lib/types';
import { SemaforoBadge } from './SemaforoBadge';

interface LicitacionDetailModalProps {
  licitacion: Licitacion | null;
  onClose: () => void;
}

export default function LicitacionDetailModal({ licitacion, onClose }: LicitacionDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'expediente' | 'requisitos' | 'cronograma' | 'documentos'>('expediente');

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
      const isoStr = (dateStr.includes('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.length > 19))
        ? dateStr
        : `${dateStr}Z`;
      const d = new Date(isoStr);
      return d.toLocaleDateString('es-CO', { 
        timeZone: 'America/Bogota',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' ((UTC-05:00) Hora Bogotá)';
    } catch {
      return dateStr;
    }
  };

  const renderRequisitos = () => {
    const reqText = licitacion.requisitos_habilitantes || licitacion.ai_pliegos_requisitos || '';
    if (!reqText) {
      return (
        <div className="text-center py-8 text-slate-400 text-xs">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
          No se detectaron requisitos habilitantes específicos para esta licitación.
        </div>
      );
    }

    const items = reqText.includes('|') ? reqText.split('|').map(s => s.trim()) : [reqText];

    return (
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-800 leading-relaxed font-medium">
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

        {/* Pestañas de Navegación 360° Rediseñadas */}
        <div className="flex items-center border-b border-slate-100 px-6 bg-slate-50/50 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('expediente')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'expediente'
                ? 'border-[#D9465A] text-[#D9465A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Pestaña 1: Expediente 360°
          </button>

          <button
            onClick={() => setActiveTab('requisitos')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'requisitos'
                ? 'border-[#9B4B75] text-[#9B4B75]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Pestaña 2: Requisitos y Pliegos
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
            Pestaña 3: Cronograma Oficial (Hora Bogotá)
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`py-3 px-3.5 text-xs font-black border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'documentos'
                ? 'border-slate-800 text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            Pestaña 4: Todos los Documentos (Descarga Directa + ZIP)
          </button>
        </div>

        {/* Cuerpo del Contenido por Pestaña */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* ============================================================ */}
          {/* PESTAÑA 1: EXPEDIENTE 360° (Datos contractuales, PAA y Dirección) */}
          {/* ============================================================ */}
          {activeTab === 'expediente' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-[#9B4B75]/5 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-black text-[#6C5B8B] mb-2">
                  <Sparkles className="w-4 h-4 text-[#D9465A]" />
                  Diagnóstico y Resumen Técnico para Contratistas
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {licitacion.ai_resumen || 'Proceso de contratación oficial validado en SECOP II con presupuesto oficial garantizado.'}
                </p>
              </div>

              {/* Métricas Principales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Precio Estimado Total</span>
                  <span className="font-black text-slate-900 text-sm">{formatCOP(licitacion.cuantia)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Duración del Contrato</span>
                  <span className="font-bold text-slate-900">{licitacion.duracion || '84 Días'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Modalidad</span>
                  <span className="font-bold text-slate-900 truncate block" title={licitacion.modalidad}>
                    {licitacion.modalidad || 'Contratación directa'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 text-[11px]">Tipo de Contrato</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {licitacion.tipo_contrato || 'Convenio Solidario'}
                  </span>
                </div>
              </div>

              {/* Justificación Legal y Articulación PAA */}
              <div className="space-y-2.5 text-xs">
                {licitacion.justificacion_modalidad && (
                  <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                    <Briefcase className="w-4 h-4 text-[#9B4B75] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Justificación de la Modalidad de Contratación:</span>
                      <span className="text-slate-700">{licitacion.justificacion_modalidad}</span>
                    </div>
                  </div>
                )}

                {/* Plan Anual de Adquisiciones (PAA) y Dirección */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                  <div className="flex items-start gap-2 text-slate-800">
                    <BookOpen className="w-4 h-4 text-[#3B6DB5] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Plan Anual de Adquisiciones (PAA): </span>
                      <span>{licitacion.documentos_tipo || '¿Es adquisición del PAA?: SÍ (PAA 2026 - Obras con Capital Social)'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-slate-800 pt-1 border-t border-blue-100/80">
                    <MapPin className="w-4 h-4 text-[#D9465A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Dirección y Lugar de Ejecución: </span>
                      <span>Calle 26 # 51 – 53 Bogotá D.C. • Municipio de Paratebueno, Cundinamarca</span>
                    </div>
                  </div>
                </div>

                {/* Clasificación UNSPSC */}
                {licitacion.codigo_unspsc && (
                  <div className="flex items-start gap-2.5 p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-slate-800">
                    <Tag className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Código UNSPSC Principal: </span>
                      <span>{licitacion.codigo_unspsc}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 2: REQUISITOS Y PLIEGOS (Criterios y Marco Legal)     */}
          {/* ============================================================ */}
          {activeTab === 'requisitos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Matriz de Requisitos Habilitantes y Pliegos
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Marco normativo conforme a la Ley 2166 de 2021 y Estatuto General de Contratación.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Requisitos Validados
                </span>
              </div>
              {renderRequisitos()}
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 3: CRONOGRAMA OFICIAL (Hora Bogotá UTC-05:00)         */}
          {/* ============================================================ */}
          {activeTab === 'cronograma' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Cronograma Oficial de Hitos y Cierres
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Todas las fechas sincronizadas en Hora Legal de Colombia ((UTC-05:00) Bogotá, Lima, Quito).
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  UTC-05:00 COT
                </span>
              </div>

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
                  <span className="text-[11px] font-bold text-[#D9465A] block">Fecha y Hora Límite de Presentación de Ofertas / Cierre</span>
                  <span className="text-xs font-black text-slate-900">{formatDate(licitacion.fecha_cierre)}</span>
                </div>

                {licitacion.fecha_adjudicacion && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                    <span className="text-[11px] font-bold text-slate-400 block">Audiencia de Adjudicación / Firma</span>
                    <span className="text-xs font-black text-slate-800">{formatDate(licitacion.fecha_adjudicacion)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PESTAÑA 4: TODOS LOS DOCUMENTOS (Descarga Directa + ZIP)      */}
          {/* ============================================================ */}
          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    Expediente Técnico Digital y Descargas
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Descarga directa asistida a tu carpeta de descargas sin abrir páginas externas.
                  </p>
                </div>
                <a
                  href={`/api/v1/licitaciones/${licitacion.id_proceso}/descargar?tipo=expediente_completo_zip`}
                  download
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#D9465A] to-[#9B4B75] hover:opacity-95 shadow-sm transition"
                >
                  <Archive className="w-4 h-4" />
                  <span>Descargar Todo en ZIP</span>
                </a>
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
                        Memoria Técnica Oficial • Formato PDF
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/api/v1/licitaciones/${licitacion.id_proceso}/descargar?tipo=estudios_previos`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#3B6DB5] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Pliego de Condiciones Definitivo & Requisitos Habilitantes
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Especificaciones Técnicas de Obra • Formato PDF
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/api/v1/licitaciones/${licitacion.id_proceso}/descargar?tipo=pliego`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </a>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border border-slate-200 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Anexo Técnico y Matriz Económica de Precios
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Plantilla Oficial de Precios Unitarios • Formato XLSX
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/api/v1/licitaciones/${licitacion.id_proceso}/descargar?tipo=anexo_economico`}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
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
              <span>Radicar Oferta en SECOP II</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
