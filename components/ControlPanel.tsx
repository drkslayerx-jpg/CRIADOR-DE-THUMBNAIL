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
  Upload,
  Image as LucideImage,
  Pipette
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
  onGenerateImage
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
    } catch (error: any) {
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

  const handlePaletteSelect = (palette: Palette) => {
    onUpdate('selectedPaletteId', palette.id);
    // Batch update individual colors from palette
    onUpdate('titleColor', palette.colors.primary);
    onUpdate('subtitleColor', palette.colors.secondary);
    
    // Extract shadow color approximate or default to black/primary shadow logic
    // For simplicity, we keep black or use textShadow from palette if parsable
    onUpdate('shadowColor', '#000000'); 
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
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={data.title}
                      onChange={(e) => onUpdate('title', e.target.value)}
                      placeholder="DIGITE AQUI"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-red-600/50 focus:bg-slate-800 focus:ring-1 focus:ring-red-500/20 outline-none text-xl font-bold transition-all uppercase resize-none leading-tight"
                    />
                    <button 
                      onClick={() => onUpdate('title', '')}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 hover:bg-red-950 hover:border-red-900 text-slate-500 hover:text-red-500 transition-colors"
                      title="Limpar Texto"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  </div>
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

            {/* Custom Colors Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Pipette className="w-3 h-3"/> Cores Personalizadas</label>
                </div>
                
                <div className="flex gap-3">
                   <div className="flex-1">
                      <label className="text-[8px] text-slate-400 uppercase font-bold mb-1 block">Título</label>
                      <div className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900 relative overflow-hidden flex items-center px-2 gap-2 focus-within:border-slate-600">
                         <input 
                           type="color" 
                           value={data.titleColor}
                           onChange={(e) => {
                             onUpdate('titleColor', e.target.value);
                             onUpdate('selectedPaletteId', ''); // Deselect preset
                           }}
                           className="w-6 h-6 rounded border-none p-0 cursor-pointer bg-transparent"
                         />
                         <span className="text-[10px] font-mono text-slate-300 uppercase">{data.titleColor}</span>
                      </div>
                   </div>
                   
                   <div className="flex-1">
                      <label className="text-[8px] text-slate-400 uppercase font-bold mb-1 block">Subtítulo</label>
                      <div className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900 relative overflow-hidden flex items-center px-2 gap-2 focus-within:border-slate-600">
                         <input 
                           type="color" 
                           value={data.subtitleColor}
                           onChange={(e) => {
                             onUpdate('subtitleColor', e.target.value);
                             onUpdate('selectedPaletteId', ''); // Deselect preset
                           }}
                           className="w-6 h-6 rounded border-none p-0 cursor-pointer bg-transparent"
                         />
                         <span className="text-[10px] font-mono text-slate-300 uppercase">{data.subtitleColor}</span>
                      </div>
                   </div>
                   
                   <div className="flex-1">
                      <label className="text-[8px] text-slate-400 uppercase font-bold mb-1 block">Sombra</label>
                      <div className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900 relative overflow-hidden flex items-center px-2 gap-2 focus-within:border-slate-600">
                         <input 
                           type="color" 
                           value={data.shadowColor}
                           onChange={(e) => onUpdate('shadowColor', e.target.value)}
                           className="w-6 h-6 rounded border-none p-0 cursor-pointer bg-transparent"
                         />
                         <span className="text-[10px] font-mono text-slate-300 uppercase">{data.shadowColor}</span>
                      </div>
                   </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2 pt-2">
                   <label className="text-[8px] text-slate-600 uppercase font-bold">Estilos Rápidos (Presets)</label>
                   <div className="grid grid-cols-4 gap-2">
                      {palettes.map((palette) => (
                        <button
                          key={palette.id}
                          onClick={() => handlePaletteSelect(palette)}
                          className={`h-8 rounded-md border transition-all relative overflow-hidden ${
                             data.selectedPaletteId === palette.id
                             ? 'border-white ring-1 ring-white'
                             : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-600'
                          }`}
                          title={palette.name}
                        >
                          <div className="absolute inset-0 flex">
                            <div className="flex-1" style={{ backgroundColor: palette.colors.primary }}></div>
                            <div className="flex-1" style={{ backgroundColor: palette.colors.secondary }}></div>
                          </div>
                        </button>
                      ))}
                   </div>
                </div>
            </div>

            {/* Layout Tools */}
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
             
             {/* Upload Custom Image */}
             <div 
               className="group border border-dashed border-slate-800 bg-slate-900/30 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-900 hover:border-slate-600 transition-all relative overflow-hidden"
               onClick={() => fileInputRef.current?.click()}
             >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Upload className="w-5 h-5 mx-auto text-slate-500 mb-2 group-hover:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300">Upload Imagem Própria</span>
             </div>

             {/* Resolution Select */}
             <div className="space-y-3">
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Ratio className="w-3 h-3"/> Formato / Resolução</label>
                <div className="grid grid-cols-4 gap-2">
                   {RESOLUTIONS.map(res => (
                      <button
                        key={res.id}
                        onClick={() => {
                          onUpdate('aspectRatio', res.aspectRatio);
                          onUpdate('selectedResolutionId', res.id);
                        }}
                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all ${
                           data.aspectRatio === res.aspectRatio
                           ? 'bg-red-500/10 border-red-500 text-red-500 shadow-sm'
                           : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                         {res.icon}
                         <span className="text-[8px] font-bold uppercase">{res.label.split(' ')[0]}</span>
                      </button>
                   ))}
                </div>
             </div>

             {/* Prompt Input */}
             <div className="space-y-3">
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-500"/> Prompt Visual</label>
                <textarea
                  rows={4}
                  value={data.description}
                  onChange={(e) => onUpdate('description', e.target.value)}
                  placeholder="Descreva o cenário de fundo (ex: Estádio de futebol futurista à noite com luzes neon azuis)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:border-yellow-500/50 focus:bg-slate-800 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all resize-none"
                />
             </div>

             {/* Style Selector */}
             <div className="space-y-3">
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Estilo de Renderização</label>
                <div className="grid grid-cols-2 gap-2">
                   {STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => onUpdate('selectedStyleId', style.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                           data.selectedStyleId === style.id
                           ? 'bg-slate-800 border-slate-600 text-white ring-1 ring-slate-500'
                           : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                         <span className="text-xl">{style.icon}</span>
                         <span className="text-[9px] font-bold uppercase tracking-wide">{style.name}</span>
                      </button>
                   ))}
                </div>
             </div>

             {/* Overlay Effects */}
             <div className="space-y-3 pb-24">
                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Itens Especiais (FX)</label>
                <div className="grid grid-cols-3 gap-2">
                   {OVERLAY_EFFECTS.map((overlay) => (
                      <button
                        key={overlay.id}
                        onClick={() => onUpdate('selectedOverlayId', overlay.id)}
                        className={`flex flex-col items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                           data.selectedOverlayId === overlay.id
                           ? 'bg-slate-800 border-slate-500 text-white'
                           : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                         <div className="opacity-70">{overlay.icon}</div>
                         <span className="text-[8px] font-bold uppercase">{overlay.name}</span>
                      </button>
                   ))}
                </div>
             </div>

             {/* Generate Button Fixed Bottom */}
             <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
               <button
                 onClick={onGenerateImage}
                 disabled={data.isGenerating}
                 className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-lg shadow-red-900/40 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
               >
                 {data.isGenerating ? (
                   <>
                     <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/>
                     PROCESSANDO...
                   </>
                 ) : (
                   <>
                     <LucideImage className="w-4 h-4" />
                     RENDERIZAR FUNDO 4K
                   </>
                 )}
               </button>
             </div>

          </div>
        )}
      </div>
    </div>
  );
};