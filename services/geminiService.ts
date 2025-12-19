import { GoogleGenAI, Type } from "@google/genai";
import { BusinessContext, FixStep, NewProfileData, ValidationResult, StepGuide } from '../types';

// System instruction for the general assistant
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
    2. Provide a clear, professional analysis (2-3 sentences) explaining the likely root cause and the strategy for resolution.
    3. Create a step-by-step action plan to resolve this issue.
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt, // Use direct string for reliability
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
    Industry: ${context.industry}

    Structure:
    1. Big Picture: Why this matters.
    2. Steps: Detailed instructions.
    3. Pitfalls: Common mistakes.
    4. Pro Tips: Expert advice.
    
    Return in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
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
      specificPrompt = `Write a professional, SEO-friendly Google Business Profile description (max 750 chars). 
      Focus on the unique selling points of ${context.name}. Do not keyword stuff.`;
      break;
    case 'post':
      specificPrompt = `Write a Google Business Profile 'Update' post (max 1500 chars) highlighting a service or offer. 
      Include a Call to Action. Business Name: ${context.name}`;
      break;
    case 'reply':
      specificPrompt = `Write a professional response to this specific customer review. 
      If negative, be empathetic. If positive, thank them. Business Name: ${context.name}`;
      break;
    case 'review_removal':
      specificPrompt = `Write a formal request for review removal based on policy violations. 
      Identify which Google policy is violated based on this input: ${extraDetails}`;
      break;
    case 'q_and_a':
        specificPrompt = `Generate 3 high-value Question & Answer pairs for ${context.name}.`;
        break;
    case 'photo_ideas':
        specificPrompt = `Generate a 'Shot List' of 8 specific photo ideas for ${context.name} in the ${context.industry} industry.`;
        break;
  }

  const finalPrompt = `
    Business: "${context.name}"
    Industry: "${context.industry}"
    Task: ${specificPrompt}
    User Request/Input Details: "${extraDetails}"
    
    IMPORTANT: Provide ONLY the requested final content. Do not include introductory text, headers like "Here is your description", or any conversational filler.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: finalPrompt // Use string prompt for better stability
  });

  return response.text || "I was unable to generate content for this request. Please check your inputs and try again.";
};

export const validateNewProfile = async (data: NewProfileData): Promise<ValidationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Audit this proposed Google Business Profile data for compliance:
    Name: ${data.businessName}
    Category: ${data.category}
    Address: ${data.address}
    Type: ${data.isServiceArea ? "Service Area" : "Storefront"}
    
    Check for Name Spam and Address violations. Return result as JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
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
    systemInstruction += `\n\nCONTEXT: Business Name is ${context.name}, Industry is ${context.industry}.`;
  }

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
    history: history
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};