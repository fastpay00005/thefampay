import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Clock, Upload, Image, ExternalLink, ShieldCheck, AlertCircle, Award } from 'lucide-react';

export const TasksPage = () => {
  const { tasks, submitTaskProof, supportLinks, isDark } = useApp();
  const [selectedTask, setSelectedTask] = useState(null);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardStyle = isDark
    ? 'bg-[#121829] border-slate-800 text-white shadow-md'
    : 'bg-white border-purple-100 text-slate-800 shadow-[0_4px_20px_rgba(109,40,217,0.05)]';

  const subBoxStyle = isDark
    ? 'bg-slate-900/60 border-slate-800 text-slate-100'
    : 'bg-[#FAF9FE] border-purple-100 text-slate-900';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !fileName) return;
    setIsSubmitting(true);
    try {
      await submitTaskProof(selectedTask.id, selectedFile || fileName);
      setSelectedTask(null);
      setFileName('');
      setSelectedFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell title="Verification Tasks">
      <div className="p-4 space-y-4">

        {/* Hero Card */}
        <div className="bg-gradient-to-r from-purple-800 via-[#6D28D9] to-indigo-900 rounded-3xl p-5 text-white shadow-hero">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-200 block mb-1">
            TASK REWARDS & CLEARANCE
          </span>
          <h2 className="text-xl font-black flex items-center gap-2">
            Verification Task Center 🛡️
          </h2>
          <p className="text-xs text-purple-100 font-medium mt-1 leading-snug">
            Complete administrative tasks, upload your proof screenshots, and unlock exclusive rewards & full account clearance.
          </p>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className={`p-8 text-center rounded-3xl border text-xs ${cardStyle}`}>
              <ShieldCheck className="w-8 h-8 text-purple-500 mx-auto mb-2 opacity-60" />
              <p className="font-bold">No active verification tasks at the moment.</p>
              <p className="text-[11px] text-slate-400 mt-1">Check back later or trade normally!</p>
            </div>
          ) : (
            tasks.map((task) => {
              const rewardAmount = task.rewardInr || task.reward || 100;
              const isAvailable = task.status === 'AVAILABLE' || task.status === 'ACTIVE';

              return (
                <div key={task.id} className={`rounded-3xl p-5 border space-y-3 ${cardStyle}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                        Reward: +₹{rewardAmount}
                      </span>
                      <h3 className={`text-sm font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {task.title}
                      </h3>
                    </div>

                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                      task.status === 'SUBMITTED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      task.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {task.status === 'SUBMITTED' ? 'In Review' : task.status === 'APPROVED' ? 'Verified' : 'Active Task'}
                    </span>
                  </div>

                  <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {task.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <a
                      href={supportLinks.telegramChannel || 'https://t.me/thefampaychannel'}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200' 
                          : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <span>Open Task Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {isAvailable && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="flex-1 py-2.5 px-3 rounded-2xl bg-[#6D28D9] hover:bg-purple-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Proof</span>
                      </button>
                    )}

                    {task.status === 'SUBMITTED' && (
                      <div className="flex-1 py-2 px-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Proof In Review</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Upload Screenshot Proof Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleProofSubmit} className={`w-full max-w-xs rounded-3xl p-6 shadow-2xl space-y-4 border ${cardStyle}`}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 mb-2">
                <Image className="w-6 h-6" />
              </div>
              <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Upload Task Proof</h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Attach screenshot verifying task completion.
              </p>
            </div>

            <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors ${
              isDark ? 'border-slate-700 hover:border-purple-500 bg-slate-900/50' : 'border-slate-300 hover:border-[#6D28D9] bg-slate-50'
            }`}>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="hidden"
                id="task-file-input"
              />
              <label htmlFor="task-file-input" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-purple-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-purple-400 block truncate">
                  {fileName || 'Tap to Select Screenshot'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">JPG, PNG, or WebP</span>
              </label>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setSelectedTask(null); setFileName(''); setSelectedFile(null); }}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!fileName || isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#6D28D9] text-white text-xs font-extrabold hover:bg-purple-700 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Uploading...' : 'Submit Proof'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
};
