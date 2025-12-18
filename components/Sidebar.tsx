import React, { useEffect } from 'react';
import { Framework, Platform, GenerationSettings } from '../types';
import { Settings, Smartphone, Monitor, Code, Layout, Layers, Cpu, Key } from 'lucide-react';

interface SidebarProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
}

export const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings }) => {
  
  const updateSetting = <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getFilteredFrameworks = () => {
    const all = Object.values(Framework);
    if (settings.platform === Platform.Web) {
      // For Web: Hide WeChat, Vant, Taro
      return all.filter(f => 
        f !== Framework.WeChatMiniprogram && 
        f !== Framework.VueVant && 
        f !== Framework.ReactTaro
      );
    } else {
      // For Mobile: Hide React + AntD, Vue 3 + AntD, Vue 3 + EP
      return all.filter(f => 
        f !== Framework.AntDesign && 
        f !== Framework.VueAntDesign && 
        f !== Framework.VueElementPlus
      );
    }
  };

  // Ensure current framework is valid for platform when platform changes
  useEffect(() => {
    const validFrameworks = getFilteredFrameworks();
    if (!validFrameworks.includes(settings.framework)) {
      updateSetting('framework', validFrameworks[0]);
    }
  }, [settings.platform]);

  return (
    <div className="w-80 bg-dark-900 border-r border-gray-800 flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="text-brand-500" />
          PixelPerfect
        </h1>
        <p className="text-gray-400 text-xs mt-1">AI Design-to-Code Engine</p>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Platform Selection */}
        <div className="space-y-3">
          <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <Layout size={16} /> Platform Target
          </label>
          <div className="flex gap-2 bg-dark-800 p-1 rounded-lg border border-gray-700">
            <button
              onClick={() => updateSetting('platform', Platform.Web)}
              className={`flex-1 py-2 px-3 rounded text-sm flex items-center justify-center gap-2 transition-all ${
                settings.platform === Platform.Web
                  ? 'bg-gray-700 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Monitor size={14} /> Web
            </button>
            <button
              onClick={() => updateSetting('platform', Platform.Mobile)}
              className={`flex-1 py-2 px-3 rounded text-sm flex items-center justify-center gap-2 transition-all ${
                settings.platform === Platform.Mobile
                  ? 'bg-gray-700 text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Smartphone size={14} /> Mobile
            </button>
          </div>
        </div>

        {/* API & Model Settings */}
        <div className="space-y-3">
          <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <Cpu size={16} /> Model & Key
          </label>
          
          <select
            value={settings.model}
            onChange={(e) => updateSetting('model', e.target.value)}
            className="w-full bg-dark-800 border border-gray-700 text-gray-300 text-sm rounded-lg p-2.5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          >
             <option value="gemini-3-flash-preview">Gemini 3 Flash (Fastest)</option>
             <option value="gemini-3-pro-preview">Gemini 3 Pro (Best Quality)</option>
             <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </select>

          <div className="relative">
            <Key size={14} className="absolute left-3 top-3 text-gray-500" />
            <input
              type="password"
              placeholder="Custom API Key (Optional)"
              value={settings.apiKey || ''}
              onChange={(e) => updateSetting('apiKey', e.target.value)}
              className="w-full bg-dark-800 border border-gray-700 text-gray-300 text-sm rounded-lg pl-9 p-2.5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors placeholder-gray-600"
            />
          </div>
        </div>

        {/* Framework Selection */}
        <div className="space-y-3">
          <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <Code size={16} /> Target Framework
          </label>
          <div className="grid gap-2">
            {getFilteredFrameworks().map((fw) => (
              <button
                key={fw}
                onClick={() => updateSetting('framework', fw)}
                className={`text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                  settings.framework === fw
                    ? 'bg-brand-500/10 border-brand-500 text-brand-100'
                    : 'bg-dark-800 border-gray-700 text-gray-300 hover:border-gray-600'
                }`}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-3">
          <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <Settings size={16} /> Optimization
          </label>
          
          <label className="flex items-center justify-between p-3 rounded-lg bg-dark-800 border border-gray-700 cursor-pointer hover:border-gray-600">
            <span className="text-gray-300 text-sm">Semantic HTML</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.useSemanticTags ? 'bg-brand-600' : 'bg-gray-600'}`}>
               <input 
                 type="checkbox" 
                 className="hidden" 
                 checked={settings.useSemanticTags}
                 onChange={(e) => updateSetting('useSemanticTags', e.target.checked)}
               />
               <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.useSemanticTags ? 'left-6' : 'left-1'}`}></div>
            </div>
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-dark-800 border border-gray-700 cursor-pointer hover:border-gray-600">
            <span className="text-gray-300 text-sm">Include Comments</span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.includeComments ? 'bg-brand-600' : 'bg-gray-600'}`}>
               <input 
                 type="checkbox" 
                 className="hidden" 
                 checked={settings.includeComments}
                 onChange={(e) => updateSetting('includeComments', e.target.checked)}
               />
               <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.includeComments ? 'left-6' : 'left-1'}`}></div>
            </div>
          </label>
        </div>

      </div>

      <div className="mt-auto p-6 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          Powered by Gemini
        </div>
      </div>
    </div>
  );
};