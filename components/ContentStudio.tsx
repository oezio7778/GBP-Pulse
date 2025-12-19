
import React, { useState } from 'react';
import { BusinessContext } from '../types';
import { generateGBPContent } from '../services/geminiService';
import { 
  PenTool, MessageSquare, FileText, Copy, Check, RefreshCw, 
  Send, Flag, Maximize2, Minimize2, 
  ExternalLink, MessageCircleQuestion, 
  Image, Users, Trash2, BookOpen, Settings,
  AlertCircle,
  Bot,
  Building2,
  ArrowRight
} from 'lucide-react';

interface Props {
  context: BusinessContext;
  focusMode?: boolean;
  toggleFocusMode?: () => void;
  onSwitchBusiness?: () => void;
  onUpdateBusiness?: (name: string, industry: string) => void;
}

type TabType = 'description' | 'post' | 'reply' | 'review_removal' | 'q_and_a' | 'photo_ideas' | 'blog' | 'challenge';

const ContentStudio: React.FC<Props> = ({ 
  context, 
  focusMode, 
  toggleFocusMode, 
  onSwitchBusiness,
  onUpdateBusiness
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('description');
  
  // Local state for the inline setup form if context is missing
  const [setupName, setSetupName] = useState('');
  const [setupIndustry, setSetupIndustry] = useState('');

  const [tabInputs, setTabInputs] = useState<Record<TabType, string>>({
    description: '', post: '', reply: '', review_removal: '', q_and_a: '', photo_ideas: '', blog: '', challenge: ''
  });
  const [tabOutputs, setTabOutputs] = useState<Record<TabType, string>>({
    description: '', post: '', reply: '', review_removal: '', q_and_a: '', photo_ideas: '', blog: '', challenge: ''
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPublishGuide, setShowPublishGuide] = useState(false);

  const currentInput = tabInputs[activeTab];
  const currentOutput = tabOutputs[activeTab];

  const handleInputChange = (val: string) => {
    setTabInputs(prev => ({ ...prev, [activeTab]: val }));
  };

  const handleOutputChange = (val: string) => {
    setTabOutputs(prev => ({ ...prev, [activeTab]: val }));
  };

  const handleGenerate = async () => {
    if (!context.name) return;

    setLoading(true);
    setCopied(false);
    setShowPublishGuide(false);
    try {
      const result = await generateGBPContent(activeTab, context, currentInput);
      handleOutputChange(result || "No response received from AI.");
    } catch (error) {
      console.error("AI Content Generation Error:", error);
      handleOutputChange("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInlineSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupName && setupIndustry && onUpdateBusiness) {
      onUpdateBusiness(setupName, setupIndustry);
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

  const navTools = [
    { id: 'description', label: 'Bio', icon: FileText },
    { id: 'post', label: 'Post', icon: PenTool },
    { id: 'reply', label: 'Reply', icon: MessageSquare },
    { id: 'challenge', label: 'Challenge', icon: Flag },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'review_removal', label: 'Flag', icon: Send },
    { id: 'q_and_a', label: 'FAQ', icon: MessageCircleQuestion },
    { id: 'photo_ideas', label: 'Photos', icon: Image },
  ];

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'description': return "List your history, services, and unique value proposition...";
      case 'post': return "What's the update or offer? (e.g., '10% off plumbing this week')...";
      case 'reply': return "Paste the customer review here...";
      case 'challenge': return "Describe the issue you are appealing (e.g., Wrongly suspended for 'Deceptive Content' after address change)...";
      case 'review_removal': return "Why should this be removed? (e.g. Off-topic, spam, conflict of interest)...";
      case 'q_and_a': return "Enter common customer questions or specific topics to address...";
      case 'photo_ideas': return "Describe your workspace, typical job site, or local landmark...";
      case 'blog': return "What topic should the post cover? (e.g., 'How to detect a leak before it costs you thousands')...";
      default: return "";
    }
  };

  const getInputLabel = () => {
    if (activeTab === 'challenge') return "Appeal Context / Evidence";
    return "Input Prompt";
  };

  const activeToolLabel = navTools.find(t => t.id === activeTab)?.label || 'Content';

  // If no business name is set, show the INLINE SETUP FORM immediately
  if (!context.name) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12 text-center animate-fade-in max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
          <Settings className="w-10 h-10 animate-pulse" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Content Studio Setup</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The Studio needs a few details to tailor AI-generated content to your brand and industry.
        </p>
        
        <form onSubmit={handleInlineSetupSubmit} className="w-full space-y-4 text-left">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Joe's Auto Repair"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Industry</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Automotive, Plumbing, Law"
              value={setupIndustry}
              onChange={(e) => setSetupIndustry(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 mt-4"
          >
            <span>Launch Content Studio</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Content Studio</h2>
          <p className="text-slate-600 font-medium flex items-center gap-2 mt-1">
            Generating for: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{context.name}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onSwitchBusiness && (
            <button 
              onClick={onSwitchBusiness} 
              className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Users className="w-4 h-4" /> <span className="text-sm font-bold">Switch Business</span>
            </button>
          )}
          <button 
            onClick={toggleFocusMode} 
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="text-sm font-bold">{focusMode ? 'Exit Copilot' : 'Copilot Mode'}</span>
          </button>
        </div>
      </div>

      <div className={`flex-1 grid gap-6 min-h-0 ${focusMode ? 'grid-cols-1' : 'lg:grid-cols-12'}`}>
        {/* Input Side */}
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

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{getInputLabel()}</label>
              {(currentInput || currentOutput) && (
                <button 
                  onClick={clearTab} 
                  className="text-slate-400 hover:text-red-500 transition-colors" 
                  title="Clear All"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <textarea
              key={`studio-input-${activeTab}`}
              className="flex-1 w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 leading-relaxed"
              placeholder={getPlaceholder()}
              value={currentInput}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <button 
              onClick={handleGenerate} 
              disabled={loading || !currentInput.trim()} 
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg active:scale-95"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
              <span>{loading ? 'Synthesizing...' : `Generate ${activeToolLabel}`}</span>
            </button>
          </div>
        </div>

        {/* Output Side */}
        <div className={`${focusMode ? '' : 'lg:col-span-8'} bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden`}>
          <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PREVIEW AREA</span>
            {currentOutput && (
              <button 
                onClick={() => copyToClipboard(currentOutput)} 
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white border border-slate-300 px-3 py-1.5 rounded-lg transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 flex flex-col">
            {currentOutput ? (
              <div className="max-w-xl mx-auto w-full space-y-4 animate-fade-in flex-1">
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

                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap text-sm text-slate-800 leading-relaxed min-h-[150px]">
                  {currentOutput}
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl mt-4 shadow-xl">
                  <button 
                    onClick={() => setShowPublishGuide(true)} 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Send className="w-5 h-5" /> <span>Launch to Dashboard</span>
                  </button>
                  {showPublishGuide && (
                    <div className="mt-4 p-4 bg-white/10 border border-white/10 rounded-xl animate-scale-in">
                      <p className="text-xs text-white/90 mb-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                        <span>The text has been copied. Click below to open your Google Profile and paste the content.</span>
                      </p>
                      <a 
                        href="https://business.google.com/" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-full py-2 bg-white text-slate-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        <span>GO TO GOOGLE DASHBOARD</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-40">
                <div className="w-16 h-16 mb-4 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl">
                    <Bot className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-center">Studio Offline</p>
                <p className="text-xs mt-1 text-center">Select a tool and provide details to awaken the AI</p>
              </div>
            )}
          </div>

          {/* Persistent Footer */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
             <a 
              href="https://business.google.com/" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-600 transition-all text-[10px] font-black uppercase tracking-tighter flex items-center gap-2"
             >
               Launch GBP Dashboard <ExternalLink className="w-3 h-3" />
             </a>
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-200 uppercase tracking-widest">
               <span>Gemini 2.0 Powered</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;
