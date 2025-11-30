// App.tsx

import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { FONTS, PALETTES, STYLES } from './constants';
import { ThumbnailData } from './types';
import { generateBackgroundImage } from './services/geminiService';
import { AlertCircle, Lock, ShieldAlert, Server } from 'lucide-react';

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

  // Verifica se o erro é relacionado à falta de chave
  const isKeyError = error && (
    error.includes("MISSING_KEY") || 
    error.toLowerCase().includes("api key") ||
    error.toLowerCase().includes("unauthorized")
  );

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
        
        {/* MODAL DE ERRO GENÉRICO */}
        {error && !isKeyError && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
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
          </div>
        )}

        {/* MODAL DE CONFIGURAÇÃO PENDENTE (FALTA CHAVE) */}
        {isKeyError && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-red-900/50 rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col">
              
              {/* Header do Modal */}
              <div className="bg-red-950/30 p-6 border-b border-red-900/30 flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase text-white tracking-wide">Configuração Pendente</h2>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <Server className="w-3 h-3" /> Servidor Vercel Não Autenticado
                  </p>
                </div>
              </div>

              {/* Corpo do Modal */}
              <div className="p-6 space-y-6">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <AlertCircle className="w-4 h-4 inline mr-2 text-yellow-500"/>
                    A Inteligência Artificial precisa ser ativada no painel do servidor para funcionar. Siga os passos abaixo:
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">1</div>
                    <p className="text-xs text-slate-400">Acesse o painel do seu projeto na <strong className="text-white">Vercel</strong>.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">2</div>
                    <p className="text-xs text-slate-400">Vá em <strong className="text-white">Settings</strong> → <strong className="text-white">Environment Variables</strong>.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">3</div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-slate-400">Adicione uma variável de ambiente:</p>
                      <div className="bg-black p-3 rounded-lg border border-slate-800 font-mono text-[10px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Key:</span>
                          <span className="text-red-400 select-all">VITE_API_KEY</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1 mt-1">
                          <span className="text-slate-500">Value:</span>
                          <span className="text-emerald-400">Sua Chave Gemini...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">4</div>
                    <p className="text-xs text-slate-400">Faça um <strong className="text-white">Redeploy</strong> para aplicar.</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-950 p-4 flex justify-between items-center border-t border-slate-800">
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">SC SYSTEM ADMIN</span>
                <button 
                  onClick={() => setError(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all"
                >
                  Fechar Aviso
                </button>
              </div>

            </div>
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