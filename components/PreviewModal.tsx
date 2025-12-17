import React, { useEffect, useRef, useState } from 'react';
import { Framework } from '../types';
import { X, Maximize2, Minimize2, Monitor, RefreshCw, Smartphone } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  framework: Framework;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, code, framework }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0); // To force re-render of iframe

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      updateIframeContent();
    }
  }, [isOpen, code, key, framework]);

  const updateIframeContent = () => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    const content = generateHtmlForFramework(code, framework);
    
    doc.open();
    doc.write(content);
    doc.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className={`bg-[#1e1e2e] rounded-xl border border-gray-700 shadow-2xl flex flex-col transition-all duration-300 ${
          isFullScreen ? 'w-full h-full' : 'w-[90vw] h-[85vh] max-w-6xl'
        }`}
      >
        {/* Header */}
        <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4 bg-dark-900 rounded-t-xl">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
               {framework === Framework.WeChatMiniprogram ? <Smartphone size={16} /> : <Monitor size={16} />}
               Live Preview
             </div>
             <div className="h-4 w-px bg-gray-700"></div>
             <span className="text-xs text-gray-500">{framework}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setKey(k => k + 1)}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Refresh Preview"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 bg-white/5 relative overflow-hidden">
           <iframe 
             ref={iframeRef}
             className="w-full h-full bg-white"
             title="Preview"
             sandbox="allow-scripts allow-same-origin allow-modals"
           />
        </div>
      </div>
    </div>
  );
};

// --- Helper Functions to Generate Sandbox HTML ---

const generateHtmlForFramework = (code: string, framework: Framework): string => {
  switch (framework) {
    case Framework.ReactTailwind:
    case Framework.AntDesign:
      return generateReactPreview(code, framework === Framework.AntDesign);
    case Framework.VueAntDesign:
      return generateVuePreview(code);
    case Framework.HTMLTailwind:
    case Framework.Bootstrap:
      return generateHTMLPreview(code, framework === Framework.Bootstrap);
    case Framework.WeChatMiniprogram:
      return generateWeChatPlaceholder();
    default:
      return generateUnsupportedPreview(framework);
  }
};

const generateUnsupportedPreview = (framework: Framework) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { background: #0f172a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
        .icon { font-size: 48px; margin-bottom: 20px; opacity: 0.5; }
        h2 { margin: 0 0 10px 0; font-weight: 500; }
        p { color: #94a3b8; text-align: center; max-width: 400px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="icon">⚠️</div>
      <h2>Preview Not Available</h2>
      <p>Automatic preview is not supported for <strong>${framework}</strong> yet. Please copy the code and run it in your local environment.</p>
    </body>
  </html>
`;

const generateWeChatPlaceholder = () => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { background: #0f172a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
        .icon { font-size: 48px; margin-bottom: 20px; color: #07c160; }
        h2 { margin: 0 0 10px 0; font-weight: 500; }
        p { color: #94a3b8; text-align: center; max-width: 400px; line-height: 1.5; }
        .code-block { background: #1e293b; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; margin-top: 20px; border: 1px solid #334155; }
      </style>
    </head>
    <body>
      <div class="icon">💬</div>
      <h2>WeChat Mini Program Code</h2>
      <p>This code requires the WeChat Developer Tools to run. It contains WXML, WXSS, and JS files.</p>
      <div class="code-block">
        Copy the code from the editor and split it into<br/>
        index.wxml, index.wxss, and index.js
      </div>
    </body>
  </html>
`;

const generateReactPreview = (code: string, useAntd: boolean) => {
  // Rough transformation to make code runnable in browser
  // 1. Remove imports
  let cleanedCode = code.replace(/import\s+.*\s+from\s+['"].*['"];?/g, '');
  // 2. Change export default function to const App
  cleanedCode = cleanedCode.replace(/export\s+default\s+function\s+(\w+)/, 'const App = function $1');
  // If export default is anonymous
  cleanedCode = cleanedCode.replace(/export\s+default\s+function\s*\(/, 'const App = function(');
  // Remove types if any (simple stripping)
  cleanedCode = cleanedCode.replace(/:\s*[A-Z][a-zA-Z0-9<>[\]]*/g, ''); 

  const antdStyles = useAntd ? `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/antd/5.12.0/reset.min.css" />` : '';
  const antdScript = useAntd ? `<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.11.10/dayjs.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/antd/5.12.0/antd.min.js"></script>` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <!-- Mock Lucide Icons -->
        <script>
           // Simple Proxy to prevent crash on Icon usage
           window.LucideIcons = new Proxy({}, {
             get: (target, prop) => (props) => {
               // Render Lucide icons as a simple SVG or text fallback
               return React.createElement('span', {style: {display:'inline-flex', alignItems:'center', justifyContent:'center', border:'1px dashed #666', borderRadius:'4px', width:'24px', height:'24px', fontSize: '10px'}}, prop.substr(0,2));
             }
           });
        </script>
        ${antdStyles}
        ${antdScript}
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          const { useState, useEffect, useRef } = React;
          const { Button, Input, Card, Layout, Typography, Space, ...AntdRest } = window.antd || {};
          
          // Inject Generated Code
          ${cleanedCode}

          // Mount
          if (typeof App !== 'undefined') {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
          } else {
             document.body.innerHTML = '<div style="color:red; padding:20px;">Could not find App component.</div>';
          }
        </script>
      </body>
    </html>
  `;
};

const generateVuePreview = (code: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
        <script src="https://unpkg.com/dayjs/dayjs.min.js"></script>
        <script src="https://unpkg.com/ant-design-vue@3.2.20/dist/antd.min.js"></script>
        <link href="https://unpkg.com/ant-design-vue@3.2.20/dist/antd.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader/dist/vue3-sfc-loader.js"></script>
      </head>
      <body>
        <div id="app"></div>
        <script>
          const options = {
            moduleCache: {
              vue: Vue,
              'ant-design-vue': antd
            },
            async getFile(url) {
              if (url === '/component.vue') return \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
              return '';
            },
            addStyle(textContent) {
              const style = document.createElement('style');
              style.textContent = textContent;
              const ref = document.head.getElementsByTagName('style')[0] || null;
              document.head.insertBefore(style, ref);
            },
          };
          
          const { loadModule } = window['vue3-sfc-loader'];
          
          const app = Vue.createApp({
            components: {
              'my-component': Vue.defineAsyncComponent(() => loadModule('/component.vue', options))
            },
            template: '<my-component></my-component>'
          });
          
          app.use(antd);
          app.mount('#app');
        </script>
      </body>
    </html>
  `;
};

const generateHTMLPreview = (code: string, isBootstrap: boolean) => {
  const bootstrapLink = isBootstrap 
    ? `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">` 
    : `<script src="https://cdn.tailwindcss.com"></script>`;
    
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${bootstrapLink}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>body { background-color: #ffffff; }</style>
      </head>
      <body>
        ${code}
      </body>
    </html>
  `;
};