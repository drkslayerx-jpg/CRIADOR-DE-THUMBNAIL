import React from 'react';
import { FontStyle, Palette, ThumbnailStyle, OverlayEffect, Resolution } from './types';
import { Zap, CloudFog, ScanLine, Aperture, Sparkles, Ban, Sun, Waves, Monitor, Smartphone, Square, Tv } from 'lucide-react';

export const FONTS: FontStyle[] = [
  { id: 'bebas', name: 'Bebas Neue', fontFamily: '"Bebas Neue", cursive', weight: '400', className: 'font-bebas' },
  { id: 'anton', name: 'Anton', fontFamily: '"Anton", sans-serif', weight: '400', className: 'font-anton' },
  { id: 'oswald', name: 'Oswald', fontFamily: '"Oswald", sans-serif', weight: '700', className: 'font-oswald' },
  { id: 'roboto', name: 'Roboto Heavy', fontFamily: '"Roboto", sans-serif', weight: '900', className: 'font-roboto' },
  { id: 'montserrat', name: 'Montserrat', fontFamily: '"Montserrat", sans-serif', weight: '800', className: 'font-montserrat' },
  { id: 'lobster', name: 'Lobster', fontFamily: '"Lobster", cursive', weight: '400', className: 'font-lobster' },
  { id: 'pacifico', name: 'Pacifico', fontFamily: '"Pacifico", cursive', weight: '400', className: 'font-pacifico' },
  { id: 'inter', name: 'Inter Bold', fontFamily: '"Inter", sans-serif', weight: '700', className: 'font-inter' },
];

export const RESOLUTIONS: Resolution[] = [
  { 
    id: 'youtube', 
    label: 'YouTube (16:9)', 
    aspectRatio: '16:9', 
    width: 1280, 
    height: 720,
    icon: React.createElement(Monitor, { className: "w-4 h-4" }) 
  },
  { 
    id: 'shorts', 
    label: 'Shorts (9:16)', 
    aspectRatio: '9:16', 
    width: 720, 
    height: 1280,
    icon: React.createElement(Smartphone, { className: "w-4 h-4" }) 
  },
  { 
    id: 'insta', 
    label: 'Post (1:1)', 
    aspectRatio: '1:1', 
    width: 1080, 
    height: 1080,
    icon: React.createElement(Square, { className: "w-4 h-4" }) 
  },
  { 
    id: 'tv', 
    label: 'TV (4:3)', 
    aspectRatio: '4:3', 
    width: 1024, 
    height: 768,
    icon: React.createElement(Tv, { className: "w-4 h-4" }) 
  }
];

export const STYLES: ThumbnailStyle[] = [
  { 
    id: 'realistic', 
    name: 'Realista', 
    promptModifier: 'hyper-realistic photography, 8k resolution, cinematic lighting, shot on Sony A7R IV, highly detailed textures, photorealism, depth of field',
    icon: '📷'
  },
  { 
    id: '3d-render', 
    name: '3D Render', 
    promptModifier: '3D render style, Pixar style, Disney animation style, octane render, soft lighting, cute, vibrant colors, high fidelity, ray tracing',
    icon: '🧊'
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk', 
    promptModifier: 'Cyberpunk 2077 style, neon lights, futuristic city, purple and blue hues, high contrast, tech atmosphere, blade runner vibe',
    icon: '🤖'
  },
  { 
    id: 'anime', 
    name: 'Anime', 
    promptModifier: 'Anime style, Studio Ghibli inspired, vibrant colors, cel shaded, 2D animation style, dramatic composition, manga art',
    icon: '🎌'
  },
  { 
    id: 'game-art', 
    name: 'Game Art', 
    promptModifier: 'Video game concept art, unreal engine 5, epic fantasy scenery, dynamic lighting, blizzard style, league of legends style',
    icon: '🎮'
  },
  { 
    id: 'novela', 
    name: 'Novela / Drama', 
    promptModifier: 'dramatic telenovela style, emotional close-up, soft cinematic lighting, soap opera aesthetic, high quality TV production, intense drama, bokeh, brazilian tv style',
    icon: '🎭'
  },
  { 
    id: 'war', 
    name: 'Guerra / Ação', 
    promptModifier: 'war photography, battlefield, gritty texture, explosions, military gear, Call of Duty style, cinematic war movie, dust and smoke, high contrast, action movie',
    icon: '⚔️'
  },
  { 
    id: 'youtube-face', 
    name: 'React Face', 
    promptModifier: 'YouTube thumbnail style, close up of expressive face, shocked expression, high contrast, vibrant background, bokeh',
    icon: '😲'
  },
  { 
    id: 'minimalist', 
    name: 'Minimalista', 
    promptModifier: 'minimalist vector art, flat design, clean lines, solid colors, simple composition, corporate memphis style, high quality',
    icon: '🔷'
  },
  { 
    id: 'horror', 
    name: 'Terror', 
    promptModifier: 'horror movie poster style, dark atmosphere, scary, fog, red and black, high contrast, cinematic, creepy lighting',
    icon: '👻'
  }
];

