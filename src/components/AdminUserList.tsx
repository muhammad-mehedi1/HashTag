import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BuyerUser } from '../types';
import {
  Users,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  DollarSign,
  UserCheck,
  Clock,
  Phone,
  ShieldAlert,
  PlusCircle,
  ExternalLink,
  Lock,
  MessageSquare,
} from 'lucide-react';

export const AdminUserList: React.FC = () => {
  const {
    registeredUsers,
    adminUpdateUserPassword,
    adminDeleteUser,
    adminAdjustUserBalance,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllPasswords, setShowAllPasswords] = useState(true);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState<string | null>(null);
  const [copiedFull, setCopiedFull] = useState<string | null>(null);

  // Edit password dialog
  const [editingUserUid, setEditingUserUid] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordActionFeedback, setPasswordActionFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Adjust balance dialog
  const [balanceUserUid, setBalanceUserUid] = useState<string | null>(null);
  const [deltaBdtInput, setDeltaBdtInput] = useState('0');
  const [deltaUsdInput, setDeltaUsdInput] = useState('0');
  const [balanceFeedback, setBalanceFeedback] = useState<string | null>(null);

  // Delete confirmation
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);

  const filteredUsers = registeredUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.uid.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.contact && u.contact.toLowerCase().includes(q))
    );
  });

  const togglePasswordVisibility = (uid: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [uid]: prev[uid] === undefined ? !showAllPasswords : !prev[uid],
    }));
  };

  const isPasswordVisible = (uid: string) => {
    if (revealedPasswords[uid] !== undefined) {
      return revealedPasswords[uid];
    }
    return showAllPasswords;
  };

  const handleCopy = (text: string, type: 'uid' | 'pass' | 'full', uid: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'uid') {
      setCopiedUid(uid);
      setTimeout(() => setCopiedUid(null), 2000);
    } else if (type === 'pass') {
      setCopiedPass(uid);
      setTimeout(() => setCopiedPass(null), 2000);
    } else {
      setCopiedFull(uid);
      setTimeout(() => setCopiedFull(null), 2000);
    }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserUid) return;
    const res = adminUpdateUserPassword(editingUserUid, newPasswordInput);
    setPasswordActionFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setEditingUserUid(null);
        setNewPasswordInput('');
        setPasswordActionFeedback(null);
      }, 1500);
    }
  };

  const handleAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceUserUid) return;
    const bdt = parseFloat(deltaBdtInput) || 0;
    const usd = parseFloat(deltaUsdInput) || 0;
    const res = adminAdjustUserBalance(balanceUserUid, bdt, usd);
    setBalanceFeedback(res.message);
    setTimeout(() => {
      setBalanceUserUid(null);
      setDeltaBdtInput('0');
      setDeltaUsdInput('0');
      setBalanceFeedback(null);
    }, 1200);
  };

  const handleDeleteUser = (uid: string) => {
    adminDeleteUser(uid);
    setConfirmDeleteUid(null);
  };

  return (
    <div id="admin-user-list-section" className="space-y-6">
      {/* Header card with recovery policy */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">
                  Buyer User List & Password Recovery
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Only Admin Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                ক্রেতাদের সাইন আপ করা সকল ইউনিক UID এবং পাসওয়ার্ড এই তালিকায় সংরক্ষিত থাকে। কোনো ক্রেতা পাসওয়ার্ড ভুলে গেলে অ্যাডমিন প্যানেল থেকে UID মিলিয়ে পাসওয়ার্ড জেনে নিতে পারবে বা নতুন পাসওয়ার্ড সেট করে দিতে পারবে।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-all-passwords"
              onClick={() => setShowAllPasswords(!showAllPasswords)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
            >
              {showAllPasswords ? (
                <>
                  <EyeOff className="w-4 h-4 text-amber-400" />
                  <span>পাসওয়ার্ড লুকান (Hide Passwords)</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>পাসওয়ার্ড প্রদর্শন (Show Passwords)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">মোট নিবন্ধিত ইউজার</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">{registeredUsers.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-emerald-400 font-medium">ব্যালেন্সযুক্ত ইউজার</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
              {registeredUsers.filter((u) => u.balanceBDT > 0 || u.balanceUSD > 0).length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-cyan-400 font-medium">মোট ইউজার ওয়ালেট BDT</div>
            <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">
              ৳{registeredUsers.reduce((sum, u) => sum + (u.balanceBDT || 0), 0).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-purple-400 font-medium">মোট ইউজার ওয়ালেট USD</div>
            <div className="text-xl font-black text-purple-300 font-mono mt-0.5">
              ${registeredUsers.reduce((sum, u) => sum + (u.balanceUSD || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-users"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ইউজার UID, নাম বা ফোন নম্বর খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>ইউজার ফলাফল:</span>
          <span className="font-bold text-white font-mono px-2 py-0.5 bg-slate-800 rounded">
            {filteredUsers.length} of {registeredUsers.length}
          </span>
        </div>
      </div>

      {/* Users Table / List */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-300">কোনো ইউজার পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `"${searchQuery}" এর সাথে মিলে এমন কোনো ইউজার UID পাওয়া যায়নি।`
              : 'এখনও পর্যন্ত কোনো ক্রেতা একাউন্ট তৈরি করেনি।'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">ইউজার UID</th>
                  <th className="px-4 py-3.5">পাসওয়ার্ড (Password)</th>
                  <th className="px-4 py-3.5">ক্রেতার নাম / তথ্য</th>
                  <th className="px-4 py-3.5">ওয়ালেট ব্যালেন্স</th>
                  <th className="px-4 py-3.5">যোগদানের তারিখ</th>
                  <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((user) => {
                  const visible = isPasswordVisible(user.uid);
                  const isCopiedU = copiedUid === user.uid;
                  const isCopiedP = copiedPass === user.uid;
                  const isCopiedF = copiedFull === user.uid;

                  return (
                    <tr key={user.uid} className="hover:bg-slate-800/40 transition-colors">
                      {/* UID */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-white font-mono text-sm bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                            <span className="text-cyan-400 font-black">#</span>
                            <span>{user.uid}</span>
                          </div>
                          <button
                            id={`btn-copy-uid-${user.uid}`}
                            onClick={() => handleCopy(user.uid, 'uid', user.uid)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="UID কপি করুন"
                          >
                            {isCopiedU ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Password (Visible to Admin as requested) */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 font-mono text-xs flex items-center gap-1.5 min-w-[130px]">
                            <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            {visible ? (
                              <span className="font-bold text-amber-300 select-all">{user.password}</span>
                            ) : (
                              <span className="text-slate-500 tracking-widest">••••••••</span>
                            )}
                          </div>

                          <button
                            onClick={() => togglePasswordVisibility(user.uid)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title={visible ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                          >
                            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            id={`btn-copy-pass-${user.uid}`}
                            onClick={() => handleCopy(user.password, 'pass', user.uid)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="পাসওয়ার্ড কপি করুন"
                          >
                            {isCopiedP ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Name & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-200 text-xs">
                            {user.name || <span className="text-slate-500 italic">নাম দেওয়া নেই</span>}
                          </div>
                          {user.contact ? (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{user.contact}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">ফোন/কন্ট্যাক্ট নেই</span>
                          )}
                        </div>
                      </td>

                      {/* Wallet Balance */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 font-mono">
                          <div className="font-bold text-emerald-400 text-xs">
                            ৳{user.balanceBDT.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            ${user.balanceUSD.toFixed(2)} USD
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Active: {new Date(user.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy both UID & Pass for direct customer message */}
                          <button
                            id={`btn-copy-full-${user.uid}`}
                            onClick={() =>
                              handleCopy(
                                `👤 Hash-Tag Account Credentials:\nUID: ${user.uid}\nPassword: ${user.password}`,
                                'full',
                                user.uid
                              )
                            }
                            className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[11px] font-medium border border-blue-500/30 flex items-center gap-1"
                            title="UID ও পাসওয়ার্ড একসাথে কপি করুন (কাস্টমারকে মেসেজ পাঠাতে)"
                          >
                            {isCopiedF ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopiedF ? 'কপি হয়েছে' : 'কপি ক্রেতা তথ্য'}</span>
                          </button>

                          {/* Edit Password */}
                          <button
                            id={`btn-edit-pass-${user.uid}`}
                            onClick={() => {
                              setEditingUserUid(user.uid);
                              setNewPasswordInput(user.password);
                              setPasswordActionFeedback(null);
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                            title="পাসওয়ার্ড রিসেট বা পরিবর্তন করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Adjust Balance */}
                          <button
                            id={`btn-adjust-bal-${user.uid}`}
                            onClick={() => {
                              setBalanceUserUid(user.uid);
                              setDeltaBdtInput('0');
                              setDeltaUsdInput('0');
                              setBalanceFeedback(null);
                            }}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                            title="ব্যালেন্স যোগ / বিয়োগ করুন"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            id={`btn-delete-user-${user.uid}`}
                            onClick={() => setConfirmDeleteUid(user.uid)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                            title="ইউজার ডিলিট করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT PASSWORD MODAL */}
      {editingUserUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <KeyRound className="w-4 h-4" />
              <span>ইউজারের পাসওয়ার্ড পরিবর্তন করুন</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ইউজার: <strong className="text-white font-mono">#{editingUserUid}</strong> এর জন্য নতুন পাসওয়ার্ড দিন। ইউজার পরবর্তীতে এই পাসওয়ার্ড দিয়ে লগইন করতে পারবে।
            </p>

            {passwordActionFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs font-medium ${
                  passwordActionFeedback.success
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {passwordActionFeedback.message}
              </div>
            )}

            <form onSubmit={handleSaveNewPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  নতুন পাসওয়ার্ড (New Password)
                </label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUserUid(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  পাসওয়ার্ড সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST BALANCE MODAL */}
      {balanceUserUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <DollarSign className="w-4 h-4" />
              <span>ইউজার ওয়ালেট ব্যালেন্স নিয়ন্ত্রণ</span>
            </div>
            <p className="text-xs text-slate-400">
              ইউজার: <strong className="text-white font-mono">#{balanceUserUid}</strong> এর অ্যাকাউন্টে ব্যালেন্স যোগ (+) বা বিয়োগ (-) করতে মান দিন:
            </p>

            {balanceFeedback && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
                {balanceFeedback}
              </div>
            )}

            <form onSubmit={handleAdjustBalance} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  টাকা পরিবর্তন (BDT ৳) — যেমন: 2000 বা -500
                </label>
                <input
                  type="number"
                  value={deltaBdtInput}
                  onChange={(e) => setDeltaBdtInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ডলার পরিবর্তন (USD $) — যেমন: 16 বা -10
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={deltaUsdInput}
                  onChange={(e) => setDeltaUsdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceUserUid(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  ব্যালেন্স আপডেট
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteUid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/40 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>ইউজার ডিলিট নিশ্চিতকরণ</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনি কি নিশ্চিতভাবে ইউজার <strong className="text-white font-mono">#{confirmDeleteUid}</strong> ডিলিট করতে চান? ডিলিট করার পর এই UID পুনরায় ফাঁকা হবে এবং ক্রেতা আর লগইন করতে পারবে না।
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteUid(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                না, রাখুন
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(confirmDeleteUid)}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
