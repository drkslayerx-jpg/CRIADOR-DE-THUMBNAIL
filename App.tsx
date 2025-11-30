// App.tsx

import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { FONTS, PALETTES, STYLES } from './constants';
import { ThumbnailData } from './types';
import { generateBackgroundImage } from './services/geminiService';
import { AlertCircle, ServerCog, Copy, Lock, ShieldAlert } from 'lucide-react';

const DEFAULT_PALETTE = PALETTES[4]; // Candy Pop as default example

const DEFAULT_DATA: ThumbnailData = {
  title: 'A VOLTA DO REI',
  subtitle: 'JOGABILIDADE EPICA',
  description: '',
  bgImage: null,
  selectedPaletteId: DEFAULT_PALETTE.id,
  selectedFontId: FONTS[1].id,
  selectedStyleId: STYLES[4].id,
  
  // Initialize colors explicitly
  titleColor: DEFAULT_PALETTE.colors.primary,
  subtitleColor: DEFAULT_PALETTE.colors.secondary,
  shadowColor: '#000000', // Default shadow base
  
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
  
  const handleUpdate = useCallback((field: keyof ThumbnailData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerateBackground = async () => {
    if (!data.description) {
      setError("Por favor, descreva o cenário na aba Estúdio.");
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
        data.aspectRatio
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
      
      {/* Control Panel */}
      <div className="order-2 lg:order-1 h-[45%] lg:h-full w-full lg:w-auto flex-shrink-0 z-40">
        <ControlPanel
          data={data}
          palettes={PALETTES}
          fonts={FONTS}
          onUpdate={handleUpdate}
          onGenerateImage={handleGenerateBackground}
        />
      </div>

      {/* Main Preview */}
      <div className="order-1 lg:order-2 flex-1 relative h-[55%] lg:h-full flex flex-col z-10 bg-slate-950">
        
        {/* Error Notification Modal */}
        {error && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {error === "MISSING_KEY" ? (
              <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-red-500/30 shadow-2xl shadow-red-900/20 overflow-hidden transform scale-100 transition-all">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-red-950 to-slate-900 px-6 py-5 border-b border-red-500/20 flex items-center gap-4">
                   <div className="p-3 bg-red-500/10 rounded-full">
                      <ServerCog className="w-6 h-6 text-red-500 animate-pulse" />
                   </div>
                   <div>
                      <h3 className="font-black text-white uppercase tracking-wider text-lg">Configuração Pendente</h3>
                      <p className="text-red-300 text-xs font-mono mt-0.5">SERVIDOR VERCEL NÃO AUTENTICADO</p>
                   </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                   <div className="flex gap-3 bg-red-500/5 p-4 rounded-lg border border-red-500/10">
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-relaxed">
                        A Inteligência Artificial precisa ser ativada no painel do servidor para funcionar. Siga os passos abaixo:
                      </p>
                   </div>

                   <ol className="space-y-4">
                     <li className="flex gap-3 items-start group">
                        <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 text-xs font-bold shrink-0 border border-slate-700 group-hover:border-red-500 group-hover:text-red-500 transition-colors">1</span>
                        <span className="text-sm text-slate-400">Acesse o painel do seu projeto na <strong>Vercel</strong>.</span>
                     </li>
                     <li className="flex gap-3 items-start group">
                        <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 text-xs font-bold shrink-0 border border-slate-700 group-hover:border-red-500 group-hover:text-red-500 transition-colors">2</span>
                        <span className="text-sm text-slate-400">Vá em <strong>Settings</strong> ➔ <strong>Environment Variables</strong>.</span>
                     </li>
                     <li className="flex gap-3 items-start group">
                        <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 text-xs font-bold shrink-0 border border-slate-700 group-hover:border-red-500 group-hover:text-red-500 transition-colors">3</span>
                        <div className="flex-1 space-y-2">
                           <span className="text-sm text-slate-400">Adicione a variável de ambiente:</span>
                           <div className="bg-black p-3 rounded-lg border border-slate-700 font-mono text-xs flex flex-col gap-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Key:</span>
                                <span className="text-red-400 font-bold">API_KEY</span>
                              </div>
                              <div className="flex justify-between border-t border-white/5 pt-1 mt-1">
                                <span className="text-slate-500">Value:</span>
                                <span className="text-emerald-500 truncate max-w-[150px]">Sua Chave Gemini...</span>
                              </div>
                           </div>
                        </div>
                     </li>
                     <li className="flex gap-3 items-start group">
                        <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 text-xs font-bold shrink-0 border border-slate-700 group-hover:border-red-500 group-hover:text-red-500 transition-colors">4</span>
                        <span className="text-sm text-slate-400">Faça um <strong>Redeploy</strong> para aplicar.</span>
                     </li>
                   </ol>
                </div>
                
                {/* Footer */}
                <div className="bg-slate-950 px-6 py-4 flex justify-between items-center border-t border-slate-800">
                   <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">SC SYSTEM ADMIN</span>
                   <button 
                     onClick={() => setError(null)} 
                     className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wide px-4 py-2 hover:bg-white/5 rounded-lg"
                   >
                     Fechar Aviso
                   </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 text-white p-6 rounded-xl border border-red-500/30 shadow-2xl max-w-md w-full relative">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/10 rounded-full shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg uppercase tracking-wide text-white mb-2">Erro no Sistema</h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{error}</p>
                    <button 
                      onClick={() => setError(null)} 
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors uppercase"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <ThumbnailPreview
          data={data}
          selectedPalette={selectedPalette}
          selectedFont={selectedFont}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}

export default App;