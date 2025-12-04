import React, { useState } from 'react';
import { Search, ShieldCheck, UserX, ArrowRight, ExternalLink, HelpCircle } from 'lucide-react';

const ClaimGuide: React.FC = () => {
  const [scenario, setScenario] = useState<'UNCLAIMED' | 'OWNED' | 'MISSING' | null>(null);

  const renderScenarioContent = () => {
    switch (scenario) {
      case 'UNCLAIMED':
        return (
          <div className="animate-fade-in-up space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">Great! It's Unclaimed.</h3>
                  <p className="text-green-800">
                    This is the easiest scenario. It means no one else has verified the business yet.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 mb-4">How to claim it now:</h4>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-medium text-slate-900">Go to Google Maps</p>
                    <p className="text-slate-600 text-sm">Find your business listing.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-medium text-slate-900">Click "Own this business?"</p>
                    <p className="text-slate-600 text-sm">It's usually located in the "About" section or near the suggest an edit button.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-medium text-slate-900">Follow the Verification Steps</p>
                    <p className="text-slate-600 text-sm">Google will ask you to verify via Phone, Text, Email, or Video.</p>
                  </div>
                </li>
              </ol>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <button 
                  onClick={() => window.open('https://business.google.com/create', '_blank')}
                  className="inline-flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-800"
                >
                  <span>Go to Google Business Profile</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'OWNED':
        return (
          <div className="animate-fade-in-up space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-amber-100 rounded-full">
                  <UserX className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900 mb-2">It's Owned by Someone Else</h3>
                  <p className="text-amber-800">
                    You saw a message like "This profile is managed by x...@gmail.com". Don't panic—you can still get it back.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 mb-4">The "Request Access" Strategy:</h4>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-medium text-slate-900">Click "Request Access"</p>
                    <p className="text-slate-600 text-sm">Fill out the form. Choose "Ownership" as the access level.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-medium text-slate-900">Wait Exactly 3 Days</p>
                    <p className="text-slate-600 text-sm">
                      <strong className="text-slate-800">Crucial Step:</strong> The current owner has 3 days to respond. If they ignore it (which is common for lost accounts), Google will release the profile to you.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-medium text-slate-900">Check Your Email</p>
                    <p className="text-slate-600 text-sm">If rejected, you may need to appeal. If ignored, you'll get a link to claim it yourself.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        );

      case 'MISSING':
        return (
          <div className="animate-fade-in-up space-y-6">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 text-center">
              <div className="inline-block p-3 bg-white rounded-full shadow-sm mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Business Not Found?</h3>
              <p className="text-slate-600 max-w-lg mx-auto mb-6">
                If searching for your business name yields no results on Google Maps, it means a profile likely doesn't exist yet.
              </p>
              <button
                onClick={() => { /* Navigate to Create Wizard logic typically handled by parent but we can link visually */ }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all inline-flex items-center space-x-2"
              >
                <span>Create New Profile Instead</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Claim Business Assistant</h2>
        <p className="text-slate-600 mt-2 text-lg">Let's find the right path to get ownership of your profile.</p>
      </div>

      {/* Decision Cards */}
      {!scenario && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setScenario('UNCLAIMED')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">It's Unclaimed</h3>
            <p className="text-sm text-slate-500">I see an "Own this business?" link on the profile.</p>
          </button>

          <button
            onClick={() => setScenario('OWNED')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Someone Owns It</h3>
            <p className="text-sm text-slate-500">It says "This business is managed by..." another email.</p>
          </button>

          <button
            onClick={() => setScenario('MISSING')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-4 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Can't Find It</h3>
            <p className="text-sm text-slate-500">My business doesn't show up on Maps at all.</p>
          </button>
        </div>
      )}

      {/* Selected Scenario Content */}
      {scenario && (
        <>
          <div className="flex justify-start">
             <button 
               onClick={() => setScenario(null)}
               className="text-slate-500 hover:text-blue-600 flex items-center space-x-2 text-sm font-medium transition-colors"
             >
               <ArrowRight className="w-4 h-4 rotate-180" />
               <span>Back to options</span>
             </button>
          </div>
          {renderScenarioContent()}
        </>
      )}

      {/* AI Help Section */}
      <div className="mt-12 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0 p-4 bg-white rounded-full shadow-sm">
           <HelpCircle className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-indigo-900 text-lg mb-1">Stuck in a loop?</h3>
          <p className="text-indigo-700 text-sm">
            Claiming can be tricky if the previous owner refuses access. Open the <strong>AI Assistant</strong> (bottom right) and ask: 
            <em> "How do I trigger the 3-day rule for a service area business?"</em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClaimGuide;
