import { GoogleGenAI } from "@google/genai";
import { Framework, GenerationSettings } from '../types';

const getSystemInstruction = (settings: GenerationSettings): string => {
  const isVue = settings.framework === Framework.VueAntDesign;
  const isWeChat = settings.framework === Framework.WeChatMiniprogram;

  return `
You are an expert Senior Frontend Engineer and UI/UX Designer specializing in pixel-perfect design reproduction.
Your goal is to analyze a UI image and generate exact, production-ready code that replicates the visual design 100%.

**Role & Capability:**
- You have advanced vision capabilities to perform semantic segmentation mentally, identifying every button, input, text block, icon, and layout container.
- You understand spacing, typography, color palettes, and visual hierarchy deeply.

**Output Configuration:**
- **Framework**: ${settings.framework}
- **Platform**: ${settings.platform} (Ensure responsive design appropriate for this platform)
- **Semantic HTML**: ${settings.useSemanticTags ? 'Yes (use <header>, <main>, <section> etc)' : 'Standard <div> is acceptable'}
- **Comments**: ${settings.includeComments ? 'Detailed comments explaining layout choices' : 'Minimal comments'}

**Strict Guidelines:**
1. **Fidelity**: The code must look *exactly* like the image. Pay attention to padding, margins, border-radius, shadows, and font weights.
2. **Icons (CRITICAL)**: 
   - **React**: Use 'lucide-react' imports (e.g., \`import { Home, User } from 'lucide-react'\`).
   - **Vue**: Use '@ant-design/icons-vue' imports.
   - **WeChat Mini Program**: Use inline SVG data URIs in <image> tags (e.g. <image src="data:image/svg+xml..."/>) or standard WeChat icon classes if applicable. Do not require external file downloads.
   - **HTML**: Use FontAwesome CDN classes (e.g., <i class="fa-solid fa-home"></i>) or inline SVG.
   - **General**: Identify the specific icon type (menu, user, arrow, heart, etc.) and use the most appropriate match.
3. **Images**: Use 'https://picsum.photos/id/[random_number]/[width]/[height]' for realistic placeholders.
4. **Content**: Transcribe text from the image where possible.
5. **Responsiveness**: Ensure the layout works on the specified platform.
6. **No External CSS**: 
   - Tailwind: Use utility classes exclusively.
   - Bootstrap: Use standard classes.
   - Ant Design: Use the component's 'style' prop or generic inline styles if absolutely necessary for custom spacing, but prefer component props.
   - WeChat: Generate WXSS using 'rpx' units for responsiveness.
7. **Complete Code**: Return the full, working component code.
${isVue ? '8. **Vue Format**: Generate a single valid .vue file with <script setup lang="ts"> and <template>. Do NOT use separate files.' : ''}
${isWeChat ? '8. **WeChat Format**: Generate a SINGLE code block containing the WXML, WXSS, and JS. Use separator comments like `<!-- index.wxml -->`, `/* index.wxss */`, and `// index.js` to distinguish sections clearly.' : ''}

If the image is a wireframe, interpret it as a high-fidelity modern UI with good design taste.
`;
};

/**
 * Compresses and resizes the image to avoid large payload errors.
 */
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
        ctx.fillStyle = '#FFFFFF'; // Handle transparent PNGs by giving them a white background
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        // Compress to JPEG at 0.8 quality
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
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-2.5-flash'; 

  const prompt = `
    Analyze the attached UI design image. 
    1. Perform a visual breakdown of the layout (header, sidebar, content area, etc.).
    2. Identify the color palette and typography styles.
    3. Generate the full source code to implement this interface.
    
    Return ONLY the code block. Do not include markdown formatting like \`\`\`tsx, \`\`\`vue or \`\`\`html at the start/end of the response, just the raw code.
  `;

  try {
    // Optimization: Resize/Compress image to prevent 500/XHR errors due to payload size
    const compressedImage = await compressImage(base64Image);
    const cleanBase64 = compressedImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // We converted to jpeg in compressImage
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        systemInstruction: getSystemInstruction(settings),
        temperature: 0.1, 
      }
    });

    let code = response.text || "// No code generated";
    
    // Cleanup markdown if the model disregarded the instruction
    code = code.replace(/^```(tsx|jsx|html|css|vue|javascript|xml)?\n/, '').replace(/```$/, '');
    
    return code;

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to analyze image. Try a smaller image or check your connection.");
  }
};