import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Wallet,
  Copy,
  Check,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Shield,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface WalletViewProps {
  openDepositModal: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ openDepositModal }) => {
  const { buyerProfile, currency, deposits, orders } = useStore();
  const [copiedUid, setCopiedUid] = useState(false);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(buyerProfile.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const buyerDeposits = deposits.filter((d) => d.buyerUid === buyerProfile.uid);
  const buyerOrders = orders.filter((o) => o.buyerUid === buyerProfile.uid);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wallet Balance Hero Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Wallet className="w-3.5 h-3.5" />
              <span>BM VAULT BUYER WALLET</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Customer Unique ID:</span>
              <button
                onClick={handleCopyUid}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-blue-300 hover:border-blue-500 transition-colors"
                title="Your permanent Unique ID. Click to copy."
              >
                <span>{buyerProfile.uid}</span>
                {copiedUid ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>

            <div>
              <div className="text-xs text-slate-400">Available Wallet Balance</div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5 flex items-baseline gap-3">
                <span>৳{buyerProfile.balanceBDT.toLocaleString()} BDT</span>
                <span className="text-base sm:text-lg text-emerald-400 font-normal">
                  (${buyerProfile.balanceUSD.toFixed(2)} USD)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={openDepositModal}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deposit Balance (Add Funds)</span>
            </button>
          </div>
        </div>

        {/* Benefits banner */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Instant 1-Click Purchase</strong>
              <span>Skip sending SMS / manual verification during account checkout.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Permanent Unique ID</strong>
              <span>Your balance is securely tied to {buyerProfile.uid} and stored locally.</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">bKash, Nagad & Binance</strong>
              <span>Top up anytime using local MFS or USDT crypto payments.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Requests Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Your Deposit Requests ({buyerDeposits.length})</h3>
          <span className="text-xs text-slate-400">TrxID verification history</span>
        </div>

        {buyerDeposits.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
            You have not submitted any deposits yet. Click "+ Deposit Balance" to add funds.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Deposit ID</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Sender Contact</th>
                  <th className="p-3">Submitted TrxID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {buyerDeposits.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-white">{d.id}</td>
                    <td className="p-3 uppercase font-semibold text-slate-300">{d.paymentMethod}</td>
                    <td className="p-3 font-mono text-slate-300">{d.senderNumberOrId}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{d.trxId}</td>
                    <td className="p-3 font-mono text-white">৳{d.amountBDT.toLocaleString()} (${d.amountUSD})</td>
                    <td className="p-3 text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                          d.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : d.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {d.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {d.status === 'pending' && <Clock className="w-3 h-3" />}
                        {d.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        <span>{d.status.toUpperCase()}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
