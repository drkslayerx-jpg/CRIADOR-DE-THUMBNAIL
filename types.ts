import React from 'react';

export interface Palette {
  id: string;
  name: string;
  colors: {
    primary: string;   // Main Title Color
    secondary: string; // Subtitle/Accent
    background: string; // Fallback background if no image
    overlay: string;   // Gradient overlay opacity/color
    textShadow: string;
  };
}

export interface FontStyle {
  id: string;
  name: string;
  fontFamily: string;
  weight: string;
  className: string;
}

export interface ThumbnailStyle {
  id: string;
  name: string;
  promptModifier: string;
  icon: string;
}

export interface OverlayEffect {
  id: string;
  name: string;
  cssClass: string; // Tailwind class or inline style object key
  icon: React.ReactNode;
}

export interface Resolution {
  id: string;
  label: string;
  aspectRatio: string; // For Gemini API
  width: number;
  height: number;
  icon: React.ReactNode;
}

export interface ThumbnailData {
  title: string;
  subtitle: string;
  description: string;
  bgImage: string | null;
  selectedPaletteId: string; // Kept for reference/UI highlighting
  selectedFontId: string;
  selectedStyleId: string;
  
  // Custom Colors (Separated)
  titleColor: string;
  subtitleColor: string;
  shadowColor: string;
  
  // Resolution / Format
  aspectRatio: string;
  selectedResolutionId?: string;

  // Layout Controls
  textAlignment: 'left' | 'center' | 'right';
  textVerticalAlignment: 'top' | 'center' | 'bottom';
  textScale: number; // 0.5 to 2.0
  textRotation: number; // -45 to 45 degrees
  xOffset: number; // Fine tuning Horizontal
  yOffset: number; // Fine tuning Vertical
  
  // Visual Effects
  selectedOverlayId: string;
  
  isGenerating: boolean;
  apiKey?: string; // Optional local handling
}