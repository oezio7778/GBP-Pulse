
import React, { useEffect, useState } from 'react';
import { StepGuide, BusinessContext } from '../types';
import { generateStepGuide } from '../services/geminiService';
import { X, BookOpen, AlertTriangle, Lightbulb, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stepTitle: string;
  stepDescription: string;
  context: BusinessContext;
}

const GuideDrawer: React.FC<Props> = ({ isOpen, onClose, stepTitle, stepDescription, context }) => {
  const [guide, setGuide] = useState<StepGuide | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && stepTitle) {
      setLoading(true);
      setGuide(null);
      
      generateStepGuide(stepTitle, stepDescription, context)
        .then(setGuide)
        .catch((err) => console.error("Failed to load guide", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, stepTitle, stepDescription, context]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wide">Deep Dive Guide</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{stepTitle}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-slate-500 font-medium">Consulting our expert knowledge base...</p>
            </div>
          ) : guide ? (
            <div className="space-y-8 animate-fade-in">
              {/* Big Picture */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3 text-sm">1</span>
                  The Big Picture
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-slate-800 leading-relaxed">
                  {guide.bigPicture}
                </div>
              </section>

              {/* Execution Steps */}
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                   <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3 text-sm">2</span>
                   How to Execute
                </h3>
                <div className="space-y-3">
                  {guide.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start group">
                      <ArrowRight className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                      <p className="text-slate-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pitfalls */}
                <section>
                   <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Common Pitfalls
                   </h3>
                   <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                      <ul className="space-y-3">
                        {guide.pitfalls.map((item, idx) => (
                          <li key={idx} className="text-sm text-red-800 flex items-start">
                             <span className="mr-2">•</span>
                             {item}
                          </li>
                        ))}
                      </ul>
                   </div>
                </section>

                {/* Pro Tips */}
                <section>
                   <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-3 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Pro Tips
                   </h3>
                   <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                      <ul className="space-y-3">
                        {guide.proTips.map((item, idx) => (
                          <li key={idx} className="text-sm text-amber-800 flex items-start">
                             <span className="mr-2">•</span>
                             {item}
                          </li>
                        ))}
                      </ul>
                   </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">
                <p>Unable to load guide. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideDrawer;
