'use client';

import React, { useState, useEffect } from 'react';
import { PerfilBusqueda } from '@/lib/types';
import { Target, Save, X, Plus, Trash2, MapPin, DollarSign, ShieldAlert, Sparkles, Building2 } from 'lucide-react';

interface PerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  onProfileSaved: () => void;
}

const DEPARTAMENTOS_COLOMBIA = [
  'Bogotá D.C.',
  'Antioquia',
  'Valle del Cauca',
  'Cundinamarca',
  'Santander',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Risaralda',
  'Tolima',
  'Huila',
  'Cesar',
  'Córdoba',
  'Magdalena',
  'Cauca',
  'La Guajira',
  'Sucre',
  'Quindío',
  'Casanare',
  'Chocó',
  'Caquetá',
  'Putumayo',
  'Arauca',
  'Amazonas',
  'Guaviare',
  'San Andrés y Providencia',
  'Vaupés',
  'Vichada',
  'Guainía',
];

export const PerfilModal: React.FC<PerfilModalProps> = ({ isOpen, onClose, apiBase, onProfileSaved }) => {
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [nit, setNit] = useState('');
  const [palabrasClave, setPalabrasClave] = useState<string[]>([]);
  const [nuevaPalabra, setNuevaPalabra] = useState('');
  const [palabrasExcluidas, setPalabrasExcluidas] = useState<string[]>([]);
  const [nuevaExcluida, setNuevaExcluida] = useState('');
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [cuantiaMin, setCuantiaMin] = useState(0);
  const [cuantiaMax, setCuantiaMax] = useState(500000000);
  const [semaforoMaximo, setSemaforoMaximo] = useState('AMARILLO');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`${apiBase}/api/v1/perfil`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: PerfilBusqueda | null) => {
          if (data) {
            setNombreEmpresa(data.nombre_empresa || '');
            setNit(data.nit || '');
            setPalabrasClave(data.palabras_clave || []);
            setPalabrasExcluidas(data.palabras_excluidas || []);
            setDepartamentos(data.departamentos || []);
            setCuantiaMin(data.cuantia_minima || 0);
            setCuantiaMax(data.cuantia_maxima || 500000000);
            setSemaforoMaximo(data.semaforo_maximo || 'AMARILLO');
          }
        })
        .catch((err) => console.error('Error cargando perfil:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, apiBase]);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaPalabra.trim() && !palabrasClave.includes(nuevaPalabra.trim())) {
      setPalabrasClave([...palabrasClave, nuevaPalabra.trim()]);
      setNuevaPalabra('');
    }
  };

  const handleRemoveKeyword = (word: string) => {
    setPalabrasClave(palabrasClave.filter((w) => w !== word));
  };

  const toggleDepartamento = (depto: string) => {
    if (departamentos.includes(depto)) {
      setDepartamentos(departamentos.filter((d) => d !== depto));
    } else {
      setDepartamentos([...departamentos, depto]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/perfil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_empresa: nombreEmpresa,
          nit,
          palabras_clave: palabrasClave,
          palabras_excluidas: palabrasExcluidas,
          departamentos,
          cuantia_minima: cuantiaMin,
          cuantia_maxima: cuantiaMax,
          semaforo_maximo: semaforoMaximo,
          notificar_email: true,
        }),
      });
      if (res.ok) {
        onProfileSaved();
        onClose();
      }
    } catch (err) {
      console.error('Error guardando perfil:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/80 p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
        {/* Barra superior con gradiente IAR */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5]" />

        <div>
          {/* Encabezado */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D9465A]/10 to-[#9B4B75]/20 text-[#D9465A] flex items-center justify-center border border-[#D9465A]/20">
                <Target className="w-5 h-5 text-[#D9465A]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Perfil de Contratación PYME</h3>
                <p className="text-xs text-slate-500">Configura tus criterios para alimentar tu feed de oportunidades personalizadas</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Empresa y NIT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Nombre o Razón Social</label>
                <input
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  placeholder="ej: Mi Empresa S.A.S."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B6DB5] focus:outline-none bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">NIT</label>
                <input
                  type="text"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  placeholder="900.123.456-7"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B6DB5] focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            {/* Palabras Clave de Búsqueda */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>¿Qué productos o servicios ofrece tu empresa? (Palabras Clave)</span>
                <span className="text-[11px] font-bold text-[#D9465A]">{palabrasClave.length} activas</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={nuevaPalabra}
                  onChange={(e) => setNuevaPalabra(e.target.value)}
                  placeholder="ej: computadores, dotación, papelería, mantenimiento..."
                  className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B6DB5] focus:outline-none bg-slate-50/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#D9465A] to-[#9B4B75] hover:opacity-95 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                {palabrasClave.length === 0 ? (
                  <span className="text-slate-400 italic">Agrega palabras clave de tus productos o servicios para activar el radar.</span>
                ) : (
                  palabrasClave.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white text-[#9B4B75] border border-[#9B4B75]/30 rounded-lg text-xs font-bold shadow-2xs"
                    >
                      {word}
                      <button type="button" onClick={() => handleRemoveKeyword(word)} className="hover:text-[#D9465A] ml-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Departamentos donde operas */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Departamentos donde operas:</span>
                <span className="text-[11px] font-bold text-[#3B6DB5]">{departamentos.length} seleccionados</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                {DEPARTAMENTOS_COLOMBIA.map((depto) => {
                  const active = departamentos.includes(depto);
                  return (
                    <button
                      key={depto}
                      type="button"
                      onClick={() => toggleDepartamento(depto)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        active
                          ? 'bg-[#3B6DB5] text-white border-[#3B6DB5] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {depto}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rango de Cuantía */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cuantía Mínima (COP)</label>
                <input
                  type="number"
                  value={cuantiaMin}
                  onChange={(e) => setCuantiaMin(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B6DB5] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cuantía Máxima (COP)</label>
                <input
                  type="number"
                  value={cuantiaMax}
                  onChange={(e) => setCuantiaMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B6DB5] focus:outline-none"
                />
              </div>
            </div>

            {/* Semáforo Máximo Aceptado */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Nivel Máximo de Riesgo Aceptado:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'VERDE', title: 'Solo Verde', desc: 'Accesible PYME' },
                  { id: 'AMARILLO', title: 'Verde y Amarillo', desc: 'Requisitos Medios' },
                  { id: 'ROJO', title: 'Todos (Inc. Rojo)', desc: 'Alta Complejidad' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSemaforoMaximo(item.id)}
                    className={`p-3 text-center rounded-xl border transition-all ${
                      semaforoMaximo === item.id
                        ? 'border-[#9B4B75] bg-gradient-to-br from-[#9B4B75]/10 to-[#3B6DB5]/10 text-slate-900 font-black shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 font-bold bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] hover:opacity-95 text-white rounded-xl shadow-md shadow-[#9B4B75]/20 flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar y Activar Radar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
