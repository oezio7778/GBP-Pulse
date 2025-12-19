
/// <reference types="node" />
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessContext, FixStep, NewProfileData, ValidationResult, StepGuide } from '../types';

/**
 * Explicitly declare process for the compiler to prevent TS2580.
 * We use 'any' here to bypass the specialized Node.js diagnostic checks
 * while still accessing the required process.env.API_KEY.
 */
declare var process: any;

const ASSISTANT_SYSTEM_INSTRUCTION = `You are GBP Pulse, a world-class Google Business Profile expert. 
Your goal is to help businesses navigate complex issues like account suspensions, video verification hurdles, and ranking drops.
Always reference current Google Business Profile guidelines (2024/2025). 
Be concise, professional, and empathetic. 
When diagnosing, ask clarifying questions if the user provides vague details.`;

// Diagnose GBP issues and generate a fix plan
export const diagnoseIssue = async (context: BusinessContext): Promise<{ category: string; analysis: string; steps: FixStep[] }> => {
  // Access process.env.API_KEY as required by system instructions
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

  return JSON.parse(response.text || '{}');
};

// Generate specific content for GBP profiles
export const generateGBPContent = async (
  type: 'description' | 'post' | 'reply' | 'review_removal' | 'q_and_a' | 'photo_ideas' | 'blog', 
  context: BusinessContext, 
  extraDetails: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let specificPrompt = "";

  switch (type) {
    case 'description':
      specificPrompt = `Write a professional, SEO-friendly GBP description (max 750 chars). Focus on trustworthiness and local expertise.`;
      break;
    case 'post':
      specificPrompt = `Write a Google Business Profile 'Update' post (max 1500 chars) with a clear Call to Action. Focus on local engagement.`;
      break;
    case 'reply':
      specificPrompt = `Write a professional, empathetic response to a customer review. Ensure a polite and solution-oriented tone.`;
      break;
    case 'review_removal':
      specificPrompt = `Write a formal request for review removal identifying specific Google policy violations (e.g., spam, harassment, off-topic).`;
      break;
    case 'q_and_a':
      specificPrompt = `Generate 3 high-value Q&A pairs that highlight key services or common customer concerns.`;
      break;
    case 'photo_ideas':
      specificPrompt = `Generate 8 photo ideas for their profile, specifically categorized (Interior, Exterior, Team, Product).`;
      break;
    case 'blog':
      specificPrompt = `Write a 400-word local SEO blog post for the company website. Focus on a topic relevant to the business and its local community. Use clear headers and a call to action.`;
      break;
  }

  const finalPrompt = `
    Business: "${context.name}" in "${context.industry}"
    Task: ${specificPrompt}
    User Details: "${extraDetails}"
    
    CRITICAL INSTRUCTION: Provide ONLY the generated content text. Do NOT include any introductory phrases or conversational filler.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: finalPrompt,
    config: {
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION
    }
  });

  return response.text || "Failed to generate content. Please check your inputs.";
};

// Generate a deep-dive educational guide for a specific task
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
    contents: prompt,
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

// Audit and validate new GBP profile data
export const validateNewProfile = async (data: NewProfileData): Promise<ValidationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Audit this GBP data for compliance and optimization:
    Name: ${data.businessName}
    Category: ${data.category}
    Address: ${data.address}
    Type: ${data.isServiceArea ? "Service Area" : "Storefront"}
    
    Return result as JSON.
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

// Send a chat message with full history and context
export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[], 
  newMessage: string,
  context?: BusinessContext
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let systemInstruction = ASSISTANT_SYSTEM_INSTRUCTION;
  
  if (context && context.name) {
    systemInstruction += `\n\nCONTEXT: Business is ${context.name}, Industry is ${context.industry}.`;
  }

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
    history: history
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};
