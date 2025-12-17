import React from 'react';

interface ScanningOverlayProps {
  isActive: boolean;
}

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-10 bg-brand-500/10 border-2 border-brand-500/50">
      <div className="scanning-line"></div>
      
      {/* Simulated semantic segmentation boxes */}
      <div className="absolute top-10 left-10 w-32 h-12 border border-brand-400/60 bg-brand-400/20 animate-pulse rounded text-xs text-brand-200 p-1">Header</div>
      <div className="absolute top-24 left-10 right-10 bottom-20 border border-brand-400/60 bg-brand-400/10 animate-pulse rounded delay-100 text-xs text-brand-200 p-1">Content Area</div>
      <div className="absolute bottom-5 right-5 w-24 h-10 border border-brand-400/60 bg-brand-400/20 animate-pulse rounded delay-200 text-xs text-brand-200 p-1">Action Button</div>
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 text-brand-100 px-4 py-2 rounded-full backdrop-blur-md border border-brand-500/30 flex items-center gap-2">
        <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce delay-200"></div>
        <span className="font-mono text-sm">Analyzing Geometry...</span>
      </div>
    </div>
  );
};