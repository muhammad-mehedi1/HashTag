import React, { useState, useEffect } from 'react';
import { Order, BMAccount } from '../types';
import { generateTOTP, getRemainingSeconds } from '../utils/totp';
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  Cookie,
  Mail,
  RefreshCw,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

interface UnlockedAccountCardProps {
  order: Order;
}

export const UnlockedAccountCard: React.FC<UnlockedAccountCardProps> = ({ order }) => {
  const account: BMAccount | undefined = order.unlockedAccount;
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState<string>('------');
  const [remainingSec, setRemainingSec] = useState<number>(30);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 2FA Live calculation loop
  useEffect(() => {
    if (!account?.twoFactorSecret) return;

    let isMounted = true;
    const updateCode = async () => {
      const code = await generateTOTP(account.twoFactorSecret);
      if (isMounted) {
        setTotpCode(code);
        setRemainingSec(getRemainingSeconds());
      }
    };

    updateCode();
    const interval = setInterval(() => {
      setRemainingSec(getRemainingSeconds());
      if (getRemainingSeconds() === 30 || getRemainingSeconds() === 29) {
        updateCode();
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [account?.twoFactorSecret]);

  if (!account) return null;

  // Download all credentials as a text file
  const downloadCredentialsTxt = () => {
    const content = `================================================
BM VAULT - PURCHASED CREDENTIALS
================================================
Order ID: ${order.id}
Date: ${new Date(order.createdAt).toLocaleString()}
Transaction ID: ${order.trxId}
Payment Method: ${order.paymentMethod.toUpperCase()}

ACCOUNT DETAILS:
------------------------------------------------
BM Account ID: ${account.accountId}
Account Title: ${account.title}
Status: ${account.verifiedStatus} (${account.dailyLimit})
Password: ${account.password}
2FA Secret Key: ${account.twoFactorSecret || 'N/A'}

OUTLOOK / WEBMAIL ACCESS:
------------------------------------------------
Outlook Credentials: ${account.outlookCookies || 'N/A'}

SESSION COOKIES:
------------------------------------------------
${account.cookies || 'N/A'}

NOTES:
------------------------------------------------
${account.notes || 'No extra notes.'}

================================================
Generated for Buyer UID: ${order.buyerUid}
Thank you for purchasing from Hash-Tag (হ্যাশ ট্যাগ)!
================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BM_${account.accountId}_Credentials.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id={`unlocked-order-${order.id}`}
      className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl overflow-hidden"
    >
      {/* Top Banner */}
      <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400">
                Order #{order.id}
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                UNLOCKED
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">{account.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            TrxID: <span className="text-slate-200 font-bold">{order.trxId}</span>
          </span>
          <button
            onClick={downloadCredentialsTxt}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Download formatted text file with all credentials"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download .TXT</span>
          </button>
        </div>
      </div>

      {/* Main Credentials Content */}
      <div className="p-6 space-y-5">
        {/* Row 1: Account ID, Password & 2FA Secret */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Account ID */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">BM Account ID</span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="font-mono text-sm font-bold text-white select-all">
                {account.accountId}
              </span>
              <button
                onClick={() => copyToClipboard(account.accountId, 'accId')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Account ID"
              >
                {copiedField === 'accId' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Password</span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="font-mono text-sm font-bold text-white select-all">
                {showPassword ? account.password : '••••••••••••'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => copyToClipboard(account.password, 'password')}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy Password"
                >
                  {copiedField === 'password' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Daily Limit & Status */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Verified Limit & Status</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {account.verifiedStatus}
              </span>
              <span className="text-xs font-mono text-slate-300 font-semibold">
                {account.dailyLimit}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Live 2FA Authenticator Widget */}
        {account.twoFactorSecret && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Live 2FA Authenticator Code</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  REAL-TIME
                </span>
              </div>
              <div className="text-xs text-slate-400">
                2FA Secret Key:{' '}
                <span className="font-mono text-slate-300 font-semibold select-all">
                  {account.twoFactorSecret}
                </span>
                <button
                  onClick={() => copyToClipboard(account.twoFactorSecret, '2faSecret')}
                  className="ml-2 text-blue-400 hover:text-blue-300 text-[11px] underline"
                >
                  {copiedField === '2faSecret' ? 'Copied!' : 'Copy Secret'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="font-mono text-2xl font-black text-amber-400 tracking-widest bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 shadow-inner">
                  {totpCode}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Refreshes in {remainingSec}s</span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(totpCode, 'totp')}
                className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-950/40"
              >
                {copiedField === 'totp' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Row 3: Outlook / Webmail Credentials */}
        {account.outlookCookies && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Outlook / Hotmail Credentials & Tokens:</span>
              </div>
              <button
                onClick={() => copyToClipboard(account.outlookCookies, 'outlook')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {copiedField === 'outlook' ? (
                  <span className="text-emerald-400">Copied!</span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Mail & Pass</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 break-all select-all">
              {account.outlookCookies}
            </div>
          </div>
        )}

        {/* Row 4: Browser Session Cookies */}
        {account.cookies && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Cookie className="w-3.5 h-3.5 text-amber-400" />
                <span>Session Cookies (datr, c_user, xs - For Cookie Editor Extension):</span>
              </div>
              <button
                onClick={() => copyToClipboard(account.cookies, 'cookies')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                {copiedField === 'cookies' ? (
                  <span className="text-emerald-400">Copied!</span>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy All Cookies</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 max-h-24 overflow-y-auto break-all select-all">
              {account.cookies}
            </div>
          </div>
        )}

        {/* Notes */}
        {account.notes && (
          <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Account Notes: </span>
              <span>{account.notes}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
