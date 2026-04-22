import React, { useState } from 'react';
import { Sparkles, Calendar, MessageSquare, Loader2, FileText, ArrowRight } from 'lucide-react';
import { generateProjectSchedule, askAIArchitect } from '../services/geminiService';
import { SchedulePhase } from '../types';

const AIStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'chat'>('schedule');
  const [loading, setLoading] = useState(false);
  
  // Schedule State
  const [projectType, setProjectType] = useState('');
  const [constraints, setConstraints] = useState('');
  const [generatedSchedule, setGeneratedSchedule] = useState<SchedulePhase[] | null>(null);

  // Chat State
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  const handleGenerateSchedule = async () => {
    if (!projectType) return;
    setLoading(true);
    const schedule = await generateProjectSchedule(projectType, constraints);
    setGeneratedSchedule(schedule);
    setLoading(false);
  };

  const handleAskAI = async () => {
    if (!chatQuery) return;
    setLoading(true);
    const response = await askAIArchitect(chatQuery, "User is managing multiple construction projects.");
    setChatResponse(response);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col animate-fade-in max-w-6xl mx-auto">
      <div className="mb-8 border-b border-gray-100 pb-8">
        <h1 className="text-2xl font-light text-gray-900 flex items-center gap-3">
          <Sparkles className="text-gray-900" strokeWidth={1.5} />
          AI Studio
        </h1>
        <p className="text-gray-500 mt-2 font-light">Generate schedules and get architectural insights using Gemini 2.0.</p>
      </div>

      <div className="flex gap-8 mb-8">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'schedule' 
            ? 'border-black text-black' 
            : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Schedule Generator
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'chat' 
            ? 'border-black text-black' 
            : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Expert Chat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full">
        {/* Input Area */}
        <div className="space-y-6">
          {activeTab === 'schedule' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Project Type</label>
                <input
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder="e.g., Modern 2-story Villa, 300sqm"
                  className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Constraints & Details</label>
                <textarea
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g., Must finish by December, difficult soil conditions..."
                  className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 text-sm h-32 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all resize-none placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleGenerateSchedule}
                disabled={loading || !projectType}
                className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
                Generate Schedule
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                 <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Ask an Expert</label>
                 <textarea
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="Ask about building codes, material properties, or sustainable design strategies..."
                  className="w-full bg-gray-50 border border-gray-200 rounded px-4 py-3 text-sm h-64 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all resize-none placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={handleAskAI}
                disabled={loading || !chatQuery}
                className="w-full bg-black text-white py-3 rounded font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
                Ask AI Assistant
              </button>
            </div>
          )}
        </div>

        {/* Output Area */}
        <div className="bg-gray-50 rounded border border-gray-200 p-8 min-h-[400px] relative">
           {!generatedSchedule && !chatResponse && !loading && (
             <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-300">
               <Sparkles size={48} strokeWidth={1} className="mb-4" />
               <p className="text-sm font-light">Results will appear here</p>
             </div>
           )}

           {loading && (
             <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-900">
               <Loader2 size={32} className="animate-spin mb-4" />
               <p className="text-sm font-medium animate-pulse">Processing...</p>
             </div>
           )}

           {activeTab === 'schedule' && generatedSchedule && (
             <div className="space-y-8 animate-fade-in">
               <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h3 className="font-bold text-gray-900">Suggested Schedule</h3>
               </div>
               <div className="space-y-0 relative">
                 <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200"></div>
                 {generatedSchedule.map((phase, idx) => (
                   <div key={idx} className="relative pl-8 py-4">
                     <div className="absolute left-0 top-5 w-4 h-4 rounded-full bg-white border-2 border-black z-10"></div>
                     <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-gray-900 text-sm">{phase.phase}</h4>
                           <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                             {phase.durationWeeks} Weeks
                           </span>
                        </div>
                       <p className="text-sm text-gray-500 leading-relaxed">{phase.details}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {activeTab === 'chat' && chatResponse && (
             <div className="animate-fade-in space-y-4">
                <div className="flex items-center gap-2 text-gray-900 mb-6 border-b border-gray-200 pb-4">
                  <FileText size={18} />
                  <span className="font-bold text-sm uppercase tracking-wide">AI Analysis</span>
                </div>
                <div className="prose prose-sm prose-gray max-w-none text-gray-600">
                  {chatResponse.split('\n').map((line, i) => (
                    <p key={i} className="mb-3 leading-relaxed">{line}</p>
                  ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AIStudio;