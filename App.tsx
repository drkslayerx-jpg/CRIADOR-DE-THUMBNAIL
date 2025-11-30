// App.tsx
import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { FONTS, PALETTES, STYLES, OVERLAY_EFFECTS, RESOLUTIONS } from './constants';
import { ThumbnailData } from './types';
import { SpeedInsights } from "@vercel/speed-insights/react"; // 
import { generateBackgroundImage } from './services/geminiService';
import { AlertCircle } from 'lucide-react';
//o

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
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-white font-sans overflow-hidden selection:bg-red-500/30 selection:text-red-200">
      <div className="flex-1 order-2 lg:order-1 h-[45%] lg:h-full w-full lg:w-auto flex-shrink-0 z-40">
        {/* Control Panel */}
        <div className="p-4 border-r border-gray-800 lg:order-1 h-full w-full lg:w-auto flex-shrink-0 z-40">
          <ControlPanel
            data={data}
            palettes={PALETTES}
            fonts={FONTS}
            onUpdate={handleUpdate}
            onGenerateImage={handleGenerateBackground}
          />
        </div>
      </div>

      {/* Main Preview */}
      <div className="lg:order-2 order-1 lg:flex-1 relative h-[55%] lg:h-full flex flex-col z-10 bg-slate-950">
        {/* Error Notification */}
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md bg-red-950/90 text-white px-4 py-3 rounded border border-red-500 mt-0.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <h4 className="font-bold text-xs uppercase tracking-wide text-red-200 mb-1">Erro no Sistema</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{error}</p>
            <button onClick={() => setError(null)} className="ml-2 text-gray-400 hover:text-white transition-colors">Fechar</button>
          </div>
        )}

        <ThumbnailPreview
          data={data}
          selectedPalette={selectedPalette}
          selectedFont={selectedFont}
        />
        
        <SpeedInsights /> {/* <-- COLE AQUI */}
      </div>
    </div>
  );
}

export default App;