export const OVERLAY_EFFECTS: OverlayEffect[] = [
  { id: 'none', name: 'Normal', cssClass: '', icon: React.createElement(Ban, { className: "w-5 h-5" }) },
  { id: 'vignette', name: 'Vinheta', cssClass: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 100%)', icon: React.createElement(Aperture, { className: "w-5 h-5" }) },
  { id: 'scanlines', name: 'Scanlines', cssClass: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 3px)', icon: React.createElement(ScanLine, { className: "w-5 h-5" }) },
  { id: 'noise', name: 'Ruído', cssClass: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCA1TDUgMFpNNSA1TDUgNVoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjEiLz4KPC9zdmc+")', icon: React.createElement(CloudFog, { className: "w-5 h-5" }) },
  { id: 'warm', name: 'Quente', cssClass: 'linear-gradient(45deg, rgba(255,100,0,0.2), transparent)', icon: React.createElement(Sun, { className: "w-5 h-5" }) },
  { id: 'cool', name: 'Frio', cssClass: 'linear-gradient(45deg, rgba(0,100,255,0.2), transparent)', icon: React.createElement(Waves, { className: "w-5 h-5" }) },
];

export const PALETTES: Palette[] = [
  {
    id: 'neon-burst',
    name: 'Neon Burst',
    colors: {
      primary: '#FAFAFA', 
      secondary: '#00FF41', // Matrix Green
      background: '#111827',
      overlay: '#000000',
      textShadow: '0 0 20px rgba(0, 255, 65, 0.6)'
    }
  },
  {
    id: 'gold-luxury',
    name: 'Ouro Luxo',
    colors: {
      primary: '#FFD700', // Gold
      secondary: '#FFFFFF',
      background: '#0F0F0F',
      overlay: '#1C1C1C',
      textShadow: '2px 2px 0px #9A8600'
    }
  },
  {
    id: 'hot-red',
    name: 'Red Alert',
    colors: {
      primary: '#FFFFFF', 
      secondary: '#FF0000', // Red
      background: '#2B0000',
      overlay: '#000000',
      textShadow: '4px 4px 0px #FF0000'
    }
  },
  {
    id: 'ocean-blue',
    name: 'Deep Sea',
    colors: {
      primary: '#00FFFF', // Cyan
      secondary: '#007BFF', // Blue
      background: '#001E3C',
      overlay: '#000000',
      textShadow: '0 0 15px #007BFF'
    }
  },
  {
    id: 'candy-pop',
    name: 'Candy Pop',
    colors: {
      primary: '#FF69B4', // Hot Pink
      secondary: '#FFFF00', // Yellow
      background: '#2D0F1F',
      overlay: '#4A0E2B',
      textShadow: '3px 3px 0px #FFFF00'
    }
  },
  {
    id: 'purple-rain',
    name: 'Roxo Vivo',
    colors: {
      primary: '#E9D5FF',
      secondary: '#A855F7',
      background: '#3B0764',
      overlay: '#000000',
      textShadow: '0 4px 0px #6B21A8'
    }
  },
  {
    id: 'clean-white',
    name: 'Clean Dark',
    colors: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      background: '#000000',
      overlay: '#000000',
      textShadow: '0 4px 10px rgba(0,0,0,0.8)'
    }
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    colors: {
      primary: '#FFD700',
      secondary: '#FF8C00',
      background: '#4A0E0E',
      overlay: '#000000',
      textShadow: '2px 2px 0px #FF4500'
    }
  }
];