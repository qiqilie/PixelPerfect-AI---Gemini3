import React, { useEffect, useRef, useState } from 'react';
import { Framework } from '../types';
import { X, Maximize2, Minimize2, Monitor, RefreshCw, Smartphone, Tablet, Terminal, Package, Info, AlertCircle } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  framework: Framework;
}

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, code, framework }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);

  const canPreview = framework === Framework.HTMLTailwind || framework === Framework.Bootstrap;

  useEffect(() => {
    if (isOpen && iframeRef.current && canPreview) {
      updateIframeContent();
    }
  }, [isOpen, code, key, framework, canPreview, breakpoint]);

  const updateIframeContent = () => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    const content = generateHTMLPreview(code, framework === Framework.Bootstrap);
    doc.open();
    doc.write(content);
    doc.close();
  };

  const getWidth = () => {
    switch (breakpoint) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div 
        className={`bg-[#0f172a] rounded-2xl border border-gray-700 shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-500 overflow-hidden ${
          isFullScreen ? 'w-full h-full' : 'w-[95vw] h-[90vh]'
        }`}
      >
        {/* Advanced Toolbar */}
        <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-dark-900">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-gray-400 text-sm font-bold tracking-widest uppercase">
               {canPreview ? <Monitor size={16} className="text-brand-500" /> : <Info size={16} />}
               Live Simulation
             </div>
             {canPreview && (
               <div className="flex items-center bg-dark-800 rounded-lg p-1 border border-gray-700">
                 <button onClick={() => setBreakpoint('mobile')} className={`p-1.5 rounded transition-all ${breakpoint === 'mobile' ? 'bg-brand-500 text-white shadow-lg shadow-brand-900/40' : 'text-gray-500 hover:text-gray-300'}`}><Smartphone size={16}/></button>
                 <button onClick={() => setBreakpoint('tablet')} className={`p-1.5 rounded transition-all ${breakpoint === 'tablet' ? 'bg-brand-500 text-white shadow-lg shadow-brand-900/40' : 'text-gray-500 hover:text-gray-300'}`}><Tablet size={16}/></button>
                 <button onClick={() => setBreakpoint('desktop')} className={`p-1.5 rounded transition-all ${breakpoint === 'desktop' ? 'bg-brand-500 text-white shadow-lg shadow-brand-900/40' : 'text-gray-500 hover:text-gray-300'}`}><Monitor size={16}/></button>
               </div>
             )}
          </div>
          
          <div className="flex items-center gap-4">
            {canPreview && (
              <button onClick={() => setKey(k => k + 1)} className="p-2 text-gray-400 hover:text-white transition-colors"><RefreshCw size={18} /></button>
            )}
            <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 text-gray-400 hover:text-white transition-colors">{isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><X size={24} /></button>
          </div>
        </div>

        {/* Dynamic Sandbox */}
        <div className="flex-1 bg-[#11111b] relative flex justify-center items-start overflow-auto p-4 md:p-10 custom-scrollbar">
           {canPreview ? (
             <div 
               className="bg-white shadow-2xl transition-all duration-500 overflow-hidden rounded-lg"
               style={{ width: getWidth(), height: '100%', minHeight: '600px' }}
             >
               <iframe 
                 ref={iframeRef}
                 className="w-full h-full"
                 title="Preview"
                 sandbox="allow-scripts allow-same-origin allow-modals"
               />
             </div>
           ) : (
             <div className="w-full max-w-4xl text-white p-6 md:p-12">
                <div className="flex items-center gap-4 text-brand-400 mb-8">
                  <AlertCircle size={40} />
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Enterprise Mode Required</h2>
                </div>
                <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                  This architecture (<strong>{framework}</strong>) leverages enterprise module resolution. 
                  To run this high-performance system, deploy to your local development environment:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-dark-900 p-6 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-3 text-brand-300 font-bold mb-4 uppercase text-xs tracking-widest"><Terminal size={18}/> Environment Setup</div>
                    <div className="bg-black/60 p-4 rounded-xl font-mono text-[11px] text-brand-200">
                      {framework.includes('React') ? 'npx create-react-app --template typescript' : 'npm create vite@latest -- --template vue-ts'}
                    </div>
                  </div>
                  <div className="bg-dark-900 p-6 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-3 text-brand-300 font-bold mb-4 uppercase text-xs tracking-widest"><Package size={18}/> Install Assets</div>
                    <div className="bg-black/60 p-4 rounded-xl font-mono text-[11px] text-brand-200">
                      npm install antd element-plus vant lucide-react
                    </div>
                  </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const generateHTMLPreview = (code: string, isBootstrap: boolean) => {
  const bootstrapLink = isBootstrap 
    ? `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">` 
    : `<script src="https://cdn.tailwindcss.com"></script>`;
    
  return `
    <!DOCTYPE html>
    <html class="antialiased">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${bootstrapLink}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          body { background-color: #f8fafc; margin: 0; min-height: 100vh; font-family: sans-serif; }
          * { transition: all 0.3s ease-out; }
        </style>
      </head>
      <body>
        ${code}
      </body>
    </html>
  `;
};