export enum AppView {
  DASHBOARD = 'DASHBOARD',
  DIAGNOSTIC = 'DIAGNOSTIC',
  PLAN = 'PLAN',
  WRITER = 'WRITER',
  CREATE_WIZARD = 'CREATE_WIZARD',
  CLAIM_GUIDE = 'CLAIM_GUIDE'
}

export interface BusinessContext {
  name: string;
  industry: string;
  issueDescription?: string; // Made optional
  detectedCategory?: 'SUSPENSION' | 'VERIFICATION' | 'RANKING' | 'REVIEWS' | 'OTHER';
  analysis?: string;
}

export interface FixStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
}

export interface StepGuide {
  title: string;
  bigPicture: string; 
  steps: string[]; 
  pitfalls: string[]; 
  proTips: string[]; 
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface WriterTemplate {
  id: string;
  name: string;
  prompt: string;
  icon: string;
}

export interface NewProfileData {
  businessName: string;
  category: string;
  isServiceArea: boolean;
  address: string; 
  phone: string;
  website: string;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  optimizedDescription?: string;
  suggestions?: string[];
  verificationAdvice?: {
    method: string; 
    tips: string[]; 
  };
}
