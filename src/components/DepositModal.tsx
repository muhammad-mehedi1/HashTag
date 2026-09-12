import React, { useState } from 'react';
import { PaymentMethod } from '../types';
import { useStore } from '../context/StoreContext';
import {
  X,
  Wallet,
  Copy,
  Check,
  Send,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const {
    buyerProfile,
    paymentConfig,
    currency,
    createDepositRequest,
  } = useStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  const [amount, setAmount] = useState<number>(1000);
  const [senderNumberOrId, setSenderNumberOrId] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<{
    id: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopyTarget = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  const getMethodInfo = () => {
    switch (selectedMethod) {
      case 'bkash':
        return {
          name: 'bKash',
          target: paymentConfig.bkash.number,
          type: `${paymentConfig.bkash.type} Send Money`,
          instructions: paymentConfig.bkash.instructions,
          placeholder: 'Enter your 11-digit bKash Number (017xxxxxxxx)',
        };
      case 'nagad':
        return {
          name: 'Nagad',
          target: paymentConfig.nagad.number,
          type: `${paymentConfig.nagad.type} Send Money`,
          instructions: paymentConfig.nagad.instructions,
          placeholder: 'Enter your Nagad Number (018xxxxxxxx)',
        };
      case 'rocket':
        return {
          name: 'Rocket',
          target: paymentConfig.rocket.number,
          type: `${paymentConfig.rocket.type} Send Money`,
          instructions: paymentConfig.rocket.instructions,
          placeholder: 'Enter your 12-digit Rocket Number',
        };
      case 'binance':
        return {
          name: 'Binance Pay / USDT',
          target: `${paymentConfig.binance.payId} (Pay ID) / ${paymentConfig.binance.usdtAddress}`,
          type: 'Binance Pay or USDT (TRC20)',
          instructions: paymentConfig.binance.instructions,
          placeholder: 'Enter your Binance Pay ID or TX Hash',
        };
      default:
        return {
          name: 'bKash',
          target: '',
          type: '',
          instructions: '',
          placeholder: '',
        };
    }
  };

  const methodInfo = getMethodInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (amount <= 0) {
      setErrorMessage('Please enter a valid deposit amount greater than 0.');
      return;
    }

    if (!senderNumberOrId.trim()) {
      setErrorMessage('Please enter your sender number or Binance Pay ID.');
      return;
    }

    if (!trxId.trim()) {
      setErrorMessage('Please enter the Transaction ID (TrxID) received from your SMS/app.');
      return;
    }

    setIsSubmitting(true);
    try {
      const depositCurrency = selectedMethod === 'binance' ? 'USD' : 'BDT';
      const res = await createDepositRequest(
        selectedMethod,
        senderNumberOrId,
        trxId,
        amount,
        depositCurrency
      );

      if (res.success && res.depositId) {
        setDepositSuccess({
          id: res.depositId,
          message: res.message,
        });
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to submit deposit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Deposit Wallet Balance</h3>
              <p className="text-xs text-slate-400">
                Unique Customer ID:{' '}
                <span className="text-emerald-400 font-mono font-bold">{buyerProfile.uid}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {depositSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-extrabold text-white">Deposit Request Submitted!</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {depositSuccess.message}
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-w-xs mx-auto text-xs font-mono text-slate-300 space-y-1">
                <div>Deposit ID: <span className="text-blue-400 font-bold">{depositSuccess.id}</span></div>
                <div>TrxID: <span className="text-emerald-400">{trxId.toUpperCase()}</span></div>
                <div>Amount: <span className="text-amber-400 font-bold">{selectedMethod === 'binance' ? `$${amount} USD` : `৳${amount} BDT`}</span></div>
              </div>

              <div className="pt-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current balance card */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Your Current Balance:</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {currency === 'BDT'
                    ? `৳${buyerProfile.balanceBDT.toLocaleString()}`
                    : `$${buyerProfile.balanceUSD.toFixed(2)}`}
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Method Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Choose Deposit Method:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['bkash', 'nagad', 'rocket', 'binance'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMethod(m)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedMethod === m
                          ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wider">
                        {m === 'binance' ? 'Binance' : m}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deposit Amount ({selectedMethod === 'binance' ? 'USD / USDT' : 'BDT ৳'})
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                      {selectedMethod === 'binance' ? '$' : '৳'}
                    </span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Preset buttons */}
                  {selectedMethod === 'binance' ? (
                    <div className="flex gap-1">
                      {[15, 25, 50, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                        >
                          ${val}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      {[1000, 2000, 3100, 5000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                        >
                          ৳{val}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Number and Instructions */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Send to Admin ({methodInfo.type}):</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {selectedMethod === 'binance' ? `$${amount} USDT` : `৳${amount} BDT`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 gap-2">
                  <span className="font-mono text-sm font-bold text-white truncate select-all">
                    {selectedMethod === 'binance' ? paymentConfig.binance.payId : methodInfo.target}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyTarget(
                        selectedMethod === 'binance' ? paymentConfig.binance.payId : methodInfo.target
                      )
                    }
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedTarget ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  💡 {methodInfo.instructions}
                </p>
              </div>

              {/* Inputs: Sender & TrxID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Sender Number / Binance ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={senderNumberOrId}
                    onChange={(e) => setSenderNumberOrId(e.target.value)}
                    placeholder={methodInfo.placeholder}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Transaction ID (TrxID) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    placeholder="e.g. 9K3LM7PQ"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-bold placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono uppercase tracking-wider"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>
                  Admin will cross-verify this TrxID. Upon verification, balance is credited directly to <strong className="text-emerald-400">{buyerProfile.uid}</strong>.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Deposit for Matching'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
