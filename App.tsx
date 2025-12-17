import React, { useState, useRef, useCallback } from 'react';
import { Framework, Platform, GenerationSettings, ProcessingStatus } from './types';
import { generateCodeFromImage } from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { ScanningOverlay } from './components/ScanningOverlay';
import { PreviewModal } from './components/PreviewModal';
import { Upload, Camera, Code2, Play, Copy, Check, AlertCircle, Loader2, Eye } from 'lucide-react';

const DefaultSettings: GenerationSettings = {
  framework: Framework.ReactTailwind,
  platform: Platform.Web,
  useSemanticTags: true,
  includeComments: false,
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<GenerationSettings>(DefaultSettings);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // --- Image Handling ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setStatus('idle');
      setGeneratedCode('');
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  // --- Camera Handling ---

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setErrorMessage("Could not access camera.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    setIsCameraOpen(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // --- Generation Logic ---

  const handleGenerate = async () => {
    if (!imagePreview) return;

    setStatus('analyzing');
    setErrorMessage(null);

    // Simulate "Scanning" phase for UX
    setTimeout(async () => {
      try {
        setStatus('generating');
        const code = await generateCodeFromImage(imagePreview, settings);
        setGeneratedCode(code);
        setStatus('complete');
      } catch (err) {
        setErrorMessage("Failed to generate code. Please try again.");
        setStatus('error');
      }
    }, 2500); // 2.5s simulated scan time
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden font-sans">
      
      {/* Sidebar */}
      <Sidebar settings={settings} setSettings={setSettings} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-dark-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
             {status === 'analyzing' && <span className="text-brand-400 text-sm animate-pulse">Running Semantic Segmentation...</span>}
             {status === 'generating' && <span className="text-brand-400 text-sm animate-pulse">Gemini Generating Code...</span>}
             {status === 'complete' && <span className="text-green-400 text-sm font-medium">Generation Complete</span>}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleGenerate}
              disabled={!imagePreview || status === 'analyzing' || status === 'generating'}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all ${
                !imagePreview || status === 'analyzing' || status === 'generating'
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/20'
              }`}
            >
              {status === 'analyzing' || status === 'generating' ? <Loader2 className="animate-spin" size={18}/> : <Play size={18} fill="currentColor" />}
              Generate Code
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Image Input */}
          <div className="w-1/2 p-6 border-r border-gray-800 bg-black/20 flex flex-col relative">
            <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Input Design</h2>
            
            <div 
              className={`flex-1 relative rounded-xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center ${
                imagePreview ? 'border-gray-700 bg-dark-900' : 'border-gray-700 hover:border-brand-500/50 hover:bg-gray-800/30'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {isCameraOpen ? (
                 <div className="relative w-full h-full bg-black flex flex-col">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                      <button onClick={capturePhoto} className="bg-white text-black rounded-full p-4 hover:scale-105 transition-transform"><Camera size={24} /></button>
                      <button onClick={stopCamera} className="bg-red-500 text-white rounded-full p-4 hover:scale-105 transition-transform">Cancel</button>
                    </div>
                 </div>
              ) : imagePreview ? (
                <>
                  <img src={imagePreview} alt="Uploaded Design" className="w-full h-full object-contain" />
                  <ScanningOverlay isActive={status === 'analyzing'} />
                  <button 
                    onClick={() => setImagePreview(null)}
                    className="absolute top-4 right-4 bg-black/60 hover:bg-red-500/80 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-500">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-200">Drop your design here</h3>
                  <p className="text-gray-500 text-sm mt-2 mb-6">Support PNG, JPG, WebP</p>
                  
                  <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm border border-gray-700 transition-colors"
                    >
                      Browse Files
                    </button>
                    <button 
                      onClick={startCamera}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm border border-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Camera size={16} /> Camera
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Code Output */}
          <div className="w-1/2 p-6 flex flex-col bg-[#1e1e2e]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Generated Code</h2>
              <div className="flex items-center gap-2">
                {generatedCode && (
                  <>
                    <button 
                      onClick={() => setIsPreviewOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-medium transition-colors shadow-lg shadow-brand-900/20"
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs font-medium transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 relative rounded-xl border border-gray-700 bg-[#11111b] overflow-hidden">
              {generatedCode ? (
                <textarea 
                  className="w-full h-full bg-transparent text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none"
                  value={generatedCode}
                  readOnly
                />
              ) : status === 'error' ? (
                 <div className="w-full h-full flex flex-col items-center justify-center text-red-400">
                    <AlertCircle size={48} className="mb-4 opacity-50" />
                    <p>{errorMessage}</p>
                 </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                  <Code2 size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">Code will appear here after generation</p>
                </div>
              )}
            </div>
            
            {generatedCode && (
               <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200 flex items-start gap-2">
                 <AlertCircle size={14} className="mt-0.5 shrink-0" />
                 <p>
                   To run this code: Create a new file (e.g., <code>Component.{settings.framework.includes('Vue') ? 'vue' : 'tsx'}</code>), paste the code, and ensure all dependencies are installed.
                 </p>
               </div>
            )}
          </div>

        </div>
      </main>

      {/* Preview Modal */}
      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        code={generatedCode}
        framework={settings.framework}
      />
    </div>
  );
};

export default App;