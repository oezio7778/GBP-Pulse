import React, { useState, useEffect } from 'react';
import { BusinessContext } from '../types';
import { generateGBPContent } from '../services/geminiService';
import { 
  PenTool, MessageSquare, FileText, Copy, Check, RefreshCw, 
  Eye, Send, Flag, ShieldAlert, Maximize2, Minimize2, 
  ExternalLink, MessageCircleQuestion, 
  Image, Users, Trash2, BookOpen
} from 'lucide-react';

interface Props {
  context: BusinessContext;
  focusMode?: boolean;
  toggleFocusMode?: () => void;
  onSwitchBusiness?: () => void;
}

type TabType = 'description' | 'post' | 'reply' | 'review_removal' | 'q_and_a' | 'photo_ideas' | 'blog';

const ContentStudio: React.FC<Props> = ({ context, focusMode, toggleFocusMode, onSwitchBusiness }) => {
  const [activeTab, setActiveTab] = useState<TabType>('description');
  
  // Controlled tab input and output state
  const [tabInputs, setTabInputs] = useState<Record<TabType, string>>({
    description: '', post: '', reply: '', review_removal: '', q_and_a: '', photo_ideas: '', blog: ''
  });
  const [tabOutputs, setTabOutputs] = useState<Record<TabType, string>>({
    description: '', post: '', reply: '', review_removal: '', q_and_a: '', photo_ideas: '', blog: ''
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPublishGuide, setShowPublishGuide] = useState(false);

  // Derive active data
  const currentInput = tabInputs[activeTab];
  const currentOutput = tabOutputs[activeTab];

  const handleInputChange = (val: string) => {
    setTabInputs(prev => ({ ...prev, [activeTab]: val }));
  };

  const handleOutputChange = (val: string) => {
    setTabOutputs(prev => ({ ...prev, [activeTab]: val }));
  };

  const handleGenerate = async () => {
    if (!context.name) {
      alert("Business Name required. Please set it in the Dashboard.");
      return;
    }
    setLoading(true);
    setCopied(false);
    setShowPublishGuide(false);
    try {
      const inputToUse = currentInput;
      const result = await generateGBPContent(activeTab, context, inputToUse);
      handleOutputChange(result || "No response received from AI.");
    } catch (error) {
      console.error("AI Content Generation Error:", error);
      handleOutputChange("Generation failed. Please try a different prompt.");
    } finally {
      setLoading(false);
    }
  };

  const clearTab = () => {
    handleInputChange('');
    handleOutputChange('');
    setShowPublishGuide(false);
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'description': return "List your history, main services, and unique value proposition...";
      case 'post': return "What's new? (e.g., '20% off for first-time customers this weekend')...";
      case 'reply': return "Paste the customer review here...";
      case 'review_removal': return "Why should this review be removed? (e.g. Off-topic, spam, harassment)...";
      case 'q_and_a': return "Enter common customer questions or topics...";
      case 'photo_ideas': return "Briefly describe your business location or shop interior...";
      case 'blog': return "What topic should the blog post cover? (e.g., 'Winter plumbing tips for homeowners')...";
      default: return "";
    }
  };

  const getButtonLabel = () => {
    if (loading) return "Consulting AI...";
    switch (activeTab) {
      case 'description': return 'Generate Bio';
      case 'post': return 'Draft Post';
      case 'reply': return 'Draft Response';
      case 'q_and_a': return 'Generate FAQs';
      case 'photo_ideas': return 'Get Shot List';
      case 'review_removal': return 'Draft Challenge';
      case 'blog': return 'Write Blog Post';
      default: return 'Generate Content';
    }
  };

  const navTools = [
    { id: 'description', label: 'Bio', icon: FileText },
    { id: 'post', label: 'Post', icon: PenTool },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'reply', label: 'Reply', icon: MessageSquare },
    { id: 'review_removal', label: 'Flag', icon: Flag },
    { id: 'q_and_a', label: 'FAQ', icon: MessageCircleQuestion },
    { id: 'photo_ideas', label: 'Photos', icon: Image },
  ];

  const smartLink = activeTab === 'review_removal' 
    ? { url: "https://support.google.com/business/workflow/9945796", label: "Open Removal Tool" }
    : { url: "https://business.google.com/", label: "GBP Dashboard" };

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Content Studio</h2>
          <p className="text-slate-600">Drafting for: <span className="font-bold text-blue-600">{context.name || "Guest Business"}</span></p>
        </div>
        <div className="flex space-x-2">
          {onSwitchBusiness && (
            <button onClick={onSwitchBusiness} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <Users className="w-4 h-4" /> <span className="text-sm font-medium">Switch</span>
            </button>
          )}
          <button onClick={toggleFocusMode} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors">
            {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="text-sm font-medium">{focusMode ? 'Exit Copilot' : 'Copilot'}</span>
          </button>
        </div>
      </div>

      <div className={`flex-1 grid gap-6 min-h-0 ${focusMode ? 'grid-cols-1' : 'lg:grid-cols-12'}`}>
        <div className={`${focusMode ? '' : 'lg:col-span-4'} flex flex-col space-y-4`}>
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
            {navTools.map((tool) => (
              <button 
                key={tool.id} 
                onClick={() => { setActiveTab(tool.id as TabType); setShowPublishGuide(false); }} 
                className={`py-2 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${activeTab === tool.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <tool.icon className="w-3.5 h-3.5" /> <span>{tool.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input Prompt</label>
              {(currentInput || currentOutput) && <button onClick={clearTab} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
            </div>
            <textarea
              key={`input-field-${activeTab}`}
              className="flex-1 w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400"
              placeholder={getPlaceholder()}
              value={currentInput}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            {activeTab === 'review_removal' && (
              <div className="mt-2 text-[10px] leading-tight text-amber-600 bg-amber-50 p-2 rounded-md flex items-start gap-1">
                <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                Note: Appeals for policy violations (spam, harassment, etc.) are most effective.
              </div>
            )}
            <button 
              onClick={handleGenerate} 
              disabled={loading || !currentInput.trim()} 
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
              <span>{getButtonLabel()}</span>
            </button>
          </div>
        </div>

        <div className={`${focusMode ? '' : 'lg:col-span-8'} bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden`}>
          <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Recommendation</span>
            {currentOutput && (
              <button 
                onClick={() => copyToClipboard(currentOutput)} 
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-300 px-3 py-1.5 rounded-md transition-all active:scale-95"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            {currentOutput ? (
              <div className="max-w-xl mx-auto space-y-4 animate-fade-in">
                {activeTab === 'post' && (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">{context.name?.charAt(0) || 'B'}</div>
                      <div className="text-xs">
                        <p className="font-bold">{context.name}</p>
                        <p className="text-slate-500">Draft Post Preview</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{currentOutput}</p>
                  </div>
                )}
                
                {activeTab === 'reply' && (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4 border-l-4 border-l-blue-600">
                    <p className="text-[10px] uppercase font-bold text-blue-600 mb-2">Response from Owner</p>
                    <p className="text-sm text-slate-800 italic whitespace-pre-wrap">"{currentOutput}"</p>
                  </div>
                )}

                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm whitespace-pre-wrap text-sm text-slate-800 leading-relaxed font-normal">
                  {currentOutput}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-40">
                <PenTool className="w-16 h-16 mb-4" />
                <p className="text-sm font-medium uppercase tracking-wide">Waiting for prompt...</p>
              </div>
            )}
          </div>

          {currentOutput && (
            <div className="p-4 bg-white border-t border-slate-200">
              <button 
                onClick={() => setShowPublishGuide(true)} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 transition-all active:scale-[0.98]"
              >
                <Send className="w-4 h-4" /> <span>Copy & Finalize on Google</span>
              </button>
              {showPublishGuide && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-scale-in">
                   <div className="flex justify-between items-start mb-1">
                     <p className="text-xs font-bold text-blue-800 uppercase tracking-tight">Final Step:</p>
                     <button onClick={() => setShowPublishGuide(false)} className="text-blue-400 hover:text-blue-600"><Trash2 className="w-3 h-3" /></button>
                   </div>
                   <p className="text-xs text-blue-700 mb-3">Your text is copied. Click the link below to open your dashboard and paste this content.</p>
                   <a 
                    href={smartLink.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full py-2 bg-blue-600 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                   >
                     <span>Open {smartLink.label}</span>
                     <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;
