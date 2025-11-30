import React, { useState } from 'react';
import { Palette, FontStyle, ThumbnailData } from '../types';
import { Download, Eye, EyeOff, ImageOff, MonitorPlay, Loader2 } from 'lucide-react';
import { OVERLAY_EFFECTS, RESOLUTIONS } from '../constants';

interface ThumbnailPreviewProps {
  data: ThumbnailData;
  selectedPalette: Palette;
  selectedFont: FontStyle;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  data,
  selectedPalette,
  selectedFont,
}) => {
  const [showUiOverlay, setShowUiOverlay] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Get current resolution config
  const currentRes = RESOLUTIONS.find(r => r.aspectRatio === data.aspectRatio) || RESOLUTIONS[0];

  const containerStyle: React.CSSProperties = {
    fontFamily: selectedFont.fontFamily,
    textAlign: data.textAlignment,
    alignItems: data.textAlignment === 'left' ? 'flex-start' : data.textAlignment === 'right' ? 'flex-end' : 'center',
    justifyContent: data.textVerticalAlignment === 'top' ? 'flex-start' : data.textVerticalAlignment === 'bottom' ? 'flex-end' : 'center',
    // Apply offset here alongside rotation and scale
    transform: `translate(${data.xOffset}px, ${data.yOffset}px) scale(${data.textScale}) rotate(${data.textRotation}deg)`,
    transformOrigin: 'center center',
    width: '100%',
    height: '100%',
  };

  const currentOverlay = OVERLAY_EFFECTS.find(o => o.id === data.selectedOverlayId);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Create a canvas element with dynamic dimensions
      const canvas = document.createElement('canvas');
      canvas.width = currentRes.width;
      canvas.height = currentRes.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 1. Draw Background
      if (data.bgImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = data.bgImage;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        // Use object-cover logic for canvas to fill without stretch if needed, 
        // though Gemini usually returns exact aspect ratio.
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#0F0F0F';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Apply Overlays (Simplified approximation for canvas)
      if (data.selectedOverlayId === 'vignette') {
        const gradient = ctx.createRadialGradient(centerX, centerY, canvas.height * 0.3, centerX, centerY, canvas.height * 0.8);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(1, "rgba(0,0,0,0.8)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (data.selectedOverlayId === 'warm') {
        ctx.fillStyle = "rgba(255,100,0,0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (data.selectedOverlayId === 'cool') {
        ctx.fillStyle = "rgba(0,100,255,0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 3. Draw Text
      // This is a manual reconstruction of the CSS styling
      ctx.save();
      
      // Translate to center for rotation
      ctx.translate(centerX + data.xOffset, centerY + data.yOffset);
      ctx.rotate((data.textRotation * Math.PI) / 180);
      ctx.scale(data.textScale, data.textScale);
      
      // Reset translation relative to the scaled/rotated context
      // Note: We are drawing at (0,0) which is now the center + offset
      
      // Font settings (Responsive Size based on height)
      const fontSize = currentRes.height * 0.15; // ~100px for 720p
      // We assume the font is loaded in the browser
      ctx.font = `900 ${fontSize}px ${selectedFont.fontFamily.replace(/"/g, '')}, sans-serif`;
      ctx.textAlign = data.textAlignment as CanvasTextAlign;
      ctx.textBaseline = 'middle';
      
      // Alignment offsets relative to center
      let drawX = 0;
      const xBound = canvas.width * 0.4;
      const yBound = canvas.height * 0.35;

      if (data.textAlignment === 'left') drawX = -xBound;
      if (data.textAlignment === 'right') drawX = xBound;
      
      let drawY = 0;
      if (data.textVerticalAlignment === 'top') drawY = -yBound;
      if (data.textVerticalAlignment === 'bottom') drawY = yBound;

      // Shadow
      ctx.shadowColor = selectedPalette.colors.secondary;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;

      // Draw Title
      if (data.title) {
        ctx.fillStyle = selectedPalette.colors.primary;
        // Stroke
        ctx.lineWidth = canvas.height * 0.005;
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.strokeText(data.title.toUpperCase(), drawX, drawY);
        ctx.fillText(data.title.toUpperCase(), drawX, drawY);
      }

      // Draw Subtitle (Small badge above or below)
      if (data.subtitle) {
         ctx.font = `700 ${fontSize * 0.3}px ${selectedFont.fontFamily.replace(/"/g, '')}, sans-serif`;
         const subY = drawY - (fontSize * 0.8); // Above title
         
         // Background badge for subtitle
         const metrics = ctx.measureText(data.subtitle.toUpperCase());
         const pad = fontSize * 0.2;
         const badgeHeight = fontSize * 0.5;
         
         ctx.fillStyle = selectedPalette.colors.secondary;
         ctx.shadowBlur = 0;
         ctx.shadowOffsetX = 0;
         ctx.shadowOffsetY = 0;
         
         // Skew transformation for badge
         ctx.save();
         ctx.transform(1, 0, -0.2, 1, 0, 0); // Skew X
         ctx.fillRect(drawX - (metrics.width/2) - pad, subY - (badgeHeight/2), metrics.width + (pad*2), badgeHeight);
         ctx.restore();

         ctx.fillStyle = "#FFFFFF";
         ctx.fillText(data.subtitle.toUpperCase(), drawX, subY);
      }

      ctx.restore();

      // 4. Download
      const link = document.createElement('a');
      link.download = `SC-Studio-${data.aspectRatio.replace(':','x')}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

    } catch (e) {
      console.error("Download failed", e);
      alert("Erro ao baixar. Tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden h-full">
      
      {/* Cinematic Background (Ambilight Effect) */}
      {data.bgImage && (
        <div 
          className="absolute inset-0 z-0 opacity-40 blur-[100px] scale-125 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${data.bgImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
        ></div>
      )}
      
      {/* Studio Gradient Radial */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 to-slate-950 pointer-events-none z-0"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
             style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Toolbar */}
      <div className="w-full h-16 flex items-center justify-between px-8 z-30 shrink-0 relative">
        <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-700/50 shadow-sm">
                <MonitorPlay className="w-3 h-3 text-red-500" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{currentRes.width} x {currentRes.height}</span>
             </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setShowUiOverlay(!showUiOverlay)}
            className={`flex items-center gap-2 text-[10px] font-bold px-4 py-2 rounded-lg transition-all border backdrop-blur-md uppercase tracking-wide ${
              showUiOverlay 
                ? 'bg-red-500/10 text-red-500 border-red-500/30' 
                : 'bg-slate-900/60 text-slate-400 border-slate-700/50 hover:border-slate-600 hover:text-white'
            }`}
          >
            {showUiOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showUiOverlay ? 'Hide UI' : 'Show UI'}
          </button>

          <button 
            className="flex items-center gap-2 text-[10px] font-black bg-white hover:bg-slate-200 text-slate-900 px-5 py-2 rounded-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 uppercase tracking-wide disabled:opacity-50"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Download className="w-3.5 h-3.5" />}
            {isDownloading ? 'Processando...' : 'Salvar Arte'}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative z-10 overflow-hidden">
        
        {/* The Thumbnail Container - Shadow & Glow */}
        {/* We use CSS aspect-ratio which reads as width/height */}
        <div 
          className="relative group transition-all duration-500 shadow-2xl rounded-xl"
          style={{ 
             aspectRatio: `${currentRes.aspectRatio.replace(':','/')}`,
             height: currentRes.height > currentRes.width ? '90%' : 'auto',
             width: currentRes.width > currentRes.height ? '90%' : 'auto',
             maxWidth: '100%',
             maxHeight: '100%'
          }}
        >
           
           {/* Drop Shadow */}
           <div className="absolute -inset-8 bg-black/60 blur-2xl rounded-[30px] -z-10"></div>
           
           <div className="w-full h-full bg-[#111] relative overflow-hidden ring-1 ring-slate-700/50 select-none rounded-xl">
            
            {/* LAYER 0: Background Image */}
            {data.bgImage ? (
               <img 
                 src={data.bgImage} 
                 alt="Background" 
                 className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 hover:scale-105"
                 crossOrigin="anonymous"
               />
            ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 z-0 bg-[#0F0F0F]">
                  <ImageOff className="w-16 h-16 mb-4 text-white" />
                  <span className="text-white font-black uppercase text-sm tracking-[0.2em]">Aguardando Render</span>
               </div>
            )}
            
            {/* LAYER 1: Cinematic Dimming */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-0 pointer-events-none"></div>

            {/* LAYER 2: CSS Overlays */}
            {currentOverlay && currentOverlay.id !== 'none' && (
               <div 
                 className="absolute inset-0 z-10 pointer-events-none opacity-70 mix-blend-overlay"
                 style={{ background: currentOverlay.cssClass }}
               ></div>
            )}
            
            {/* LAYER 3: Content */}
            <div className="absolute inset-0 p-[8%] flex flex-col z-20 pointer-events-none" style={containerStyle}>
              
              {data.subtitle && (
                <div 
                  className="inline-block px-4 py-1.5 mb-3 transform -skew-x-6 shadow-2xl backdrop-blur-sm"
                  style={{ backgroundColor: selectedPalette.colors.secondary }}
                >
                  <span className="block transform skew-x-6 text-white font-black uppercase tracking-[0.15em] text-lg lg:text-xl drop-shadow-md">
                    {data.subtitle}
                  </span>
                </div>
              )}

              <h1 
                className="text-6xl lg:text-8xl font-black leading-[0.85] uppercase max-w-full break-words tracking-tighter filter drop-shadow-2xl"
                style={{ 
                  color: selectedPalette.colors.primary,
                  WebkitTextStroke: '1px rgba(0,0,0,0.1)', // Subtle stroke for definition
                  textShadow: `${selectedPalette.colors.textShadow}, 0 10px 40px rgba(0,0,0,0.8)`,
                }}
              >
                {data.title || "TÍTULO AQUI"}
              </h1>
            </div>

            {/* LAYER 4: YouTube UI Simulator - Only show on 16:9 for accuracy */}
            {showUiOverlay && data.aspectRatio === '16:9' && (
               <div className="absolute inset-0 z-30 pointer-events-none">
                  <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] tracking-wide font-mono">
                     12:42
                  </div>
                  <div className="absolute bottom-2 right-12 top-2 left-2 opacity-0"></div> {/* Spacer */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/40">
                     <div className="w-[85%] h-full bg-[#FF0000]"></div>
                  </div>
               </div>
            )}

            {/* SC Studio Watermark */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-40 mix-blend-screen">
               <span className="text-[9px] text-white font-black tracking-[0.4em] uppercase border border-white/30 px-3 py-1 rounded-full">
                  SC STUDIO
               </span>
            </div>

           </div>
        </div>
      </div>
    </div>
  );
};