import React, { useState, useEffect } from 'react';
import { generateTOTP, getRemainingSeconds } from '../utils/totp';
import { KeyRound, Copy, Check, Clock, Sparkles, RefreshCw } from 'lucide-react';

export const TwoFactorTool: React.FC = () => {
  const [secret, setSecret] = useState('TWAE 7XRL SR24 J3NM KFNN HX6K 6LTP KYXL');
  const [code, setCode] = useState('------');
  const [remaining, setRemaining] = useState(30);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      const currentCode = await generateTOTP(secret);
      if (isMounted) {
        setCode(currentCode);
        setRemaining(getRemainingSeconds());
      }
    };

    refresh();
    const timer = setInterval(() => {
      setRemaining(getRemainingSeconds());
      if (getRemainingSeconds() === 30 || getRemainingSeconds() === 29) {
        refresh();
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [secret]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <KeyRound className="w-3.5 h-3.5" />
          <span>FACEBOOK 2FA AUTHENTICATOR</span>
        </div>
        <h2 className="text-2xl font-black text-white">Live 2FA Code Generator</h2>
        <p className="text-sm text-slate-400">
          Paste any Facebook Business Manager 2FA Secret Key to generate the live 6-digit verification code.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Enter / Paste 2FA Secret Key:
          </label>
          <input
            type="text"
            id="input-2fa-secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="e.g. TWAE 7XRL SR24 J3NM KFNN HX6K 6LTP KYXL"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Code Display */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 text-center space-y-4">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
            Current 6-Digit Code
          </div>

          <div className="font-mono text-4xl sm:text-5xl font-black text-amber-400 tracking-widest py-2">
            {code}
          </div>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto space-y-1.5">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(remaining / 30) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Refreshes in:
              </span>
              <span className="font-bold text-slate-200">{remaining} seconds</span>
            </div>
          </div>

          <div>
            <button
              id="btn-copy-2fa"
              onClick={handleCopy}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-900/30 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy 6-Digit Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick sample secrets from actual BM inventory */}
        <div className="text-xs text-slate-400 space-y-2">
          <span className="font-semibold text-slate-300">Quick Test from Inventory:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSecret('TWAE 7XRL SR24 J3NM KFNN HX6K 6LTP KYXL')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              BM #1 (TWAE 7XRL...)
            </button>
            <button
              onClick={() => setSecret('QNLS EJOZ G7OH KFPB MCUQ 3DDQ LF44 A7EP')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              BM #5 (QNLS EJOZ...)
            </button>
            <button
              onClick={() => setSecret('R5Q4 3G6G PJJB NPCA 37XG YRHM N6SS JGCD')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
            >
              BM #6 (R5Q4 3G6G...)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
