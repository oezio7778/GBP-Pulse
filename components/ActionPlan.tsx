
import React, { useState } from 'react';
import { FixStep, BusinessContext } from '../types.ts';
import { CheckSquare, Square, ExternalLink, ShieldAlert, CheckCircle2, Lightbulb, BookOpen, ChevronRight, Printer, FileDown } from 'lucide-react';
import GuideDrawer from './GuideDrawer.tsx';

interface Props {
  steps: FixStep[];
  context: BusinessContext;
  onToggleStep: (id: string) => void;
  goToWriter: () => void;
}

const ActionPlan: React.FC<Props> = ({ steps, context, onToggleStep, goToWriter }) => {
  const [selectedStep, setSelectedStep] = useState<{title: string, description: string} | null>(null);

  const handlePrint = () => {
    window.print();
  };

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <ShieldAlert className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700">No Action Plan Yet</h3>
        <p className="text-slate-500 max-w-md mt-2">Please run the Diagnostic Tool first to generate a tailored recovery plan for your business.</p>
      </div>
    );
  }

  const progress = Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100);

  return (
    <>
      {/* Print Header (Visible only when printing) */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-slate-900">GBP Pulse - Recovery Plan</h1>
        <p className="text-slate-600">Generated for: {context.name} ({context.industry})</p>
        <p className="text-sm text-slate-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
        <hr className="my-4 border-slate-300"/>
      </div>

      <div className="space-y-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-3xl font-bold text-slate-900">Recovery Plan</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                context.detectedCategory === 'SUSPENSION' ? 'bg-red-100 text-red-700' :
                context.detectedCategory === 'VERIFICATION' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {context.detectedCategory || 'Optimization'}
              </span>
            </div>
            <p className="text-slate-600">Action items for <strong>{context.name}</strong>.</p>
          </div>

          <div className="flex items-center gap-4 print:hidden">
            <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
                <FileDown className="w-4 h-4" />
                <span>Export PDF</span>
            </button>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 min-w-[200px]">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-slate-700">Progress</span>
                <span className="text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section - Explains "What the issue is" */}
        {context.analysis && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">Diagnostic Analysis</h3>
                <p className="text-slate-700 leading-relaxed text-md">
                  {context.analysis}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900">Step-by-Step Fixes</h3>
            </div>
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`group flex items-start space-x-4 p-5 rounded-xl border transition-all break-inside-avoid ${
                  step.status === 'completed' 
                    ? 'bg-slate-50 border-slate-200 opacity-70' 
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <button 
                  onClick={() => onToggleStep(step.id)}
                  className="mt-1 flex-shrink-0 focus:outline-none print:hidden"
                >
                  {step.status === 'completed' ? (
                    <CheckSquare className="w-6 h-6 text-green-500" />
                  ) : (
                    <Square className="w-6 h-6 text-slate-300 group-hover:text-blue-500" />
                  )}
                </button>
                {/* Print-only checkbox representation */}
                <div className="hidden print:block mt-1">
                   <div className={`w-5 h-5 border-2 rounded ${step.status === 'completed' ? 'border-black bg-gray-200' : 'border-gray-400'}`}></div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-lg font-semibold mb-1 ${step.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {step.title}
                    </h4>
                    <button
                        onClick={() => setSelectedStep({ title: step.title, description: step.description })}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Guide</span>
                    </button>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm mb-3">
                    {step.description}
                  </p>
                  
                  {step.status !== 'completed' && (
                    <button 
                      onClick={() => setSelectedStep({ title: step.title, description: step.description })}
                      className="inline-flex items-center space-x-2 text-sm text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors print:hidden"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Learn how to do this</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6 print:hidden">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <h3 className="font-bold text-indigo-900 mb-2">Need to rewrite content?</h3>
              <p className="text-sm text-indigo-700 mb-4">
                Fixing issues often requires updating your business description or posting an update to show activity.
              </p>
              <button 
                onClick={goToWriter}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Go to Content Studio</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-4">Helpful Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://support.google.com/business/gethelp" target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    GBP Support Form
                  </a>
                </li>
                <li>
                  <a href="https://support.google.com/business/answer/3038177" target="_blank" rel="noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Guidelines for Business Representation
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <GuideDrawer 
        isOpen={!!selectedStep}
        onClose={() => setSelectedStep(null)}
        stepTitle={selectedStep?.title || ''}
        stepDescription={selectedStep?.description || ''}
        context={context}
      />
    </>
  );
};

export default ActionPlan;
