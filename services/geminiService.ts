import { GoogleGenAI, Type } from "@google/genai";
import { BusinessContext, FixStep, NewProfileData, ValidationResult, StepGuide } from '../types.ts';

const ASSISTANT_SYSTEM_INSTRUCTION = `You are GBP Pulse, an elite Google Business Profile diagnostic specialist.
Your core mission is to help business owners understand the "Why" behind Google's algorithmic flags.

Expertise:
- Identifying "Hidden" policy triggers (Keyword stuffing, Address spoofing, Virtual offices).
- Video Verification failure analysis (Device issues vs. Location issues).
- Local search penalty recovery.
- Reinstatement appeal strategy.

Tone: Professional, authoritative, and data-driven. Focus on providing clear root-cause analysis.`;

// Diagnose GBP issues using Gemini 3 Pro for deep reasoning
export const diagnoseIssue = async (context: BusinessContext): Promise<{ category: string; analysis: string; steps: FixStep[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze the following GBP issue:
    Business: ${context.name} (${context.industry})
    Reported Issue: ${context.issueDescription}

    Provide a deep-dive analysis. Explain exactly why Google's automated systems likely flagged this. 
    Be specific about policy names and technical triggers.

    Return JSON matching the schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: 'SUSPENSION, VERIFICATION, RANKING, REVIEWS, or OTHER' },
          analysis: { type: Type.STRING, description: 'Root cause analysis (max 100 words)' },
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

  return JSON.parse(response.text || '{"category": "OTHER", "analysis": "Could not analyze.", "steps": []}');
};

// Generate high-authority content using Gemini 3 Flash
export const generateGBPContent = async (
  type: 'description' | 'post' | 'reply' | 'review_removal' | 'q_and_a' | 'photo_ideas' | 'blog' | 'challenge', 
  context: BusinessContext, 
  extraDetails: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let systemContext = ASSISTANT_SYSTEM_INSTRUCTION;
  if (type === 'challenge') {
    systemContext += "\n\nWhen generating a 'challenge', you are writing an official appeal or verification justification to Google. Focus on proving legal business existence, physical location evidence, and guideline compliance. Be firm but professional.";
  }

  const taskPrompt = `Generate ${type} content for ${context.name} (${context.industry}). Details: ${extraDetails}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: taskPrompt,
    config: {
      systemInstruction: systemContext
    }
  });

  return response.text || "Failed to generate content.";
};

// Send a chat message with full context
export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[], 
  newMessage: string,
  context?: BusinessContext
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { 
        systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION + (context?.name ? `\n\nYou are helping ${context.name}.` : '')
    },
    history: history
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};

// Educational step guides
export const generateStepGuide = async (stepTitle: string, stepDescription: string, context: BusinessContext): Promise<StepGuide> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain how to execute: ${stepTitle}. Context: ${stepDescription} for ${context.name}.`,
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

  return JSON.parse(response.text || '{}');
};

// New Profile Validation
export const validateNewProfile = async (data: NewProfileData): Promise<ValidationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Audit this profile for policy risks: ${JSON.stringify(data)}`,
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
        },
        required: ['isValid', 'issues', 'optimizedDescription', 'verificationAdvice']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
