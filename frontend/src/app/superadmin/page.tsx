'use client';

import React, { useState, useEffect } from 'react';
import { SonarLogo } from '@/components/SonarLogo';
import { SuperAdminStats, EmpresaSaas } from '@/lib/types';
import {
  Users,
  ShieldCheck,
  Building2,
  Filter,
  Layers,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function SuperAdminPage() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaSaas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('');

  // Modal para nueva empresa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [plan, setPlan] = useState<'STARTER' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [saving, setSaving] = useState(false);

  const fetchSuperAdminData = async () => {
    setLoading(true);
    try {
      const [resStats, resEmpresas] = await Promise.all([
        fetch(`${API_BASE}/api/v1/saas/superadmin/stats`),
        fetch(`${API_BASE}/api/v1/saas/empresas`)
      ]);

      if (resStats.ok) {
        const statsData = await resStats.json();
        setStats(statsData);
      }
      if (resEmpresas.ok) {
        const empresasData = await resEmpresas.json();
        setEmpresas(empresasData);
      }
    } catch (err) {
      console.error('Error cargando datos de SuperAdmin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const handleCreateEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/saas/empresas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          nit,
          email_contacto: email,
          telefono,
          plan,
          estado: 'ACTIVO'
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNombre('');
        setNit('');
        setEmail('');
        setTelefono('');
        fetchSuperAdminData();
      }
    } catch (err) {
      console.error('Error creando empresa:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredEmpresas = empresas.filter((emp) => {
    const matchesSearch =
      emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email_contacto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan ? emp.plan === filterPlan : true;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header Corporativo SuperAdmin */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SonarLogo size="md" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-[#D9465A] to-[#9B4B75] text-white uppercase tracking-wider">
              SuperAdmin Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSuperAdminData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              ← Ir al Radar Público
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] to-[#9B4B75] hover:opacity-95 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Nueva Empresa
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Banner de Estado General */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Panel de Control Global SaaS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervisión integral de clientes corporativos, ejecución de motores de cruce en ClickHouse y estado del servicio.
          </p>
        </div>

        {/* Métricas Globales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#3B6DB5]/30 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Empresas Registradas
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3B6DB5] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {stats?.total_empresas ?? 0}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {stats?.empresas_activas ?? 0} Activas
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Clientes en plan de suscripción</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#D9465A]/30 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Reglas de Búsqueda
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#D9465A] flex items-center justify-center">
                <Filter className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {stats?.total_reglas_activas ?? 0}
              </span>
              <span className="text-xs font-semibold text-slate-500">activas</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Monitoreo continuo multivariable</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#9B4B75]/30 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Licitaciones en Base
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#9B4B75] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {stats?.total_licitaciones_analizadas ?? 0}
              </span>
              <span className="text-xs font-semibold text-slate-500">SECOP I y II</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">ClickHouse OLAP indexado</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-500/30 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cruces de Interés
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700">
                {stats?.total_cruces_generados ?? 0}
              </span>
              <span className="text-xs font-semibold text-slate-500">matches</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Oportunidades despachadas a clientes</p>
          </div>
        </div>

        {/* Tabla de Gestión de Empresas SaaS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Directorio de Empresas Suscritas
              </h2>
              <p className="text-xs text-slate-500">
                Gestiona accesos, planes y revisa el espacio de trabajo de cada cliente.
              </p>
            </div>

            {/* Barra de Filtros */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o NIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                />
              </div>

              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#3B6DB5] text-slate-600 font-medium"
              >
                <option value="">Todos los planes</option>
                <option value="STARTER">Starter</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Empresa / Razón Social</th>
                  <th className="py-3 px-4">NIT</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Plan SaaS</th>
                  <th className="py-3 px-4">Reglas Activas</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmpresas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900">{emp.nombre}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.id}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-600 font-medium">
                      {emp.nit}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-800">{emp.email_contacto}</div>
                      <div className="text-[11px] text-slate-400">{emp.telefono || 'Sin teléfono'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          emp.plan === 'ENTERPRISE'
                            ? 'bg-purple-100 text-[#9B4B75]'
                            : emp.plan === 'PRO'
                            ? 'bg-blue-100 text-[#3B6DB5]'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {emp.plan}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-[#D9465A]" />
                        {emp.total_reglas || 0} configuradas
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {emp.estado}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/empresa/${emp.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#3B6DB5] bg-blue-50 hover:bg-blue-100 transition"
                      >
                        Abrir Dashboard
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Registrar Nueva Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Registrar Nueva Empresa en SaaS
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Crea la cuenta de la empresa para habilitar su propio panel de reglas de licitación.
            </p>

            <form onSubmit={handleCreateEmpresa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Razón Social / Nombre Comercial
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: InnovaTech Colombia S.A.S."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIT
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 901.321.456-7"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="licitaciones@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="+57 300 000 0000"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Plan de Suscripción
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5] font-medium"
                >
                  <option value="STARTER">Starter (Hasta 3 reglas de búsqueda)</option>
                  <option value="PRO">Pro (Hasta 10 reglas de búsqueda)</option>
                  <option value="ENTERPRISE">Enterprise (Reglas ilimitadas)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] to-[#9B4B75] rounded-xl hover:opacity-95 shadow-md transition"
                >
                  {saving ? 'Guardando...' : 'Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
