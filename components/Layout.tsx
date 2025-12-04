import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, Stethoscope, ClipboardList, PenTool, Menu, Activity, RotateCcw, PlusCircle, MapPin, Maximize2, Minimize2 } from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  children: React.ReactNode;
  toggleSidebar: () => void;
  onReset?: () => void;
  focusMode?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children, toggleSidebar, onReset, focusMode = false }) => {
  
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.CREATE_WIZARD, label: 'Create Profile', icon: PlusCircle },
    { id: AppView.CLAIM_GUIDE, label: 'Claim Business', icon: MapPin },
    { id: AppView.DIAGNOSTIC, label: 'Diagnostic Tool', icon: Stethoscope },
    { id: AppView.PLAN, label: 'Action Plan', icon: ClipboardList },
    { id: AppView.WRITER, label: 'Content Studio', icon: PenTool },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Hidden in Focus Mode */}
      <aside className={`bg-slate-900 text-white flex-col shadow-xl z-20 transition-all duration-300 ease-in-out ${focusMode ? 'hidden w-0' : 'w-64 hidden md:flex'}`}>
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">GBP Pulse</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          {onReset && (
            <button 
              type="button"
              onClick={onReset}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all border border-transparent hover:border-red-900/50"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="font-medium text-sm">New Session</span>
            </button>
          )}

          <div className="bg-slate-800 rounded-xl p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-1">Status</h4>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-slate-400">Auto-save Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden transition-all duration-300">
        {/* Mobile Header - Hidden in Focus Mode unless mobile */}
        {!focusMode && (
          <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-slate-900">GBP Pulse</span>
            </div>
            <button onClick={toggleSidebar} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth ${focusMode ? 'bg-slate-100' : ''}`}>
          <div className={`mx-auto h-full transition-all duration-300 ${focusMode ? 'max-w-2xl' : 'max-w-5xl'}`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
