'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SonarLogo } from '@/components/SonarLogo';
import { LicitacionCard } from '@/components/LicitacionCard';
import { SemaforoBadge } from '@/components/SemaforoBadge';
import { PerfilModal } from '@/components/PerfilModal';
import { ReglaBusqueda, EmpresaSaas, Licitacion, LicitacionesResponse } from '@/lib/types';
import {
  Building2,
  Filter,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  MapPin,
  DollarSign,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  FolderKanban,
  Target,
  ArrowLeft,
  X
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const DEPARTAMENTOS_COLOMBIA = [
  'Bogotá D.C.',
  'Antioquia',
  'Valle del Cauca',
  'Cundinamarca',
  'Santander',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Norte de Santander',
  'Tolima',
  'Huila',
  'Caldas',
  'Risaralda',
  'Amazonas',
  'Meta'
];

export default function EmpresaDashboardPage() {
  const params = useParams();
  const empresaId = (params?.id as string) || 'emp_tecnologia';

  const [empresa, setEmpresa] = useState<EmpresaSaas | null>(null);
  const [reglas, setReglas] = useState<ReglaBusqueda[]>([]);
  const [selectedReglaId, setSelectedReglaId] = useState<string | null>(null);
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);

  // Modal para crear/editar regla de búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [nombreRegla, setNombreRegla] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [palabrasClave, setPalabrasClave] = useState<string[]>([]);
  const [nuevaPalabra, setNuevaPalabra] = useState('');
  const [palabrasExcluidas, setPalabrasExcluidas] = useState<string[]>([]);
  const [nuevaExcluida, setNuevaExcluida] = useState('');
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [cuantiaMin, setCuantiaMin] = useState(0);
  const [cuantiaMax, setCuantiaMax] = useState(500000000);
  const [semaforoMaximo, setSemaforoMaximo] = useState('AMARILLO');
  const [savingRegla, setSavingRegla] = useState(false);

  // Modal de detalle de licitación
  const [selectedLicitacion, setSelectedLicitacion] = useState<Licitacion | null>(null);

  // Cargar perfil de la empresa y sus reglas
  const loadEmpresaData = async () => {
    setLoading(true);
    try {
      const [resEmpresas, resReglas] = await Promise.all([
        fetch(`${API_BASE}/api/v1/saas/empresas`),
        fetch(`${API_BASE}/api/v1/saas/empresas/${empresaId}/reglas`)
      ]);

      if (resEmpresas.ok) {
        const emps: EmpresaSaas[] = await resEmpresas.json();
        const found = emps.find((e) => e.id === empresaId) || {
          id: empresaId,
          nombre: 'Empresa Registrada',
          nit: '900.000.000-0',
          email_contacto: 'contacto@empresa.com',
          plan: 'PRO',
          estado: 'ACTIVO'
        };
        setEmpresa(found);
      }

      if (resReglas.ok) {
        const rulesData: ReglaBusqueda[] = await resReglas.json();
        setReglas(rulesData);
      }
    } catch (err) {
      console.error('Error cargando empresa:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar cruces de licitaciones según la regla seleccionada (o todas)
  const loadCruces = async (reglaId?: string | null) => {
    setLoadingMatches(true);
    try {
      const queryParam = reglaId ? `?regla_id=${reglaId}&limit=24` : '?limit=24';
      const res = await fetch(`${API_BASE}/api/v1/saas/empresas/${empresaId}/cruces${queryParam}`);
      if (res.ok) {
        const data: LicitacionesResponse = await res.json();
        setLicitaciones(data.items);
        setTotalMatches(data.total);
      }
    } catch (err) {
      console.error('Error cargando cruces:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    loadEmpresaData();
  }, [empresaId]);

  useEffect(() => {
    loadCruces(selectedReglaId);
  }, [empresaId, selectedReglaId]);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaPalabra.trim() && !palabrasClave.includes(nuevaPalabra.trim())) {
      setPalabrasClave([...palabrasClave, nuevaPalabra.trim()]);
      setNuevaPalabra('');
    }
  };

  const handleAddExcluida = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaExcluida.trim() && !palabrasExcluidas.includes(nuevaExcluida.trim())) {
      setPalabrasExcluidas([...palabrasExcluidas, nuevaExcluida.trim()]);
      setNuevaExcluida('');
    }
  };

  const toggleDepto = (depto: string) => {
    if (departamentos.includes(depto)) {
      setDepartamentos(departamentos.filter((d) => d !== depto));
    } else {
      setDepartamentos([...departamentos, depto]);
    }
  };

  const handleSaveRegla = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRegla(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/saas/empresas/${empresaId}/reglas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresaId,
          nombre_regla: nombreRegla,
          descripcion,
          palabras_clave: palabrasClave,
          palabras_excluidas: palabrasExcluidas,
          departamentos,
          cuantia_minima: cuantiaMin,
          cuantia_maxima: cuantiaMax,
          semaforo_maximo: semaforoMaximo,
          activa: true
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNombreRegla('');
        setDescripcion('');
        setPalabrasClave([]);
        setPalabrasExcluidas([]);
        setDepartamentos([]);
        await loadEmpresaData();
        await loadCruces(selectedReglaId);
      }
    } catch (err) {
      console.error('Error guardando regla:', err);
    } finally {
      setSavingRegla(false);
    }
  };

  const handleDeleteRegla = async (reglaId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta regla de búsqueda?')) return;
    try {
      await fetch(`${API_BASE}/api/v1/saas/empresas/${empresaId}/reglas/${reglaId}`, {
        method: 'DELETE'
      });
      if (selectedReglaId === reglaId) setSelectedReglaId(null);
      await loadEmpresaData();
      await loadCruces(null);
    } catch (err) {
      console.error('Error eliminando regla:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Barra de Navegación con Vidrio Esmerilado Oficial iAR Tecnology */}
      <header className="sticky top-0 z-40 px-3 sm:px-6 pt-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-[15px] [-webkit-backdrop-filter:blur(15px)] border-b border-x border-white/60 rounded-b-[25px] shadow-[0px_5px_23px_4px_rgba(0,0,0,0.08)] px-4 sm:px-8 h-18 flex items-center justify-between transition-all">
          <div className="flex items-center gap-4">
            <SonarLogo size="md" />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#3B6DB5]" />
              <span className="font-black text-slate-800 text-sm">{empresa?.nombre || 'Mi Empresa'}</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#3B6DB5]">
                Plan {empresa?.plan || 'PRO'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/superadmin"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white/60 hover:bg-white transition"
            >
              Control SaaS (SuperAdmin)
            </Link>
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white/60 hover:bg-white transition"
            >
              Radar Público
            </Link>
            <button
              onClick={() => setIsPerfilModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200/80 bg-white/60 hover:bg-white transition"
              title="Configurar Perfil de Contratación PYME"
            >
              <Target className="w-4 h-4 text-[#9B4B75]" />
              <span>Perfil Contratación PYME</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] to-[#9B4B75] hover:opacity-95 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Nueva Búsqueda
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal: Reglas a la izquierda, Cruces a la derecha */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMNA IZQUIERDA: CONFIGURACIONES DE BÚSQUEDA GUARDADAS (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#D9465A]" />
                  <h2 className="text-sm font-black text-slate-900">
                    Mis Búsquedas Guardadas
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {reglas.length} configuraciones
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Configura múltiples perfiles según las líneas de negocio de tu empresa para cruzar licitaciones en tiempo real.
              </p>

              {/* Botón Ver Todas */}
              <button
                onClick={() => setSelectedReglaId(null)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition mb-3 flex items-center justify-between ${
                  selectedReglaId === null
                    ? 'border-[#3B6DB5] bg-blue-50/60 text-[#3B6DB5] shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-[#3B6DB5]" />
                  <span>Cruzar Todas las Búsquedas</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white border border-slate-200">
                  Global
                </span>
              </button>

              {/* Lista de Reglas */}
              <div className="space-y-2.5">
                {reglas.map((regla) => {
                  const isSelected = selectedReglaId === regla.id;
                  return (
                    <div
                      key={regla.id}
                      className={`p-3.5 rounded-xl border transition relative ${
                        isSelected
                          ? 'border-[#D9465A] bg-rose-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        onClick={() => setSelectedReglaId(regla.id || null)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="text-xs font-black text-slate-900 hover:text-[#D9465A] transition">
                            {regla.nombre_regla}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            {regla.coincidencias_count || 0} matches
                          </span>
                        </div>

                        {regla.descripcion && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                            {regla.descripcion}
                          </p>
                        )}

                        {/* Etiquetas de la regla */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {regla.palabras_clave.slice(0, 3).map((kw, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                            >
                              {kw}
                            </span>
                          ))}
                          {regla.palabras_clave.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400">
                              +{regla.palabras_clave.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                          <span>Max: ${(regla.cuantia_maxima / 1000000).toFixed(0)}M COP</span>
                          <span>•</span>
                          <span>Semáforo {regla.semaforo_maximo}</span>
                        </div>
                      </div>

                      {/* Botón eliminar regla */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (regla.id) handleDeleteRegla(regla.id);
                        }}
                        className="absolute bottom-3 right-3 text-slate-400 hover:text-rose-600 transition p-1"
                        title="Eliminar regla"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {reglas.length === 0 && (
                  <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-xl">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600 mb-1">
                      No tienes búsquedas configuradas
                    </p>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Agrega tu primera regla para que el radar cruce licitaciones automáticamente.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs font-bold text-[#D9465A] hover:underline"
                    >
                      + Configurar ahora
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: RESULTADOS DEL CRUCE DE LICITACIONES (8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D9465A]" />
                    <h1 className="text-base font-black text-slate-900">
                      {selectedReglaId
                        ? `Oportunidades para: ${
                            reglas.find((r) => r.id === selectedReglaId)?.nombre_regla || 'Regla'
                          }`
                        : 'Cruces Consolidados de Todas tus Búsquedas'}
                    </h1>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Licitaciones del SECOP cruzadas con los filtros, palabras clave y regiones configuradas.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">{totalMatches}</span>
                    <span className="text-xs text-slate-500 ml-1">licitaciones cruzadas</span>
                  </div>
                  <button
                    onClick={() => loadCruces(selectedReglaId)}
                    disabled={loadingMatches}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-600"
                    title="Actualizar cruces"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingMatches ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Listado de Licitaciones */}
            {loadingMatches ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-44"
                  />
                ))}
              </div>
            ) : licitaciones.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {licitaciones.map((lic) => (
                  <LicitacionCard
                    key={lic.id_proceso}
                    licitacion={lic}
                    onSelect={(item) => setSelectedLicitacion(item)}
                    onToggleFavorite={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-800 mb-1">
                  Sin coincidencias directas para esta regla
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Prueba ampliando los departamentos, ajustando el rango de cuantía o añadiendo sinónimos a tus palabras clave.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Crear / Editar Regla de Búsqueda */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#D9465A]" />
                <h3 className="text-base font-black text-slate-900">
                  Configurar Nueva Regla de Búsqueda
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRegla} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Búsqueda / Línea de Negocio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Suministro de Equipos Médicos y Quirúrgicos"
                  value={nombreRegla}
                  onChange={(e) => setNombreRegla(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Licitaciones para el área hospitalaria y reactivos de laboratorio"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                />
              </div>

              {/* Palabras Clave */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Palabras Clave Obligatorias / De Interés
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Escribe una palabra (ej: Salud, Instrumental) y presiona Añadir"
                    value={nuevaPalabra}
                    onChange={(e) => setNuevaPalabra(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    Añadir
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {palabrasClave.map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-[#3B6DB5] font-semibold"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => setPalabrasClave(palabrasClave.filter((_, idx) => idx !== i))}
                        className="hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Palabras Excluidas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Palabras Excluidas (Descartar Licitación)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Escribe palabras que NO te interesan (ej: Obra civil, Alimentos)"
                    value={nuevaExcluida}
                    onChange={(e) => setNuevaExcluida(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                  <button
                    type="button"
                    onClick={handleAddExcluida}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    Añadir
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {palabrasExcluidas.map((ex, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold"
                    >
                      {ex}
                      <button
                        type="button"
                        onClick={() => setPalabrasExcluidas(palabrasExcluidas.filter((_, idx) => idx !== i))}
                        className="hover:text-rose-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Departamentos */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Departamentos de Operación (Cobertura)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {DEPARTAMENTOS_COLOMBIA.map((depto) => {
                    const isSelected = departamentos.includes(depto);
                    return (
                      <button
                        key={depto}
                        type="button"
                        onClick={() => toggleDepto(depto)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#D9465A] to-[#9B4B75] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {depto}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rango de Cuantía */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cuantía Mínima (COP)
                  </label>
                  <input
                    type="number"
                    value={cuantiaMin}
                    onChange={(e) => setCuantiaMin(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cuantía Máxima (COP)
                  </label>
                  <input
                    type="number"
                    value={cuantiaMax}
                    onChange={(e) => setCuantiaMax(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
              </div>

              {/* Semáforo Máximo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Complejidad Máxima Aceptable
                </label>
                <select
                  value={semaforoMaximo}
                  onChange={(e) => setSemaforoMaximo(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5] font-medium"
                >
                  <option value="VERDE">🟢 Solo Verde (Baja Complejidad / Ideal PYME)</option>
                  <option value="AMARILLO">🟡 Verde y Amarillo (Requisitos Medios)</option>
                  <option value="ROJO">🔴 Todos los Semáforos (Incluyendo Alta Complejidad)</option>
                </select>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingRegla}
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] to-[#9B4B75] rounded-xl hover:opacity-95 shadow-md transition"
                >
                  {savingRegla ? 'Guardando...' : 'Guardar y Cruzar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle Licitación */}
      {selectedLicitacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {selectedLicitacion.numero_proceso}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {selectedLicitacion.entidad}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLicitacion(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-700">Objeto del Contrato:</span>
                <p className="text-xs text-slate-600 mt-1">{selectedLicitacion.objeto}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400">Cuantía:</span>
                  <div className="font-bold text-slate-900">
                    ${selectedLicitacion.cuantia.toLocaleString('es-CO')} COP
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Ubicación:</span>
                  <div className="font-bold text-slate-900">
                    {selectedLicitacion.departamento} ({selectedLicitacion.municipio || 'Principal'})
                  </div>
                </div>
              </div>

              {selectedLicitacion.ai_resumen && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-[#3B6DB5]">Diagnóstico Cognitivo IA:</span>
                  <p className="text-xs text-slate-700 mt-1">{selectedLicitacion.ai_resumen}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedLicitacion(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cerrar
              </button>
              {selectedLicitacion.url_proceso && (
                <a
                  href={selectedLicitacion.url_proceso}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3B6DB5] rounded-xl hover:bg-blue-700 transition"
                >
                  Ver en SECOP II
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Perfil de Contratación PYME de la Empresa */}
      <PerfilModal
        isOpen={isPerfilModalOpen}
        onClose={() => setIsPerfilModalOpen(false)}
        apiBase={API_BASE}
        onProfileSaved={() => {
          loadCruces(selectedReglaId);
        }}
      />
    </div>
  );
}
