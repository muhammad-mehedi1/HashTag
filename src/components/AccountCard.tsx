import React from 'react';
import { BMAccount } from '../types';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  FileKey,
  Cookie,
  Zap,
  Tag,
  AlertCircle,
} from 'lucide-react';

interface AccountCardProps {
  account: BMAccount;
  onSelectBuy: (account: BMAccount) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onSelectBuy }) => {
  const { currency, buyerProfile } = useStore();
  const isAvailable = account.status === 'Available';
  const is2k = account.verifiedStatus.includes('2k');

  const priceFormatted =
    currency === 'BDT'
      ? `৳${account.priceBDT.toLocaleString()}`
      : `$${account.priceUSD.toFixed(2)}`;

  const secondaryPrice =
    currency === 'BDT'
      ? `$${account.priceUSD.toFixed(2)} USD`
      : `৳${account.priceBDT.toLocaleString()} BDT`;

  const canAffordWithWallet =
    currency === 'BDT'
      ? buyerProfile.balanceBDT >= account.priceBDT
      : buyerProfile.balanceUSD >= account.priceUSD;

  return (
    <div
      id={`account-card-${account.id}`}
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isAvailable
          ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-950/20'
          : 'bg-slate-900/40 border-slate-800/60 opacity-70'
      }`}
    >
      {/* Header Banner */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                is2k
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {account.verifiedStatus}
            </span>

            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {account.dailyLimit}
            </span>
          </div>

          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
              isAvailable
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center gap-1'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isAvailable ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                In Stock
              </>
            ) : (
              'Sold'
            )}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white tracking-tight mb-2 line-clamp-1">
          {account.title}
        </h3>

        {/* Account ID preview */}
        <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/80 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">BM Account ID:</span>
            <span className="font-mono text-slate-200 font-semibold tracking-wider">
              {isAvailable ? `${account.accountId.slice(0, 6)}••••••••` : account.accountId}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Date Added: {account.date}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready to Advertise
            </span>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="space-y-1.5 text-xs text-slate-300 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-blue-500/10 text-blue-400">
              <FileKey className="w-3.5 h-3.5" />
            </div>
            <span>2FA Secret Key + Live TOTP Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Outlook / Hotmail Webmail Credentials</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500/10 text-amber-400">
              <Cookie className="w-3.5 h-3.5" />
            </div>
            <span>High-Trust Browser Session Cookies (datr, xs)</span>
          </div>
        </div>

        {/* Note if any */}
        {account.notes && (
          <p className="text-[11px] text-slate-400 bg-slate-800/40 p-2 rounded-md border border-slate-800/60 line-clamp-2">
            ℹ️ {account.notes}
          </p>
        )}
      </div>

      {/* Footer / Pricing & Purchase */}
      <div className="p-5 pt-3 bg-slate-950/40 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-slate-400">Price</div>
            <div className="text-xl font-black text-white font-mono">{priceFormatted}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-mono">{secondaryPrice}</div>
            {isAvailable && canAffordWithWallet && (
              <span className="text-[10px] text-emerald-400 font-medium">
                ⚡ Wallet Balance Ready
              </span>
            )}
          </div>
        </div>

        {isAvailable ? (
          <button
            id={`btn-buy-${account.id}`}
            onClick={() => onSelectBuy(account)}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Buy & Unlock Account</span>
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-slate-800 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Account Sold Out</span>
          </button>
        )}
      </div>
    </div>
  );
};
