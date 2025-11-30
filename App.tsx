// App.tsx

import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { FONTS, PALETTES, STYLES } from './constants';
import { ThumbnailData } from './types';
import { generateBackgroundImage } from './services/geminiService';
import { AlertCircle, ShieldAlert } from 'lucide-react';

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
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  
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
    setShowConfigHelp(false);

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
      
      if (err.message === "MISSING_API_KEY" || err.message?.includes("API Key")) {
        setShowConfigHelp(true);
      } else {
        setError(err.message || "Erro desconhecido ao gerar imagem.");
      }
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
        
        {/* Missing API Key Modal - Vercel Instructions */}
        {showConfigHelp && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-6 animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-slate-900 text-white p-8 rounded-2xl border border-red-500/50 shadow-2xl max-w-lg w-full relative">
               <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-red-500/30">
                   <ShieldAlert className="w-8 h-8 text-red-500" />
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-widest text-white">Configuração Pendente</h2>
                 <p className="text-xs font-bold text-red-400 uppercase tracking-wide mt-1">Servidor Vercel Não Autenticado</p>
               </div>
               
               <div className="bg-slate-950/50 rounded-lg p-4 mb-6 border border-slate-800 text-left">
                  <div className="flex gap-3 mb-3">
                     <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                     <p className="text-sm text-slate-300 leading-relaxed">
                       A Inteligência Artificial precisa ser ativada no painel do servidor para funcionar. Siga os passos abaixo:
                     </p>
                  </div>
                  <ol className="space-y-3 text-xs text-slate-400 list-decimal list-inside font-mono">
                    <li className="pl-2">Acesse o painel do seu projeto na <strong className="text-white">Vercel</strong>.</li>
                    <li className="pl-2">Vá em <strong className="text-white">Settings → Environment Variables</strong>.</li>
                    <li className="pl-2">Adicione a variável de ambiente:
                        <div className="mt-2 bg-black border border-slate-800 rounded p-2 grid grid-cols-[40px_1fr] gap-2">
                           <span className="text-slate-500">Key:</span>
                           <code className="text-red-400 font-bold select-all">VITE_API_KEY</code>
                           <span className="text-slate-500">Value:</span>
                           <code className="text-green-400 select-all">Sua Chave Gemini...</code>
                        </div>
                    </li>
                    <li className="pl-2">Faça um <strong className="text-white">Redeploy</strong> para aplicar.</li>
                  </ol>
               </div>

               <div className="flex justify-between items-center pt-2">
                 <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">SC SYSTEM ADMIN</span>
                 <button 
                   onClick={() => setShowConfigHelp(false)}
                   className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                 >
                   Fechar Aviso
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* Generic Error Modal */}
        {error && (
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