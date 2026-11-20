import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ActionBuy3D, ActionSell3D, ActionDeposit3D, ActionWithdraw3D } from '../common/Icons3D';

export const QuickActions = () => {
  const navigate = useNavigate();
  const { isDark } = useApp();

  const actions = [
    {
      label: 'Deposit',
      IconComponent: ActionDeposit3D,
      action: () => navigate('/deposit'),
    },
    {
      label: 'Withdraw',
      IconComponent: ActionWithdraw3D,
      action: () => navigate('/withdraw'),
    },
    {
      label: 'Buy Token',
      IconComponent: ActionBuy3D,
      action: () => navigate('/token?tab=buy'),
    },
    {
      label: 'Sell Token',
      IconComponent: ActionSell3D,
      action: () => navigate('/token?tab=sell'),
    },
  ];

  return (
    <div className="px-4 py-2">
      {/* Section Header with Live Exchange Badge */}
      <div className="flex items-center justify-between mb-2.5">
        <h3 className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Quick Actions & Trade
        </h3>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
          isDark 
            ? 'bg-purple-900/30 text-purple-400 border border-purple-800/40' 
            : 'bg-purple-50 text-[#6D28D9] border border-purple-200/80'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Exchange
        </span>
      </div>

      {/* 4 3D Action Buttons Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {actions.map((act) => {
          const IconComponent = act.IconComponent;
          return (
            <button
              key={act.label}
              onClick={act.action}
              className={`rounded-2xl p-2 sm:p-2.5 border flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all duration-200 group overflow-hidden ${
                isDark 
                  ? 'bg-[#121829] border-slate-800/80 shadow-md hover:border-slate-700' 
                  : 'bg-white border-[#F3F0FF] shadow-[0_6px_25px_rgba(109,40,217,0.05)] hover:shadow-md hover:border-purple-200'
              }`}
            >
              {/* Glossy 3D Custom Rendered SVG Icon */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center group-hover:scale-108 transition-transform duration-200">
                <IconComponent className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-sm" />
              </div>

              {/* Action Title */}
              <span className={`text-[10px] sm:text-[11px] font-black leading-tight text-center block ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
