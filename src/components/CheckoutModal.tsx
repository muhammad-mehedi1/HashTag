import React, { useState } from 'react';
import { BMAccount, PaymentMethod } from '../types';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShieldCheck,
  Wallet,
  Copy,
  Check,
  Zap,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface CheckoutModalProps {
  account: BMAccount | null;
  onClose: () => void;
  onSuccessNavigate: () => void;
  openDepositModal: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  account,
  onClose,
  onSuccessNavigate,
  openDepositModal,
}) => {
  const {
    currency,
    buyerProfile,
    paymentConfig,
    buyWithWallet,
    createOrderWithMFS,
  } = useStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('bkash');
  const [senderNumberOrId, setSenderNumberOrId] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState<{
    orderId: string;
    isWallet: boolean;
    message: string;
  } | null>(null);

  if (!account) return null;

  const priceBDT = account.priceBDT;
  const priceUSD = account.priceUSD;

  const currentWalletBalance =
    currency === 'BDT' ? buyerProfile.balanceBDT : buyerProfile.balanceUSD;
  const requiredAmount = currency === 'BDT' ? priceBDT : priceUSD;
  const hasEnoughWalletBalance = currentWalletBalance >= requiredAmount;

  // Method details
  const getMethodDetails = () => {
    switch (selectedMethod) {
      case 'bkash':
        return {
          name: 'bKash',
          color: 'from-pink-600 to-rose-600',
          badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
          accountTarget: paymentConfig.bkash.number,
          targetType: `${paymentConfig.bkash.type} Send Money`,
          instructions: paymentConfig.bkash.instructions,
          amountToPay: `৳${priceBDT.toLocaleString()} BDT`,
          placeholderSender: 'Enter your 11-digit bKash Number (e.g. 017xxxxxxxx)',
        };
      case 'nagad':
        return {
          name: 'Nagad',
          color: 'from-orange-600 to-amber-600',
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          accountTarget: paymentConfig.nagad.number,
          targetType: `${paymentConfig.nagad.type} Send Money`,
          instructions: paymentConfig.nagad.instructions,
          amountToPay: `৳${priceBDT.toLocaleString()} BDT`,
          placeholderSender: 'Enter your Nagad Number (e.g. 018xxxxxxxx)',
        };
      case 'rocket':
        return {
          name: 'Rocket',
          color: 'from-purple-600 to-violet-600',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          accountTarget: paymentConfig.rocket.number,
          targetType: `${paymentConfig.rocket.type} Send Money`,
          instructions: paymentConfig.rocket.instructions,
          amountToPay: `৳${priceBDT.toLocaleString()} BDT`,
          placeholderSender: 'Enter your Rocket 12-digit Number',
        };
      case 'binance':
        return {
          name: 'Binance Pay / USDT',
          color: 'from-yellow-500 to-amber-600',
          badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          accountTarget: `${paymentConfig.binance.payId} (Pay ID) / ${paymentConfig.binance.usdtAddress}`,
          targetType: `Binance Pay ID or USDT (${paymentConfig.binance.network})`,
          instructions: paymentConfig.binance.instructions,
          amountToPay: `$${priceUSD.toFixed(2)} USDT`,
          placeholderSender: 'Enter your Binance Pay ID or TX Hash',
        };
      default:
        return {
          name: 'Wallet',
          color: 'from-emerald-600 to-teal-600',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          accountTarget: '',
          targetType: '',
          instructions: '',
          amountToPay: '',
          placeholderSender: '',
        };
    }
  };

  const methodDetails = getMethodDetails();

  const handleCopyTarget = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  // Handle Wallet Purchase
  const handleWalletPurchase = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await buyWithWallet(account.id);
      if (res.success && res.orderId) {
        setOrderCreatedSuccess({
          orderId: res.orderId,
          isWallet: true,
          message: res.message,
        });
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Failed to process wallet payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle MFS / Binance Purchase
  const handleMFSPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!senderNumberOrId.trim()) {
      setErrorMessage('Please enter your Sender Phone Number or Binance ID.');
      return;
    }

    if (!trxId.trim()) {
      setErrorMessage('Please enter the Transaction ID (TrxID) received after payment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const amountToRecord = selectedMethod === 'binance' ? priceUSD : priceBDT;
      const currencyPaid = selectedMethod === 'binance' ? 'USD' : 'BDT';

      const res = await createOrderWithMFS(
        account.id,
        selectedMethod,
        senderNumberOrId,
        trxId,
        amountToRecord,
        currencyPaid
      );

      if (res.success && res.orderId) {
        setOrderCreatedSuccess({
          orderId: res.orderId,
          isWallet: false,
          message: res.message,
        });
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('An error occurred while creating order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Purchase & Unlock Account</h3>
              <p className="text-xs text-slate-400">Buyer ID: <span className="text-blue-300 font-mono font-semibold">{buyerProfile.uid}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {orderCreatedSuccess ? (
            /* Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-extrabold text-white">
                {orderCreatedSuccess.isWallet
                  ? 'Account Unlocked Successfully!'
                  : 'Order Placed & TrxID Submitted!'}
              </h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {orderCreatedSuccess.message}
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-w-sm mx-auto text-xs font-mono text-slate-300 space-y-1">
                <div>Order Number: <span className="text-blue-400 font-bold">{orderCreatedSuccess.orderId}</span></div>
                <div>Account: <span className="text-emerald-400 font-semibold">{account.verifiedStatus}</span></div>
                <div>Your UID: <span className="text-amber-400">{buyerProfile.uid}</span></div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  id="btn-view-unlocked"
                  onClick={() => {
                    onClose();
                    onSuccessNavigate();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
                >
                  <span>View Unlocked Accounts & Orders</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Product Info Strip */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {account.verifiedStatus}
                    </span>
                    <span className="text-xs text-slate-400">{account.dailyLimit}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{account.title}</h4>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Account ID: {account.accountId.slice(0, 8)}••••••••
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Price</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {currency === 'BDT' ? `৳${priceBDT.toLocaleString()}` : `$${priceUSD.toFixed(2)}`}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {currency === 'BDT' ? `$${priceUSD} USD` : `৳${priceBDT.toLocaleString()} BDT`}
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* PAYMENT OPTION 1: Instant Wallet Balance */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Pay with Wallet Balance</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                          Instant 1-Click Unlock
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Available Balance:{' '}
                        <span className="font-mono font-bold text-emerald-400">
                          {currency === 'BDT'
                            ? `৳${buyerProfile.balanceBDT.toLocaleString()}`
                            : `$${buyerProfile.balanceUSD.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {hasEnoughWalletBalance ? (
                    <button
                      id="btn-pay-wallet-instant"
                      onClick={handleWalletPurchase}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition-all shadow-md shadow-emerald-900/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isSubmitting ? 'Processing...' : 'Pay & Unlock Now'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        openDepositModal();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
                    >
                      + Deposit Balance
                    </button>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold whitespace-nowrap">
                  Or Pay Direct with MFS / Binance
                </span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>

              {/* PAYMENT OPTION 2: Direct bKash / Nagad / Rocket / Binance */}
              <form onSubmit={handleMFSPurchase} className="space-y-4">
                {/* Method Tabs */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Select Payment Gateway:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* bKash */}
                    <button
                      type="button"
                      id="btn-tab-bkash"
                      onClick={() => setSelectedMethod('bkash')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedMethod === 'bkash'
                          ? 'bg-pink-950/40 border-pink-500 shadow-md shadow-pink-950/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-black text-pink-400">bKash</div>
                      <div className="text-[10px] text-slate-400 font-mono">Personal Send</div>
                    </button>

                    {/* Nagad */}
                    <button
                      type="button"
                      id="btn-tab-nagad"
                      onClick={() => setSelectedMethod('nagad')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedMethod === 'nagad'
                          ? 'bg-orange-950/40 border-orange-500 shadow-md shadow-orange-950/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-black text-orange-400">Nagad</div>
                      <div className="text-[10px] text-slate-400 font-mono">Personal Send</div>
                    </button>

                    {/* Rocket */}
                    <button
                      type="button"
                      id="btn-tab-rocket"
                      onClick={() => setSelectedMethod('rocket')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedMethod === 'rocket'
                          ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-black text-purple-400">Rocket</div>
                      <div className="text-[10px] text-slate-400 font-mono">Personal Send</div>
                    </button>

                    {/* Binance */}
                    <button
                      type="button"
                      id="btn-tab-binance"
                      onClick={() => setSelectedMethod('binance')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedMethod === 'binance'
                          ? 'bg-yellow-950/40 border-yellow-500 shadow-md shadow-yellow-950/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-black text-yellow-400">Binance Pay</div>
                      <div className="text-[10px] text-slate-400 font-mono">USDT (TRC20)</div>
                    </button>
                  </div>
                </div>

                {/* Gateway Instructions Box */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Send to {methodDetails.name} ({methodDetails.targetType}):
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      Pay Exact: {methodDetails.amountToPay}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 gap-2">
                    <div className="font-mono text-sm font-bold text-white truncate select-all">
                      {selectedMethod === 'binance' ? paymentConfig.binance.payId : methodDetails.accountTarget}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyTarget(
                          selectedMethod === 'binance' ? paymentConfig.binance.payId : methodDetails.accountTarget
                        )
                      }
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1 flex-shrink-0 transition-colors"
                    >
                      {copiedTarget ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {selectedMethod === 'binance' && (
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>
                        USDT Address (TRC20):{' '}
                        <span className="font-mono text-slate-300 select-all break-all">
                          {paymentConfig.binance.usdtAddress}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    💡 <strong className="text-slate-300">Instructions:</strong> {methodDetails.instructions}
                  </p>
                </div>

                {/* Form Inputs: Sender Phone & TrxID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Your Sender Number / Binance ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-sender-contact"
                      required
                      value={senderNumberOrId}
                      onChange={(e) => setSenderNumberOrId(e.target.value)}
                      placeholder={methodDetails.placeholderSender}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Transaction ID (TrxID) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-trx-id"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="e.g. 9K3LM7PQ or BL98762"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-bold placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 font-mono uppercase tracking-wider"
                    />
                  </div>
                </div>

                {/* How Verification works notice */}
                <div className="text-[11px] text-slate-400 flex items-start gap-1.5 p-2 rounded-lg bg-blue-950/20 border border-blue-900/40">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>How Matching Works:</strong> Once you submit, our system & admin will match your Transaction ID with the incoming payment. As soon as matched, your account details unlock automatically!
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  id="btn-submit-mfs-payment"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Payment & Match TrxID'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
