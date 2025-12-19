import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import DiagnosticWizard from './components/DiagnosticWizard.tsx';
import ActionPlan from './components/ActionPlan.tsx';
import ContentStudio from './components/ContentStudio.tsx';
import AssistantSidebar from './components/AssistantSidebar.tsx';
import CreateWizard from './components/CreateWizard.tsx';
import ClaimGuide from './components/ClaimGuide.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';
import QuickStartModal from './components/QuickStartModal.tsx';
import { AppView, BusinessContext, FixStep } from './types.ts';
import { ArrowRight, RotateCcw, Play, PlusCircle, PenTool, MapPin, Settings, AlertCircle, Building2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);
  const [sessionKey, setSessionKey] = useState(0); 
  const [focusMode, setFocusMode] = useState(false); 
  
  const [businessContext, setBusinessContext] = useState<BusinessContext>(() => {
    try {
      const saved = localStorage.getItem('gbp_context');
      return saved ? JSON.parse(saved) : { name: '', industry: '', issueDescription: '' };
    } catch (e) {
      return { name: '', industry: '', issueDescription: '' };
    }
  });
  
  const [actionPlan, setActionPlan] = useState<FixStep[]>(() => {
    try {
      const saved = localStorage.getItem('gbp_plan');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('gbp_context', JSON.stringify(businessContext));
  }, [businessContext]);

  useEffect(() => {
    localStorage.setItem('gbp_plan', JSON.stringify(actionPlan));
  }, [actionPlan]);

  useEffect(() => {
    if (currentView !== AppView.WRITER) {
      setFocusMode(false);
    }
  }, [currentView]);

  const handleDiagnosisComplete = (context: BusinessContext, steps: FixStep[]) => {
    setBusinessContext(context);
    setActionPlan(steps);
    setCurrentView(AppView.PLAN);
  };

  const handleQuickStart = (name: string, industry: string) => {
    setBusinessContext(prev => ({ ...prev, name: name.trim(), industry: industry.trim() }));
    setShowQuickStartModal(false);
  };

  const toggleStep = (id: string) => {
    setActionPlan(prev => prev.map(step => 
      step.id === id ? { ...step, status: step.status === 'completed' ? 'pending' : 'completed' } : step
    ));
  };

  const requestReset = () => {
    setShowResetModal(true);
  };

  const performReset = () => {
    localStorage.removeItem('gbp_context');
    localStorage.removeItem('gbp_plan');
    setBusinessContext({ name: '', industry: '', issueDescription: '' });
    setActionPlan([]);
    setSessionKey(prev => prev + 1);
    setCurrentView(AppView.DASHBOARD);
    setFocusMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStudio = () => {
    setCurrentView(AppView.WRITER);
  };

  const handleSwitchBusiness = () => {
      setShowQuickStartModal(true);
  };

  const handleUpdateBusiness = (name: string, industry: string) => {
    setBusinessContext(prev => ({ ...prev, name: name.trim(), industry: industry.trim() }));
  };

  const hasIdentitySet = !!(businessContext.name && businessContext.name.trim() !== '');
  const hasActiveSession = hasIdentitySet && actionPlan.length > 0;

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">GBP Pulse Dashboard</h1>
                <p className="text-xl text-slate-600">Unified command for Google Business Profiles.</p>
              </div>
              {!hasIdentitySet && (
                <button 
                  onClick={() => setShowQuickStartModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Setup Business Identity</span>
                </button>
              )}
            </div>

            {!hasIdentitySet && (
               <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4 shadow-sm border-l-4 border-l-amber-500">
                  <div className="p-3 bg-amber-100 rounded-2xl flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 text-lg">Identity Required</h3>
                    <p className="text-amber-700 text-sm mb-4">Set your business name and industry to unlock the AI Diagnostic tools and Content Studio.</p>
                    <button 
                      onClick={() => setShowQuickStartModal(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      Configure Business Identity Now
                    </button>
                  </div>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Fix Existing</h2>
                  <p className="text-slate-600 mb-8 flex-1 text-sm">
                    Diagnose suspensions, solve verification issues, and get a recovery plan.
                  </p>
                  {hasActiveSession ? (
                    <div className="space-y-3">
                      <button 
                        onClick={() => setCurrentView(AppView.PLAN)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Continue</span>
                      </button>
                      <button onClick={requestReset} className="w-full text-sm text-slate-500 hover:text-red-500 font-medium py-2">
                        Start New
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setCurrentView(AppView.DIAGNOSTIC)}
                      className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Diagnose</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Claim Profile</h2>
                  <p className="text-slate-600 mb-8 flex-1 text-sm">
                    Find out how to claim a business that is new, or currently owned by someone else.
                  </p>
                  <button onClick={() => setCurrentView(AppView.CLAIM_GUIDE)} className="w-full bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2">
                    <span>Start Claim</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-xl text-white hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                      <PlusCircle className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Create New</h2>
                    <p className="text-slate-300 mb-8 flex-1 text-sm">
                      Build a perfect profile from scratch. AI audits your data for compliance.
                    </p>
                    <button 
                      onClick={() => setCurrentView(AppView.CREATE_WIZARD)} 
                      className="w-full bg-white text-slate-900 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Create</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-slate-100 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-full shadow-sm">
                    <PenTool className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Need content only?</h3>
                    <p className="text-slate-600 text-sm">Jump straight to the Content Studio.</p>
                </div>
                <button onClick={handleOpenStudio} className="ml-auto px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Open Studio
                </button>
              </div>
            </div>
          </div>
        );
      case AppView.DIAGNOSTIC:
        return <DiagnosticWizard onDiagnosisComplete={handleDiagnosisComplete} />;
      case AppView.PLAN:
        return <ActionPlan steps={actionPlan} context={businessContext} onToggleStep={toggleStep} goToWriter={() => setCurrentView(AppView.WRITER)} />;
      case AppView.WRITER:
        return (
          <ContentStudio 
            context={businessContext} 
            focusMode={focusMode} 
            toggleFocusMode={() => setFocusMode(!focusMode)} 
            onSwitchBusiness={handleSwitchBusiness}
            onUpdateBusiness={handleUpdateBusiness}
          />
        );
      case AppView.CREATE_WIZARD:
        return <CreateWizard />;
      case AppView.CLAIM_GUIDE:
        return <ClaimGuide />;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <>
      <Layout 
        currentView={currentView} 
        setView={setCurrentView}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onReset={requestReset}
        focusMode={focusMode}
        businessName={businessContext.name}
      >
        <div key={sessionKey} className="h-full">
          {renderContent()}
        </div>
        {!focusMode && <AssistantSidebar context={businessContext} />}
      </Layout>

      <ConfirmationModal 
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={performReset}
        title="Start New Session?"
        message="This will clear your current profile data."
      />

      <QuickStartModal
        isOpen={showQuickStartModal}
        onClose={() => setShowQuickStartModal(false)}
        onSubmit={handleQuickStart}
        initialName={businessContext.name}
        initialIndustry={businessContext.industry}
      />
    </>
  );
};

export default App;
