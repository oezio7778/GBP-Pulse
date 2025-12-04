
import React, { useState } from 'react';
import { BusinessContext } from '../types';
import { generateGBPContent } from '../services/geminiService';
import { PenTool, MessageSquare, FileText, Copy, Check, RefreshCw, Eye, Send, Flag, ShieldAlert, Maximize2, Minimize2, ExternalLink, ArrowRight, History, Clock } from 'lucide-react';

interface Props {
  context: BusinessContext;
  focusMode?: boolean;
  toggleFocusMode?: () => void;
}

interface ReviewEntry {
  id: string;
  original: string;
  reply: string;
  timestamp: number;
}

const ContentStudio: React.FC<Props> = ({ context, focusMode, toggleFocusMode }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'post' | 'reply' | 'review_removal'>('description');
  const [extraDetails, setExtraDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPublishGuide, setShowPublishGuide] = useState(false);
  const [reviewHistory, setReviewHistory] = useState<ReviewEntry[]>([]);

  const handleGenerate = async () => {
    if (!context.name) {
      alert("Please configure your business details in the Diagnostic Tool first.");
      return;
    }
    setLoading(true);
    setCopied(false);
    setShowPublishGuide(false);
    try {
      const result = await generateGBPContent(activeTab, context, extraDetails);
      setGeneratedContent(result);

      // If generating a reply, save to history
      if (activeTab === 'reply' && result) {
        const newEntry: ReviewEntry = {
          id: Date.now().toString(),
          original: extraDetails,
          reply: result,
          timestamp: Date.now()
        };
        setReviewHistory(prev => [newEntry, ...prev]);
      }

    } catch (error) {
      console.error(error);
      setGeneratedContent("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartPublishing = () => {
    setShowPublishGuide(true);
    // Auto-copy for convenience
    copyToClipboard(generatedContent);
  };

  // Smart Link logic based on active tab
  const getSmartLink = () => {
      if (activeTab === 'review_removal') {
          return {
              url: 'https://support.google.com/business/workflow/9945796',
              label: 'Open Review Removal Tool'
          };
      }
      return {
          url: 'https://business.google.com/',
          label: 'Launch GBP Dashboard'
      };
  };

  const smartLink = getSmartLink();

  return (
    <div className="h-full flex flex-col animate-fade-in-up">
      <div className="mb-6 flex justify-between items-start">
        <div>
            <h2 className={`${focusMode ? 'text-xl' : 'text-3xl'} font-bold text-slate-900`}>Content Studio</h2>
            <p className="text-slate-600">Generate content & appeals.</p>
        </div>
        {toggleFocusMode && (
            <button 
                onClick={toggleFocusMode}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    focusMode 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
            >
                {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="text-sm font-medium">{focusMode ? 'Exit Copilot' : 'Copilot Mode'}</span>
            </button>
        )}
      </div>

      <div className={`flex-1 grid gap-6 min-h-0 ${focusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
        {/* Tools Panel */}
        <div className={`${focusMode ? 'col-span-1' : 'lg:col-span-4'} flex flex-col space-y-4`}>
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
            {[
                { id: 'description', label: 'Bio', icon: FileText },
                { id: 'post', label: 'Post', icon: PenTool },
                { id: 'reply', label: 'Reply', icon: MessageSquare },
                { id: 'review_removal', label: 'Challenge', icon: Flag },
            ].map((tool) => {
                const Icon = tool.icon;
                return (
                    <button
                        key={tool.id}
                        onClick={() => { setActiveTab(tool.id as any); setGeneratedContent(''); setShowPublishGuide(false); }}
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

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {activeTab === 'description' && "Unique Selling Points & History"}
              {activeTab === 'post' && "What are you promoting? (Offer, Event, News)"}
              {activeTab === 'reply' && "Paste the review you received here"}
              {activeTab === 'review_removal' && "Paste the unfair review content here"}
            </label>
            <textarea
              className={`flex-1 w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50 text-slate-900 text-sm ${focusMode ? 'h-32' : ''}`}
              placeholder={
                activeTab === 'description' ? "e.g. Family owned since 1990, specializing in emergency plumbing..." :
                activeTab === 'post' ? "e.g. Summer sale, 20% off all AC tune-ups until August..." :
                activeTab === 'reply' ? "e.g. 'Great service but expensive' - John Doe" :
                "e.g. 'This place is terrible' - [Also explain WHY it's fake, e.g. 'This person is a competitor']"
              }
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
            />
            
            {activeTab === 'review_removal' && (
                <div className="mt-2 text-xs text-amber-600 flex items-center bg-amber-50 p-2 rounded-lg">
                    <ShieldAlert className="w-4 h-4 mr-2 flex-shrink-0" />
                    Tip: Mention if it's spam, conflict of interest, or off-topic.
                </div>
            )}
             
            {activeTab === 'reply' && focusMode && (
                <div className="mt-2 text-xs text-blue-600 flex items-center bg-blue-50 p-2 rounded-lg">
                    <History className="w-4 h-4 mr-2 flex-shrink-0" />
                    Rapid Response Mode active. Replies are saved below.
                </div>
            )}

            <div className="mt-4">
              <button
                onClick={handleGenerate}
                disabled={loading || !extraDetails}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <PenTool className="w-5 h-5" />}
                <span>
                    {activeTab === 'description' ? 'Generate Bio' : 
                     activeTab === 'post' ? 'Generate Post' : 
                     activeTab === 'reply' ? 'Generate Response' : 
                     'Draft Appeal Argument'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className={`${focusMode ? 'col-span-1' : 'lg:col-span-8'} flex flex-col min-h-[400px] lg:min-h-0`}>
          <div className="bg-white flex-1 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
             <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {activeTab === 'review_removal' ? 'Formal Removal Request' : 'Google Search Preview'}
                    </span>
                    {generatedContent && activeTab !== 'review_removal' && activeTab !== 'description' && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Live Mockup
                        </span>
                    )}
                </div>
                <div className="flex space-x-2">
                    {generatedContent && (
                    <button 
                        onClick={() => copyToClipboard(generatedContent)}
                        className="flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-300 px-3 py-1.5 rounded-md transition-all"
                    >
                        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy Text'}</span>
                    </button>
                    )}
                </div>
             </div>
             
             <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
               {generatedContent ? (
                 <div className="max-w-2xl mx-auto">
                    {activeTab === 'post' && (
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6">
                             <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {context.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{context.name}</h4>
                                    <p className="text-xs text-slate-500">Just now · Updates</p>
                                </div>
                             </div>
                             <p className="text-sm text-slate-800 whitespace-pre-wrap mb-3">{generatedContent}</p>
                             <button className="w-full py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100">
                                Call Now
                             </button>
                        </div>
                    )}

                    {activeTab === 'reply' && (
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6">
                            <div className="border-l-4 border-slate-200 pl-4 mb-4">
                                <p className="text-xs text-slate-500 italic mb-1">Customer Review:</p>
                                <p className="text-sm text-slate-700">"{extraDetails || 'Great service...'}"</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs">Owner</div>
                                <div className="bg-slate-100 rounded-lg rounded-tl-none p-3 text-sm text-slate-800">
                                    <p className="whitespace-pre-wrap">{generatedContent}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'review_removal' ? (
                        <div className="bg-white p-8 shadow-sm border border-slate-200 mx-auto max-w-2xl">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Submission Text</h4>
                            <div className="prose prose-slate prose-sm max-w-none">
                                <p className="whitespace-pre-wrap font-serif text-slate-800">{generatedContent}</p>
                            </div>
                            <p className="text-xs text-slate-400 mt-6 pt-4 border-t">
                                Copy this text into the "Describe the issue" field in the Google Business Profile removal tool.
                            </p>
                        </div>
                    ) : (
                       (activeTab !== 'post' && activeTab !== 'reply') && (
                           <div className="prose prose-slate max-w-none">
                                <p className="whitespace-pre-wrap text-slate-800 leading-relaxed text-lg">{generatedContent}</p>
                           </div>
                       )
                    )}
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                   <PenTool className="w-16 h-16 mb-4" />
                   <p>Your content will appear here</p>
                 </div>
               )}

               {/* Review History / Rapid Response List */}
               {activeTab === 'reply' && reviewHistory.length > 0 && (
                 <div className="mt-8 pt-8 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Session History ({reviewHistory.length})
                    </h4>
                    <div className="space-y-4">
                        {reviewHistory.map((entry) => (
                            <div key={entry.id} className="bg-white p-4 rounded-lg border border-slate-200 text-sm">
                                <p className="text-slate-500 italic mb-2 line-clamp-1">"{entry.original}"</p>
                                <div className="flex items-start gap-2">
                                    <div className="bg-blue-50 p-2 rounded text-slate-800 flex-1">
                                        {entry.reply}
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard(entry.reply)}
                                        className="p-2 text-slate-400 hover:text-blue-600"
                                        title="Copy again"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
               )}
             </div>

             {/* Action Footer for Simulation/Launch */}
             <div className="p-4 bg-white border-t border-slate-200">
                {!showPublishGuide ? (
                     <div className="flex justify-between items-center">
                        <a 
                            href={smartLink.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center space-x-1"
                        >
                            <span>{smartLink.label}</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>

                        {generatedContent && (
                            <button
                                onClick={handleStartPublishing}
                                className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                            >
                                <Send className="w-4 h-4" />
                                <span>Start Publishing</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 animate-scale-in">
                        <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-blue-900 text-sm">Follow these steps to publish on Google:</h4>
                             <button onClick={() => setShowPublishGuide(false)} className="text-blue-400 hover:text-blue-600"><Minimize2 className="w-4 h-4" /></button>
                        </div>
                        <ol className="space-y-2 text-sm text-blue-800 mb-4">
                            <li className="flex items-center gap-2">
                                <span className="bg-blue-200 text-blue-700 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">1</span>
                                <span>We just copied the text for you.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="bg-blue-200 text-blue-700 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">2</span>
                                <span>Click the button below to open Google.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="bg-blue-200 text-blue-700 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">3</span>
                                <span>Select <strong>"{activeTab === 'post' ? 'Add Update' : activeTab === 'reply' ? 'Reply' : 'Describe Issue'}"</strong> and paste (Ctrl+V).</span>
                            </li>
                        </ol>
                        <a 
                            href={smartLink.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
                        >
                            <span>Open Google & Paste</span>
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
