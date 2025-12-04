import React, { useState } from 'react';
import { BusinessContext, FixStep } from '../types';
import { diagnoseIssue } from '../services/geminiService';
import { AlertTriangle, Search, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  onDiagnosisComplete: (context: BusinessContext, steps: FixStep[]) => void;
}

const DiagnosticWizard: React.FC<Props> = ({ onDiagnosisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessContext>({
    name: '',
    industry: '',
    issueDescription: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.issueDescription) return;

    setLoading(true);
    try {
      const result = await diagnoseIssue(formData);
      const updatedContext = {
        ...formData,
        detectedCategory: result.category as any,
        analysis: result.analysis
      };
      onDiagnosisComplete(updatedContext, result.steps);
    } catch (error) {
      console.error("Diagnosis failed", error);
      alert("Something went wrong with the AI diagnosis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Diagnostic Center</h2>
        <p className="text-slate-600 text-lg">Tell us about your business and the issue you're facing. Our AI will analyze your situation against the latest Google guidelines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Acme Plumbing Co."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Industry / Category</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. Local Services, Restaurant, Retail"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Describe the Issue</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                placeholder="e.g. My profile is suspended for 'quality issues', or I can't get video verification to work..."
                value={formData.issueDescription}
                onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing & Generating Plan...</span>
                </>
              ) : (
                <>
                  <span>Run Diagnosis</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Informational Side Panel */}
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-800 mb-1">Common Triggers</h3>
                <p className="text-amber-700 text-sm leading-relaxed">
                  Recent GBP updates have increased sensitivity to keyword stuffing in names, address inconsistencies, and P.O. Box usage. Our AI checks against these patterns.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
             <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-800 mb-1">What You'll Get</h3>
                <ul className="mt-2 space-y-2 text-blue-700 text-sm">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>Categorized issue identification</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>Root cause analysis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>Step-by-step reinstatement checklist</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>Access to AI content writers for fixes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticWizard;