import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { AccountCard } from './components/AccountCard';
import { CheckoutModal } from './components/CheckoutModal';
import { DepositModal } from './components/DepositModal';
import { UnlockedAccountCard } from './components/UnlockedAccountCard';
import { TwoFactorTool } from './components/TwoFactorTool';
import { AdminPanel } from './components/AdminPanel';
import { AdminAuthModal } from './components/AdminAuthModal';
import { BMAccount } from './types';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Zap,
  ArrowRight,
  Shield,
  HelpCircle,
  KeyRound,
  Mail,
  Cookie,
  Lock,
} from 'lucide-react';

function MarketplaceApp() {
  const {
    accounts,
    orders,
    activeView,
    currency,
    buyerProfile,
    switchView,
    isAdminLoggedIn,
    setIsAdminAuthModalOpen,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'store' | 'unlocked' | 'wallet' | '2fa'>('store');
  const [selectedAccountForBuy, setSelectedAccountForBuy] = useState<BMAccount | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Search & Filter in Buyer Store
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | '2k' | '250' | 'available'>('all');

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.accountId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.verifiedStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.notes.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === '2k') {
      return acc.verifiedStatus.includes('2k');
    }
    if (categoryFilter === '250') {
      return acc.verifiedStatus.includes('250');
    }
    if (categoryFilter === 'available') {
      return acc.status === 'Available';
    }
    return true;
  });

  const availableCount = accounts.filter((a) => a.status === 'Available').length;
  const unlockedOrders = orders.filter((o) => o.status === 'completed' && o.unlockedAccount);
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openDepositModal={() => setIsDepositModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: ADMIN PANEL (Restricted strictly to authenticated session) */}
        {activeView === 'admin' ? (
          isAdminLoggedIn ? (
            <AdminPanel />
          ) : (
            <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center shadow-2xl space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-lg">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Restricted Area</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                This area requires authorization. Please verify credentials to continue.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  id="btn-gate-enter-password"
                  onClick={() => setIsAdminAuthModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  Verify Authorization
                </button>
                <button
                  onClick={() => switchView('buyer')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Return to Store
                </button>
              </div>
            </div>
          )
        ) : (
          /* VIEW 2: BUYER PORTAL */
          <div>
            {/* SUB-TAB 1: STORE / CATALOG */}
            {activeTab === 'store' && (
              <div className="space-y-8">
                {/* Hero Header */}
                <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="max-w-3xl space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>OFFICIAL FACEBOOK BUSINESS MANAGER STORE</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                      Buy Verified BM Accounts with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">bKash, Nagad & Binance</span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                      Instant credentials unlock upon Transaction ID matching. Every BM account comes complete with 2FA secret key, session cookies, and dedicated Outlook/Hotmail webmail credentials.
                    </p>

                    {/* Features Strip */}
                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
                      <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>2K & $250 Daily Limit BMs</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <span>Live 2FA Authenticator Code</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                        <Mail className="w-4 h-4 text-indigo-400" />
                        <span>Outlook Webmail Login</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span>MFS TrxID Auto-Matching</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        categoryFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      All BMs ({accounts.length})
                    </button>
                    <button
                      onClick={() => setCategoryFilter('available')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        categoryFilter === 'available'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      In Stock Only ({availableCount})
                    </button>
                    <button
                      onClick={() => setCategoryFilter('2k')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        categoryFilter === '2k'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      2K Verified BM
                    </button>
                    <button
                      onClick={() => setCategoryFilter('250')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        categoryFilter === '250'
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      250 Limit BM
                    </button>
                  </div>

                  {/* Search Box */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      id="input-search-accounts"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search account ID, limit, outlook..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Account Grid */}
                {filteredAccounts.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
                    <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">No accounts found</h3>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search query or switching filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        onSelectBuy={(acc) => setSelectedAccountForBuy(acc)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: UNLOCKED ACCOUNTS & ORDERS */}
            {activeTab === 'unlocked' && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">My Unlocked Accounts & Orders</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Buyer UID: <span className="text-blue-300 font-mono font-bold">{buyerProfile.uid}</span> • Credentials reveal automatically after payment matching.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('store')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Browse More Accounts</span>
                  </button>
                </div>

                {/* Pending Verification Notice */}
                {pendingOrders.length > 0 && (
                  <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                      <h4 className="text-sm font-bold text-amber-300">
                        {pendingOrders.length} Order(s) Awaiting Transaction ID Matching
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {pendingOrders.map((po) => (
                        <div
                          key={po.id}
                          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
                        >
                          <div>
                            <span className="text-white font-bold">Order #{po.id}</span> •{' '}
                            <span className="text-slate-300">{po.accountTitle}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">
                              TrxID: <strong className="text-emerald-400">{po.trxId}</strong>
                            </span>
                            <span className="text-amber-400 font-sans font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                              Matching in progress...
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      💡 Tip: If you are testing as admin or seller, switch to <strong>"Admin / Seller Panel"</strong> at the top to enter or confirm this Transaction ID and watch it unlock instantly!
                    </p>
                  </div>
                )}

                {/* Unlocked Accounts List */}
                {unlockedOrders.length === 0 && pendingOrders.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">No Unlocked Accounts Yet</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        When you purchase a BM account using your wallet or MFS (bKash/Nagad/Rocket/Binance), your full credentials and 2FA generator will show up here.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('store')}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                      Browse Available Accounts
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {unlockedOrders.map((order) => (
                      <UnlockedAccountCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: WALLET & DEPOSIT */}
            {activeTab === 'wallet' && (
              <div className="max-w-4xl mx-auto">
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>BUYER UNIQUE ID & WALLET</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Customer ID: <span className="font-mono font-bold text-blue-300">{buyerProfile.uid}</span>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Current Balance</div>
                        <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5">
                          ৳{buyerProfile.balanceBDT.toLocaleString()} BDT{' '}
                          <span className="text-base text-emerald-400 font-normal">
                            (${buyerProfile.balanceUSD.toFixed(2)} USD)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      id="btn-deposit-open"
                      onClick={() => setIsDepositModalOpen(true)}
                      className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Deposit Balance via MFS / Binance</span>
                    </button>
                  </div>
                </div>

                {/* How to deposit steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div className="text-xs font-bold text-white">Send MFS / Binance Payment</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      Choose bKash, Nagad, Rocket, or Binance Pay and send funds to admin number.
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div className="text-xs font-bold text-white">Submit TrxID & Amount</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      Enter your Sender Number & TrxID into the deposit form.
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div className="text-xs font-bold text-white">Instant Account Purchases</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      Use wallet balance to buy and unlock BM accounts in 1-click anytime!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: 2FA CODE GENERATOR TOOL */}
            {activeTab === '2fa' && <TwoFactorTool />}
          </div>
        )}
      </main>

      {/* MODALS */}
      {selectedAccountForBuy && (
        <CheckoutModal
          account={selectedAccountForBuy}
          onClose={() => setSelectedAccountForBuy(null)}
          onSuccessNavigate={() => setActiveTab('unlocked')}
          openDepositModal={() => {
            setSelectedAccountForBuy(null);
            setIsDepositModalOpen(true);
          }}
        />
      )}

      {isDepositModalOpen && (
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />
      )}

      {/* Admin Authentication Security Modal */}
      <AdminAuthModal />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <span className="text-[#00c853]">Hash-Tag</span>
              <span className="text-slate-400 text-[11px] font-medium">(হ্যাশ ট্যাগ)</span>
            </span>
            <span>• Verified Facebook Business Manager Marketplace</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>bKash</span>
            <span>•</span>
            <span>Nagad</span>
            <span>•</span>
            <span>Rocket</span>
            <span>•</span>
            <span>Binance Pay (USDT)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Secure Automated Checkout</span>
            <span>•</span>
            <button
              id="footer-btn-owner-portal"
              onClick={() => {
                if (isAdminLoggedIn) {
                  switchView(activeView === 'admin' ? 'buyer' : 'admin');
                } else {
                  setIsAdminAuthModalOpen(true);
                }
              }}
              className="text-slate-500 hover:text-amber-400 transition-colors inline-flex items-center gap-1 cursor-pointer font-medium"
              title="Store Owner Access"
            >
              <Lock className="w-3 h-3" />
              <span>{isAdminLoggedIn ? 'Open Admin Panel' : 'Staff Portal'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MarketplaceApp />
    </StoreProvider>
  );
}
