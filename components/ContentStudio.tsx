
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

type TabType = 'description' | 'post' | 'reply' | 'review_removal' | 'q_and_a' | 'photo_ideas';

const ContentStudio: React.FC<Props> = ({ context, focusMode, toggleFocusMode, onSwitchBusiness }) => {
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [tabInputs, setTabInputs] = useState<Record<TabType, string>>({
    description: '', post: '', reply: '', review_removal: '', q_and_a: '', photo_ideas: ''
  });
  const [tabOutputs, setTabOutputs] = useState<Record<TabType, string>>({
    description: '', post: '', reply: '', review_removal: '', q_and_a: '', photo_ideas: ''
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
    if (!context.name) {
      alert("Business Name required.");
      return;
    }
    setLoading(true);
    setCopied(false);
    setShowPublishGuide(false);
    try {
      const result = await generateGBPContent(activeTab, context, currentInput);
      handleOutputChange(result || "No content generated.");
    } catch (error) {
      console.error(error);
      handleOutputChange("Generation error.");
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

  const navTools = [
    { id: 'description', label: 'Bio', icon: FileText },
    { id: 'post', label: 'Post', icon: PenTool },
    { id: 'reply', label: 'Reply', icon: MessageSquare },
    { id: 'review_removal', label: 'Flag', icon: Flag },
    { id: 'q_and_a', label: 'FAQ', icon: MessageCircleQuestion },
    { id: 'photo_ideas', label: 'Photos', icon: Image },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Content Studio</h2>
          <p className="text-slate-600">Context: <strong>{context.name}</strong></p>
        </div>
        <div className="flex space-x-2">
          {onSwitchBusiness && (
            <button onClick={onSwitchBusiness} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 flex items-center gap-2 hover:bg-slate-50">
              <Users className="w-4 h-4" /> <span className="text-sm">Switch</span>
            </button>
          )}
          <button onClick={toggleFocusMode} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 flex items-center gap-2 hover:bg-slate-50">
            {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="text-sm">Copilot</span>
          </button>
        </div>
      </div>

      <div className={`flex-1 grid gap-6 min-h-0 ${focusMode ? 'grid-cols-1' : 'lg:grid-cols-12'}`}>
        <div className={`${focusMode ? '' : 'lg:col-span-4'} space-y-4`}>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
            {navTools.map((tool) => (
              <button key={tool.id} onClick={() => setActiveTab(tool.id as TabType)} className={`py-2 rounded-lg text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${activeTab === tool.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <tool.icon className="w-4 h-4" /> <span>{tool.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-64">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input Details</label>
              {(currentInput || currentOutput) && <button onClick={clearTab} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
            </div>
            <textarea
              key={activeTab}
              className="flex-1 w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50 text-sm"
              placeholder="What are we writing about?"
              value={currentInput}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            <button onClick={handleGenerate} disabled={loading || !currentInput.trim()} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/20">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
              <span>Generate</span>
            </button>
          </div>
        </div>

        <div className={`${focusMode ? '' : 'lg:col-span-8'} bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden`}>
          <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Result</span>
            {currentOutput && (
              <button onClick={() => copyToClipboard(currentOutput)} className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-300 px-3 py-1.5 rounded-md">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
            {currentOutput ? (
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm whitespace-pre-wrap text-sm text-slate-800 leading-relaxed">
                {currentOutput}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <PenTool className="w-12 h-12 mb-3" />
                <p className="text-sm">Your generated content will appear here</p>
              </div>
            )}
          </div>
          {currentOutput && (
            <div className="p-4 bg-white border-t border-slate-200">
              <button onClick={() => setShowPublishGuide(true)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                <Send className="w-4 h-4" /> <span>Finalize & Open Google</span>
              </button>
              {showPublishGuide && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg animate-scale-in">
                   <p className="text-xs text-blue-800 mb-3">Copy successful. Paste this on your Google profile dashboard.</p>
                   <a href="https://business.google.com/" target="_blank" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                     Open GBP Dashboard <ExternalLink className="w-3 h-3" />
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
