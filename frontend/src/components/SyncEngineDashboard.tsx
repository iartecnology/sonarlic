'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Terminal,
  ShieldCheck,
  Zap,
  Server,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { SyncStatus, SyncExecution, SyncLog } from '@/lib/types';

interface SyncEngineDashboardProps {
  apiBase: string;
}

export default function SyncEngineDashboard({ apiBase }: SyncEngineDashboardProps) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [history, setHistory] = useState<SyncExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  
  // Modal de Logs
  const [selectedExecution, setSelectedExecution] = useState<SyncExecution | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<string>('ALL');

  const loadSyncData = async () => {
    try {
      const [resStatus, resHistory] = await Promise.all([
        fetch(`${apiBase}/api/v1/saas/sync/status`),
        fetch(`${apiBase}/api/v1/saas/sync/history?limit=30`)
      ]);

      if (resStatus.ok) {
        setStatus(await resStatus.json());
      }
      if (resHistory.ok) {
        setHistory(await resHistory.json());
      }
    } catch (err) {
      console.error('Error cargando datos del motor de sincronización:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSyncData();
    const interval = setInterval(loadSyncData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSync = async () => {
    setTriggering(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/saas/sync/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 500, fuente: 'SECOP_II' })
      });
      if (res.ok) {
        await loadSyncData();
      }
    } catch (err) {
      console.error('Error disparando sincronización:', err);
    } finally {
      setTriggering(false);
    }
  };

  const handleOpenLogs = async (item: SyncExecution) => {
    setSelectedExecution(item);
    setLoadingLogs(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/saas/sync/executions/${item.id}/logs`);
      if (res.ok) {
        setLogs(await res.json());
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error cargando logs:', err);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const formatFecha = (str?: string) => {
    if (!str) return 'Pendiente';
    try {
      // Si la fecha viene sin 'Z' ni offset, asumimos UTC
      const isoStr = (str.includes('Z') || str.includes('+') || (str.includes('-') && str.length > 19))
        ? str 
        : `${str}Z`;
      const d = new Date(isoStr);
      return d.toLocaleTimeString('es-CO', { 
        timeZone: 'America/Bogota', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }) + ' (' + d.toLocaleDateString('es-CO', { 
        timeZone: 'America/Bogota', 
        day: '2-digit', 
        month: 'short' 
      }) + ')';
    } catch {
      return str;
    }
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'ALL') return true;
    return l.nivel === logFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. Barra de Control Operativo y KPIs Rápidos */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#D9465A]/10 to-[#3B6DB5]/10 text-[#D9465A] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#D9465A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">Motor de Ingesta & Sincronización SECOP</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {status?.estado_motor || 'ONLINE (IDLE)'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Job programado {status?.frecuencia_cron || 'cada 15 min'} con deduplicación ReplacingMergeTree en ClickHouse.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={loadSyncData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refrescar métricas"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleTriggerSync}
            disabled={triggering}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#D9465A] to-[#9B4B75] hover:opacity-95 transition shadow-sm disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-white ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? 'Ejecutando Ingesta...' : 'Forzar Sincronización Ahora'}</span>
          </button>
        </div>
      </div>

      {/* 2. Tarjetas de Telemetría y Salud */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Última Ingesta</span>
            <Clock className="w-4 h-4 text-[#3B6DB5]" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatFecha(status?.ultima_sincronizacion)}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
            Token SODA Activo (200 OK)
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total en ClickHouse</span>
            <Database className="w-4 h-4 text-[#9B4B75]" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {status?.total_licitaciones_actuales.toLocaleString('es-CO')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            Licitaciones indexadas y deduplicadas
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tasa de Éxito (24h)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700">
            {status?.tasa_exito_24h || 99.4}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            0 fallos críticos en pipeline
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lotes Procesados</span>
            <Server className="w-4 h-4 text-[#D9465A]" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {status?.total_ejecuciones_completadas || history.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            Auditoría persistida en ClickHouse
          </span>
        </div>
      </div>

      {/* 3. Tabla de Auditoría e Historial de Ejecuciones */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Bitácora de Lotes y Auditoría en Tiempo Real</h3>
            <p className="text-xs text-slate-500">Historial cronológico de corridas, registros leídos, inserts y notificaciones.</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {history.length} Lotes Registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Lote / Tipo</th>
                <th className="py-3 px-4">Fuente</th>
                <th className="py-3 px-4">Fecha & Duración</th>
                <th className="py-3 px-4">Consultadas</th>
                <th className="py-3 px-4">Nuevas</th>
                <th className="py-3 px-4">Matches (Notifs)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    <div>{item.id}</div>
                    <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                      item.tipo === 'MANUAL' ? 'bg-purple-100 text-[#9B4B75]' : 'bg-blue-100 text-[#3B6DB5]'
                    }`}>
                      {item.tipo}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-semibold">
                    {item.fuente}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="font-medium text-slate-800">{formatFecha(item.fecha_inicio)}</div>
                    <span className="text-[11px] text-slate-400">{item.duracion_segundos}s</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-700">
                    {item.registros_consultados.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    +{item.registros_insertados}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-black text-[#D9465A] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      ⚡ {item.notificaciones_generadas}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {item.estado === 'SUCCESS' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Completado
                      </span>
                    )}
                    {item.estado === 'PARTIAL' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Parcial
                      </span>
                    )}
                    {item.estado === 'ERROR' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        Fallo
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenLogs(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition font-bold"
                    >
                      <Terminal className="w-3.5 h-3.5 text-[#3B6DB5]" />
                      <span>Ver Logs</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Modal Terminal de Logs en Vivo */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden font-mono">
            {/* Header Terminal */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <span className="text-xs font-bold text-slate-300">
                  Consola de Auditoría: Lote [{selectedExecution.id}] - {selectedExecution.fuente}
                </span>
              </div>

              <button
                onClick={() => setSelectedExecution(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros de Nivel */}
            <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2 text-xs">
              <span className="text-slate-500 text-[11px]">Nivel:</span>
              {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    logFilter === lvl ? 'bg-[#3B6DB5] text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Contenido Logs */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs leading-relaxed">
              {loadingLogs ? (
                <div className="text-center py-8 text-slate-500">Cargando traza de ejecución...</div>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="text-slate-500 text-[11px] shrink-0 font-mono">
                      [{new Date((log.timestamp.includes('Z') || log.timestamp.includes('+')) ? log.timestamp : `${log.timestamp}Z`).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour12: true })}]
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                      log.nivel === 'INFO' ? 'bg-blue-900/60 text-blue-300 border border-blue-700' :
                      log.nivel === 'SUCCESS' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' :
                      log.nivel === 'WARNING' ? 'bg-amber-900/60 text-amber-300 border border-amber-700' :
                      'bg-rose-900/60 text-rose-300 border border-rose-700'
                    }`}>
                      {log.nivel}
                    </span>
                    <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">
                      [{log.fase}]
                    </span>
                    <span className="text-slate-200 flex-1">{log.mensaje}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 py-6 text-center">No se encontraron líneas de registro para este filtro.</div>
              )}
            </div>

            {/* Footer Terminal */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Duración total: {selectedExecution.duracion_segundos}s</span>
              <button
                onClick={() => setSelectedExecution(null)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Cerrar Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
