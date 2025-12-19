
import React, { useState } from 'react';
import { Building2, ArrowRight, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, industry: string) => void;
}

const QuickStartModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && industry) {
      onSubmit(name, industry);
      setName('');
      setIndustry('');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">Quick Setup</h3>
          <p className="text-slate-500 text-sm">Tell us about your business to get started.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Joe's Pizza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Industry</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Restaurant"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/20 flex items-center"
            >
              <span>Start</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickStartModal;
