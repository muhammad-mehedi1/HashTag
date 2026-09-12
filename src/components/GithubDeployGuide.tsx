import React, { useState } from 'react';
import { FileCode2, Copy, Check, Terminal, Globe, GitBranch, Github, ExternalLink } from 'lucide-react';

export const GithubDeployGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Initialize Git Repository',
      desc: 'Open your terminal in the project directory and run:',
      code: `git init\ngit add .\ngit commit -m "feat: complete Facebook BM marketplace with MFS & Binance payment matching"`,
    },
    {
      title: '2. Create GitHub Repo and Push',
      desc: 'Create a new repository on GitHub (e.g. "bm-vault-marketplace") and push:',
      code: `git branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/bm-vault-marketplace.git\ngit push -u origin main`,
    },
    {
      title: '3. Free Live Hosting Options',
      desc: 'You can host this application completely free with 1 click:',
      options: [
        {
          name: 'Vercel (Recommended - 100% Free)',
          detail: 'Go to vercel.com -> "Add New Project" -> Import your GitHub repository. Build command: npm run build, Output directory: dist. Ready in 30 seconds!',
        },
        {
          name: 'GitHub Pages',
          detail: 'Already configured with base: "./" in vite.config.ts! Run "npm run build" and deploy the "dist" folder, or use GitHub Pages Actions.',
        },
        {
          name: 'Cloud Run / Docker',
          detail: 'The app is fully full-stack compliant and ready to run with "npm run build" and "npm start".',
        },
      ],
    },
    {
      title: '4. Secret Admin Panel Security',
      desc: 'Security is configured by default so only you can access the admin panel:',
      detail: 'Buyers will only see the catalog, wallet, and checkout. The admin panel is completely locked behind your confidential master password. No unauthorized user or visitor can view inventory passwords or approve payments.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <Github className="w-3.5 h-3.5" />
          <span>GITHUB PUBLISH GUIDE</span>
        </div>
        <h2 className="text-2xl font-black text-white">How to Publish to GitHub & Host Live</h2>
        <p className="text-sm text-slate-400">
          Step-by-step instructions to push your Facebook Business Manager buying & selling website to GitHub.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              {step.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>

            {step.code && (
              <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap overflow-x-auto">
                  {step.code}
                </pre>
                <button
                  onClick={() => copyText(step.code!, idx)}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {step.options && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {step.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="text-xs font-bold text-slate-200">{opt.name}</div>
                    <div className="text-[11px] text-slate-400 leading-relaxed">{opt.detail}</div>
                  </div>
                ))}
              </div>
            )}

            {step.detail && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                {step.detail}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
