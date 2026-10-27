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

  // Cargar configuración actual
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
        setFeedback({ type: 'success', message: 'Proveedor de IA configurado y activo con éxito.' });
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 flex flex-col justify-between animate-in fade-in zoom-in-95">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Configuración del Proveedor de IA</h3>
                <p className="text-xs text-slate-500">Ajusta el LLM que analizará los pliegos y semáforos en tiempo real</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">✕</button>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-500" /> Proveedor de Inteligencia Artificial
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
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                      provider === item.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
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
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-500" /> API Key / Token
                </span>
                {isConfigured && (
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Clave guardada: {maskedKey}
                  </span>
                )}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={isConfigured ? 'Escribe para cambiar la clave actual...' : 'sk-proj-... / sk-...'}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Modelo y Base URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-500" /> Modelo
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="ej: gpt-4o-mini o deepseek-chat"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" /> Base URL (OpenAI Spec)
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Temperatura */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" /> Temperatura: {temperature}
                </span>
                <span className="text-[11px] text-slate-400">0.0 (determinista) a 1.0 (creativo)</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
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
