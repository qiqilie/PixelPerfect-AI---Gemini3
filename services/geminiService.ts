import { GoogleGenAI, Type } from "@google/genai";
import { Framework, GenerationSettings, DesignTokens } from '../types';

const getSystemInstruction = (settings: GenerationSettings): string => {
  const isVue = settings.framework.includes('Vue');
  const isReact = settings.framework.includes('React');
  const isWeChat = settings.framework === Framework.WeChatMiniprogram;
  const isTaro = settings.framework === Framework.ReactTaro;

  return `
You are the world's leading Senior Frontend Architect and UI/UX Design Specialist.
Your goal is to transform a UI image into pixel-perfect, enterprise-grade frontend code.

**OUTPUT PROTOCOL:**
You must provide your response in a structured format:
1. **Design Tokens**: Extract the primary/secondary colors, fonts, and spacing found in the image.
2. **Implementation Code**: The complete, production-ready code for the requested framework.

**Enterprise Standards:**
- **Code Quality**: Use absolute fidelity. Capture every shadow, border-radius, and micro-interaction intent.
- **Dynamic Binding**: Define a 'mockData' object or 'reactive' state. Map through data for lists.
- **Responsiveness**: Use the platform ${settings.platform} to guide your layout.
- **Library Usage**:
  ${isReact ? `- React: Use functional components, Lucide icons, and Tailwind/AntD as requested.` : ''}
  ${isVue ? `- Vue 3: Use <script setup lang="ts">. Use Element Plus/Vant/AntD components correctly.` : ''}
  ${isTaro ? `- Taro: Use @tarojs/components. Use rpx for styling.` : ''}

**Specific Requirements for ${settings.framework}:**
- Generate clean, modular, and type-safe code.
- Ensure all imports are correct.

**Response Structure (CRITICAL):**
Your response should start with a JSON block for tokens, then the code.
[TOKENS_START]
{ "colors": [{"name": "primary", "hex": "#..."}], "typography": [{"element": "h1", "fontSize": "24px", "fontWeight": "bold"}], "spacing": ["4px", "8px"] }
[TOKENS_END]
[CODE_START]
...source code...
[CODE_END]
`;
};

const compressImage = (base64Str: string, maxWidth = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const generateCodeFromImage = async (
  base64Image: string, 
  settings: GenerationSettings
): Promise<{ code: string; tokens: DesignTokens }> => {
  const apiKey = settings.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const modelId = settings.model || 'gemini-3-flash-preview';

  const prompt = `Perform an architectural analysis of this design and implement it. 
  1. Extract design tokens. 
  2. Write production code for ${settings.framework}.`;

  try {
    const compressedImage = await compressImage(base64Image);
    const cleanBase64 = compressedImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: getSystemInstruction(settings),
        temperature: 0.1, 
      }
    });

    const text = response.text || "";
    
    // Default empty tokens
    let tokens: DesignTokens = { colors: [], typography: [], spacing: [] };
    
    // Parse Tokens with fallbacks
    const tokenMatch = text.match(/\[TOKENS_START\]([\s\S]*?)\[TOKENS_END\]/);
    if (tokenMatch) {
      try {
        const parsed = JSON.parse(tokenMatch[1]);
        tokens = {
          colors: Array.isArray(parsed.colors) ? parsed.colors : [],
          typography: Array.isArray(parsed.typography) ? parsed.typography : [],
          spacing: Array.isArray(parsed.spacing) ? parsed.spacing : []
        };
      } catch (e) {
        console.warn("Failed to parse design tokens JSON", e);
      }
    }
    
    // Parse Code
    const codeMatch = text.match(/\[CODE_START\]([\s\S]*?)\[CODE_END\]/);
    let code = codeMatch ? codeMatch[1].trim() : text;
    code = code.replace(/^```(tsx|jsx|html|css|vue|javascript|xml)?\n/, '').replace(/```$/, '');

    return { code, tokens };
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};

export const refineCode = async (
  currentCode: string,
  instruction: string,
  settings: GenerationSettings
): Promise<string> => {
  const apiKey = settings.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey });
  const modelId = settings.model || 'gemini-3-flash-preview';

  const prompt = `
    Current Enterprise Code:
    \`\`\`
    ${currentCode}
    \`\`\`
    Refinement Request: "${instruction}"
    Return ONLY the full updated source code without any extra text or markdown wrappers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: getSystemInstruction(settings),
        temperature: 0.2, 
      }
    });
    let code = response.text || "";
    code = code.replace(/^```(tsx|jsx|html|css|vue|javascript|xml)?\n/, '').replace(/```$/, '');
    return code;
  } catch (error) {
    throw error;
  }
};