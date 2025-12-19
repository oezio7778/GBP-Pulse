import React, { useState, useEffect } from 'react';
import { BusinessContext } from '../types';
import { generateGBPContent } from '../services/geminiService';
import { 
  PenTool, MessageSquare, FileText, Copy, Check, RefreshCw, 
  Send, Flag, Maximize2, Minimize2, 
  ExternalLink, MessageCircleQuestion, 
  Image, Trash2, BookOpen, Settings,
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
  
  // Initialize with safe string fallbacks
  const [setupName, setSetupName] = useState(String(context?.name || ''));
  const [setupIndustry, setSetupIndustry] = useState(String(context?.industry || ''));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setSetupName(String(context?.name || ''));
    setSetupIndustry(String(context?.industry || ''));
  }, [context?.name, context?.industry]);

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
    if (localError) setLocalError(null);
  };

  const handleOutputChange = (val: string) => {
    setTabOutputs(prev => ({ ...prev, [activeTab]: val }));
  };

  const handleGenerate = async () => {
    if (!context?.name || String(context.name).trim() === '') {
      setLocalError("Business Name is required. Use the setup form below.");
      return;
    }

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
    if (setupName.trim() && setupIndustry.trim() && onUpdateBusiness) {
      onUpdateBusiness(setupName.trim(), setupIndustry.trim());
    }
  };

  const clearTab = () => {
    handleInputChange('');
    handleOutputChange('');
    setShowPublishGuide(false);
    setLocalError(null);
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
      case 'challenge': return "Describe the issue you are appealing (e.g., Wrongly suspended for 'Deceptive Content')...";
      case 'review_removal': return "Why should this be removed? (e.g. Off-topic, spam, conflict of interest)...";
      case 'q_and_a': return "Enter common customer questions or specific topics to address...";
      case 'photo_ideas': return "Describe your workspace, typical job site, or local landmark...";
      case 'blog': return "What topic should the post cover? (e.g., 'How to detect a leak')...";
      default: return "";
    }
  };

  const getInputLabel = () => {
    if (activeTab === 'challenge') return "Appeal Context / Evidence";
    return "Input Prompt";
  };

  const activeToolLabel = navTools.find(t => t.id === activeTab)?.label || 'Content';

  // Defensive empty state check
  const isBusinessNameEmpty = !context?.name || String(context.name).trim() === '';

  if (isBusinessNameEmpty) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in-up py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12 text-center max-w-2xl w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
            <Building2 className="w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Initialize Content Studio</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The Content Studio needs your business identity to craft guideline-compliant posts and profile descriptions.
          </p>
          
          <form onSubmit={handleInlineSetupSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Prestige Plumbers"
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
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Plumber"
                value={setupIndustry}
                onChange={(e) => setSetupIndustry(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 mt-4"
            >
              <span>Activate Studio & Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Content Studio</h2>
          <p className="text-slate-600 font-medium flex items-center gap-2 mt-1">
            Active Profile: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold">{context.name}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onSwitchBusiness && (
            <button 
              onClick={onSwitchBusiness} 
              className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Settings className="w-4 h-4" /> <span className="text-sm font-bold">Change Business</span>
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

      {localError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 animate-fade-in">
           <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
           <p className="text-sm text-red-800 font-medium">{localError}</p>
        </div>
      )}

      <div className={`flex-1 grid gap-6 min-h-0 ${focusMode ? 'grid-cols-1' : 'lg:grid-cols-12'}`}>
        <div className={`${focusMode ? '' : 'lg:col-span-4'} flex flex-col space-y-4`}>
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1.5 rounded-2xl">
            {navTools.map((tool) => (
              <button 
                key={tool.id} 
                onClick={() => { setActiveTab(tool.id as TabType); setShowPublishGuide(false); setLocalError(null); }} 
                className={`py-3 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${activeTab === tool.id ? 'bg-white text-blue-600 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                <tool.icon className="w-4 h-4" /> <span>{tool.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{getInputLabel()}</label>
              {(currentInput || currentOutput) && (
                <button 
                  onClick={clearTab} 
                  className="text-slate-300 hover:text-red-500 transition-colors p-1" 
                  title="Clear All"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <textarea
              key={`studio-input-${activeTab}`}
              className="flex-1 w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 leading-relaxed transition-all"
              placeholder={getPlaceholder()}
              value={currentInput}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <button 
              onClick={handleGenerate} 
              disabled={loading || !currentInput.trim()} 
              className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
              <span>{loading ? 'Consulting Experts...' : `Generate ${activeToolLabel}`}</span>
            </button>
          </div>
        </div>

        <div className={`${focusMode ? '' : 'lg:col-span-8'} bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden`}>
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Studio Preview</span>
            {currentOutput && (
              <button 
                onClick={() => copyToClipboard(currentOutput)} 
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50/30 flex flex-col">
            {currentOutput ? (
              <div className="max-w-2xl mx-auto w-full space-y-6 animate-fade-in">
                {activeTab === 'post' && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner">{context.name?.charAt(0) || 'B'}</div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">{context.name}</p>
                        <p className="text-slate-400 font-medium">Draft Google Post Preview</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{currentOutput}</p>
                  </div>
                )}
                
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm whitespace-pre-wrap text-sm text-slate-800 leading-relaxed min-h-[200px]">
                  {currentOutput}
                </div>

                <div className="p-6 bg-slate-900 rounded-3xl mt-6 shadow-2xl">
                  <button 
                    onClick={() => setShowPublishGuide(true)} 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                  >
                    <Send className="w-5 h-5" /> <span>Launch to GBP Dashboard</span>
                  </button>
                  {showPublishGuide && (
                    <div className="mt-6 p-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl animate-scale-in text-left">
                      <p className="text-sm text-white/90 mb-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-400" />
                        <span>The text is copied. Click below to open your Google Profile and paste the content in the correct field.</span>
                      </p>
                      <a 
                        href="https://business.google.com/" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-full py-3 bg-white text-slate-900 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg"
                      >
                        <span>GO TO GOOGLE DASHBOARD</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 opacity-50">
                <div className="w-20 h-20 mb-6 flex items-center justify-center border-4 border-dashed border-slate-200 rounded-3xl transform rotate-6">
                    <Bot className="w-10 h-10" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-center">Studio Offline</p>
                <p className="text-xs mt-2 text-center font-medium">Select a tool and enter details to begin</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
             <a 
              href="https://business.google.com/" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-600 transition-all text-xs font-black flex items-center gap-2 uppercase tracking-tighter"
             >
               GBP Dashboard <ExternalLink className="w-3.5 h-3.5" />
             </a>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-200 uppercase tracking-widest">
               <span>Gemini 3 Pro Assisted</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;
