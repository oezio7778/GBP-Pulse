import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in ring-1 ring-slate-900/5">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{message}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg shadow-lg shadow-red-600/30 transition-all text-sm"
          >
            Yes, Start New Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;