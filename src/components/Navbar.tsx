import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { HashTagLogo } from './HashTagLogo';
import {
  Shield,
  User,
  Wallet,
  PlusCircle,
  Copy,
  Check,
  ShoppingBag,
  KeyRound,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  LogOut,
  Sparkles,
  UserPlus,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'store' | 'unlocked' | 'wallet' | '2fa';
  setActiveTab: (tab: 'store' | 'unlocked' | 'wallet' | '2fa') => void;
  openDepositModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openDepositModal,
}) => {
  const {
    buyerProfile,
    activeView,
    switchView,
    currency,
    setCurrency,
    orders,
    deposits,
    isAdminLoggedIn,
    adminLogout,
    setIsAdminAuthModalOpen,
    isBuyerLoggedIn,
    currentBuyer,
    buyerLogout,
    openBuyerAuthModal,
  } = useStore();

  const [copiedUid, setCopiedUid] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const pendingDepositsCount = deposits.filter((d) => d.status === 'pending').length;
  const totalPendingAdmin = pendingOrdersCount + pendingDepositsCount;

  const unlockedCount = orders.filter((o) => o.status === 'completed' && o.unlockedAccount).length;

  const handleCopyUid = () => {
    navigator.clipboard.writeText(buyerProfile.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Banner with Perspective Switcher & Admin Control */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              LIVE MFS GATEWAY
            </span>
            <span className="hidden sm:inline text-slate-400">
              bKash • Nagad • Rocket • Binance Pay Instant Verification
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* ADMIN ACCESS CONTROLS (Discreet unlock button & session controls) */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
                <button
                  id="btn-switch-buyer"
                  onClick={() => switchView('buyer')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
                    activeView === 'buyer'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Switch to Store Buyer View"
                >
                  <User className="w-3 h-3" />
                  <span>Store</span>
                </button>
                <button
                  id="btn-switch-admin"
                  onClick={() => switchView('admin')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 relative ${
                    activeView === 'admin'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Open Admin Dashboard"
                >
                  <Shield className="w-3 h-3" />
                  <span>Dashboard</span>
                  {totalPendingAdmin > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                      {totalPendingAdmin}
                    </span>
                  )}
                </button>
                <button
                  id="btn-admin-logout"
                  onClick={adminLogout}
                  className="px-2 py-1 rounded text-xs font-medium text-slate-400 hover:bg-red-950/40 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Lock Session (লক করুন)"
                >
                  <LogOut className="w-3 h-3 text-red-400" />
                  <span>Lock</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-open-unlock-modal"
                onClick={() => setIsAdminAuthModalOpen(true)}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Admin Authentication (আনলক করুন)"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Admin Login</span>
              </button>
            )}

            {/* Currency Switcher */}
            <div className="inline-flex rounded-lg bg-slate-800/90 p-0.5 border border-slate-700">
              <button
                id="btn-curr-bdt"
                onClick={() => setCurrency('BDT')}
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  currency === 'BDT'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Bangladeshi Taka (BDT)"
              >
                ৳ BDT
              </button>
              <button
                id="btn-curr-usd"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  currency === 'USD'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="US Dollar (USD / USDT)"
              >
                $ USD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('store')}
              className="text-left cursor-pointer group transition-transform active:scale-95 flex items-center"
              title="Hash-Tag - Facebook BM & Ads Accounts Marketplace"
            >
              <HashTagLogo height={44} />
            </button>
            <div className="hidden lg:block pl-2 border-l border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                BM & Ads Marketplace
              </span>
            </div>
          </div>

          {/* Center Tabs (Visible in Buyer mode) */}
          {activeView === 'buyer' && (
            <nav className="hidden md:flex items-center space-x-1">
              <button
                id="nav-tab-store"
                onClick={() => setActiveTab('store')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'store'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Accounts</span>
              </button>

              <button
                id="nav-tab-unlocked"
                onClick={() => setActiveTab('unlocked')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
                  activeTab === 'unlocked'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Unlocked Accounts</span>
                {unlockedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                    {unlockedCount}
                  </span>
                )}
                {pendingOrdersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-wallet"
                onClick={() => setActiveTab('wallet')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'wallet'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span>Deposit & Wallet</span>
              </button>

              <button
                id="nav-tab-2fa"
                onClick={() => setActiveTab('2fa')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === '2fa'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>2FA Code Generator</span>
              </button>
            </nav>
          )}

          {/* Right: Buyer Authentication & Wallet Balance */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {isBuyerLoggedIn ? (
              /* Logged In Buyer Status */
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl p-1">
                <div
                  id="btn-buyer-profile-uid"
                  onClick={handleCopyUid}
                  className="flex items-center gap-1.5 hover:bg-slate-700/80 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                  title="আপনার ইউনিক বায়ার UID। কপি করতে ক্লিক করুন"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-bold text-emerald-400 leading-none">
                      {currentBuyer?.name ? currentBuyer.name.slice(0, 10) : 'Active UID'}
                    </div>
                    <div className="text-xs font-mono font-black text-blue-300">
                      {buyerProfile.uid}
                    </div>
                  </div>
                  {copiedUid ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                  )}
                </div>

                <button
                  id="btn-buyer-logout"
                  onClick={buyerLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                  title="লগআউট করুন (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Guest / Not Logged In: Login & Sign Up Actions */
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-nav-buyer-login"
                  onClick={() => openBuyerAuthModal('login')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                  title="বায়ার অ্যাকাউন্টে লগইন করুন"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>লগইন</span>
                </button>
                <button
                  id="btn-nav-buyer-signup"
                  onClick={() => openBuyerAuthModal('signup')}
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  title="নতুন UID দিয়ে অ্যাকাউন্ট সাইন আপ করুন"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>সাইন আপ</span>
                </button>
              </div>
            )}

            {/* Wallet Balance Pill */}
            <div className="flex items-center bg-gradient-to-r from-emerald-950/60 to-slate-800/80 border border-emerald-500/30 rounded-lg p-1">
              <div className="px-2 sm:px-2.5 py-0.5 text-right">
                <div className="text-[9px] text-emerald-400 font-medium leading-none">
                  Wallet Balance
                </div>
                <div className="text-xs sm:text-sm font-bold text-white font-mono">
                  {currency === 'BDT'
                    ? `৳${buyerProfile.balanceBDT.toLocaleString()}`
                    : `$${buyerProfile.balanceUSD.toFixed(2)}`}
                </div>
              </div>
              <button
                id="btn-quick-deposit"
                onClick={openDepositModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-md transition-colors shadow-sm"
                title="Deposit balance into wallet"
              >
                <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        {activeView === 'buyer' && (
          <div className="flex md:hidden items-center justify-between gap-1 py-2 border-t border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium ${
                activeTab === 'store' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              Store
            </button>
            <button
              onClick={() => setActiveTab('unlocked')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium flex items-center gap-1 ${
                activeTab === 'unlocked' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium ${
                activeTab === 'wallet' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setActiveTab('2fa')}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium ${
                activeTab === '2fa' ? 'bg-blue-600 text-white' : 'text-slate-300'
              }`}
            >
              2FA Code
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
