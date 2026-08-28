import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExtensionFilesViewer } from './ExtensionFilesViewer';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Download,
  ArrowRight,
  CheckCircle2,
  Check,
  Lock,
  Layers,
  Clock,
  Laptop,
  Flame,
  ExternalLink,
  ChevronRight,
  Crown,
  Tag,
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToApp }) => {
  const { user, login, logout } = useAuth();
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [demoPlatform, setDemoPlatform] = useState<'linkedin' | 'x' | 'instagram'>('linkedin');
  const [demoStage, setDemoStage] = useState('lead');
  const [demoTags, setDemoTags] = useState('Tech Founder, Series A');
  const [demoNote, setDemoNote] = useState('Met at AI meetup. Interested in workflow sync.');
  const [demoSaved, setDemoSaved] = useState(false);

  const demoProfiles = {
    linkedin: {
      url: 'https://www.linkedin.com/in/satyanadella',
      handle: 'in/satyanadella',
      name: 'Satya Nadella',
      title: 'Chairman and CEO at Microsoft',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    x: {
      url: 'https://x.com/sama',
      handle: '@sama',
      name: 'Sam Altman',
      title: 'CEO at OpenAI',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    instagram: {
      url: 'https://www.instagram.com/creators',
      handle: '@creators',
      name: 'Instagram Creators',
      title: 'Official account for creators',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    }
  };

  const currentProfile = demoProfiles[demoPlatform];

  const handleDemoSave = () => {
    setDemoSaved(true);
    setTimeout(() => {
      setDemoSaved(false);
    }, 2500);
  };

  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">SocialCRM</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
                Extension + Web
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollToPricing}
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition px-2.5 py-1.5 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Pricing</span>
            </button>

            <button
              onClick={() => setShowExtensionModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              Extension Files
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden md:inline">
                  Signed in as <strong className="text-slate-200">{user.email}</strong>
                </span>
                <button
                  onClick={onNavigateToApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Open CRM App
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={login}
                  className="px-3.5 py-1.5 rounded text-xs font-semibold text-slate-200 hover:bg-slate-800 transition border border-slate-700 cursor-pointer"
                >
                  Sign in with Google
                </button>
                <button
                  onClick={() => {
                    login();
                    onNavigateToApp();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Get Started Free
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900 to-slate-900 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Manifest V3 Zero-Scraping Chrome Extension
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
              Turn Social Profiles into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-teal-300">Actionable Deals</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Dock our lightweight sidebar while browsing <strong>LinkedIn, X, or Instagram</strong>. Save handles, categorize stages, set follow-up reminders, and sync instantly to your cloud CRM with 0 account ban risk.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (!user) login();
                  onNavigateToApp();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
              >
                Launch Web App
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowExtensionModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                Download Chrome Extension
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Safe (No DOM Scraping)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Cloud Sync
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free to use
              </span>
            </div>
          </div>

          {/* Interactive Extension Sidebar Preview */}
          <div className="max-w-5xl mx-auto bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur">
            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" /> Interactive Sidebar Simulator
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Experience how the docked Chrome sidebar captures URLs and syncs instantly without scraping.
                </p>
              </div>

              {/* Platform switcher tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded border border-slate-800">
                <button
                  onClick={() => setDemoPlatform('linkedin')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition ${
                    demoPlatform === 'linkedin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => setDemoPlatform('x')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition ${
                    demoPlatform === 'x' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  X (Twitter)
                </button>
                <button
                  onClick={() => setDemoPlatform('instagram')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition ${
                    demoPlatform === 'instagram' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Instagram
                </button>
              </div>
            </div>

            {/* Split Screen Layout: Browser Tab on Left, Docked Sidebar on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Simulated Browser Webpage */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
                <div>
                  {/* Browser URL Bar */}
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 mb-5 text-xs text-slate-400 font-mono">
                    <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="truncate text-slate-300">{currentProfile.url}</span>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start gap-4">
                    <img
                      src={currentProfile.avatar}
                      alt={currentProfile.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white">{currentProfile.name}</h3>
                      <p className="text-xs text-indigo-400 font-mono">{currentProfile.handle}</p>
                      <p className="text-xs text-slate-400 mt-1">{currentProfile.title}</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-2">
                    <p className="font-semibold text-slate-200">How the extension works here:</p>
                    <p className="text-slate-400 leading-relaxed">
                      Instead of reading private cookies or DOM text, the extension reads the clean URL from your active tab bar. You keep 100% control over notes, stage tags, and follow-ups.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Shortcut to toggle: <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Alt+Shift+S</kbd></span>
                  <span className="text-emerald-400 font-semibold">Active tab detected ✓</span>
                </div>
              </div>

              {/* Docked Chrome Extension Sidebar */}
              <div className="lg:col-span-5 bg-slate-950 border-2 border-indigo-500/40 rounded-lg p-4 flex flex-col justify-between shadow-xl">
                <div>
                  {/* Extension Sidebar Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-indigo-600 text-white rounded flex items-center justify-center font-bold text-xs">
                        ⚡
                      </div>
                      <span className="text-xs font-bold text-white">SocialCRM Sidebar</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                      Live Cloud Sync
                    </span>
                  </div>

                  {/* Active URL Card */}
                  <div className="mt-3 bg-slate-900 border border-slate-800 p-2.5 rounded">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold uppercase tracking-wider">Detected URL</span>
                      <span className="text-indigo-400 font-bold uppercase">{demoPlatform}</span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={currentProfile.url}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-slate-300 outline-none"
                    />
                    <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                      ✓ {currentProfile.handle}
                    </div>
                  </div>

                  {/* Stage & Tags */}
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Pipeline Stage
                      </label>
                      <select
                        value={demoStage}
                        onChange={(e) => setDemoStage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      >
                        <option value="lead">Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="conversation">In Discussion</option>
                        <option value="meeting">Meeting Booked</option>
                        <option value="opportunity">Opportunity</option>
                        <option value="customer">Customer / Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={demoTags}
                        onChange={(e) => setDemoTags(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Quick Note
                      </label>
                      <textarea
                        rows={2}
                        value={demoNote}
                        onChange={(e) => setDemoNote(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleDemoSave}
                    className={`w-full py-2 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      demoSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    {demoSaved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved to Cloud CRM!
                      </>
                    ) : (
                      <>
                        💾 Save Profile URL to CRM
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-900 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-4">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Transparent & Fair Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Start Free. Scale as You Grow.
            </h2>
            <p className="text-base text-slate-400 mt-3 max-w-xl mx-auto">
              Your first <strong>50 contacts are 100% free</strong> with full extension and cloud capabilities. Upgrade to Pro for <strong>$10/month</strong> for unlimited usage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between hover:border-slate-700 transition">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded">
                    Free Starter Tier
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">No credit card required</span>
                </div>

                <div className="flex items-baseline gap-2 my-6">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-sm text-slate-400 font-medium">/ forever</span>
                </div>

                <p className="text-sm text-slate-300 mb-6">
                  Everything you need to capture and organize your first 50 professional relationships.
                </p>

                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>First 50 contacts free</strong> forever</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Manifest V3 Chrome Extension Side Panel</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>LinkedIn, X & Instagram Profile Auto-Detection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pipeline Stages, Custom Tags & Pinned Notes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Follow-up Scheduled Alarms & Calendar Reminders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Live Google Firestore Cloud Sync</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Export to CSV & JSON Anytime</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (!user) login();
                    onNavigateToApp();
                  }}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <span>Start Free with 50 Contacts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pro Unlimited Card */}
            <div className="bg-gradient-to-b from-indigo-950/70 to-slate-950 border-2 border-indigo-500/80 rounded-2xl p-8 flex flex-col justify-between relative shadow-2xl shadow-indigo-950/50">
              <div className="absolute -top-3.5 right-6 bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                Most Popular
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded border border-indigo-500/30">
                    Pro Unlimited Plan
                  </span>
                  <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Unlimited Scale
                  </span>
                </div>

                <div className="flex items-baseline gap-2 my-6">
                  <span className="text-5xl font-black text-white">$10</span>
                  <span className="text-sm text-indigo-200 font-medium">/ month</span>
                </div>

                <p className="text-sm text-indigo-100 mb-6">
                  For creators, sales professionals, and agency founders who need unrestricted pipeline power.
                </p>

                <div className="space-y-3.5 text-xs text-indigo-100">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 font-bold" />
                    <span><strong>Unlimited Contacts</strong> (no 50 contact limit)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Priority Real-time Firestore Cloud Sync</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Automatic Extension Auto-Handshake</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Unlimited Notes, History & Reminders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Fast Full Database Export & Backups</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Early Access to Automation & AI Features</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Priority Direct Founder Support</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-indigo-900/60">
                <button
                  onClick={() => {
                    if (!user) login();
                    onNavigateToApp();
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/40 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Get Unlimited Usage for $10/mo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-slate-500 flex items-center justify-center gap-6">
            <span>✓ Cancel anytime with one click</span>
            <span>✓ No setup fees or hidden charges</span>
            <span>✓ 30-day money-back guarantee</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Built for Fast Relationship Building
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Everything you need to turn casual social connections into tracked opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-lg">
              <div className="w-10 h-10 bg-indigo-500/10 rounded flex items-center justify-center text-indigo-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Zero-Scraping Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Protects your LinkedIn and social accounts. The extension never injects intrusive scrapers or reads background DOM nodes.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-lg">
              <div className="w-10 h-10 bg-indigo-500/10 rounded flex items-center justify-center text-indigo-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Instant Cloud Sync</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless automatic handshake links the extension to your Google Firebase account in milliseconds. No manual keys needed.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-lg">
              <div className="w-10 h-10 bg-indigo-500/10 rounded flex items-center justify-center text-indigo-400 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Smart Follow-up Reminders</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Never lose a warm lead. Set scheduled alarms right from the sidebar that notify you when it's time to send a follow-up DM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SocialCRM</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowExtensionModal(true)}
              className="text-slate-400 hover:text-white transition"
            >
              Extension Package
            </button>
            <button
              onClick={onNavigateToApp}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition"
            >
              Open Web App ↗
            </button>
          </div>
        </div>
      </footer>

      {/* Extension Code & Download Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col text-slate-900">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Chrome Extension Package & Files</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manifest V3 Side Panel extension ready for local load unpacked and Chrome Web Store submission.
                </p>
              </div>
              <button
                onClick={() => setShowExtensionModal(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <ExtensionFilesViewer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
