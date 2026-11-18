import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';
import { Clock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PendingOrderAlert = () => {
  const { user, isDark } = useApp();
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    apiService.getActiveDepositOrder(user.id).then((res) => {
      if (res.success && res.order && res.order.status === 'RESERVED') {
        setActiveOrder(res.order);
      }
    });
  }, [user?.id]);

  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'RESERVED') return;
    const target = new Date(activeOrder.expiresAt).getTime();

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        clearInterval(interval);
        setActiveOrder(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  if (!activeOrder || timeLeft <= 0) return null;

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const timeFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="px-4 py-1.5 animate-in slide-in-from-top-2 duration-300">
      <div 
        onClick={() => navigate('/deposit')}
        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
          isDark 
            ? 'bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-purple-500/60 shadow-lg shadow-purple-950/40 text-white' 
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-300 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-amber-300">
                PENDING PURCHASE
              </span>
              <span className="font-mono text-[10px] font-bold text-purple-200">
                ({timeFormatted} left)
              </span>
            </div>
            <h4 className="text-xs font-black leading-tight mt-0.5">
              Order #{activeOrder.orderId} • ₹{activeOrder.packageAmount}
            </h4>
          </div>
        </div>

        <button className="px-3 py-1.5 rounded-xl bg-white text-purple-900 font-black text-xs shadow-xs active:scale-95 flex items-center gap-1 shrink-0">
          Continue Payment <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

