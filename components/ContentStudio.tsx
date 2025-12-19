import React, { useState, useEffect } from 'react';
import { BusinessContext } from '../types';
import { generateGBPContent } from '../services/geminiService';
import { 
  PenTool, MessageSquare, FileText, Copy, Check, RefreshCw, 
  Eye, Send, Flag, ShieldAlert, Maximize2, Minimize2, 
  ExternalLink, MessageCircleQuestion, 
  Image, Users, Trash2 
} from 'lucide-react';

interface Props {
  context: BusinessContext;
  focusMode?: boolean;
  toggleFocusMode?: () => void;
  onSwitchBusiness?: () => void;
}

interface ReviewEntry {
  id: string;
  original: string;
  reply: string;
  timestamp: number;
}

type TabType = 'description' | 'post' | 'reply' | 'review_removal' | 'q_and_a' | 'photo_ideas';

const ContentStudio: React.FC<Props> = ({ context, focusMode, toggleFocusMode, onSwitchBusiness }) => {
  const [activeTab, setActiveTab] = useState<TabType>('description');
  
  // Per-tab Input State
  const [tabInputs, setTabInputs] = useState<Record<TabType, string>>({
    description: '',
    post: '',
    reply: '',
    review_removal: '',
    q_and_a: '',
    photo_ideas: ''
  });

  // Per-tab Output State
  const [tabOutputs, setTabOutputs] = useState<Record<TabType, string>>({
    description: '',
    post: '',
    reply: '',
    review_removal: '',
    q_and_a: '',
    photo_ideas: ''
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPublishGuide, setShowPublishGuide] = useState(false);
  const [reviewHistory, setReviewHistory] = useState<ReviewEntry[]>([]);

  // Derived current states based on active tab
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
      alert("Business Name is missing. Please return to the Dashboard and set your business details.");
      return;
    }
    
    setLoading(true);
    setCopied(false);
    setShowPublishGuide(false);
    
    try {
      // Capture input locally to avoid race conditions
      const inputToUse = currentInput;
      const result = await generateGBPContent(activeTab, context, inputToUse);
      
      if (result) {
        handleOutputChange(result);
        
        if (activeTab === 'reply') {
          const newEntry: ReviewEntry = {
            id: Date.now().toString(),
            original: inputToUse,
            reply: result,
            timestamp: Date.now()
          };
          setReviewHistory(prev => [newEntry, ...prev]);
        }
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      handleOutputChange("Generation failed. Please ensure your prompt is clear and try again.");
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

  const handleStartPublishing = () => {
    setShowPublishGuide(true);
    copyToClipboard(currentOutput);
  };

  const getSmartLink = () => {
    switch (activeTab) {
      case 'review_removal': return { url: 'https://support.google.com/business/workflow/9945796', label: 'Open Review Removal Tool' };
      case 'post': return { url: 'https://business.google.com/posts', label: 'Go to Posts Section' };
      case 'photo_ideas': return { url: 'https://business.google.com/photos', label: 'Upload Photos' };
      case 'q_and_a': return { url: 'https://business.google.com/dashboard', label: 'Open Dashboard (Find Q&A)' };
      default: return { url: 'https://business.google.com/', label: 'Launch GBP Dashboard' };
    }
  };

  const smartLink = getSmartLink();

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'description': return "Tell us what makes your business special, your history, and your main services...";
      case 'post': return "What is your offer or update? (e.g., 'Free coffee with every meal this Friday')...";
      case 'reply': return "Paste the customer review here...";
      case 'review_removal': return "Why is this review unfair? (e.g., 'This person was never a customer')...";
      case 'q_and_a': return "What questions do customers ask most often?";
      case 'photo_ideas': return "Describe your shop or workspace...";
      default: return "Type something here...";
    }
  };

  const getButtonLabel = () => {
    if (loading) return "Generating...";
    switch (activeTab) {
      case 'description': return 'Generate Bio';
      case 'post': return 'Generate Post';
      case 'reply': return 'Generate Response';
      case 'q_and_a': return 'Generate FAQ Pairs';
      case 'photo_ideas': return 'Create Shot List';
      case 'review_removal': return 'Draft Appeal';
      default: return 'Generate';
    }
  };

  const navTools = [
    { id: 'description', label: 'Bio', icon: FileText },
    { id: 'post', label: 'Post', icon: PenTool },
    { id: 'reply', label: 'Reply', icon: MessageSquare },
    { id: 'review_removal', label: 'Challenge', icon: Flag },
    { id: 'q_and_a', label: 'FAQ', icon: MessageCircleQuestion },
    { id: 'photo_ideas', label: 'Photos', icon: Image },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className={`${focusMode ? 'text-xl' : 'text-3xl'} font-bold text-slate-900`}>Content Studio</h2>
          <p className="text-slate-600">Tailored content for <strong>{context.name || 'your business'}</strong>.</p>
        </div>
        <div className="flex space-x-2">
          {onSwitchBusiness && (
            <button
              onClick={onSwitchBusiness}
              className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Switch Biz</span>
            </button>
          )}
          {toggleFocusMode && (
            <button
              onClick={toggleFocusMode}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                focusMode ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="text-sm font-medium">{focusMode ? 'Exit Copilot' : 'Copilot Mode'}</span>
            </button>
          )}
        </div>
      </div>

      <div className={`flex-1 grid gap-6 min-h-0 ${focusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        <div className={`${focusMode ? 'col-span-1' : 'lg:col-span-4'} flex flex-col space-y-4`}>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {navTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => { setActiveTab(tool.id as TabType); setShowPublishGuide(false); }}
                  className={`py-2 px-1 rounded-lg text-xs font-medium flex flex-col items-center justify-center space-y-1 transition-all ${
                    activeTab === tool.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                {activeTab === 'description' && "Bio Context"}
                {activeTab === 'post' && "Post Content"}
                {activeTab === 'reply' && "Paste Review"}
                {activeTab === 'review_removal' && "Why Remove?"}
                {activeTab === 'q_and_a' && "Topics for FAQs"}
                {activeTab === 'photo_ideas' && "Business Setting"}
              </label>
              {(currentInput || currentOutput) && (
                <button onClick={clearTab} className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors" title="Clear this tab">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Using value={currentInput} makes this a controlled component, fixing the overlap bug */}
            <textarea
              key={`input-${activeTab}`}
              className={`flex-1 w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50 text-slate-900 text-sm ${focusMode ? 'h-32' : ''}`}
              placeholder={getPlaceholder()}
              value={currentInput}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            
            {activeTab === 'review_removal' && (
              <div className="mt-2 text-xs text-amber-600 flex items-center bg-amber-50 p-2 rounded-lg">
                <ShieldAlert className="w-4 h-4 mr-2 flex-shrink-0" />
                Note: Google rarely removes honest reviews.
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={handleGenerate}
                disabled={loading || !currentInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
                <span>{getButtonLabel()}</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`${focusMode ? 'col-span-1' : 'lg:col-span-8'} flex flex-col min-h-[400px] lg:min-h-0`}>
          <div className="bg-white flex-1 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  AI Output
                </span>
                {currentOutput && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Ready</span>
                )}
              </div>
              <div className="flex space-x-2">
                {currentOutput && (
                  <button 
                    onClick={() => copyToClipboard(currentOutput)}
                    className="flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-300 px-3 py-1.5 rounded-md transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
              {currentOutput ? (
                <div className="max-w-2xl mx-auto animate-fade-in">
                  <div className="prose prose-slate max-w-none">
                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed text-sm bg-white p-6 rounded-lg border border-slate-200 shadow-sm shadow-slate-200/50">
                      {currentOutput}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <div className="p-4 bg-slate-100 rounded-full mb-4">
                    <PenTool className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium">Generated content will appear here</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex justify-between items-center">
                <a href={smartLink.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center space-x-1">
                  <span>{smartLink.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {currentOutput && !showPublishGuide && (
                  <button
                    onClick={handleStartPublishing}
                    className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Copy & Open Google</span>
                  </button>
                )}
              </div>
              
              {showPublishGuide && currentOutput && (
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 animate-scale-in">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-blue-900 text-sm">Draft Ready!</h4>
                    <button onClick={() => setShowPublishGuide(false)} className="text-blue-400 hover:text-blue-600"><Maximize2 className="w-4 h-4" /></button>
                  </div>
                  <p className="text-sm text-blue-800 mb-4">
                    The content has been copied. Use the link below to open your profile dashboard and paste it.
                  </p>
                  <a 
                    href={smartLink.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
                  >
                    <span>Go to Google Now</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentStudio;