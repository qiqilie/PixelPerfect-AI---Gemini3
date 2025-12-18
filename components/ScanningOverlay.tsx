import React from 'react';
import { Cpu, Layout, Box, Target } from 'lucide-react';

interface ScanningOverlayProps {
  isActive: boolean;
}

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Background Dimming */}
      <div className="absolute inset-0 bg-brand-900/20 backdrop-blur-[1px]"></div>
      
      {/* Moving Scan Line */}
      <div className="scanning-line"></div>
      
      {/* Pulsing Grid Layer */}
      <div className="scanning-grid"></div>

      {/* Tech Corner Brackets */}
      <div className="tech-bracket tech-bracket-tl"></div>
      <div className="tech-bracket tech-bracket-tr"></div>
      <div className="tech-bracket tech-bracket-bl"></div>
      <div className="tech-bracket tech-bracket-br"></div>

      {/* Semantic Region Indicators */}
      <div className="absolute top-[15%] left-[10%] w-[35%] h-[12%] border border-brand-500/40 bg-brand-500/5 animate-pulse rounded p-1 flex flex-col justify-between">
        <span className="text-[8px] font-mono text-brand-400 uppercase tracking-tighter">NAV_HEADER_IDENTIFIED</span>
        <div className="flex justify-between items-end">
          <Layout size={8} className="text-brand-500" />
          <div className="w-1 h-1 bg-brand-500 rounded-full"></div>
        </div>
      </div>

      <div className="absolute top-[35%] right-[10%] w-[40%] h-[30%] border border-brand-500/40 bg-brand-500/5 animate-pulse delay-700 rounded p-1 flex flex-col justify-between">
        <span className="text-[8px] font-mono text-brand-400 uppercase tracking-tighter">COMPONENT_GRID_V2</span>
        <div className="flex justify-between items-end">
          <Box size={8} className="text-brand-500" />
          <span className="text-[6px] text-brand-500/60 font-mono">CONF: 98.4%</span>
        </div>
      </div>

      {/* Central Status Hud */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
        <div className="relative">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping scale-150 opacity-20"></div>
            <div className="bg-dark-900/90 text-brand-100 px-6 py-3 rounded-2xl backdrop-blur-xl border border-brand-500/50 flex items-center gap-4 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                <Cpu className="text-brand-400 animate-spin transition-all duration-[3000ms]" size={20} />
                <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-brand-500">Neural Analysis</span>
                    <div className="flex gap-1 mt-1">
                        <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:200ms]"></div>
                        <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:400ms]"></div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Real-time Data Stream Mock */}
        <div className="text-[10px] font-mono text-brand-500/70 bg-black/40 px-3 py-1 rounded-full border border-brand-500/20 backdrop-blur-sm">
          EXTRACTING_DOM_REFS_0x7F2...
        </div>
      </div>

      {/* Peripheral Markers */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-12 opacity-40">
        <div className="flex flex-col items-center">
          <Target size={12} className="text-brand-500 animate-pulse" />
          <span className="text-[6px] font-mono mt-1">PTR: 402</span>
        </div>
        <div className="flex flex-col items-center">
          <Target size={12} className="text-brand-500 animate-pulse delay-500" />
          <span className="text-[6px] font-mono mt-1">DIM: 1024x768</span>
        </div>
      </div>
    </div>
  );
};