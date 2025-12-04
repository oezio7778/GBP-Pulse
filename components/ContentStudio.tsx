import React, { useState } from 'react';
import { BusinessContext } from '../types';
import { generateGBPContent } from '../services/geminiService';
import { PenTool, MessageSquare, FileText, Copy, Check, RefreshCw } from 'lucide-react';

interface Props {
  context: BusinessContext;
}

const ContentStudio: React.FC<Props> = ({ context }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'post' | 'reply'>('description');
  const [extraDetails, setExtraDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!context.name) {
      alert("Please configure your business details in the Diagnostic Tool first.");
      return;
    }
    setLoading(true);
    setCopied(false);
    try {
      const result = await generateGBPContent(activeTab, context, extraDetails);
      setGeneratedContent(result);
    } catch (error) {
      console.error(error);
      setGeneratedContent("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Content Studio</h2>
        <p className="text-slate-600">Generate guideline-compliant content for your profile. Select a tool below.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Tools Panel */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('description'); setGeneratedContent(''); }}
              className={`py-2 px-3 rounded-lg text-sm font-medium flex flex-col items-center justify-center space-y-1 transition-all ${
                activeTab === 'description' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Bio</span>
            </button>
            <button
              onClick={() => { setActiveTab('post'); setGeneratedContent(''); }}
              className={`py-2 px-3 rounded-lg text-sm font-medium flex flex-col items-center justify-center space-y-1 transition-all ${
                activeTab === 'post' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Post</span>
            </button>
            <button
              onClick={() => { setActiveTab('reply'); setGeneratedContent(''); }}
              className={`py-2 px-3 rounded-lg text-sm font-medium flex flex-col items-center justify-center space-y-1 transition-all ${
                activeTab === 'reply' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {activeTab === 'description' && "Unique Selling Points & History"}
              {activeTab === 'post' && "What are you promoting? (Offer, Event, News)"}
              {activeTab === 'reply' && "Paste the review you received here"}
            </label>
            <textarea
              className="flex-1 w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50 text-slate-900 text-sm"
              placeholder={
                activeTab === 'description' ? "e.g. Family owned since 1990, specializing in emergency plumbing..." :
                activeTab === 'post' ? "e.g. Summer sale, 20% off all AC tune-ups until August..." :
                "e.g. 'Great service but expensive' - John Doe"
              }
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
            />
            <div className="mt-4">
              <button
                onClick={handleGenerate}
                disabled={loading || !extraDetails}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
                <span>Generate {activeTab === 'description' ? 'Bio' : activeTab === 'post' ? 'Post' : 'Response'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-8 flex flex-col min-h-[400px] lg:min-h-0">
          <div className="bg-white flex-1 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
             <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Output</span>
                {generatedContent && (
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-300 px-2 py-1 rounded-md transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
             </div>
             
             <div className="flex-1 p-6 overflow-y-auto">
               {generatedContent ? (
                 <div className="prose prose-slate max-w-none">
                   <p className="whitespace-pre-wrap text-slate-800 leading-relaxed text-lg">{generatedContent}</p>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                   <PenTool className="w-16 h-16 mb-4" />
                   <p>Your content will appear here</p>
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