import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, Shield, Eye, EyeOff, KeyRound, AlertCircle, X, CheckCircle2 } from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const { isAdminAuthModalOpen, setIsAdminAuthModalOpen, adminLogin } = useStore();
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isAdminAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!passwordInput) {
      setErrorMsg('অনুগ্রহ করে অ্যাডমিন পাসওয়ার্ডটি প্রদান করুন (Please enter admin password).');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await adminLogin(passwordInput);
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          setPasswordInput('');
          setSuccessMsg('');
        }, 500);
      } else {
        setErrorMsg(result.message);
      }
    } catch {
      setErrorMsg('ভেরিফিকেশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setIsAdminAuthModalOpen(false);
    setPasswordInput('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-100">
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-admin-modal"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100 shadow-md">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Staff Authentication
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Security Gate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Access restricted to authorized personnel
            </p>
          </div>
        </div>

        {/* Info box explaining protection */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5 mb-5">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Shield className="w-3.5 h-3.5" />
            <span>সিকিউরিটি রেস্ট্রিকশন (Restricted Access)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            এই অ্যাডমিন প্যানেল সাধারণ ক্রেতা বা ভিজিটরদের কাছে সম্পূর্ণ অদৃশ্য ও সংরক্ষিত। ইনভেন্টরি, অর্ডার ভেরিফিকেশন ও পেমেন্ট নম্বর নিয়ন্ত্রণ করতে গোপন মাস্টার পাসওয়ার্ড প্রদান করুন।
          </p>
        </div>

        {/* Error / Success feedback */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 mb-4 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Master Admin Password</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন..."
                autoFocus
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              বাতিল (Cancel)
            </button>
            <button
              id="btn-submit-admin-unlock"
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>প্রবেশ করুন (Unlock)</span>
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            গোপন মাস্টার পাসওয়ার্ড শুধুমাত্র স্টোরের মালিকের কাছে সংরক্ষিত।
          </p>
        </div>
      </div>
    </div>
  );
};
