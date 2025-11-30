// App.tsx

import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { FONTS, PALETTES, STYLES } from './constants';
import { ThumbnailData } from './types';
import { generateBackgroundImage } from './services/geminiService';
import { AlertCircle, ServerCog, Copy } from 'lucide-react';

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
        
        {/* Error Notification */}
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-lg shadow-2xl animate-in slide-in-from-top-4">
            {error === "MISSING_KEY" ? (
              <div className="bg-slate-900 border border-red-500/50 rounded-xl overflow-hidden">
                <div className="bg-red-900/20 px-4 py-3 border-b border-red-500/20 flex items-center gap-2">
                   <ServerCog className="w-5 h-5 text-red-500" />
                   <h3 className="font-bold text-red-100 uppercase tracking-wide text-sm">Configuração Necessária (Vercel)</h3>
                   <button onClick={() => setError(null)} className="ml-auto text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="p-5 text-sm text-slate-300 space-y-3">
                   <p>Para usar a IA, você precisa configurar sua chave no Vercel:</p>
                   <ol className="list-decimal pl-5 space-y-1 text-slate-400 marker:text-red-500">
                     <li>Vá no painel do seu projeto na <strong>Vercel</strong>.</li>
                     <li>Clique em <strong>Settings</strong> {'>'} <strong>Environment Variables</strong>.</li>
                     <li>Adicione uma nova variável:
                        <div className="mt-2 bg-black/50 p-2 rounded border border-white/10 font-mono text-xs flex justify-between items-center group">
                          <span>Key: <span className="text-red-400">API_KEY</span></span>
                          <span className="text-emerald-500">Value: Sua Chave Gemini</span>
                        </div>
                     </li>
                     <li>Salve e faça um <strong>Redeploy</strong>.</li>
                   </ol>
                </div>
              </div>
            ) : (
              <div className="bg-red-950/90 text-white px-4 py-3 rounded border border-red-500/50 flex items-start gap-3 backdrop-blur-md">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-red-200 mb-1">Erro no Sistema</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-2 text-gray-400 hover:text-white transition-colors">✕</button>
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