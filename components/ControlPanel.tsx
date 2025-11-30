import React, { useState, useRef } from 'react';
import { Palette, FontStyle, ThumbnailData } from '../types';
import { STYLES, OVERLAY_EFFECTS, RESOLUTIONS } from '../constants';
import { generateImagePromptFromTitle } from '../services/geminiService';
import { 
  Type, 
  ImageIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  ArrowUpToLine,
  ArrowDownToLine,
  MoveVertical,
  RotateCw,
  Sparkles,
  Zap,
  Layout,
  Palette as PaletteIcon,
  Wand2,
  Maximize,
  Move,
  MoveHorizontal,
  Ratio,
  Upload
} from 'lucide-react';

interface ControlPanelProps {
  data: ThumbnailData;
  palettes: Palette[];
  fonts: FontStyle[];
  onUpdate: (field: keyof ThumbnailData, value: any) => void;
  onGenerateImage: () => void;
}

const QUICK_TEXTS = ["GAMEPLAY", "AO VIVO", "REACT", "VS", "EPICO", "TUTORIAL", "24H", "DESAFIO"];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  data,
  palettes,
  fonts,
  onUpdate,
  onGenerateImage,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'studio'>('editor');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMagicPrompt = async () => {
    if (!data.title) return;
    setIsMagicLoading(true);
    try {
      const prompt = await generateImagePromptFromTitle(data.title);
      if (prompt) {
        onUpdate('description', prompt);
        setActiveTab('studio');
      }
    } catch (error) {
      console.error("Magic prompt error", error);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate('bgImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full lg:w-[420px] bg-slate-950 border-r border-slate-800 h-full flex flex-col z-30 relative shadow-[5px_0_30px_rgba(0,0,0,0.3)] font-sans">
      
      {/* Header Pro */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-900 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20 ring-1 ring-white/10">
             <Zap className="text-white w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-wider">SC STUDIO <span className="text-red-500">PRO</span></h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="px-4 py-4 bg-slate-950">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800/50">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all ${
              activeTab === 'editor' 
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Type className="w-3 h-3" />
            Editor
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-lg transition-all ${
              activeTab === 'studio' 
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            Estúdio IA
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-8 space-y-8 bg-slate-950">
        
        {/* --- TAB: EDITOR --- */}
        {activeTab === 'editor' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
            
            {/* Input Section */}
            <div className="space-y-4">
               <div className="group">
                  <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2 block group-focus-within:text-red-500 transition-colors">Texto Principal</label>
                  <textarea
                    rows={2}
                    value={data.title}
                    onChange={(e) => onUpdate('title', e.target.value)}
                    placeholder="DIGITE AQUI"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-red-600/50 focus:bg-slate-800 focus:ring-1 focus:ring-red-500/20 outline-none text-xl font-bold transition-all uppercase resize-none leading-tight"
                  />
               </div>

               {/* Quick Tags */}
               <div className="flex flex-wrap gap-1.5">
                 {QUICK_TEXTS.map(text => (
                   <button
                     key={text}
                     onClick={() => onUpdate('title', text)}
                     className="bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400 px-2.5 py-1 rounded-md hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all uppercase"
                   >
                     {text}
                   </button>
                 ))}
               </div>

               <div className="group pt-2">
                  <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2 block group-focus-within:text-red-500 transition-colors">Subtítulo</label>
                  <input
                    type="text"
                    value={data.subtitle}
                    onChange={(e) => onUpdate('subtitle', e.target.value)}
                    placeholder="LEGENDA OPCIONAL"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 placeholder-slate-600 focus:border-red-600/50 focus:bg-slate-800 outline-none text-xs font-bold transition-all uppercase"
                  />
               </div>
            </div>

            {/* Layout Tools - Compact Toolbar Style */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Layout className="w-3 h-3"/> Layout Geral</label>
                <span className="text-[9px] text-slate-600 font-mono">ALIGN</span>
              </div>
              
              <div className="flex gap-2">
                {/* H-Align */}
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 flex-1">
                  {[
                    { val: 'left', Icon: AlignLeft },
                    { val: 'center', Icon: AlignCenter },
                    { val: 'right', Icon: AlignRight }
                  ].map((item) => (
                    <button 
                      key={item.val}
                      onClick={() => onUpdate('textAlignment', item.val)}
                      className={`flex-1 h-7 flex items-center justify-center rounded transition-all ${data.textAlignment === item.val ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      <item.Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                {/* V-Align */}
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 flex-1">
                  {[
                    { val: 'top', Icon: ArrowUpToLine },
                    { val: 'center', Icon: MoveVertical },
                    { val: 'bottom', Icon: ArrowDownToLine }
                  ].map((item) => (
                    <button 
                      key={item.val}
                      onClick={() => onUpdate('textVerticalAlignment', item.val)}
                      className={`flex-1 h-7 flex items-center justify-center rounded transition-all ${data.textVerticalAlignment === item.val ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      <item.Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-slate-800/50"></div>

              {/* Sliders Row 1: Scale & Rotate */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1"><Maximize className="w-3 h-3"/> Escala</span>
                   </div>
                   <input 
                     type="range" min="0.5" max="2.0" step="0.1" 
                     value={data.textScale}
                     onChange={(e) => onUpdate('textScale', parseFloat(e.target.value))}
                     className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-600 hover:accent-red-500"
                   />
                 </div>
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1"><RotateCw className="w-3 h-3"/> Ângulo</span>
                   </div>
                   <input 
                     type="range" min="-20" max="20" step="1" 
                     value={data.textRotation}
                     onChange={(e) => onUpdate('textRotation', parseFloat(e.target.value))}
                     className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-600 hover:accent-red-500"
                   />
                 </div>
              </div>

              {/* Sliders Row 2: Fine Tuning */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1"><MoveHorizontal className="w-3 h-3"/> Posição X</span>
                     <span className="text-[9px] text-slate-600 font-mono">{data.xOffset}</span>
                   </div>
                   <input 
                     type="range" min="-400" max="400" step="10" 
                     value={data.xOffset}
                     onChange={(e) => onUpdate('xOffset', parseFloat(e.target.value))}
                     className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                   />
                 </div>
                 <div>
                   <div className="flex justify-between mb-2">
                     <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1"><Move className="w-3 h-3 rotate-90"/> Posição Y</span>
                     <span className="text-[9px] text-slate-600 font-mono">{data.yOffset}</span>
                   </div>
                   <input 
                     type="range" min="-300" max="300" step="10" 
                     value={data.yOffset}
                     onChange={(e) => onUpdate('yOffset', parseFloat(e.target.value))}
                     className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                   />
                 </div>
              </div>
            </div>

            {/* Typography Grid */}
            <div className="space-y-3">
               <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Type className="w-3 h-3"/> Fontes</label>
               <div className="grid grid-cols-2 gap-2">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => onUpdate('selectedFontId', font.id)}
                      className={`h-12 relative rounded-lg border transition-all overflow-hidden group ${
                         data.selectedFontId === font.id
                         ? 'bg-white text-black border-white shadow-md'
                         : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      <span 
                        className="absolute inset-0 flex items-center justify-center text-lg leading-none pt-1" 
                        style={{ fontFamily: font.fontFamily }}
                      >
                        {font.name}
                      </span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Color Palettes */}
            <div className="space-y-3 pb-4">
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><PaletteIcon className="w-3 h-3"/> Paleta de Cores</label>
                <div className="space-y-2">
                   {palettes.map((palette) => (
                     <button
                       key={palette.id}
                       onClick={() => onUpdate('selectedPaletteId', palette.id)}
                       className={`w-full h-10 flex items-stretch rounded-lg border overflow-hidden transition-all ${
                          data.selectedPaletteId === palette.id
                          ? 'border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)] scale-[1.01]'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-700'
                       }`}
                     >
                       <div className="flex-[2] bg-[#222] flex items-center px-3" style={{ backgroundColor: palette.colors.primary }}>
                          <span className="text-[8px] font-black uppercase text-black/50 tracking-widest">{palette.name}</span>
                       </div>
                       <div className="flex-1" style={{ backgroundColor: palette.colors.secondary }}></div>
                       <div className="flex-1" style={{ backgroundColor: palette.colors.background }}></div>
                     </button>
                   ))}
                </div>
            </div>
            
             {/* Magic Action for Transition */}
             <div className="pt-4 border-t border-slate-800">
                <button 
                  onClick={handleMagicPrompt}
                  disabled={!data.title || isMagicLoading}
                  className="w-full bg-slate-900 border border-blue-500/20 hover:border-blue-500/50 text-blue-400 text-[10px] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-900/10 group"
                >
                  {isMagicLoading ? <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"/> : <Wand2 className="w-3 h-3 group-hover:scale-110 transition-transform" />}
                  GERAR CENÁRIO COM IA BASEADO NO TÍTULO
                </button>
             </div>

          </div>
        )}

        {/* --- TAB: STUDIO --- */}
        {activeTab === 'studio' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
            
             {/* Upload Option */}
             <div className="space-y-3">
               <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Upload className="w-3 h-3"/> Upload Imagem Própria</label>
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="group cursor-pointer border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-red-500/50 hover:bg-slate-900 transition-all"
               >
                 <div className="p-3 bg-slate-900 rounded-full group-hover:bg-slate-800 transition-colors">
                   <Upload className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">CLIQUE PARA CARREGAR</span>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleImageUpload} 
                   accept="image/*" 
                   className="hidden" 
                 />
               </div>
             </div>

            {/* Prompt Box */}
            <div className="space-y-3">
               <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500"/> Prompt Visual</label>
               
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner focus-within:border-red-500/50 transition-colors">
                 <textarea
                   value={data.description}
                   onChange={(e) => onUpdate('description', e.target.value)}
                   placeholder="Descreva o cenário..."
                   rows={4}
                   className="w-full bg-transparent border-none p-3 text-slate-300 placeholder-slate-700 outline-none text-xs resize-none leading-relaxed font-mono"
                 />
                 <div className="flex justify-end px-2 pb-2">
                    <span className="text-[9px] text-slate-600 font-mono">{data.description ? data.description.length : 0} chars</span>
                 </div>
               </div>

               {/* Resolution Selection */}
               <div className="space-y-2 pt-2">
                 <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Ratio className="w-3 h-3"/> Formato / Resolução</label>
                 <div className="grid grid-cols-4 gap-2">
                    {RESOLUTIONS.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => onUpdate('aspectRatio', res.aspectRatio)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                          data.aspectRatio === res.aspectRatio
                          ? 'bg-slate-800 border-red-500 text-white shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                         <div className="mb-1">{res.icon}</div>
                         <span className="text-[8px] font-bold uppercase text-center leading-tight">{res.label.split(' ')[0]}</span>
                      </button>
                    ))}
                 </div>
               </div>

               <button
                 onClick={onGenerateImage}
                 disabled={data.isGenerating || !data.description}
                 className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg mt-4 ${
                    data.isGenerating || !data.description
                    ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40 active:scale-[0.98]'
                 }`}
               >
                  {data.isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white"></div>
                      <span>Renderizando...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>RENDERIZAR FUNDO 4K</span>
                    </>
                  )}
               </button>
            </div>

            {/* Visual Styles */}
            <div className="space-y-3">
               <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Estilo de Renderização</label>
               <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onUpdate('selectedStyleId', style.id)}
                      className={`flex flex-col items-start gap-1 p-3 rounded-lg border transition-all ${
                        data.selectedStyleId === style.id
                          ? 'bg-slate-800 border-red-500/50 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                       <span className="text-xl mb-1">{style.icon}</span>
                       <span className="text-[9px] font-bold uppercase tracking-wider">{style.name}</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Effects */}
            <div className="space-y-3">
               <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3"/> Post-Processing</label>
               <div className="grid grid-cols-3 gap-2">
                  {OVERLAY_EFFECTS.map((effect) => (
                     <button
                        key={effect.id}
                        onClick={() => onUpdate('selectedOverlayId', effect.id)}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-2 transition-all group ${
                           data.selectedOverlayId === effect.id
                           ? 'bg-slate-800 border-red-500/50 text-white shadow-lg'
                           : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-400'
                        }`}
                     >
                        {effect.icon}
                        <span className="text-[8px] font-bold uppercase">{effect.name}</span>
                     </button>
                  ))}
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};