import React from 'react';
import {
  Check,
  Zap,
  Sparkles,
  Shield,
  CreditCard,
  X,
  Crown,
  ArrowRight,
  Infinity,
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount: number;
  isPro: boolean;
  onTogglePro: (pro: boolean) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentCount,
  isPro,
  onTogglePro,
}) => {
  if (!isOpen) return null;

  const FREE_LIMIT = 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                SocialCRM Plans & Pricing
              </h3>
              <p className="text-xs text-slate-500">
                Simple, transparent pricing. Free for your first 50 contacts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Usage Banner */}
        <div className="px-6 py-3 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Current Contact Usage:</span>
            <span className="font-mono font-bold text-indigo-700">
              {currentCount} / {isPro ? '∞ Unlimited' : `${FREE_LIMIT} contacts`}
            </span>
          </div>
          <div className="w-36 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                currentCount >= FREE_LIMIT && !isPro
                  ? 'bg-rose-500'
                  : currentCount > 35 && !isPro
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{
                width: isPro ? '100%' : `${Math.min(100, (currentCount / FREE_LIMIT) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Free Tier */}
          <div
            className={`rounded-xl border p-5 flex flex-col justify-between transition ${
              !isPro
                ? 'border-slate-300 bg-slate-50 shadow-xs'
                : 'border-slate-200 bg-white opacity-85 hover:opacity-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-slate-900">Free Starter</h4>
                {!isPro && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-black text-slate-900">$0</span>
                <span className="text-xs text-slate-500 font-medium">/ forever</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Perfect for solo founders, creators, and freelancers getting started.
              </p>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>First <strong>50 Contacts</strong> included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Manifest V3 Chrome Extension</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>LinkedIn, X & Instagram Detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Follow-up Reminders & Notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>CSV & JSON Export</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                disabled={!isPro}
                onClick={() => {
                  onTogglePro(false);
                  onClose();
                }}
                className={`w-full py-2 rounded-lg text-xs font-bold transition ${
                  !isPro
                    ? 'bg-slate-200 text-slate-600 cursor-default'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                {!isPro ? 'Active Plan' : 'Downgrade to Free'}
              </button>
            </div>
          </div>

          {/* Pro Unlimited Tier */}
          <div
            className={`rounded-xl border-2 p-5 flex flex-col justify-between relative shadow-md ${
              isPro
                ? 'border-indigo-600 bg-indigo-50/40'
                : 'border-indigo-500 bg-white'
            }`}
          >
            <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
              Recommended
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                  Pro Unlimited
                </h4>
                {isPro && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    Active Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-black text-slate-900">$10</span>
                <span className="text-xs text-slate-500 font-medium">/ month</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                For sales pros, agencies, and power networkers who need unlimited scale.
              </p>

              <ul className="space-y-2 text-xs text-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 font-bold" />
                  <span><strong>Unlimited Contacts</strong> (no limits)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Priority Real-time Firestore Sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Automatic Extension Web Handshake</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Unlimited Reminders & Tag Presets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Full Data Export & Backup</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  onTogglePro(true);
                  onClose();
                }}
                className={`w-full py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                  isPro
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                }`}
              >
                {isPro ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Pro Plan Active
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade to Unlimited ($10/mo)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          🔒 Cancel anytime. Secure payments with 30-day money-back guarantee.
        </div>
      </div>
    </div>
  );
};
