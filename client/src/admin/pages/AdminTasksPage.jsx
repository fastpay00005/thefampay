import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { apiService } from '../../services/apiService';
import { ShieldCheck, Check, Clock, Image, ExternalLink, Plus, X, FileText } from 'lucide-react';

export const AdminTasksPage = () => {
  const { isDark } = useAdminTheme();
  const { showToast } = useApp();

  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedProofUrl, setSelectedProofUrl] = useState(null);

  // New Task Form
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReward, setNewReward] = useState('200');

  const loadData = async () => {
    try {
      const res = await apiService.adminGetTasks();
      if (res.success) {
        setTasks(res.tasks || []);
        setSubmissions(res.submissions || []);
      }
    } catch (err) {
      console.warn('Failed to fetch tasks:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveSubmission = async (subId) => {
    try {
      const res = await apiService.adminUpdateSubmissionStatus(subId, 'APPROVED');
      if (res.success) {
        showToast('Task proof approved & reward credited to user balance!', 'success');
        loadData();
      }
    } catch {
      showToast('Approval failed', 'error');
    }
  };

  const handleRejectSubmission = async (subId) => {
    try {
      const res = await apiService.adminUpdateSubmissionStatus(subId, 'REJECTED');
      if (res.success) {
        showToast('Task submission rejected', 'info');
        loadData();
      }
    } catch {
      showToast('Rejection failed', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    try {
      const res = await apiService.adminAddTask({
        title: newTitle,
        description: newDesc,
        rewardInr: Number(newReward)
      });
      if (res.success) {
        showToast('New verification task published!', 'success');
        setShowNewTaskModal(false);
        setNewTitle('');
        setNewDesc('');
        loadData();
      }
    } catch {
      showToast('Failed to create task', 'error');
    }
  };

  const cardStyle = isDark
    ? 'bg-[#111C44] border-slate-800 shadow-md text-white'
    : 'bg-white border-slate-200/90 shadow-xs text-slate-800';

  const inputStyle = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <span>Community Tasks & Proof Review</span>
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Audit user screenshot submissions and publish promotional verification tasks
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Task</span>
        </button>
      </div>

      {/* Submissions Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Pending & Recent Proof Submissions ({submissions.length})</span>
        </h3>

        {submissions.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border text-xs text-slate-400 ${cardStyle}`}>
            No task proof submissions currently awaiting review.
          </div>
        ) : (
          submissions.map((sub) => (
            <div 
              key={sub.id} 
              className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all ${cardStyle}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">{sub.userName || sub.userId}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    sub.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' :
                    sub.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' :
                    'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono block">
                  Task ID: {sub.taskId} • {new Date(sub.submittedAt || Date.now()).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {sub.proofUrl && (
                  <button
                    onClick={() => setSelectedProofUrl(sub.proofUrl)}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20' 
                        : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    <Image className="w-3.5 h-3.5" />
                    <span>View Screenshot</span>
                  </button>
                )}

                {sub.status === 'PENDING' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                      onClick={() => handleRejectSubmission(sub.id)}
                      className={`flex-1 sm:flex-initial text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center justify-center gap-1 active:scale-95 ${
                        isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApproveSubmission(sub.id)}
                      className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Credit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Published Tasks Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Active Tasks ({tasks.length})</span>
        </h3>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className={`p-4 sm:p-5 rounded-2xl border space-y-2 ${cardStyle}`}>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block mb-1 ${
                    isDark ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    Reward: ₹{task.rewardInr || task.reward || 200}
                  </span>
                  <h3 className="text-sm font-black">{task.title}</h3>
                  <p className={`text-xs mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{task.description}</p>
                </div>

                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shrink-0">
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: View Screenshot */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl p-5 max-w-lg w-full space-y-3 border shadow-2xl ${
            isDark ? 'bg-[#0D1527] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black">Submitted Proof</h3>
              <button onClick={() => setSelectedProofUrl(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[70vh] overflow-auto rounded-xl bg-black/50 flex items-center justify-center p-2">
              <img src={selectedProofUrl} alt="Task Proof" className="max-h-[60vh] max-w-full object-contain rounded-lg" />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <a
                href={selectedProofUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <span>Open Full Size</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Task */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateTask} 
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 ${
              isDark ? 'bg-[#0D1527] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black">Publish New Verification Task</h3>
              <button type="button" onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow VIP Telegram Channel"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputStyle}`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Description & Instructions</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Join the channel and upload a screenshot of your joined status."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border ${inputStyle}`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Reward Amount (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border font-mono ${inputStyle}`}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-700 shadow-md active:scale-95"
              >
                Publish Task
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
