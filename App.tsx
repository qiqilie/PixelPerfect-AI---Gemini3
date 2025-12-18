
import React, { useState, useRef, useEffect } from 'react';
import { Framework, Platform, GenerationSettings, ProcessingStatus, ChatMessage, HistoryItem, DesignTokens } from './types';
import { generateCodeFromImage, refineCode } from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { ScanningOverlay } from './components/ScanningOverlay';
import { PreviewModal } from './components/PreviewModal';
import { ChatFloatingWindow } from './components/ChatFloatingWindow';
// Added Box to imports to fix the error in the history drawer empty state
import { Upload, Camera, Code2, Play, Copy, Check, AlertCircle, Loader2, Eye, History, Download, Palette, Type as TypeIcon, X, Box } from 'lucide-react';

const DefaultSettings: GenerationSettings = {
  framework: Framework.ReactTailwind,
  platform: Platform.Web,
  useSemanticTags: true,
  includeComments: false,
  model: 'gemini-3-flash-preview',
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<GenerationSettings>(DefaultSettings);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [designTokens, setDesignTokens] = useState<DesignTokens | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!imagePreview) return;
    
    // Explicitly set to analyzing first to trigger the fancy scanner
    setStatus('analyzing');
    setErrorMessage(null);
    setChatMessages([]);

    try {
      // Small artificial delay to let user see the "analyzing" scanner before moving to generation
      await new Promise(r => setTimeout(r, 1500));
      
      setStatus('generating');
      const result = await generateCodeFromImage(imagePreview, settings);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        code: result.code,
        timestamp: Date.now(),
        tokens: result.tokens
      };

      setGeneratedCode(result.code);
      setDesignTokens(result.tokens);
      setHistory(prev => [newHistoryItem, ...prev]);
      setStatus('complete');
      setIsChatOpen(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Unknown error");
      setStatus('error');
    }
  };

  const handleRefineCode = async (instruction: string) => {
    if (!generatedCode) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: instruction, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setStatus('refining');
    try {
      const newCode = await refineCode(generatedCode, instruction, settings);
      setGeneratedCode(newCode);
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Updated!", timestamp: Date.now() };
      setChatMessages(prev => [...prev, assistantMsg]);
      
      const newHistoryItem: HistoryItem = { id: Date.now().toString(), code: newCode, timestamp: Date.now(), tokens: designTokens || undefined };
      setHistory(prev => [newHistoryItem, ...prev]);
      setStatus('complete');
    } catch (err: any) {
      setStatus('complete');
    }
  };

  const exportCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-perfect-code.${settings.framework.includes('Vue') ? 'vue' : 'tsx'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreHistory = (item: HistoryItem) => {
    setGeneratedCode(item.code);
    if (item.tokens) setDesignTokens(item.tokens);
    setIsHistoryOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden font-sans">
      <Sidebar settings={settings} setSettings={setSettings} />

      <main className="flex-1 flex flex-col h-full relative">
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-dark-900/50 backdrop-blur-sm z-50">
          <div className="flex items-center gap-4">
             {status !== 'idle' && (
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                 <span className="text-brand-400 text-xs font-bold uppercase tracking-[0.3em]">{status}...</span>
               </div>
             )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="History"
            >
              <History size={20} />
            </button>
            <button 
              onClick={handleGenerate}
              disabled={!imagePreview || status === 'analyzing' || status === 'generating' || status === 'refining'}
              className="group relative flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-lg font-bold transition-all shadow-lg shadow-brand-900/40 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {status === 'generating' || status === 'analyzing' ? <Loader2 className="animate-spin" size={18}/> : <Play size={18} fill="currentColor" />}
              <span className="relative z-10">Generate Code</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Design Panel (Enterprise) */}
          <div className="w-1/2 p-6 border-r border-gray-800 bg-black/20 overflow-y-auto custom-scrollbar">
            {!imagePreview ? (
              <div 
                className="h-full border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-brand-500/5 hover:border-brand-500/50 transition-all duration-500 group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <div className="p-6 rounded-full bg-dark-800 mb-6 group-hover:scale-110 transition-transform">
                    <Upload size={48} className="text-gray-500 group-hover:text-brand-500 transition-colors" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Enterprise Design Hub</h3>
                <p className="text-gray-500 mt-2 max-w-xs text-sm">Upload your UI design here. We'll handle the architectural mapping and code generation.</p>
                <div className="mt-8 px-6 py-2 bg-dark-800 rounded-full text-xs text-gray-400 border border-gray-700">Supported: PNG, JPG, WEBP</div>
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     const reader = new FileReader();
                     reader.onload = () => setImagePreview(reader.result as string);
                     reader.readAsDataURL(file);
                   }
                }} />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden border border-gray-700 bg-black/40 shadow-2xl">
                  <img src={imagePreview} className="w-full object-contain max-h-[500px]" alt="Design" />
                  {/* Keep overlay during BOTH analyzing and generating for best effect */}
                  <ScanningOverlay isActive={status === 'analyzing' || status === 'generating'} />
                  
                  <button onClick={() => {setImagePreview(null); setDesignTokens(null); setGeneratedCode('');}} className="absolute top-4 right-4 bg-dark-900/80 p-2 rounded-xl hover:bg-red-500 transition-all text-white border border-white/10 backdrop-blur-md z-50 shadow-lg">
                    <X size={18} />
                  </button>
                </div>

                {designTokens && (
                  <div className="bg-dark-900/40 rounded-2xl border border-gray-800 p-6 space-y-6 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Palette size={14} className="text-brand-500"/> System Design Tokens
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Color Palette</h4>
                            <div className="flex flex-wrap gap-2">
                                {(designTokens.colors || []).map((c, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-dark-800/80 p-1.5 rounded-lg border border-white/5 pr-3">
                                        <div className="w-8 h-8 rounded-md border border-white/10 shadow-inner" style={{ backgroundColor: c.hex }}></div>
                                        <div className="text-[9px] font-mono">
                                            <div className="text-gray-200 font-bold uppercase">{c.hex}</div>
                                            <div className="text-gray-500 mt-0.5 truncate max-w-[60px]">{c.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Type System</h4>
                            <div className="space-y-1.5">
                                {(designTokens.typography || []).map((t, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] text-gray-400 bg-dark-800/40 p-2 rounded-lg border border-white/5">
                                        <span className="font-bold text-brand-500 uppercase">{t.element}</span>
                                        <span className="font-mono text-gray-500">{t.fontSize} • {t.fontWeight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Editor Panel */}
          <div className="w-1/2 p-6 flex flex-col bg-[#1e1e2e]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Code2 size={16} className="text-brand-500"/> Production Output
              </h2>
              {generatedCode && (
                <div className="flex items-center gap-2">
                   <button onClick={exportCode} className="p-2 text-gray-400 hover:text-white hover:bg-dark-900 rounded-lg transition-all" title="Export File"><Download size={18}/></button>
                   <button 
                     onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                     }} 
                     className="p-2 text-gray-400 hover:text-white hover:bg-dark-900 rounded-lg transition-all" 
                     title="Copy Source"
                   >
                     {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18}/>}
                   </button>
                   <button onClick={() => setIsPreviewOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-400 transition-all shadow-lg shadow-brand-900/30">
                    <Eye size={16} /> Run Preview
                   </button>
                </div>
              )}
            </div>
            <div className="flex-1 bg-[#11111b] border border-gray-800 rounded-2xl overflow-hidden relative shadow-inner">
               <textarea 
                className="w-full h-full p-6 bg-transparent font-mono text-sm text-gray-400 resize-none focus:outline-none custom-scrollbar leading-relaxed"
                value={generatedCode}
                readOnly
                placeholder="/* Waiting for design upload and analysis... */"
               />
               {status === 'generating' && (
                 <div className="absolute inset-0 bg-dark-900/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-brand-500" size={32} />
                        <span className="text-xs font-mono text-brand-400 animate-pulse tracking-widest uppercase">Building Architecture...</span>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>

      {/* History Drawer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-end">
           <div className="w-[400px] bg-dark-900 h-full border-l border-gray-800 p-8 shadow-2xl animate-in slide-in-from-right duration-500">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <History className="text-brand-500" size={24} />
                    <h3 className="text-xl font-black italic tracking-tighter uppercase">Snapshots</h3>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
              </div>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center text-gray-600 py-20 flex flex-col items-center gap-4 border-2 border-dashed border-gray-800 rounded-2xl">
                      <Box size={40} className="opacity-20" />
                      <span className="text-sm">No enterprise snapshots yet.</span>
                  </div>
                ) : (
                  history.map(h => (
                    <div key={h.id} className="group p-5 bg-dark-800 rounded-2xl border border-gray-700 hover:border-brand-500 cursor-pointer transition-all hover:scale-[1.02] shadow-xl" onClick={() => restoreHistory(h)}>
                      <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-mono text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded uppercase">{new Date(h.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-xs font-mono text-gray-400 line-clamp-2 leading-relaxed opacity-60">
                        {h.code.substring(0, 100)}...
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} code={generatedCode} framework={settings.framework} />

      {/* Assistant */}
      {generatedCode && (
        <ChatFloatingWindow 
          isOpen={isChatOpen} 
          setIsOpen={setIsChatOpen} 
          messages={chatMessages} 
          onSendMessage={handleRefineCode} 
          status={status} 
        />
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-red-950/90 border border-red-500/50 px-8 py-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-bottom shadow-2xl backdrop-blur-md">
          <AlertCircle size={24} className="text-red-500" />
          <div className="flex flex-col">
              <span className="text-sm font-black text-red-100 uppercase italic">Error Detected</span>
              <span className="text-xs text-red-200/70">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="ml-4 p-1 hover:bg-white/10 rounded-lg text-red-400"><X size={18}/></button>
        </div>
      )}
    </div>
  );
};

export default App;
