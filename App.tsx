// App.tsx

import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { FONTS, PALETTES, STYLES } from './constants';
import { ThumbnailData } from './types';
import { generateBackgroundImage } from './services/geminiService';
import { AlertCircle, ShieldAlert, X, Settings, ExternalLink } from 'lucide-react';

const DEFAULT_PALETTE = PALETTES[4]; // Candy Pop as default example

const DEFAULT_DATA: ThumbnailData = {
  title: 'A VOLTA DO REI',
  subtitle: 'JOGABILIDADE EPICA',
  description: '',
  bgImage: null,
  selectedPaletteId: DEFAULT_PALETTE.id,
  selectedFontId: FONTS[1].id,
  selectedStyleId: STYLES[4].id,
  
  titleColor: DEFAULT_PALETTE.colors.primary,
  subtitleColor: DEFAULT_PALETTE.colors.secondary,
  shadowColor: '#000000',
  
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
      let errorMessage = err.message || "Erro desconhecido ao gerar imagem.";
      if (errorMessage.includes("quota")) {
        errorMessage = "Limite de uso da IA atingido. A cota da sua chave gratuita esgotou por hoje. Tente novamente mais tarde ou use outra chave.";
      }
      setError(errorMessage);
    } finally {
      setData((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const selectedPalette = PALETTES.find((p) => p.id === data.selectedPaletteId) || PALETTES[0];
  const selectedFont = FONTS.find((f) => f.id === data.selectedFontId) || FONTS[0];

  // CORREÇÃO: Lógica simplificada para garantir que a tela de ajuda correta seja exibida.
  const isApiKeyError = error === 'MISSING_API_KEY';

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden selection:bg-red-500/30 selection:text-red-200">
      
      <div className="order-2 lg:order-1 h-[45%] lg:h-full w-full lg:w-auto flex-shrink-0 z-40">
        <ControlPanel
          data={data}
          palettes={PALETTES}
          fonts={FONTS}
          onUpdate={handleUpdate}
          onGenerateImage={handleGenerateBackground}
        />
      </div>

      <div className="order-1 lg:order-2 flex-1 relative h-[55%] lg:h-full flex flex-col z-10 bg-slate-950">
        
        {isApiKeyError ? (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-red-500/30 shadow-2xl max-w-lg w-full relative ring-1 ring-red-900/20">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                       <ShieldAlert className="w-8 h-8 text-red-500"/>
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Configuração Pendente</h2>
                    <p className="text-xs text-red-400 font-mono tracking-widest">SERVIDOR VERCEL NÃO AUTENTICADO</p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-4 text-sm">
                    <p className="text-slate-300 leading-relaxed flex items-start gap-3"><AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5"/> A Inteligência Artificial precisa ser ativada no painel do servidor para funcionar. Siga os passos abaixo:</p>
                    
                    <ol className="list-decimal list-inside space-y-3 text-slate-400 pl-2">
                      <li>Acesse o painel do seu projeto na <a href="https://vercel.com" target="_blank" className="font-bold text-cyan-400 hover:underline">Vercel</a>.</li>
                      <li>Vá em <strong className="text-slate-200">Settings &rarr; Environment Variables</strong>.</li>
                      <li className="space-y-2">
                        <span>Adicione a variável de ambiente:</span>
                        <div className="bg-slate-950 p-3 rounded-md border border-slate-700 text-xs font-mono">
                          <div><span className="text-slate-500">Key:</span> <span className="text-red-400 ml-2">VITE_API_KEY</span></div>
                          <div className="mt-1"><span className="text-slate-500">Value:</span><span className="text-green-400 ml-2">Sua Chave Gemini...</span></div>
                        </div>
                      </li>
                      <li>Faça um <strong className="text-slate-200">Redeploy</strong> para aplicar.</li>
                    </ol>
                </div>
                
                <div className="mt-6 text-center flex items-center justify-between bg-slate-900/30 px-4 py-2 rounded-lg">
                    <span className="text-[10px] font-mono text-slate-600 tracking-widest">SC SYSTEM ADMIN</span>
                    <button 
                     onClick={() => setError(null)} 
                     className="bg-red-800/50 hover:bg-red-700/50 border border-red-500/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors uppercase"
                   >
                     Fechar Aviso
                   </button>
                </div>
             </div>
          </div>
        ) : error && (
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
