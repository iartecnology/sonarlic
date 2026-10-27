'use client';

import React, { useState, useEffect } from 'react';
import { PerfilBusqueda } from '@/lib/types';
import { Target, Save, X, Plus, Trash2, MapPin, DollarSign, ShieldAlert, Sparkles, Building } from 'lucide-react';

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

  const handleAddExcluded = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaExcluida.trim() && !palabrasExcluidas.includes(nuevaExcluida.trim())) {
      setPalabrasExcluidas([...palabrasExcluidas, nuevaExcluida.trim()]);
      setNuevaExcluida('');
    }
  };

  const handleRemoveExcluded = (word: string) => {
    setPalabrasExcluidas(palabrasExcluidas.filter((w) => w !== word));
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 flex flex-col justify-between">
        <div>
          {/* Encabezado */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Perfil de Contratación de tu Empresa</h3>
                <p className="text-xs text-slate-500">Configura tus criterios para alimentar tu feed de oportunidades personalizadas</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Empresa y NIT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre o Razón Social</label>
                <input
                  type="text"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                  placeholder="ej: Mi Empresa S.A.S."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIT</label>
                <input
                  type="text"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  placeholder="900.123.456-7"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Palabras Clave de Búsqueda */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>¿Qué productos o servicios ofrece tu empresa? (Palabras Clave)</span>
                <span className="text-[11px] text-indigo-600">{palabrasClave.length} añadidas</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={nuevaPalabra}
                  onChange={(e) => setNuevaPalabra(e.target.value)}
                  placeholder="ej: computadores, dotación, papelería, mantenimiento..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {palabrasClave.length === 0 ? (
                  <span className="text-slate-400 italic">No has agregado palabras clave todavía.</span>
                ) : (
                  palabrasClave.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium"
                    >
                      {word}
                      <button type="button" onClick={() => handleRemoveKeyword(word)} className="hover:text-rose-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Departamentos donde operas */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Departamentos donde puedes ejecutar contratos:</span>
                <span className="text-[11px] text-indigo-600">{departamentos.length} seleccionados</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {DEPARTAMENTOS_COLOMBIA.map((depto) => {
                  const active = departamentos.includes(depto);
                  return (
                    <button
                      key={depto}
                      type="button"
                      onClick={() => toggleDepartamento(depto)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-700'
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
                <label className="block font-semibold text-slate-700 mb-1">Cuantía Mínima (COP)</label>
                <input
                  type="number"
                  value={cuantiaMin}
                  onChange={(e) => setCuantiaMin(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cuantía Máxima (COP)</label>
                <input
                  type="number"
                  value={cuantiaMax}
                  onChange={(e) => setCuantiaMax(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Apetito de Riesgo / Semáforo Máximo */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Nivel Máximo de Complejidad Aceptado (Semáforo IA):
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
                    className={`p-2.5 text-center rounded-xl border transition-all ${
                      semaforoMaximo === item.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
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
