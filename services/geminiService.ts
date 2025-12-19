
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessContext, FixStep, NewProfileData, ValidationResult, StepGuide } from '../types';

const ASSISTANT_SYSTEM_INSTRUCTION = `You are GBP Pulse, the industry-leading Google Business Profile diagnostic expert. 
Your expertise covers:
- GBP Suspensions (Hard and Soft)
- Video Verification (Troubleshooting common mobile upload failures)
- Local Search Ranking Factors (Proximity, Relevance, Prominence)
- Review Management & Removal Guidelines
- Compliance with the latest 2024/2025 Google Merchant & Business representation policies.

Tone: Clinical yet supportive, professional, and authoritative. 
Always prioritize "Clean Data" (Consistency between Website, GBP, and Third-party citations).`;

// Diagnose GBP issues and generate a fix plan
export const diagnoseIssue = async (context: BusinessContext): Promise<{ category: string; analysis: string; steps: FixStep[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Critically analyze this Google Business Profile issue using 2025 Local SEO and Policy standards.
    Focus on helping the user UNDERSTAND exactly why this is happening.

    Business Name: ${context.name}
    Industry: ${context.industry}
    Issue Description: ${context.issueDescription}

    Provide:
    1. CATEGORY: One of [SUSPENSION, VERIFICATION, RANKING, REVIEWS, OTHER].
    2. ANALYSIS: A root-cause explanation. Explain the 'why' behind Google's likely automated trigger or manual penalty (max 60 words). 
       Mention specific policy points like 'Misleading Content', 'Address Quality', or 'Keyword Stuffing' if applicable.
    3. STEPS: A 3-5 step action plan to rectify the issue. Each step needs a clear title and actionable description.
    
    Return the response as a JSON object matching the requested schema.
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

  return JSON.parse(response.text || '{"category": "OTHER", "analysis": "Unable to analyze.", "steps": []}');
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
      specificPrompt = `Write a professional 750-character bio. NO keyword stuffing. Focus on heritage, unique services, and location relevance.`;
      break;
    case 'post':
      specificPrompt = `Write a GBP 'Update' post. Use local phrasing. Include a hook, offer/detail, and clear CTA.`;
      break;
    case 'reply':
      specificPrompt = `Write a professional response to a review. If negative, be apologetic and move the convo offline. If positive, be thankful and highlight a service mentioned.`;
      break;
    case 'review_removal':
      specificPrompt = `Draft a formal removal appeal to Google based on policy violations like "Spam", "Conflict of Interest", or "Harassment".`;
      break;
    case 'q_and_a':
      specificPrompt = `Generate 3 frequently asked questions and high-authority answers for this specific industry.`;
      break;
    case 'photo_ideas':
      specificPrompt = `Suggest a list of 8 high-impact photos that build trust (Exterior with signage, interior, team at work, etc.).`;
      break;
    case 'blog':
      specificPrompt = `Write a 500-word SEO blog post about a local topic relevant to this business category to build geographic authority.`;
      break;
  }

  const finalPrompt = `
    Business: "${context.name}" (${context.industry})
    Task: ${specificPrompt}
    User Details: "${extraDetails}"
    
    Output ONLY the final content. No intro/outro.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: finalPrompt,
    config: {
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION
    }
  });

  return response.text || "Failed to generate content.";
};

// Generate a deep-dive educational guide for a specific task
export const generateStepGuide = async (stepTitle: string, stepDescription: string, context: BusinessContext): Promise<StepGuide> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Create a technical educational guide for this task: "${stepTitle}".
    Description: "${stepDescription}"
    Business Context: ${context.name} (${context.industry})

    JSON Requirements:
    - title: Brief catchy title.
    - bigPicture: Why this matters for GBP health and compliance.
    - steps: Array of 4-6 granular instructions.
    - pitfalls: Array of things to avoid.
    - proTips: Array of advanced optimization tips.
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
    Audit this profile for immediate suspension risks:
    Name: ${data.businessName}
    Category: ${data.category}
    Address: ${data.address}
    Type: ${data.isServiceArea ? "Service Area" : "Storefront"}
    
    Check for: Keyword stuffing in name, prohibited address types, category relevance.
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
    systemInstruction += `\n\nActive Context: You are discussing "${context.name}", a "${context.industry}" business. Always tailor advice to this specific vertical.`;
  }

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: { systemInstruction },
    history: history
  });

  const response = await chat.sendMessage({ message: newMessage });
  return response.text;
};
