// App.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { FONTS, PALETTES, STYLES, OVERLAY_EFFECTS, RESOLUTIONS } from './constants';
import { ThumbnailData } from './types';
import { generateBackgroundImage } from './services/geminiService';
import { AlertCircle, Key, Lock } from 'lucide-react';

const DEFAULT_DATA: ThumbnailData = {
  title: 'A VOLTA DO REI',
  subtitle: 'JOGABILIDADE EPICA',
  description: '',
  bgImage: null,
  selectedPaletteId: PALETTES[0].id,
  selectedFontId: FONTS[1].id,
  selectedStyleId: STYLES[4].id,
  
  // Default to YouTube Standard
  aspectRatio: '16:9',

  textAlignment: 'center',
  textVerticalAlignment: 'center',
  textScale: 1.0,
  textRotation: -2,
  xOffset: 0,
  yOffset: 0,
  selectedOverlayId: 'vignette',
  
  isGenerating: false,
};

function App() {
  const [data, setData] = useState<ThumbnailData>(DEFAULT_DATA);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(true);

  // Load API Key on Mount
  useEffect(() => {
    const storedKey = localStorage.getItem('sc_studio_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setShowKeyModal(false);
    }
  }, []);

  const handleSaveKey = (key: string) => {
    if (!key.trim()) return;
    localStorage.setItem('sc_studio_api_key', key);
    setApiKey(key);
    setShowKeyModal(false);
  };

  const handleUpdate = useCallback((field: keyof ThumbnailData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerateBackground = async () => {
    if (!data.description) {
      setError("Por favor, descreva o cenário na aba Estúdio.");
      return;
    }

    if (!apiKey) {
      setError("Chave de API não configurada. Atualize a página.");
      setShowKeyModal(true);
      return;
    }

    setData((prev) => ({ ...prev, isGenerating: true }));
    setError(null);

    try {
      const selectedStyle = STYLES.find(s => s.id === data.selectedStyleId) || STYLES[0];
      
      const imageBase64 = await generateBackgroundImage(
        data.title,
        data.description,
        selectedStyle.promptModifier,
        data.aspectRatio,
        apiKey
      );
      
      if (!imageBase64) {
        throw new Error("Ocorreu um erro ao processar a imagem. Tente novamente.");
      }

      setData((prev) => ({ ...prev, bgImage: imageBase64 }));
    } catch (err: any) {
      console.error("App Generate Error:", err);
      setError(err.message || "Erro desconhecido ao gerar imagem.");
    } finally {
      setData((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const selectedPalette = PALETTES.find((p) => p.id === data.selectedPaletteId) || PALETTES[0];
  const selectedFont = FONTS.find((f) => f.id === data.selectedFontId) || FONTS[0];

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden selection:bg-red-500/30 selection:text-red-200">
      
      {/* API Key Modal (Lock Screen) */}
      {showKeyModal && (
        <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center mb-4">
                   <Lock className="w-6 h-6 text-red-500" />
                 </div>
                 <h2 className="text-xl font-bold text-white mb-2">SC STUDIO PRO</h2>
                 <p className="text-sm text-slate-400">Para continuar, insira sua chave de acesso (Google Gemini API Key).</p>
              </div>
              
              <div className="space-y-4">
                 <div className="relative">
                   <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                     type="password" 
                     placeholder="Cole sua API Key aqui..."
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-all"
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') handleSaveKey((e.target as HTMLInputElement).value);
                     }}
                   />
                 </div>
                 <button 
                   onClick={(e) => {
                     const input = e.currentTarget.parentElement?.querySelector('input');
                     if (input) handleSaveKey(input.value);
                   }}
                   className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/20"
                 >
                   ACESSAR SISTEMA
                 </button>
                 <div className="text-center">
                   <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:text-slate-300 underline">
                     Não tem uma chave? Gere gratuitamente aqui.
                   </a>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="order-2 lg:order-1 h-[45%] lg:h-full w-full lg:w-auto flex-shrink-0 z-40">
        <ControlPanel
          data={data}
          palettes={PALETTES}
          fonts={FONTS}
          onUpdate={handleUpdate}
          onGenerateImage={handleGenerateBackground}
          apiKey={apiKey}
        />
      </div>

      {/* Main Preview */}
      <div className="order-1 lg:order-2 flex-1 relative h-[55%] lg:h-full flex flex-col z-10 bg-slate-950">
        
        {/* Error Notification */}
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md bg-red-950/90 text-white px-4 py-3 rounded border border-red-500/50 flex items-start gap-3 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-xs uppercase tracking-wide text-red-200 mb-1">Erro no Sistema</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-2 text-gray-400 hover:text-white transition-colors">✕</button>
          </div>
        )}

        <ThumbnailPreview
          data={data}
          selectedPalette={selectedPalette}
          selectedFont={selectedFont}
        />
      </div>
    </div>
  );
}

export default App;