import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { useApp } from '../context/AppContext';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { loginUser, showToast, appName } = useApp();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        // 1. Check for OAuth error in URL hash or params
        const hash = window.location.hash || '';
        const params = new URLSearchParams(window.location.search);
        
        if (params.get('error') || hash.includes('error=')) {
          const errDesc = params.get('error_description') || 'Google sign-in was cancelled or encountered an error';
          if (isMounted) {
            setErrorMsg(errDesc);
            showToast(errDesc, 'error');
            setTimeout(() => navigate('/login', { replace: true }), 2500);
          }
          return;
        }

        // 2. Fetch Supabase OAuth Session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          // If session is still propagating, wait briefly and re-check once
          await new Promise(r => setTimeout(r, 1200));
          const retry = await supabase.auth.getSession();
          if (!retry.data?.session?.user) {
            if (isMounted) {
              setErrorMsg('Unable to retrieve Google session. Please try logging in again.');
              showToast('Authentication timed out. Please try again.', 'error');
              setTimeout(() => navigate('/login', { replace: true }), 2000);
            }
            return;
          }
        }

        const activeSession = session || (await supabase.auth.getSession()).data.session;
        const user = activeSession.user;

        // 3. Retrieve any pending referral code stored before redirect
        let pendingRef = '';
        try {
          pendingRef = localStorage.getItem('fampay_pending_ref') || '';
          localStorage.removeItem('fampay_pending_ref');
        } catch {
          // ignore
        }

        const meta = user.user_metadata || {};
        const email = user.email || '';
        const fullName = meta.full_name || meta.name || email.split('@')[0] || 'FamPay User';
        const avatar = meta.avatar_url || meta.picture || '';

        // 4. Synchronize with The FamPay Backend
        const res = await authService.googleSync({
          email,
          fullName,
          avatar,
          googleId: user.id,
          referralCode: pendingRef
        });

        if (res.success && res.user) {
          if (isMounted) {
            loginUser(res.user);
            showToast(res.message || `Welcome to ${appName}!`, 'success');
            navigate('/', { replace: true });
          }
        } else {
          if (isMounted) {
            setErrorMsg(res.message || 'Failed to link Google account.');
            showToast(res.message || 'Authentication error', 'error');
            setTimeout(() => navigate('/login', { replace: true }), 2500);
          }
        }
      } catch (err) {
        console.error('[Google Auth Callback Error]:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'An unexpected error occurred during Google Sign-In.');
          showToast('Authentication failed', 'error');
          setTimeout(() => navigate('/login', { replace: true }), 2500);
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate, loginUser, showToast, appName]);

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-sm bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 text-center border border-purple-500/20 shadow-2xl space-y-4">
        <img 
          src="/favicon.svg" 
          onError={(e) => { e.currentTarget.src = '/apple-touch-icon.png'; }}
          alt="The FamPay Logo" 
          className="w-16 h-16 rounded-2xl shadow-hero mx-auto object-contain border border-white/20 p-1 bg-purple-900/40" 
        />

        <div>
          <h2 className="text-lg font-black text-white">{appName} Auth</h2>
          <p className="text-xs text-slate-400 mt-1">Securing your session with Google...</p>
        </div>

        {errorMsg ? (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-purple-400 text-sm font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Verifying credentials...</span>
          </div>
        )}
      </div>
    </div>
  );
};

