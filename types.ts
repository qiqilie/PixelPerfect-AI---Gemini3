export enum Framework {
  ReactTailwind = 'React + Tailwind',
  HTMLTailwind = 'HTML + Tailwind',
  Bootstrap = 'HTML + Bootstrap',
  AntDesign = 'React + Ant Design',
  VueAntDesign = 'Vue 3 + Ant Design Vue',
  WeChatMiniprogram = 'WeChat Mini Program',
}

export enum Platform {
  Web = 'Web Desktop',
  Mobile = 'Mobile App',
}

export interface GenerationSettings {
  framework: Framework;
  platform: Platform;
  useSemanticTags: boolean;
  includeComments: boolean;
}

export interface AnalysisResult {
  code: string;
  explanation: string;
}

export type ProcessingStatus = 'idle' | 'analyzing' | 'generating' | 'complete' | 'error';