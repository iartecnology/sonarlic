'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Save, CheckCircle, AlertCircle, Key, Cpu, Globe, Sliders } from 'lucide-react';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose, apiBase }) => {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [temperature, setTemperature] = useState(0.2);
  const [maskedKey, setMaskedKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch(`${apiBase}/api/v1/config/ai`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setProvider(data.provider || 'openai');
            setModel(data.model || 'gpt-4o-mini');
            setBaseUrl(data.base_url || 'https://api.openai.com/v1');
            setTemperature(data.temperature ?? 0.2);
            setMaskedKey(data.api_key_masked || '');
            setIsConfigured(data.is_configured || false);
          }
        })
        .catch((err) => console.error('Error obteniendo config IA:', err));
    }
  }, [isOpen, apiBase]);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    if (p === 'openai') {
      setModel('gpt-4o-mini');
      setBaseUrl('https://api.openai.com/v1');
    } else if (p === 'deepseek') {
      setModel('deepseek-chat');
      setBaseUrl('https://api.deepseek.com/v1');
    } else if (p === 'groq') {
      setModel('llama-3.3-70b-versatile');
      setBaseUrl('https://api.groq.com/openai/v1');
    } else if (p === 'ollama') {
      setModel('llama3');
      setBaseUrl('http://host.docker.internal:11434/v1');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey && !maskedKey) {
      setFeedback({ type: 'error', message: 'Por favor ingresa una API Key válida.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`${apiBase}/api/v1/config/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          api_key: apiKey || maskedKey,
          model,
          base_url: baseUrl,
          temperature: parseFloat(temperature.toString()),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMaskedKey(data.api_key_masked);
        setApiKey('');
        setIsConfigured(true);
        setFeedback({ type: 'success', message: 'Motor de IA de SonarLIC actualizado con éxito.' });
        setTimeout(() => onClose(), 1500);
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: err.detail || 'Error guardando configuración.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al conectar con la API.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200/80 p-6 sm:p-7 flex flex-col justify-between animate-in fade-in zoom-in-95 overflow-hidden relative">
        {/* Barra superior con gradiente IAR */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5]" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6C5B8B]/10 to-[#3B6DB5]/20 text-[#6C5B8B] flex items-center justify-center border border-[#6C5B8B]/20">
                <Bot className="w-5 h-5 text-[#6C5B8B]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Motor de Inteligencia Artificial</h3>
                <p className="text-xs text-slate-500">Configura el LLM cognitivo para el análisis de pliegos y semáforos</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              ✕
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selector de Proveedor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#3B6DB5]" /> Proveedor de LLM
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'openai', name: 'OpenAI' },
                  { id: 'deepseek', name: 'DeepSeek' },
                  { id: 'groq', name: 'Groq (Llama)' },
                  { id: 'ollama', name: 'Ollama (Local)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleProviderChange(item.id)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                      provider === item.id
                        ? 'border-[#9B4B75] bg-gradient-to-br from-[#9B4B75]/10 to-[#3B6DB5]/10 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#D9465A]" /> API Key / Token Secreto
                </span>
                {isConfigured && (
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Activa: {maskedKey}
                  </span>
                )}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={isConfigured ? 'Escribe aquí para reemplazar la clave...' : 'sk-proj-... / sk-...'}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B6DB5] focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* Modelo y Base URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-500" /> Modelo
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="ej: gpt-4o-mini o deepseek-chat"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B6DB5] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" /> Base URL (OpenAI Spec)
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3B6DB5] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Temperatura */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" /> Temperatura Cognitiva: {temperature}
                </span>
                <span className="text-[11px] text-slate-400">0.0 (preciso) a 1.0 (creativo)</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#3B6DB5] cursor-pointer"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#D9465A] via-[#9B4B75] to-[#3B6DB5] hover:opacity-95 text-white flex items-center gap-1.5 shadow-md shadow-[#9B4B75]/20 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Guardando...' : 'Guardar y Activar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
