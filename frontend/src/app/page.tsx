'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Licitacion, LicitacionesResponse } from '@/lib/types';
import { LicitacionCard } from '@/components/LicitacionCard';
import { SemaforoBadge } from '@/components/SemaforoBadge';
import { AuthModal } from '@/components/AuthModal';
import { SonarLogo } from '@/components/SonarLogo';
import LicitacionDetailModal from '@/components/LicitacionDetailModal';
import {
  Search,
  Filter,
  Radar,
  Sparkles,
  Building2,
  Calendar,
  DollarSign,
  X,
  Bot,
  Target,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  LogIn,
  UserPlus
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'explorador' | 'oportunidades'>('explorador');
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filtros
  const [query, setQuery] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [semaforo, setSemaforo] = useState('');

  // Modales
  const [selectedLicitacion, setSelectedLicitacion] = useState<Licitacion | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');

  const openLogin = () => {
    setAuthDefaultTab('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthDefaultTab('register');
    setIsAuthModalOpen(true);
  };

  const fetchLicitaciones = async () => {
    setLoading(true);
    try {
      if (activeTab === 'oportunidades') {
        const res = await fetch(`${API_BASE}/api/v1/perfil/mis-oportunidades?limit=24`);
        if (res.ok) {
          const data: LicitacionesResponse = await res.json();
          setLicitaciones(data.items);
          setTotal(data.total);
        }
      } else {
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
      }
    } catch (err) {
      console.error('Error cargando licitaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicitaciones();
  }, [activeTab, departamento, semaforo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLicitaciones();
  };

  const handleToggleFavorite = async (id_proceso: string, currentStatus: boolean) => {
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* 1. Barra de Navegación con Efecto Vidrio Esmerilado Oficial iAR Tecnology */}
      <header className="sticky top-0 z-40 px-3 sm:px-6 pt-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto bg-white/75 backdrop-blur-[15px] [-webkit-backdrop-filter:blur(15px)] border-b border-x border-white/60 rounded-b-[25px] shadow-[0px_5px_23px_4px_rgba(0,0,0,0.08)] px-4 sm:px-8 h-18 flex items-center justify-between transition-all">
          {/* Logo Oficial SonarLIC iAR tecnology */}
          <SonarLogo size="md" />

          {/* Acciones de la barra */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={openLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200/80 bg-white/60 hover:bg-white transition shadow-2xs backdrop-blur-xs"
              title="Iniciar Sesión / Acceso Rápido Demo"
            >
              <LogIn className="w-3.5 h-3.5 text-[#3B6DB5]" />
              <span>Ingresar</span>
            </button>

            <button
              onClick={openRegister}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] hover:opacity-95 shadow-sm shadow-[#9B4B75]/25 transition hover:scale-[1.02] active:scale-[0.98]"
              title="Registrar Nueva Empresa"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarse</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section con Fondo Oscuro Profundo y Degradado iAR */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B0E14] via-[#171526] to-[#101726] text-white py-14 px-4 sm:px-6 lg:px-8">
        {/* Efecto de Luces Ambientales (Glows IAR) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D9465A]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#3B6DB5]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium mb-4 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#D9465A] animate-ping" />
            <span>Radar Inteligente en Tiempo Real</span>
            <span className="text-slate-400">•</span>
            <span className="text-[#3B6DB5] font-bold">SECOP I & II</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">
            Descubre Licitaciones que <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] bg-clip-text text-transparent">
              Hacen Match con tu Empresa
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Monitoreo continuo de contratación pública en Colombia con diagnóstico cognitivo de pliegos y semáforos de viabilidad técnica para PYMEs.
          </p>
        </div>

        {/* Buscador Flotante con Glassmorphism */}
        <div className="relative max-w-3xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por objeto, palabras clave, entidad (ej: computadores, dotación, obra)..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B6DB5] focus:border-transparent transition-all text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3.5 bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] hover:opacity-95 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-[#9B4B75]/30 flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02]"
            >
              <Search className="w-4 h-4" />
              Explorar
            </button>
          </form>

          {/* Filtros Rápidos */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <Filter className="w-3.5 h-3.5 text-[#3B6DB5]" /> Filtrar por:
            </span>

            {/* Selector de Departamento */}
            <select
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="bg-slate-900/80 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3B6DB5] font-medium"
            >
              <option value="">Todos los Departamentos</option>
              <option value="Bogotá D.C.">Bogotá D.C.</option>
              <option value="Antioquia">Antioquia</option>
              <option value="Valle del Cauca">Valle del Cauca</option>
              <option value="Cundinamarca">Cundinamarca</option>
              <option value="Santander">Santander</option>
              <option value="Atlántico">Atlántico</option>
              <option value="Bolívar">Bolívar</option>
            </select>

            {/* Selector de Semáforo IA */}
            <select
              value={semaforo}
              onChange={(e) => setSemaforo(e.target.value)}
              className="bg-slate-900/80 border border-slate-700/80 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3B6DB5] font-medium"
            >
              <option value="">Todos los Semáforos</option>
              <option value="VERDE">🟢 Viable PYME (Baja Complejidad)</option>
              <option value="AMARILLO">🟡 Requisitos Medios</option>
              <option value="ROJO">🔴 Alta Complejidad</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. Selector de Pestañas: Mis Oportunidades vs Explorador General */}
      <div className="bg-white border-b border-slate-200 sticky top-18 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('explorador')}
              className={`py-4 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'explorador'
                  ? 'border-[#3B6DB5] text-[#3B6DB5]'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              Explorador General SECOP
            </button>

            <button
              onClick={() => setActiveTab('oportunidades')}
              className={`py-4 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'oportunidades'
                  ? 'border-[#D9465A] text-[#9B4B75] bg-gradient-to-r from-[#D9465A]/5 to-[#3B6DB5]/5'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D9465A]" />
              Mis Oportunidades (Radar PYME)
              <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D9465A] to-[#9B4B75] text-white font-bold">
                Match
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{total}</span> licitaciones indexadas
          </div>
        </div>
      </div>

      {/* 4. Grilla Principal de Contenido */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Informativo cuando está en Mis Oportunidades */}
        {activeTab === 'oportunidades' && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#D9465A]/8 via-[#9B4B75]/8 to-[#3B6DB5]/8 border border-[#9B4B75]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 text-[#D9465A] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Radar Personalizado de Contratación
                </h3>
                <p className="text-xs text-slate-600">
                  Licitaciones ordenadas por porcentaje de compatibilidad con las palabras clave y departamentos de tu empresa.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPerfilModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all shrink-0"
            >
              Editar Criterios
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-72 bg-white rounded-2xl border border-slate-200/80 animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded-md w-1/3" />
                  <div className="h-5 bg-slate-100 rounded-md w-full" />
                  <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                </div>
                <div className="h-10 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : licitaciones.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Radar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No se encontraron licitaciones</h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              {activeTab === 'oportunidades'
                ? 'Configura las palabras clave de tu empresa en "Mi Perfil PYME" para que el radar comience a encontrar coincidencias.'
                : 'Intenta modificar los términos de búsqueda o cambiar los filtros de departamento y semáforo.'}
            </p>
            {activeTab === 'oportunidades' && (
              <button
                onClick={() => setIsPerfilModalOpen(true)}
                className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D9465A] to-[#3B6DB5] text-white text-xs font-bold shadow-md transition-all hover:scale-105"
              >
                Configurar mi Perfil Ahora
              </button>
            )}
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

      {/* 5. Modal de Detalle 360° con Expediente Completo */}
      <LicitacionDetailModal
        licitacion={selectedLicitacion}
        onClose={() => setSelectedLicitacion(null)}
      />

      {/* Modales */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />
    </div>
  );
}
