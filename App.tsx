// App.tsx

import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { FONTS, PALETTES, STYLES } from './constants';
import { ThumbnailData } from './types';
import { generateBackgroundImage } from './services/geminiService';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';

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
      // Pass the raw error message to state to trigger specific modals
      setError(err.message || "Erro desconhecido ao gerar imagem.");
    } finally {
      setData((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const selectedPalette = PALETTES.find((p) => p.id === data.selectedPaletteId) || PALETTES[0];
  const selectedFont = FONTS.find((f) => f.id === data.selectedFontId) || FONTS[0];

  // Detect specific key errors regardless of casing or specific wording
  const isMissingKeyError = error === "MISSING_KEY" || 
                            error?.toLowerCase().includes("api key") || 
                            error?.toLowerCase().includes("key not found");

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
        
        {/* MODAL DE CONFIGURAÇÃO PENDENTE (VERCEL) */}
        {isMissingKeyError && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-slate-900 text-white rounded-2xl border border-red-500/30 shadow-2xl max-w-lg w-full relative overflow-hidden">
               
               {/* Header de Atenção */}
               <div className="bg-red-500/10 p-6 border-b border-red-500/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-wide text-white">Configuração Pendente</h2>
                    <p className="text-xs text-red-400 font-bold tracking-widest uppercase">Servidor Vercel Não Autenticado</p>
                  </div>
               </div>

               <div className="p-6 space-y-6">
                 <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      A Inteligência Artificial precisa ser ativada no painel do servidor para funcionar. Siga os passos abaixo:
                    </p>
                 </div>

                 <div className="space-y-3">
                    <div className="flex gap-4 items-center group">
                       <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-400 text-xs font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">1</span>
                       <p className="text-sm text-slate-400">Acesse o painel do seu projeto na <strong className="text-white">Vercel</strong>.</p>
                    </div>
                    <div className="flex gap-4 items-center group">
                       <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-400 text-xs font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">2</span>
                       <p className="text-sm text-slate-400">Vá em <strong className="text-white">Settings ➔ Environment Variables</strong>.</p>
                    </div>
                    <div className="flex gap-4 items-start group">
                       <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-400 text-xs font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors mt-1">3</span>
                       <div className="flex-1">
                          <p className="text-sm text-slate-400 mb-2">Adicione a variável de ambiente:</p>
                          <div className="bg-black rounded border border-slate-800 p-2 font-mono text-xs">
                             <div className="flex justify-between mb-1">
                               <span className="text-slate-500">Key:</span>
                               <span className="text-red-400 font-bold select-all">VITE_API_KEY</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-slate-500">Value:</span>
                               <span className="text-emerald-400 select-all">Sua Chave Gemini...</span>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-4 items-center group">
                       <span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-400 text-xs font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">4</span>
                       <p className="text-sm text-slate-400">Faça um <strong className="text-white">Redeploy</strong> para aplicar.</p>
                    </div>
                 </div>
               </div>

               <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">SC System Admin</span>
                  <button 
                    onClick={() => setError(null)}
                    className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Fechar Aviso
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* MODAL DE ERRO GENÉRICO (Só aparece se NÃO for erro de chave) */}
        {error && !isMissingKeyError && (
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