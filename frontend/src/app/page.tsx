'use client';

import React, { useState, useEffect } from 'react';
import { Licitacion, LicitacionesResponse } from '@/lib/types';
import { LicitacionCard } from '@/components/LicitacionCard';
import { SemaforoBadge } from '@/components/SemaforoBadge';
import { Search, Filter, Radar, Sparkles, Building2, Calendar, DollarSign, X } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function DashboardPage() {
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Filtros
  const [query, setQuery] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [semaforo, setSemaforo] = useState('');
  
  // Modal de Detalle
  const [selectedLicitacion, setSelectedLicitacion] = useState<Licitacion | null>(null);

  const fetchLicitaciones = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (departamento) params.append('departamento', departamento);
      if (semaforo) params.append('semaforo', semaforo);
      params.append('limit', '24');

      const res = await fetch(`${API_BASE}/api/v1/licitaciones?${params.toString()}`);
      if (res.ok) {
        const data: LicitacionesResponse = await res.json();
        setLicitaciones(data.items);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Error cargando licitaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicitaciones();
  }, [departamento, semaforo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLicitaciones();
  };

  const handleToggleFavorite = async (id_proceso: string, currentStatus: boolean) => {
    // Actualización optimista en interfaz
    setLicitaciones((prev) =>
      prev.map((item) =>
        item.id_proceso === id_proceso ? { ...item, is_favorite: !currentStatus } : item
      )
    );

    try {
      await fetch(`${API_BASE}/api/v1/licitaciones/favoritos/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_proceso,
          favorito: !currentStatus,
        }),
      });
    } catch (err) {
      console.error('Error actualizando favorito:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de Navegación */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Radar className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">SonarIAR</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Radar PYME
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Conectado a SECOP I y II
            </span>
          </div>
        </div>
      </header>

      {/* Hero y Filtros */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Oportunidades de Contratación con Filtro Inteligente
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Monitoreo en tiempo real de licitaciones públicas de Colombia con análisis cognitivo de pliegos y semáforos de viabilidad para PYMEs.
          </p>
        </div>

        {/* Formulario de Búsqueda */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por objeto, palabras clave, entidad (ej: software, dotación, obra)..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Explorar
            </button>
          </form>

          {/* Filtros Rápidos */}
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtrar por:
            </span>

            {/* Selector de Departamento */}
            <select
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todos los Departamentos</option>
              <option value="Bogotá D.C.">Bogotá D.C.</option>
              <option value="Antioquia">Antioquia</option>
              <option value="Valle del Cauca">Valle del Cauca</option>
              <option value="Cundinamarca">Cundinamarca</option>
              <option value="Santander">Santander</option>
              <option value="Atlántico">Atlántico</option>
            </select>

            {/* Selector de Semáforo IA */}
            <select
              value={semaforo}
              onChange={(e) => setSemaforo(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todos los Semáforos</option>
              <option value="VERDE">🟢 Viabilidad Alta (PYME)</option>
              <option value="AMARILLO">🟡 Requisitos Medios</option>
              <option value="ROJO">🔴 Alta Complejidad</option>
            </select>
          </div>
        </div>
      </section>

      {/* Contenido Principal / Grilla de Licitaciones */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Licitaciones Recientes <span className="text-sm font-normal text-slate-500">({total} encontradas)</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-xl border border-slate-200/80 animate-pulse p-5" />
            ))}
          </div>
        ) : licitaciones.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Radar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No se encontraron licitaciones</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o filtros de departamento y semáforo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licitaciones.map((lic) => (
              <LicitacionCard
                key={lic.id_proceso}
                licitacion={lic}
                onToggleFavorite={handleToggleFavorite}
                onSelect={(selected) => setSelectedLicitacion(selected)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalle con Análisis IA */}
      {selectedLicitacion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <SemaforoBadge status={selectedLicitacion.ai_semaforo} />
                <button
                  onClick={() => setSelectedLicitacion(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {selectedLicitacion.entidad}
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-4 leading-snug">
                {selectedLicitacion.objeto}
              </h2>

              {/* Bloque de Análisis IA */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Diagnóstico Cognitivo SonarIAR
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {selectedLicitacion.ai_resumen || 'Sin resumen analítico disponible.'}
                </p>

                {selectedLicitacion.ai_pliegos_requisitos && (
                  <div className="border-t border-emerald-200/60 pt-2 text-xs">
                    <span className="font-semibold text-emerald-900 block mb-1">
                      Puntos Clave de Pliegos:
                    </span>
                    <p className="text-slate-600">{selectedLicitacion.ai_pliegos_requisitos}</p>
                  </div>
                )}
              </div>

              {/* Información General */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 rounded-xl p-3 text-slate-700 mb-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">Cuantía Estimada:</span>
                  <span className="font-semibold text-slate-900">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(selectedLicitacion.cuantia)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Ubicación:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedLicitacion.municipio ? `${selectedLicitacion.municipio}, ` : ''}{selectedLicitacion.departamento}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Modalidad:</span>
                  <span className="font-semibold text-slate-900">{selectedLicitacion.modalidad || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tipo de Contrato:</span>
                  <span className="font-semibold text-slate-900">{selectedLicitacion.tipo_contrato || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedLicitacion(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
              {selectedLicitacion.url_proceso && (
                <a
                  href={selectedLicitacion.url_proceso}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-center transition-colors shadow-sm"
                >
                  Postularse en SECOP
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
