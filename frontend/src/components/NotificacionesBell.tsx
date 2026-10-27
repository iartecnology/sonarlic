'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Notificacion, NotificacionesResponse } from '@/lib/types';
import {
  Bell,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  MapPin,
  X,
  CheckCheck,
  ChevronRight
} from 'lucide-react';

interface NotificacionesBellProps {
  empresaId: string;
  apiBase: string;
  onSelectLicitacion?: (id_proceso: string) => void;
}

export const NotificacionesBell: React.FC<NotificacionesBellProps> = ({
  empresaId,
  apiBase,
  onSelectLicitacion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotificaciones = async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/saas/empresas/${empresaId}/notificaciones`);
      if (res.ok) {
        const data: NotificacionesResponse = await res.json();
        setNotificaciones(data.items);
        setNoLeidas(data.no_leidas);
      }
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    }
  };

  // Cargar notificaciones al montar y establecer sondeo (polling cada 20 segundos)
  useEffect(() => {
    fetchNotificaciones();
    const interval = setInterval(fetchNotificaciones, 20000);
    return () => clearInterval(interval);
  }, [empresaId, apiBase]);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`${apiBase}/api/v1/saas/empresas/${empresaId}/notificaciones/${id}/leer`, {
        method: 'POST'
      });
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marcando leída:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${apiBase}/api/v1/saas/empresas/${empresaId}/notificaciones/leer-todas`, {
        method: 'POST'
      });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (err) {
      console.error('Error marcando todas leídas:', err);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Campana de Notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 border border-slate-200/80 bg-white/70 hover:bg-white transition shadow-2xs backdrop-blur-xs flex items-center justify-center group"
        title="Notificaciones de Licitaciones en Tiempo Real"
      >
        <Bell className="w-4 h-4 group-hover:scale-110 transition-transform text-slate-700" />
        
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9465A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D9465A] text-[9px] font-black text-white items-center justify-center">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          </span>
        )}
      </button>

      {/* Visor Desplegable de Notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-[15px] border border-white/60 rounded-2xl shadow-[0px_10px_35px_5px_rgba(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header del Visor */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D9465A]" />
              <span className="text-xs font-black text-slate-900">
                Licitaciones en Tiempo Real
              </span>
              {noLeidas > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-[#D9465A]">
                  {noLeidas} nuevas
                </span>
              )}
            </div>

            {noLeidas > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-[#3B6DB5] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Listado de Notificaciones */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notificaciones.length > 0 ? (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.leida) handleMarkAsRead(notif.id);
                    if (onSelectLicitacion) onSelectLicitacion(notif.id_proceso);
                  }}
                  className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50/80 flex items-start gap-3 ${
                    !notif.leida ? 'bg-rose-50/25' : 'bg-transparent'
                  }`}
                >
                  {/* Badge de Match */}
                  <div className="shrink-0 pt-0.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#D9465A] to-[#9B4B75] text-white">
                      {notif.match_score}%
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {notif.titulo}
                      </h4>
                      {!notif.leida && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D9465A] shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {notif.entidad}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        ${(notif.cuantia / 1000000).toFixed(1)}M COP
                      </span>
                      <span>•</span>
                      <span>{notif.departamento}</span>
                    </div>

                    {/* Razones de Match */}
                    {notif.match_reasons && notif.match_reasons.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {notif.match_reasons.slice(0, 2).map((reason, i) => (
                          <span
                            key={i}
                            className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 font-medium"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 self-center" />
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Sin notificaciones pendientes</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Las nuevas licitaciones del SECOP que crucen con tus búsquedas aparecerán aquí en tiempo real.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
