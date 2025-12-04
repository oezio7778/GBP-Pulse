
import React, { useState } from 'react';
import { NewProfileData, ValidationResult } from '../types';
import { validateNewProfile } from '../services/geminiService';
import { ArrowRight, Check, MapPin, Phone, Building2, Search, AlertTriangle, Sparkles, Send, Loader2, CheckCircle2, Copy, Video, Mail } from 'lucide-react';

const CreateWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const [formData, setFormData] = useState<NewProfileData>({
    businessName: '',
    category: '',
    isServiceArea: false,
    address: '',
    phone: '',
    website: '',
    description: ''
  });

  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleNext = async () => {
    if (step === 3) {
      // Perform AI Audit before Final Step
      setLoading(true);
      try {
        const result = await validateNewProfile(formData);
        setValidation(result);
        if (result.optimizedDescription) {
            setFormData(prev => ({ ...prev, description: result.optimizedDescription || '' }));
        }
        setStep(step + 1);
      } catch (e) {
        alert("Failed to validate profile. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (step === 4) {
      // Simulate submission
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setCompleted(true);
      }, 2000);
    } else {
      setStep(step + 1);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center relative z-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
            step >= i ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200 text-slate-400'
          }`}>
            {step > i ? <Check className="w-5 h-5" /> : i}
          </div>
          <span className={`text-xs mt-2 font-medium ${step >= i ? 'text-blue-600' : 'text-slate-400'}`}>
            {i === 1 && 'Info'}
            {i === 2 && 'Location'}
            {i === 3 && 'Contact'}
            {i === 4 && 'Audit'}
          </span>
        </div>
      ))}
      <div className="absolute top-9 left-0 w-full h-1 bg-slate-200 -z-0 px-8">
        <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  if (completed && validation) {
    return (
      <div className="flex flex-col h-full animate-fade-in-up pb-10">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">You are Ready to Launch!</h2>
            <p className="text-slate-600 max-w-lg mx-auto">
                Your profile data is optimized and compliant. Follow the steps below to complete the process on Google.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Data to Transfer */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center">
                    <span>1. Copy Data to Google</span>
                    <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Manual Step</span>
                </h3>
                <div className="space-y-4">
                    {[
                        { label: 'Business Name', value: formData.businessName },
                        { label: 'Category', value: formData.category },
                        { label: 'Description', value: formData.description },
                        { label: 'Phone', value: formData.phone },
                        { label: 'Website', value: formData.website }
                    ].map((item, idx) => (
                        <div key={idx} className="group">
                            <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                            <div className="flex items-start gap-2">
                                <div className="bg-slate-50 p-2.5 rounded-lg text-sm font-medium text-slate-800 flex-1 break-words border border-slate-200">
                                    {item.value || 'N/A'}
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(item.value)}
                                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Verification Advice */}
            <div className="space-y-6">
                 {/* Likely Method */}
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        {validation.verificationAdvice?.method.toLowerCase().includes('video') ? (
                            <Video className="w-5 h-5" />
                        ) : (
                            <Mail className="w-5 h-5" />
                        )}
                        2. Expect: {validation.verificationAdvice?.method || "Standard Verification"}
                    </h3>
                    <p className="text-sm text-blue-800 mb-4">
                        Based on your business type, Google will likely require this verification method.
                    </p>
                    
                    <h4 className="font-semibold text-sm text-blue-900 mb-2 uppercase tracking-wide">Pre-Checklist</h4>
                    <ul className="space-y-2">
                        {validation.verificationAdvice?.tips?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                                <Check className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                    <h3 className="font-bold mb-2">3. Final Step</h3>
                    <p className="text-slate-300 text-sm mb-6">
                        Click the button below to open Google Business Profile. Use the "Copy" buttons on the left to paste your validated data directly into the form.
                    </p>
                    <button 
                        onClick={() => window.open('https://business.google.com/create', '_blank')}
                        className="w-full bg-white text-slate-900 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all"
                    >
                        <span>Open Google Business Profile</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Create New Profile</h2>
        <p className="text-slate-600 mt-2">Let's build a guideline-compliant profile from the ground up.</p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-fade-in-up min-h-[400px] flex flex-col">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Official legal business name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Do not include keywords or location modifiers (e.g. "Best Plumber NY").</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Primary Category</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Italian Restaurant, Plumber"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-4">
               <button 
                 onClick={() => setFormData({...formData, isServiceArea: false})}
                 className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${!formData.isServiceArea ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
               >
                 <MapPin className="w-6 h-6 mx-auto mb-2" />
                 <span className="block font-bold">Storefront</span>
                 <span className="text-xs">Customers visit me</span>
               </button>
               <button 
                 onClick={() => setFormData({...formData, isServiceArea: true})}
                 className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${formData.isServiceArea ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
               >
                 <Building2 className="w-6 h-6 mx-auto mb-2" />
                 <span className="block font-bold">Service Area</span>
                 <span className="text-xs">I visit customers</span>
               </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                {formData.isServiceArea ? "Service Area (City/Region)" : "Street Address"}
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={formData.isServiceArea ? "e.g. Phoenix, AZ" : "123 Main St"}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
              {!formData.isServiceArea && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    P.O. Boxes and Virtual Offices are prohibited.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
            <div className="space-y-6">
                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                </div>
                </div>
                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Website</label>
                <input
                    type="url"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
                </div>
            </div>
        )}

        {step === 4 && validation && (
            <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${validation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start space-x-3">
                        {validation.isValid ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
                        <div>
                            <h3 className={`font-bold ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                                {validation.isValid ? "Compliance Check Passed" : "Violations Detected"}
                            </h3>
                            {!validation.isValid && (
                                <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                                    {validation.issues.map((issue, idx) => <li key={idx}>{issue}</li>)}
                                </ul>
                            )}
                            {validation.isValid && validation.suggestions && validation.suggestions.length > 0 && (
                                <div className="mt-2 text-sm text-green-700">
                                    <p className="font-semibold">Tips:</p>
                                    <ul className="list-disc list-inside">
                                        {validation.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-1">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>AI Generated Description</span>
                    </label>
                    <textarea
                        className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 text-sm"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                    <p className="text-xs text-slate-500 mt-1">We generated this based on your category and name. Edit as needed.</p>
                </div>
            </div>
        )}

        <div className="mt-auto pt-8 flex justify-between">
            {step > 1 && (
                <button 
                    onClick={() => setStep(step - 1)}
                    className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2"
                >
                    Back
                </button>
            )}
            <button
                onClick={handleNext}
                disabled={loading || (step === 1 && !formData.businessName)}
                className={`ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-blue-600/20 ${loading ? 'opacity-75 cursor-wait' : ''}`}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <span>{step === 4 ? "Complete Preparation" : "Next Step"}</span>
                        {step !== 4 && <ArrowRight className="w-5 h-5" />}
                        {step === 4 && <Send className="w-4 h-5" />}
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWizard;
