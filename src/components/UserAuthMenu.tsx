import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  LogOut,
  Cloud,
  CloudCheck,
  CheckCircle2,
  RefreshCw,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface UserAuthMenuProps {
  totalContacts: number;
  onNavigateToLanding?: () => void;
  onOpenPricing?: () => void;
  isPro?: boolean;
}

export const UserAuthMenu: React.FC<UserAuthMenuProps> = ({
  totalContacts,
  onNavigateToLanding,
  onOpenPricing,
  isPro = false,
}) => {
  const { user, loading, isCloudSyncing, cloudSyncError, login, logout, syncLocalToCloud } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSyncToCloud = async () => {
    try {
      await syncLocalToCloud();
      setSyncFeedback('All contacts synced to cloud!');
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (e) {
      setSyncFeedback('Sync failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-semibold">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
        <span className="hidden sm:inline">Connecting...</span>
      </div>
    );
  }

  // Not logged in: Show Google Sign in button
  if (!user) {
    return (
      <button
        onClick={login}
        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-xs transition flex items-center gap-2 cursor-pointer active:bg-slate-100"
        title="Sign in with Google to enable live cloud CRM across all devices"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
          />
        </svg>
        <span>Google Login</span>
      </button>
    );
  }

  // Logged in: Show user profile trigger with cloud badge
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
      >
        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold hidden sm:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Cloud</span>
        </div>

        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 object-cover border border-slate-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 shadow-xl z-50 p-3 space-y-3">
          {/* User Info Header */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-10 h-10 object-cover border border-slate-200 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-slate-900 truncate">
                {user.displayName || 'Social CRM User'}
              </p>
              <p className="text-[11px] text-slate-500 truncate font-mono">{user.email}</p>
            </div>
          </div>

          {/* Cloud Sync Status Box */}
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Live Cloud Sync Active
              </span>
              <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                {totalContacts} contacts
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 leading-tight">
              Changes sync in real time to your secure Firestore cloud database.
            </p>
          </div>

          {/* Plan & Pricing Tier Box */}
          <div className="bg-indigo-50/70 border border-indigo-200 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-indigo-900">
                {isPro ? '⭐ Pro Unlimited Plan' : 'Free Starter Tier'}
              </span>
              <span className="font-mono font-bold text-indigo-700">
                {isPro ? 'Unlimited' : `${totalContacts}/50 contacts`}
              </span>
            </div>
            <p className="text-[9.5px] text-indigo-800">
              {isPro
                ? 'Enjoy unlimited contacts with priority real-time cloud sync.'
                : 'First 50 contacts free. Upgrade to Pro for $10/mo for unlimited usage.'}
            </p>
            {onOpenPricing && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPricing();
                }}
                className="w-full mt-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isPro ? 'Manage Plan ($10/mo)' : 'Upgrade to Unlimited ($10/mo)'}</span>
              </button>
            )}
          </div>

          {/* Extension Account Sync Key */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              <span>Your Extension Sync Key</span>
              <span className="text-emerald-600 font-normal">Connects Sidebar</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                readOnly
                value={user.uid}
                className="w-full text-[10px] font-mono bg-white border border-slate-300 p-1.5 text-slate-800 select-all"
                title="Your unique Cloud Sync Key"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user.uid);
                  setSyncFeedback('Sync Key copied!');
                  setTimeout(() => setSyncFeedback(null), 2500);
                }}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition shrink-0 cursor-pointer"
                title="Copy key to paste into your Chrome Extension settings"
              >
                Copy
              </button>
            </div>
            <p className="text-[9.5px] text-slate-500">
              Paste this in the Chrome Extension sidebar to automatically save LinkedIn, X & Instagram profiles directly to your account.
            </p>
          </div>

          {/* Sync Local Data Button */}
          <div className="space-y-1">
            <button
              onClick={handleSyncToCloud}
              disabled={isCloudSyncing}
              className="w-full py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
              <span>{isCloudSyncing ? 'Syncing...' : 'Sync Local Contacts to Cloud'}</span>
            </button>
            {syncFeedback && (
              <p className="text-[10px] text-center font-bold text-emerald-600">{syncFeedback}</p>
            )}
            {cloudSyncError && (
              <p className="text-[10px] text-center font-bold text-rose-600">{cloudSyncError}</p>
            )}
          </div>

          {/* Logout Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={async () => {
                setIsOpen(false);
                await logout();
                if (onNavigateToLanding) {
                  onNavigateToLanding();
                }
              }}
              className="w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
