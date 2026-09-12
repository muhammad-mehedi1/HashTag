import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BMAccount, PaymentGatewayConfig, AccountLimitType, Order, DepositRequest } from '../types';
import { AdminUserList } from './AdminUserList';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Save,
  RotateCcw,
  Zap,
  KeyRound,
  Download,
  Upload,
  AlertCircle,
  Clock,
  Send,
  Eye,
  Settings,
  Check,
  Lock,
  LogOut,
  Users,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    accounts,
    orders,
    deposits,
    paymentConfig,
    registeredUsers,
    matchAndVerifyTrxId,
    approveOrder,
    rejectOrder,
    approveDeposit,
    rejectDeposit,
    addAccount,
    updateAccount,
    deleteAccount,
    updatePaymentConfig,
    resetToDefaultData,
    switchView,
    adminLogout,
    changeAdminPassword,
  } = useStore();

  // Admin Active Tab
  const [adminTab, setAdminTab] = useState<'matching' | 'orders' | 'deposits' | 'inventory' | 'users' | 'settings'>('matching');

  // Admin Password Change state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ success: boolean; message: string } | null>(null);

  // TrxID Matching input
  const [adminInputTrxId, setAdminInputTrxId] = useState('');
  const [matchNotification, setMatchNotification] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Cross-verify modal
  const [verifyModalOrder, setVerifyModalOrder] = useState<Order | null>(null);
  const [crossVerifyInput, setCrossVerifyInput] = useState('');
  const [crossVerifyError, setCrossVerifyError] = useState('');

  // Add Account Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState<Omit<BMAccount, 'id'>>({
    accountId: '',
    title: '',
    password: '',
    verifiedStatus: '2k Verified',
    dailyLimit: '$2,000 / Day',
    cookies: '',
    outlookCookies: '',
    twoFactorSecret: '',
    priceUSD: 16,
    priceBDT: 2000,
    status: 'Available',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    features: ['2K Daily Spend Limit', '2FA Authenticator', 'Full Outlook Mail Login', 'Cookies Included'],
  });

  // Gateway config form state
  const [configForm, setConfigForm] = useState<PaymentGatewayConfig>(paymentConfig);
  const [configSavedToast, setConfigSavedToast] = useState(false);

  // Search & Filter in Inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'all' | 'Available' | 'Sold'>('all');

  // Analytics calculations matching user's CSV data
  const totalInventory = accounts.length;
  const soldAccounts = accounts.filter((a) => a.status === 'Sold').length;
  const availableStock = accounts.filter((a) => a.status === 'Available').length;
  const available2k = accounts.filter((a) => a.status === 'Available' && a.verifiedStatus.includes('2k')).length;
  const available250 = accounts.filter((a) => a.status === 'Available' && a.verifiedStatus.includes('250')).length;
  const sold2k = accounts.filter((a) => a.status === 'Sold' && a.verifiedStatus.includes('2k')).length;
  const sold250 = accounts.filter((a) => a.status === 'Sold' && a.verifiedStatus.includes('250')).length;

  const totalRevenueBDT = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.amountBDT, 0);

  const totalRevenueUSD = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.amountUSD, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');

  // Handle Match Transaction ID input
  const handlePerformMatch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminInputTrxId.trim()) return;

    const result = matchAndVerifyTrxId(adminInputTrxId);
    setMatchNotification({
      success: result.matched,
      message: result.message,
    });

    if (result.matched) {
      setAdminInputTrxId('');
    }
  };

  // Handle Cross Verification
  const handleConfirmCrossVerify = () => {
    if (!verifyModalOrder) return;
    setCrossVerifyError('');

    const adminVal = crossVerifyInput.trim().toUpperCase();
    const buyerVal = verifyModalOrder.trxId.trim().toUpperCase();

    if (adminVal !== buyerVal) {
      setCrossVerifyError(`Mismatch! Buyer submitted: "${buyerVal}", but you entered: "${adminVal}". Please check your SMS.`);
      return;
    }

    approveOrder(verifyModalOrder.id, adminVal);
    setVerifyModalOrder(null);
    setCrossVerifyInput('');
    setMatchNotification({
      success: true,
      message: `✅ Order #${verifyModalOrder.id} successfully matched and unlocked for buyer ${verifyModalOrder.buyerUid}!`,
    });
  };

  // Save Gateway settings
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentConfig(configForm);
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 3000);
  };

  // Change Admin Master Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!currentPwd) {
      setPwdMsg({ success: false, message: 'Please enter your current admin password.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ success: false, message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPwd.length < 4) {
      setPwdMsg({ success: false, message: 'New password must be at least 4 characters long.' });
      return;
    }

    try {
      const res = await changeAdminPassword(currentPwd, newPwd);
      setPwdMsg(res);
      if (res.success) {
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
        setTimeout(() => setPwdMsg(null), 4000);
      }
    } catch {
      setPwdMsg({ success: false, message: 'Failed to update password.' });
    }
  };

  // Save Account (Add or Edit)
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccountId) {
      updateAccount(editingAccountId, accountForm);
    } else {
      addAccount(accountForm);
    }
    setIsAddModalOpen(false);
    setEditingAccountId(null);
  };

  // Edit existing account
  const handleOpenEditAccount = (acc: BMAccount) => {
    setEditingAccountId(acc.id);
    setAccountForm({
      accountId: acc.accountId,
      title: acc.title,
      password: acc.password,
      verifiedStatus: acc.verifiedStatus,
      dailyLimit: acc.dailyLimit,
      cookies: acc.cookies,
      outlookCookies: acc.outlookCookies,
      twoFactorSecret: acc.twoFactorSecret,
      priceUSD: acc.priceUSD,
      priceBDT: acc.priceBDT,
      status: acc.status,
      date: acc.date,
      notes: acc.notes,
      features: acc.features,
    });
    setIsAddModalOpen(true);
  };

  // Filtered inventory list
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.accountId.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      acc.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      acc.verifiedStatus.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesStatus =
      inventoryStatusFilter === 'all' ? true : acc.status === inventoryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Protected Session Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 shadow-sm">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Admin Management Portal</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Secure authenticated session active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => switchView('buyer')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Preview Store View</span>
          </button>
          <button
            id="btn-admin-panel-lock-top"
            onClick={adminLogout}
            className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-500/30 text-red-200 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Lock Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock & Logout</span>
          </button>
        </div>
      </div>

      {/* Top Banner with Stats matching user's CSV */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SELLER DASHBOARD
              </span>
              <span className="text-xs text-slate-400 font-mono">Date: 2026-09-12</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">Facebook BM Inventory & MFS Matcher</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefaultData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Reset inventory to initial 12+ real records from CSV"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset CSV Data</span>
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Total Inventory</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">{totalInventory}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-emerald-400 font-medium">Available Stock</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{availableStock}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-blue-400 font-medium">Sold Accounts</div>
            <div className="text-xl font-black text-blue-400 font-mono mt-0.5">{soldAccounts}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-purple-400 font-medium">Total Revenue</div>
            <div className="text-xl font-black text-purple-300 font-mono mt-0.5">৳{totalRevenueBDT.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 font-mono">${totalRevenueUSD.toFixed(0)} USD</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-amber-400 font-medium">2K In Stock</div>
            <div className="text-xl font-black text-amber-300 font-mono mt-0.5">{available2k}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-cyan-400 font-medium">250 Limit Stock</div>
            <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">{available250}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] text-rose-400 font-medium">Pending Matches</div>
            <div className="text-xl font-black text-rose-400 font-mono mt-0.5">
              {pendingOrders.length + pendingDeposits.length}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setAdminTab('matching')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            adminTab === 'matching'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>⚡ TrxID Matcher Station</span>
          {pendingOrders.length + pendingDeposits.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
              {pendingOrders.length + pendingDeposits.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            adminTab === 'orders'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Customer Orders ({orders.length})</span>
          {pendingOrders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('deposits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            adminTab === 'deposits'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Wallet Deposits ({deposits.length})</span>
          {pendingDeposits.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
              {pendingDeposits.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            adminTab === 'inventory'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>BM Inventory ({accounts.length})</span>
        </button>

        <button
          id="tab-admin-users"
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            adminTab === 'users'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User List ({registeredUsers.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            adminTab === 'settings'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Payment Gateway Config</span>
        </button>
      </div>

      {/* MATCH NOTIFICATION BANNER */}
      {matchNotification && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between gap-3 ${
            matchNotification.success
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {matchNotification.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{matchNotification.message}</span>
          </div>
          <button
            onClick={() => setMatchNotification(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: TRANSACTION ID MATCHING STATION */}
      {adminTab === 'matching' && (
        <div className="space-y-6">
          {/* Big Matcher Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                  <h3 className="text-lg font-black text-white">
                    Live Transaction ID Verification & Auto-Unlock
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  When a buyer pays via bKash, Nagad, Rocket, or Binance, they submit their TrxID. Enter or paste the Transaction ID you received on your SMS or Binance App here. If it matches, the account unlocks for the buyer immediately!
                </p>
              </div>
            </div>

            <form onSubmit={handlePerformMatch} className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="input-admin-match-trx"
                  value={adminInputTrxId}
                  onChange={(e) => setAdminInputTrxId(e.target.value.toUpperCase())}
                  placeholder="Paste or Enter TrxID (e.g. 9K3LM7PQ or BL987621)..."
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold text-base focus:outline-none focus:border-amber-500 tracking-wider uppercase"
                />
                {adminInputTrxId && (
                  <button
                    type="button"
                    onClick={() => setAdminInputTrxId('')}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                id="btn-admin-match-action"
                className="px-6 py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-950/50 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Verify & Match TrxID</span>
              </button>
            </form>
          </div>

          {/* Pending Queue Tables */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Buyer Payment Submissions Waiting for Matching ({pendingOrders.length + pendingDeposits.length})</span>
            </h4>

            {pendingOrders.length === 0 && pendingDeposits.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
                🎉 No pending transactions! All buyer orders and deposits are currently matched and verified.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Orders */}
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-wrap items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                          Account Buy ({order.accountType})
                        </span>
                        <span className="text-xs font-mono font-bold text-white">Order #{order.id}</span>
                        <span className="text-xs text-slate-400 font-mono">Buyer: {order.buyerUid}</span>
                      </div>
                      <div className="text-xs text-slate-300">
                        Item: <strong className="text-white">{order.accountTitle}</strong>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        <span>Method: <strong className="text-slate-200 uppercase">{order.paymentMethod}</strong></span>
                        <span>Sender: <strong className="text-slate-200 font-mono">{order.senderNumberOrId}</strong></span>
                        <span>
                          TrxID:{' '}
                          <button
                            onClick={() => setAdminInputTrxId(order.trxId)}
                            className="font-mono font-bold text-emerald-400 hover:underline bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                            title="Click to copy into matcher input"
                          >
                            {order.trxId}
                          </button>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-white font-mono">
                          {order.currencyPaid === 'BDT' ? `৳${order.amountBDT.toLocaleString()}` : `$${order.amountUSD}`}
                        </div>
                        <div className="text-[10px] text-amber-400">Pending Match</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setVerifyModalOrder(order);
                            setCrossVerifyInput('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Match & Unlock</span>
                        </button>
                        <button
                          onClick={() => rejectOrder(order.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 text-xs transition-colors"
                          title="Reject order"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Deposits */}
                {pendingDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-4 rounded-xl bg-slate-900 border border-emerald-900/30 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                          Wallet Deposit
                        </span>
                        <span className="text-xs font-mono font-bold text-white">Deposit #{dep.id}</span>
                        <span className="text-xs text-slate-400 font-mono">Buyer: {dep.buyerUid}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        <span>Method: <strong className="text-slate-200 uppercase">{dep.paymentMethod}</strong></span>
                        <span>Sender: <strong className="text-slate-200 font-mono">{dep.senderNumberOrId}</strong></span>
                        <span>
                          TrxID:{' '}
                          <button
                            onClick={() => setAdminInputTrxId(dep.trxId)}
                            className="font-mono font-bold text-emerald-400 hover:underline bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                            title="Click to copy into matcher input"
                          >
                            {dep.trxId}
                          </button>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400 font-mono">
                          ৳{dep.amountBDT.toLocaleString()} (${dep.amountUSD})
                        </div>
                        <div className="text-[10px] text-slate-400">Waiting approval</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => approveDeposit(dep.id, dep.trxId)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Deposit</span>
                        </button>
                        <button
                          onClick={() => rejectDeposit(dep.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 text-xs transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER ORDERS LIST */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">All Orders History</h3>
            <span className="text-xs text-slate-400">Total: {orders.length} orders</span>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Buyer UID</th>
                    <th className="p-3">Account Title</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Sender Contact</th>
                    <th className="p-3">Submitted TrxID</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{o.id}</td>
                      <td className="p-3 font-mono text-blue-300">{o.buyerUid}</td>
                      <td className="p-3 max-w-[200px] truncate font-medium text-slate-200">
                        {o.accountTitle}
                      </td>
                      <td className="p-3 uppercase font-semibold text-slate-300">{o.paymentMethod}</td>
                      <td className="p-3 font-mono text-slate-300">{o.senderNumberOrId}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{o.trxId}</td>
                      <td className="p-3 font-mono text-white">
                        {o.currencyPaid === 'BDT' ? `৳${o.amountBDT.toLocaleString()}` : `$${o.amountUSD}`}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : o.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {o.status === 'pending' && (
                          <button
                            onClick={() => approveOrder(o.id, o.trxId)}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Approve
                          </button>
                        )}
                        {o.status === 'completed' && o.unlockedAccount && (
                          <span className="text-[10px] text-emerald-400 font-mono">Credentials Unlocked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WALLET DEPOSITS LIST */}
      {adminTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Wallet Deposits Queue & Logs</h3>
            <span className="text-xs text-slate-400">Total: {deposits.length} requests</span>
          </div>

          {deposits.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              No deposit requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Deposit ID</th>
                    <th className="p-3">Buyer UID</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Sender Contact</th>
                    <th className="p-3">TrxID</th>
                    <th className="p-3">Amount BDT</th>
                    <th className="p-3">Amount USD</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{d.id}</td>
                      <td className="p-3 font-mono text-emerald-300">{d.buyerUid}</td>
                      <td className="p-3 uppercase font-semibold text-slate-300">{d.paymentMethod}</td>
                      <td className="p-3 font-mono text-slate-300">{d.senderNumberOrId}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{d.trxId}</td>
                      <td className="p-3 font-mono text-white">৳{d.amountBDT.toLocaleString()}</td>
                      <td className="p-3 font-mono text-slate-400">${d.amountUSD}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : d.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {d.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveDeposit(d.id, d.trxId)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectDeposit(d.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-red-900 text-slate-400 text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BM INVENTORY MANAGEMENT */}
      {adminTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search account ID, limit, status..."
                  className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 w-56 sm:w-64"
                />
              </div>

              <select
                value={inventoryStatusFilter}
                onChange={(e) => setInventoryStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="Available">Available (In Stock)</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingAccountId(null);
                setAccountForm({
                  accountId: '',
                  title: '',
                  password: '',
                  verifiedStatus: '2k Verified',
                  dailyLimit: '$2,000 / Day',
                  cookies: '',
                  outlookCookies: '',
                  twoFactorSecret: '',
                  priceUSD: 25,
                  priceBDT: 3100,
                  status: 'Available',
                  date: new Date().toISOString().split('T')[0],
                  notes: '',
                  features: ['2K Daily Spend Limit', '2FA Authenticator', 'Full Outlook Mail Login'],
                });
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-purple-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add New BM Account</span>
            </button>
          </div>

          {/* Accounts Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">BM Account ID</th>
                  <th className="p-3">Type & Limit</th>
                  <th className="p-3">Password</th>
                  <th className="p-3">2FA Secret</th>
                  <th className="p-3">Outlook / Cookies</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="font-mono font-bold text-white select-all">{acc.accountId}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{acc.title}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                        {acc.verifiedStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300 select-all">{acc.password}</td>
                    <td className="p-3 font-mono text-amber-300 text-[11px] max-w-[130px] truncate select-all">
                      {acc.twoFactorSecret || 'None'}
                    </td>
                    <td className="p-3 text-[11px] max-w-[180px] truncate text-slate-400 select-all">
                      {acc.outlookCookies || acc.cookies || 'Standard'}
                    </td>
                    <td className="p-3 font-mono font-bold text-white">
                      ৳{acc.priceBDT} (${acc.priceUSD})
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          acc.status === 'Available'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditAccount(acc)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Edit Account"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: USER LIST & CREDENTIALS (ADMIN ONLY) */}
      {adminTab === 'users' && <AdminUserList />}

      {/* TAB 5: GATEWAY CONFIGURATION */}
      {adminTab === 'settings' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Payment Numbers & Gateway Settings</h3>
              <p className="text-xs text-slate-400">
                Update the payment numbers that buyers see when checking out with bKash, Nagad, Rocket, or Binance.
              </p>
            </div>
            {configSavedToast && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            {/* bKash */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-pink-400">bKash Account Number</label>
                <select
                  value={configForm.bkash.type}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      bkash: { ...configForm.bkash, type: e.target.value as any },
                    })
                  }
                  className="text-xs bg-slate-900 border border-slate-700 text-white rounded px-2 py-0.5"
                >
                  <option value="Personal">Personal</option>
                  <option value="Merchant">Merchant</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>
              <input
                type="text"
                value={configForm.bkash.number}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    bkash: { ...configForm.bkash, number: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
              />
            </div>

            {/* Nagad */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-orange-400">Nagad Account Number</label>
                <select
                  value={configForm.nagad.type}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      nagad: { ...configForm.nagad, type: e.target.value as any },
                    })
                  }
                  className="text-xs bg-slate-900 border border-slate-700 text-white rounded px-2 py-0.5"
                >
                  <option value="Personal">Personal</option>
                  <option value="Merchant">Merchant</option>
                </select>
              </div>
              <input
                type="text"
                value={configForm.nagad.number}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    nagad: { ...configForm.nagad, number: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
              />
            </div>

            {/* Rocket */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-400">Rocket Account Number</label>
                <select
                  value={configForm.rocket.type}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      rocket: { ...configForm.rocket, type: e.target.value as any },
                    })
                  }
                  className="text-xs bg-slate-900 border border-slate-700 text-white rounded px-2 py-0.5"
                >
                  <option value="Personal">Personal</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>
              <input
                type="text"
                value={configForm.rocket.number}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    rocket: { ...configForm.rocket, number: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
              />
            </div>

            {/* Binance */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-yellow-400 block">Binance Pay & USDT Details</label>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-slate-400">Binance Pay ID:</span>
                  <input
                    type="text"
                    value={configForm.binance.payId}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        binance: { ...configForm.binance, payId: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">USDT Wallet Address (TRC20):</span>
                  <input
                    type="text"
                    value={configForm.binance.usdtAddress}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        binance: { ...configForm.binance, usdtAddress: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-emerald-400 block">USD to BDT Exchange Rate</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">1 USD =</span>
                <input
                  type="number"
                  value={configForm.usdToBdtRate}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      usdToBdtRate: Number(e.target.value),
                    })
                  }
                  className="w-28 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold"
                />
                <span className="text-xs text-slate-400">BDT</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Payment Gateway Configuration</span>
            </button>
          </form>

          {/* Master Admin Security & Password Management */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Master Password Security / অ্যাডমিন পাসওয়ার্ড পরিবর্তন</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  পাসওয়ার্ড পরিবর্তন করে নিরাপদ রাখুন।
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Security
              </span>
            </div>

            {pwdMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  pwdMsg.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/15 border-red-500/30 text-red-300'
                }`}
              >
                {pwdMsg.success ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{pwdMsg.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="বর্তমান পাসওয়ার্ড..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="পাসওয়ার্ড নিশ্চিত করুন..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <p className="text-[11px] text-slate-500">
                  পাসওয়ার্ড নিরাপদ ও গোপন রাখুন।
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={adminLogout}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Lock Panel Now</span>
                  </button>
                  <button
                    id="btn-update-admin-password"
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CROSS VERIFICATION MODAL ("amio bosabo, matching hoile payment succesfull") */}
      {verifyModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">Cross-Verify TrxID & Unlock</h4>
              <button
                onClick={() => setVerifyModalOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div>Order: <span className="text-white font-bold">{verifyModalOrder.id}</span></div>
              <div>Buyer UID: <span className="text-blue-400 font-mono">{verifyModalOrder.buyerUid}</span></div>
              <div>Item: <span className="text-slate-200">{verifyModalOrder.accountTitle}</span></div>
              <div>Method: <span className="text-amber-400 uppercase font-bold">{verifyModalOrder.paymentMethod}</span></div>
              <div>Sender Phone/ID: <span className="text-slate-300 font-mono">{verifyModalOrder.senderNumberOrId}</span></div>
              <div>Buyer Submitted TrxID: <span className="text-emerald-400 font-mono font-bold">{verifyModalOrder.trxId}</span></div>
            </div>

            {crossVerifyError && (
              <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                {crossVerifyError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Enter the Transaction ID you received on your SMS / Binance:
              </label>
              <input
                type="text"
                autoFocus
                value={crossVerifyInput}
                onChange={(e) => setCrossVerifyInput(e.target.value.toUpperCase())}
                placeholder="e.g. 9K3LM7PQ"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm uppercase tracking-wider focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setVerifyModalOrder(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCrossVerify}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Verify & Unlock Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ACCOUNT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl my-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">
                {editingAccountId ? 'Edit BM Account' : 'Add New BM Account'}
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">BM Account ID *</label>
                  <input
                    type="text"
                    required
                    value={accountForm.accountId}
                    onChange={(e) => setAccountForm({ ...accountForm, accountId: e.target.value })}
                    placeholder="e.g. 61594195442610"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    value={accountForm.password}
                    onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                    placeholder="e.g. shayon@8"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Title / Display Name *</label>
                <input
                  type="text"
                  required
                  value={accountForm.title}
                  onChange={(e) => setAccountForm({ ...accountForm, title: e.target.value })}
                  placeholder="e.g. 2K Daily Spend Verified BM + Full Outlook"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Verified Status</label>
                  <select
                    value={accountForm.verifiedStatus}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, verifiedStatus: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="2k Verified">2k Verified</option>
                    <option value="250 Limit Verified">250 Limit Verified</option>
                    <option value="Unlimited Verified">Unlimited Verified</option>
                    <option value="50 Limit">50 Limit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Daily Limit String</label>
                  <input
                    type="text"
                    value={accountForm.dailyLimit}
                    onChange={(e) => setAccountForm({ ...accountForm, dailyLimit: e.target.value })}
                    placeholder="$2,000 / Day"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Status</label>
                  <select
                    value={accountForm.status}
                    onChange={(e) => setAccountForm({ ...accountForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Price in BDT (৳)</label>
                  <input
                    type="number"
                    required
                    value={accountForm.priceBDT}
                    onChange={(e) => setAccountForm({ ...accountForm, priceBDT: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Price in USD ($)</label>
                  <input
                    type="number"
                    required
                    value={accountForm.priceUSD}
                    onChange={(e) => setAccountForm({ ...accountForm, priceUSD: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">2FA Secret Key</label>
                <input
                  type="text"
                  value={accountForm.twoFactorSecret}
                  onChange={(e) => setAccountForm({ ...accountForm, twoFactorSecret: e.target.value })}
                  placeholder="e.g. TWAE 7XRL SR24 J3NM KFNN HX6K 6LTP KYXL"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Outlook / Webmail Credentials</label>
                <input
                  type="text"
                  value={accountForm.outlookCookies}
                  onChange={(e) => setAccountForm({ ...accountForm, outlookCookies: e.target.value })}
                  placeholder="Email|Password|AuthToken..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Session Cookies (datr, xs, c_user...)</label>
                <textarea
                  rows={2}
                  value={accountForm.cookies}
                  onChange={(e) => setAccountForm({ ...accountForm, cookies: e.target.value })}
                  placeholder="datr=...; c_user=...; xs=..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={accountForm.notes}
                  onChange={(e) => setAccountForm({ ...accountForm, notes: e.target.value })}
                  placeholder="e.g. French Outlook attached, 2FA enabled"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  {editingAccountId ? 'Save Changes' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
