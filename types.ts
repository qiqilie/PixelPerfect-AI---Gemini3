export enum Framework {
  ReactTailwind = 'React + Tailwind',
  HTMLTailwind = 'HTML + Tailwind',
  Bootstrap = 'HTML + Bootstrap',
  AntDesign = 'React + Ant Design',
  VueAntDesign = 'Vue 3 + Ant Design Vue',
  VueElementPlus = 'Vue 3 + Element Plus',
  VueVant = 'Vue 3 + Vant',
  WeChatMiniprogram = 'WeChat Mini Program',
  ReactTaro = 'React + Taro',
}

export enum Platform {
  Web = 'Web Desktop',
  Mobile = 'Mobile App',
}

export interface DesignTokens {
  colors: { name: string; hex: string }[];
  typography: { element: string; fontSize: string; fontWeight: string }[];
  spacing: string[];
}

export interface HistoryItem {
  id: string;
  code: string;
  timestamp: number;
  screenshot?: string;
  tokens?: DesignTokens;
}

export interface GenerationSettings {
  framework: Framework;
  platform: Platform;
  useSemanticTags: boolean;
  includeComments: boolean;
  apiKey?: string;
  model: string;
}

export type ProcessingStatus = 'idle' | 'analyzing' | 'generating' | 'complete' | 'error' | 'refining';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}