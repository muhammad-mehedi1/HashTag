import React, { useState, useId } from 'react';
import { useStore } from '../context/StoreContext';
import {
  User,
  Lock,
  UserPlus,
  LogIn,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Phone,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const BuyerAuthModal: React.FC = () => {
  const {
    isBuyerAuthModalOpen,
    setIsBuyerAuthModalOpen,
    buyerAuthModalMode,
    setBuyerAuthModalMode,
    buyerSignUp,
    buyerLogin,
    registeredUsers,
    paymentConfig,
  } = useStore();

  const [uidInput, setUidInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [contactInput, setContactInput] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const uidFieldId = useId();
  const passFieldId = useId();
  const confirmPassFieldId = useId();
  const nameFieldId = useId();
  const contactFieldId = useId();

  if (!isBuyerAuthModalOpen) return null;

  const cleanUid = uidInput.trim();
  const isUidTaken =
    cleanUid.length >= 3 &&
    registeredUsers.some((u) => u.uid.toLowerCase() === cleanUid.toLowerCase());

  const handleClose = () => {
    setIsBuyerAuthModalOpen(false);
    setErrorMessage('');
    setSuccessMessage('');
    setShowForgotNotice(false);
  };

  const handleSwitchMode = (mode: 'login' | 'signup') => {
    setBuyerAuthModalMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    setShowForgotNotice(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (buyerAuthModalMode === 'signup') {
        const res = await buyerSignUp(
          uidInput,
          passwordInput,
          confirmPasswordInput,
          nameInput,
          contactInput
        );
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            handleClose();
          }, 1200);
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await buyerLogin(uidInput, passwordInput);
        if (res.success) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            handleClose();
          }, 900);
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch {
      setErrorMessage('একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        id="buyer-auth-modal"
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-buyer-auth"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
            {buyerAuthModalMode === 'signup' ? (
              <UserPlus className="w-5 h-5" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {buyerAuthModalMode === 'signup' ? 'বায়ার সাইন আপ (Sign Up)' : 'বায়ার লগইন (Buyer Login)'}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Hash-Tag
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {buyerAuthModalMode === 'signup'
                ? 'আপনার ইউনিক UID ও পাসওয়ার্ড দিয়ে একাউন্ট তৈরি করুন'
                : 'আপনার UID ও পাসওয়ার্ড দিয়ে একাউন্টে প্রবেশ করুন'}
            </p>
          </div>
        </div>

        {/* Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-5">
          <button
            id="tab-mode-signup"
            type="button"
            onClick={() => handleSwitchMode('signup')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              buyerAuthModalMode === 'signup'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            সাইন আপ (New Account)
          </button>
          <button
            id="tab-mode-login"
            type="button"
            onClick={() => handleSwitchMode('login')}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              buyerAuthModalMode === 'login'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            লগইন (Sign In)
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 mb-4 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* UID Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={uidFieldId} className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                আপনার ইউনিক UID (Unique ID) <span className="text-red-400">*</span>
              </label>
              {buyerAuthModalMode === 'signup' && cleanUid.length >= 3 && (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    isUidTaken ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {isUidTaken ? (
                    <>
                      <AlertCircle className="w-3 h-3" /> ইতিমধ্যে ব্যবহৃত
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> UID ফাঁকা আছে
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id={uidFieldId}
                type="text"
                value={uidInput}
                onChange={(e) => setUidInput(e.target.value.replace(/\s+/g, ''))}
                placeholder="যেমন: agency_hq, buyer_rakib"
                className={`w-full px-3.5 py-2.5 bg-slate-950/70 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  buyerAuthModalMode === 'signup' && isUidTaken
                    ? 'border-red-500/60 focus:ring-red-500/30'
                    : 'border-slate-700/80 focus:ring-blue-500/30 focus:border-blue-500'
                }`}
                required
                autoFocus
              />
            </div>
            {buyerAuthModalMode === 'signup' && (
              <p className="text-[11px] text-slate-400 mt-1">
                ⚠️ একবার একটি UID দিলে অন্য কেউ আর তা ব্যবহার করতে পারবে না।
              </p>
            )}
          </div>

          {/* Optional Name & Contact on Sign Up */}
          {buyerAuthModalMode === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor={nameFieldId} className="block text-xs font-medium text-slate-300 mb-1">
                  নাম / এজেন্সির নাম (ঐচ্ছিক)
                </label>
                <input
                  id={nameFieldId}
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="যেমন: Rakib Hasan"
                  className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor={contactFieldId} className="block text-xs font-medium text-slate-300 mb-1">
                  ফোন / হোয়াটসঅ্যাপ (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <input
                    id={contactFieldId}
                    type="text"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password Input */}
          <div>
            <label htmlFor={passFieldId} className="block text-xs font-medium text-slate-300 mb-1.5">
              পাসওয়ার্ড (Password) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id={passFieldId}
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {buyerAuthModalMode === 'signup' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={confirmPassFieldId} className="text-xs font-medium text-slate-300">
                  কনফার্ম পাসওয়ার্ড (Confirm Password) <span className="text-red-400">*</span>
                </label>
                {confirmPasswordInput && (
                  <span
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      passwordInput === confirmPasswordInput ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {passwordInput === confirmPasswordInput ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> পাসওয়ার্ড মিলেছে
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" /> মিলছে না
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id={confirmPassFieldId}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="পাসওয়ার্ডটি পুনরায় লিখুন"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="btn-submit-buyer-auth"
            type="submit"
            disabled={isSubmitting || (buyerAuthModalMode === 'signup' && isUidTaken)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : buyerAuthModalMode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                অ্যাকাউন্ট তৈরি করুন (Sign Up)
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                লগইন করুন (Sign In)
              </>
            )}
          </button>
        </form>

        {/* Password Recovery Assistance for Buyers */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          {buyerAuthModalMode === 'login' ? (
            <div>
              <button
                id="btn-toggle-forgot-pass"
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-slate-800/60"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  পাসওয়ার্ড ভুলে গেছেন? (Forgot Password?)
                </span>
                <span className="text-[11px] text-blue-400 underline">
                  {showForgotNotice ? 'লুকান' : 'সহায়তা দেখুন'}
                </span>
              </button>

              {showForgotNotice && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>অ্যাডমিনের মাধ্যমে পাসওয়ার্ড উদ্ধার:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    আমাদের সিস্টেমে আপনার সুরক্ষার জন্য প্রতিটি ইউজারের পাসওয়ার্ড অ্যাডমিন প্যানেলে সংরক্ষিত থাকে। আপনি পাসওয়ার্ড ভুলে গেলে অ্যাডমিনকে আপনার <strong className="text-white">UID</strong> বললে অ্যাডমিন প্যানেলের <strong className="text-blue-400">User List</strong> থেকে পাসওয়ার্ডটি যাচাই করে সাথে সাথে আপনাকে জানিয়ে দেওয়া হবে।
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2">
                    {paymentConfig.telegramSupport && (
                      <a
                        href={paymentConfig.telegramSupport}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-[11px] font-medium border border-sky-500/30"
                      >
                        টেলিগ্রাম অ্যাডমিন সাপোর্ট
                      </a>
                    )}
                    {paymentConfig.whatsappSupport && (
                      <a
                        href={paymentConfig.whatsappSupport}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-medium border border-emerald-500/30"
                      >
                        হোয়াটসঅ্যাপ সাপোর্ট
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="text-blue-400 font-semibold hover:underline"
              >
                লগইন করুন
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
