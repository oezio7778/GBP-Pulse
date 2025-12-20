import { GoogleGenAI, Type } from "@google/genai";
import { BusinessContext, FixStep, NewProfileData, ValidationResult, StepGuide } from '../types.ts';

const ASSISTANT_SYSTEM_INSTRUCTION = `You are GBP Pulse, an elite Google Business Profile specialist.
Your core mission is to help business owners fix profile issues.

Expertise:
- Identifying guideline violations.
- Resolving verification failures.
- Drafting reinstatement appeals.

Tone: Professional, authoritative, and helpful.`;

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const diagnoseIssue = async (context: BusinessContext): Promise<{ category: string; analysis: string; steps: FixStep[] }> => {
  const ai = getAI();
  const prompt = `Analyze GBP issue for: ${context.name} (${context.industry}). Issue: ${context.issueDescription}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          analysis: { type: Type.STRING },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                status: { type: Type.STRING }
              },
              required: ['id', 'title', 'description', 'status']
            }
          }
        },
        required: ['category', 'analysis', 'steps']
      }
    }
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (e) {
    return { category: 'OTHER', analysis: 'Parsing failed.', steps: [] };
  }
};

export const generateGBPContent = async (type: string, context: BusinessContext, details: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate ${type} for ${context.name}. Details: ${details}`,
    config: { systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION }
  });
  return response.text;
};

export const sendChatMessage = async (history: any[], message: string, context?: BusinessContext) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION },
    history
  });
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const generateStepGuide = async (title: string, desc: string, context: BusinessContext): Promise<StepGuide> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain how to: ${title}. ${desc}`,
    config: {
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          bigPicture: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          pitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
          proTips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'bigPicture', 'steps', 'pitfalls', 'proTips']
      }
    }
  });
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { title: title, bigPicture: "Parsing failed", steps: [], pitfalls: [], proTips: [] };
  }
};

export const validateNewProfile = async (data: NewProfileData): Promise<ValidationResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Audit profile data: ${JSON.stringify(data)}`,
    config: {
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          optimizedDescription: { type: Type.STRING },
          verificationAdvice: {
            type: Type.OBJECT,
            properties: {
              method: { type: Type.STRING },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    }
  });
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { isValid: false, issues: ["Audit parsing failed"] };
  }
};
