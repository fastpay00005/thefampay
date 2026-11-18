import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { 
  AlertTriangle, 
  Power, 
  Clock, 
  CheckCircle2, 
  ShieldAlert,
  Save
} from 'lucide-react';

export const AdminMaintenancePage = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchMaintenance = async () => {
    try {
      const res = await apiService.adminGetMaintenance();
      if (res.success && res.maintenance) {
        setIsEnabled(Boolean(res.maintenance.isEnabled));
        setMessage(res.maintenance.message || 'System maintenance in progress. Normal operations will resume shortly.');
        setScheduledEnd(res.maintenance.scheduledEnd || '');
      }
    } catch (e) {
      console.error('Fetch maintenance error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiService.adminUpdateMaintenance({
        isEnabled,
        message: message.trim(),
        scheduledEnd: scheduledEnd || null
      });

      if (res.success) {
        setToastMessage(`Maintenance Mode ${isEnabled ? 'ACTIVATED' : 'DEACTIVATED'} successfully!`);
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        alert(res.message || 'Failed to update maintenance settings');
      }
    } catch {
      alert('Error saving maintenance settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">

        {/* Toast */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* Warning Banner if Enabled */}
        {isEnabled && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center gap-3 text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">MAINTENANCE MODE IS CURRENTLY ACTIVE!</span>
              Users visiting the platform will see the maintenance announcement and countdown timer.
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black">Maintenance Switch</h2>
              <p className="text-xs text-slate-400 mt-0.5">Toggle site-wide maintenance barrier</p>
            </div>

            <button
              type="button"
              onClick={() => setIsEnabled(!isEnabled)}
              className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 transition-all ${
                isEnabled 
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' 
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              {isEnabled ? 'ACTIVE (Enabled)' : 'OFF (Normal)'}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Announcement Message for Users
              </label>
              <textarea
                rows="3"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message displayed on user app..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Scheduled End Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                If provided, a live countdown timer will be shown to users until this timestamp.
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Maintenance Configuration'}
            </button>
          </form>
        </div>

      </div>
  );
};

