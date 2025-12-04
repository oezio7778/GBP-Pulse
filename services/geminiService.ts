import { GoogleGenAI, Type } from "@google/genai";
import { BusinessContext, FixStep, NewProfileData, ValidationResult, StepGuide } from '../types';

// Robust API Key Retrieval for Vite, Vercel, and Sandbox environments
const getApiKey = () => {
  try {
    // 1. Check Vite/Vercel standard (import.meta.env)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      return import.meta.env.VITE_API_KEY;
    }
    // 2. Check Sandbox/Node standard (process.env)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      // @ts-ignore
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Error retrieving API key", e);
  }
  return '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

// System instruction for the general assistant
const ASSISTANT_SYSTEM_INSTRUCTION = `You are GBP Pulse, a world-class Google Business Profile expert. 
Your goal is to help businesses navigate complex issues like account suspensions, video verification hurdles, and ranking drops.
Always reference current Google Business Profile guidelines (2024/2025). 
Be concise, professional, and empathetic. 
When diagnosing, ask clarifying questions if the user provides vague details.`;

export const diagnoseIssue = async (context: BusinessContext): Promise<{ category: string; analysis: string; steps: FixStep[] }> => {
  const prompt = `
    Analyze the following Google Business Profile issue based on official Google Guidelines (2024/2025):
    Business Name: ${context.name}
    Industry: ${context.industry}
    Issue Description: ${context.issueDescription}

    1. Categorize the issue into one of these: SUSPENSION, VERIFICATION, RANKING, REVIEWS, OTHER.
    2. Provide a clear, professional analysis (2-3 sentences) explaining the likely root cause and the strategy for resolution. This helps the user understand *why* this is happening.
    3. Create a step-by-step action plan to resolve this issue.
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
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
                status: { type: Type.STRING, enum: ['pending'] } // Default status
              },
              required: ['id', 'title', 'description', 'status']
            }
          }
        },
        required: ['category', 'analysis', 'steps']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text);
};

export const generateStepGuide = async (stepTitle: string, stepDescription: string, context: BusinessContext): Promise<StepGuide> => {
  const prompt = `
    Provide a deep-dive educational guide for the following Google Business Profile task. 
    The user is confused by Google's generic support pages and needs the "Big Picture" and specific instructions.
    
    Task: ${stepTitle}
    Context Description: ${stepDescription}
    Business Name: ${context.name}
    Industry: ${context.industry}
    Issue Category: ${context.detectedCategory}

    Structure the response to be highly educational and actionable:
    1. Big Picture: Explain WHY this step is necessary, what Google is trying to verify, and the hidden nuance (e.g. "Google wants to prove you are not a lead-gen site").
    2. Steps: Detailed, granular instructions on how to execute this.
    3. Pitfalls: Common mistakes that cause automatic rejections or delays.
    4. Pro Tips: Expert advice to speed things up.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
};

export const generateGBPContent = async (
  type: 'description' | 'post' | 'reply' | 'email' | 'review_removal', 
  context: BusinessContext, 
  extraDetails: string
): Promise<string> => {
  let specificPrompt = "";

  switch (type) {
    case 'description':
      specificPrompt = `Write a professional, SEO-friendly Google Business Profile description (max 750 chars). 
      Focus on the unique selling points. Do not keyword stuff.`;
      break;
    case 'post':
      specificPrompt = `Write a Google Business Profile 'Update' post (max 1500 chars) highlighting a service or offer. 
      Include a Call to Action.`;
      break;
    case 'reply':
      specificPrompt = `Write a professional response to a review. 
      If the review is negative, be empathetic, take it offline, and don't get defensive. 
      If positive, thank them specifically.`;
      break;
    case 'email':
      specificPrompt = `Write a formal Reinstatement Request Appeal email to Google Business Profile Support.
      Tone: Professional, Legalistic, Polite but Firm.
      Cite specific Google Guidelines where appropriate.
      If the user provided a Case ID, include it clearly in the subject line.`;
      break;
    case 'review_removal':
      specificPrompt = `Write a formal request for review removal to be submitted to Google's content moderation team.
      
      User Input (The bad review and why it's fake): "${extraDetails}"

      Task:
      1. Identify which specific Google "Prohibited and Restricted Content" policy this violates (e.g. Spam and fake content, Conflict of interest, Off-topic, Profanity, Bullying).
      2. Write a concise, objective argument explaining strictly HOW the review violates that policy.
      3. Do not be emotional. Be factual.
      4. Format it so the user can copy and paste it into the "Describe the issue" field in the removal tool.
      `;
      break;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `
      Context: Business "${context.name}" in "${context.industry}".
      Task: ${specificPrompt}
      Additional Details (User Input): ${extraDetails}
    `
  });

  return response.text || "Failed to generate content.";
};

export const validateNewProfile = async (data: NewProfileData): Promise<ValidationResult> => {
  const prompt = `
    Audit this proposed Google Business Profile data for compliance with Google Guidelines (2024/2025):
    
    Name: ${data.businessName}
    Category: ${data.category}
    Address/Location: ${data.address}
    Type: ${data.isServiceArea ? "Service Area Business (Hidden Address)" : "Storefront (Visible Address)"}
    Phone: ${data.phone}
    Website: ${data.website}

    Tasks:
    1. Check for Name Spam (keywords, location modifiers, capitalization abuse).
    2. Check for Address violations (P.O. Boxes, Virtual Offices).
    3. Generate a high-quality, SEO-optimized business description (max 750 chars) based on the category and name.
    4. Predict the likely Verification Method (Video Verification or Postcard) based on the business type.
    5. Provide 3-4 specific "Verification Prep Tips" (e.g., "Have branded vehicle ready", "Ensure signage is permanent not vinyl banner").
    
    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          issues: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of specific violations found, or empty if valid."
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Suggestions to improve the profile quality."
          },
          optimizedDescription: { type: Type.STRING, description: "A suggested business description." },
          verificationAdvice: {
            type: Type.OBJECT,
            properties: {
              method: { type: Type.STRING, description: "Likely verification method (Video vs Postcard)." },
              tips: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of things to physically prepare for verification."
              }
            }
          }
        },
        required: ['isValid', 'issues', 'optimizedDescription', 'verificationAdvice']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text);
};

export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[], 
  newMessage: string,
  context?: BusinessContext
) => {
  let systemInstruction = ASSISTANT_SYSTEM_INSTRUCTION;
  
  // Inject current app context into the assistant's brain
  if (context && context.name) {
    systemInstruction += `\n\nCURRENT BUSINESS CONTEXT (The user is currently viewing this business):
    Name: ${context.name}
    Industry: ${context.industry}
    Reported Issue: ${context.issueDescription}
    Detected Category: ${context.detectedCategory || 'N/A'}
    Diagnosis Analysis: ${context.analysis || 'N/A'}
    
    Use this context to provide specific, tailored advice without asking the user to repeat themselves.`;
  }

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
    history: history
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};
