
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessContext, FixStep, NewProfileData, ValidationResult, StepGuide } from '../types';

const ASSISTANT_SYSTEM_INSTRUCTION = `You are GBP Pulse, a world-class Google Business Profile expert. 
Your goal is to help businesses navigate complex issues like account suspensions, video verification hurdles, and ranking drops.
Always reference current Google Business Profile guidelines (2024/2025). 
Be concise, professional, and empathetic. 
When diagnosing, ask clarifying questions if the user provides vague details.`;

export const diagnoseIssue = async (context: BusinessContext): Promise<{ category: string; analysis: string; steps: FixStep[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze the following Google Business Profile issue based on official Google Guidelines (2024/2025):
    Business Name: ${context.name}
    Industry: ${context.industry}
    Issue Description: ${context.issueDescription}

    1. Categorize the issue into one of these: SUSPENSION, VERIFICATION, RANKING, REVIEWS, OTHER.
    2. Provide a clear, professional analysis (2-3 sentences) explaining the likely root cause.
    3. Create a step-by-step action plan to resolve this issue.
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
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

  return JSON.parse(response.text || '{}');
};

export const generateStepGuide = async (stepTitle: string, stepDescription: string, context: BusinessContext): Promise<StepGuide> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Provide a deep-dive educational guide for the following Google Business Profile task. 
    Task: ${stepTitle}
    Context Description: ${stepDescription}
    Business Name: ${context.name}

    Return JSON with: title, bigPicture, steps (array), pitfalls (array), proTips (array).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
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

export const generateGBPContent = async (
  type: 'description' | 'post' | 'reply' | 'review_removal' | 'q_and_a' | 'photo_ideas', 
  context: BusinessContext, 
  extraDetails: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let specificPrompt = "";

  switch (type) {
    case 'description':
      specificPrompt = `Write a professional, SEO-friendly GBP description (max 750 chars).`;
      break;
    case 'post':
      specificPrompt = `Write a GBP 'Update' post (max 1500 chars) with a Call to Action.`;
      break;
    case 'reply':
      specificPrompt = `Write a professional, empathetic response to a customer review.`;
      break;
    case 'review_removal':
      specificPrompt = `Write a formal request for review removal identifying policy violations.`;
      break;
    case 'q_and_a':
        specificPrompt = `Generate 3 high-value Q&A pairs.`;
        break;
    case 'photo_ideas':
        specificPrompt = `Generate 8 photo ideas for their profile.`;
        break;
  }

  const finalPrompt = `
    Business: "${context.name}" in "${context.industry}"
    Task: ${specificPrompt}
    User Details: "${extraDetails}"
    
    IMPORTANT: Provide ONLY the content text. No conversational filler.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: finalPrompt }] }]
  });

  return response.text || "Failed to generate content.";
};

export const validateNewProfile = async (data: NewProfileData): Promise<ValidationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Audit this GBP data:
    Name: ${data.businessName}
    Category: ${data.category}
    Address: ${data.address}
    Type: ${data.isServiceArea ? "Service Area" : "Storefront"}
    
    Check for compliance and return JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
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

export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[], 
  newMessage: string,
  context?: BusinessContext
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let systemInstruction = ASSISTANT_SYSTEM_INSTRUCTION;
  
  if (context && context.name) {
    systemInstruction += `\n\nCONTEXT: Business is ${context.name}.`;
  }

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
    history: history
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};
