'use client';

import React, { useState } from 'react';
import { SonarLogo } from './SonarLogo';
import {
  X,
  Mail,
  Lock,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  UserCheck,
  KeyRound,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  onLoginSuccess?: (role: string, targetPath: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  onLoginSuccess
}) => {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  // Formulario Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Formulario Registro
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nit, setNit] = useState('');
  const [emailRegistro, setEmailRegistro] = useState('');
  const [telefono, setTelefono] = useState('');
  const [passwordRegistro, setPasswordRegistro] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Acceso Rápido SuperAdmin
  const handleQuickSuperAdmin = () => {
    setEmail('admin@sonarlic.com');
    setPassword('••••••••••••');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess('superadmin', '/superadmin');
      } else {
        router.push('/superadmin');
      }
    }, 400);
  };

  // Acceso Rápido Empresa Demo (Biolab S.A.S.)
  const handleQuickEmpresa = () => {
    setEmail('contacto@biolab.co');
    setPassword('••••••••••••');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess('empresa', '/empresa/emp_tecnologia');
      } else {
        router.push('/empresa/emp_tecnologia');
      }
    }, 400);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      // Si el email contiene admin, llevar a superadmin, si no a empresa
      if (email.toLowerCase().includes('admin')) {
        router.push('/superadmin');
      } else {
        router.push('/empresa/emp_tecnologia');
      }
    }, 500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
      router.push('/empresa/emp_tecnologia');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado con Identidad iAR estilo Claro Homologado a Página Principal */}
        <div className="p-6 pb-5 bg-white border-b border-slate-100">
          <div className="mb-3">
            <SonarLogo size="sm" isDark={false} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {tab === 'login' ? 'Bienvenido a SonarLIC' : 'Registra tu Empresa'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'login'
              ? 'Inicia sesión para gestionar tus oportunidades y reglas de contratación pública.'
              : 'Empieza a recibir y cruzar licitaciones del SECOP a la medida de tu negocio.'}
          </p>

          {/* Selector de Pestañas: Login vs Registro con estilo claro idéntico al sitio */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl mt-5 text-xs font-bold border border-slate-200/60">
            <button
              onClick={() => setTab('login')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setTab('register')}
              className={`py-2 rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        </div>

        {/* CONTENEDOR DE ACCESOS RÁPIDOS (DEMO & TEST) */}
        <div className="p-5 pb-3 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Accesos Rápidos Demo (1-Click)</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Botón Acceso Rápido SuperAdmin */}
            <button
              onClick={handleQuickSuperAdmin}
              disabled={loading}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#D9465A] hover:bg-rose-50/50 transition-all text-left shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100/80 text-[#D9465A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">SuperAdmin</div>
                <div className="text-[10px] text-slate-400">Control SaaS</div>
              </div>
            </button>

            {/* Botón Acceso Rápido Empresa */}
            <button
              onClick={handleQuickEmpresa}
              disabled={loading}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#3B6DB5] hover:bg-blue-50/50 transition-all text-left shadow-2xs group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-[#3B6DB5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 truncate">Biolab S.A.S.</div>
                <div className="text-[10px] text-slate-400">Empresa Demo</div>
              </div>
            </button>
          </div>
        </div>

        {/* CUERPO DEL FORMULARIO */}
        <div className="p-6">
          {tab === 'login' ? (
            /* FORMULARIO LOGIN */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Contraseña</label>
                  <a href="#" className="text-[11px] font-semibold text-[#3B6DB5] hover:underline">
                    ¿Olvidaste tu clave?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] hover:opacity-95 shadow-md shadow-[#9B4B75]/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Accediendo...' : 'Iniciar Sesión en SonarLIC'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* FORMULARIO REGISTRO EMPRESA */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Empresa / Razón Social
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Inversiones Globales S.A.S."
                    value={nombreEmpresa}
                    onChange={(e) => setNombreEmpresa(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIT</label>
                  <input
                    type="text"
                    required
                    placeholder="900.123.456-7"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+57 300 000 0000"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="contacto@miempresa.com"
                    value={emailRegistro}
                    onChange={(e) => setEmailRegistro(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Crear Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 8 caracteres"
                    value={passwordRegistro}
                    onChange={(e) => setPasswordRegistro(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#3B6DB5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] hover:opacity-95 shadow-md shadow-[#9B4B75]/25 transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Creando cuenta...' : 'Comenzar Prueba Gratuita'}
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            Al continuar, aceptas los términos de servicio y política de privacidad de SonarLIC & iAR Tecnology.
          </div>
        </div>
      </div>
    </div>
  );
};
