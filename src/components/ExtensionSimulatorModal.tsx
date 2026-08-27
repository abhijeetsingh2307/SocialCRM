import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Save,
  Tag,
  Clock,
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Plus,
  RefreshCw,
  Copy,
  PanelRightClose,
  PanelRightOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SocialContact, ContactStage, ChromeTabMock, Platform } from '../types';
import { checkSocialProfile, getPlatformBadge, STAGE_CONFIG } from '../utils/urlParser';
import confetti from 'canvas-confetti';

interface ExtensionSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveContact: (contactData: Partial<SocialContact>) => void;
  existingContacts: SocialContact[];
  initialUrl?: string;
  customTags: string[];
  onAddCustomTag: (tag: string) => void;
}

const SAMPLE_TABS: ChromeTabMock[] = [
  {
    id: 'tab-li',
    title: 'Satya Nadella | LinkedIn',
    url: 'https://www.linkedin.com/in/satyanadella',
    platform: 'linkedin',
    isProfilePage: true,
    pageSnippet: 'LinkedIn Member Profile — Chairman and CEO at Microsoft',
  },
  {
    id: 'tab-x',
    title: 'Sam Altman (@sama) / X',
    url: 'https://x.com/sama',
    platform: 'x',
    isProfilePage: true,
    pageSnippet: 'X Profile — @sama • CEO at OpenAI',
  },
  {
    id: 'tab-ig',
    title: 'Mark Zuckerberg (@zuck) • Instagram',
    url: 'https://www.instagram.com/zuck/',
    platform: 'instagram',
    isProfilePage: true,
    pageSnippet: 'Instagram Profile — @zuck • 15.2M Followers',
  },
  {
    id: 'tab-li-feed',
    title: 'Feed | LinkedIn',
    url: 'https://www.linkedin.com/feed/',
    platform: 'linkedin',
    isProfilePage: false,
    pageSnippet: 'LinkedIn Newsfeed & Updates (Non-profile tab)',
  },
  {
    id: 'tab-google',
    title: 'Google Search: AI Founders',
    url: 'https://www.google.com/search?q=AI+Founders',
    platform: 'other',
    isProfilePage: false,
    pageSnippet: 'Google Search Results (Non-profile tab)',
  },
];

export const ExtensionSimulatorModal: React.FC<ExtensionSimulatorProps> = ({
  isOpen,
  onClose,
  onSaveContact,
  existingContacts,
  initialUrl,
  customTags,
  onAddCustomTag,
}) => {
  const [activeTab, setActiveTab] = useState<ChromeTabMock>(SAMPLE_TABS[0]);
  const [browserAddress, setBrowserAddress] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form State in Sidebar
  const [capturedUrl, setCapturedUrl] = useState('');
  const [stage, setStage] = useState<ContactStage>('lead');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('10:00');
  const [reminderNote, setReminderNote] = useState('');
  const [reminderPriority, setReminderPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Synchronize when simulated tab or initialUrl changes
  useEffect(() => {
    const targetUrl = initialUrl || activeTab.url;
    setBrowserAddress(targetUrl);
    setCapturedUrl(targetUrl);

    const check = checkSocialProfile(targetUrl);

    // Check if this profile URL is already saved in the CRM
    const existing = existingContacts.find(
      (c) =>
        c.profileUrl.toLowerCase() === targetUrl.toLowerCase() ||
        (check.cleanUrl && c.profileUrl.toLowerCase() === check.cleanUrl.toLowerCase())
    );

    if (existing) {
      setStage(existing.stage);
      setSelectedTags(existing.tags || []);
    } else {
      setStage('lead');
      const defaultTag =
        check.platform === 'linkedin'
          ? 'LinkedIn'
          : check.platform === 'x'
          ? 'X'
          : check.platform === 'instagram'
          ? 'Instagram'
          : 'Social Lead';
      setSelectedTags([defaultTag]);
    }

    setNoteContent('');
    setReminderDate('');
    setReminderNote('');
    setSavedSuccess(false);
  }, [activeTab, initialUrl, isOpen, existingContacts]);

  if (!isOpen) return null;

  const currentCheck = checkSocialProfile(browserAddress);
  const platformBadge = getPlatformBadge(currentCheck.platform);

  const existingContact = existingContacts.find(
    (c) =>
      c.profileUrl.toLowerCase() === browserAddress.toLowerCase() ||
      (currentCheck.cleanUrl && c.profileUrl.toLowerCase() === currentCheck.cleanUrl.toLowerCase())
  );

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddNewTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    onAddCustomTag(trimmed);
    setNewTagInput('');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentCheck.cleanUrl || browserAddress);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSaveToCrm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCheck.cleanUrl && !browserAddress.trim()) return;

    const urlToSave = currentCheck.cleanUrl || browserAddress.trim();
    const notesToSave = existingContact ? [...existingContact.notes] : [];

    if (noteContent.trim()) {
      notesToSave.unshift({
        id: 'note-' + Date.now(),
        content: noteContent.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const remindersToSave = existingContact ? [...existingContact.reminders] : [];
    if (reminderDate) {
      remindersToSave.unshift({
        id: 'rem-' + Date.now(),
        date: reminderDate,
        time: reminderTime || '10:00',
        note: reminderNote.trim() || `Follow up with ${currentCheck.handle || 'contact'}`,
        completed: false,
        priority: reminderPriority,
        createdAt: new Date().toISOString(),
      });
    }

    const contactPayload: Partial<SocialContact> = {
      id: existingContact?.id || 'contact-' + Date.now(),
      profileUrl: urlToSave,
      platform: currentCheck.platform,
      handle: currentCheck.handle || urlToSave,
      stage: stage,
      tags: selectedTags.length > 0 ? selectedTags : ['Social Contact'],
      notes: notesToSave,
      reminders: remindersToSave,
      rating: existingContact?.rating || 3,
      createdAt: existingContact?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveContact(contactPayload);
    setSavedSuccess(true);

    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {}

    setTimeout(() => {
      setSavedSuccess(false);
      setNoteContent('');
      setReminderDate('');
      setReminderNote('');
    }, 2000);
  };

  const handleNavigateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const check = checkSocialProfile(browserAddress);
    setCapturedUrl(browserAddress);
    setActiveTab({
      id: 'custom-' + Date.now(),
      title: check.handle ? `${check.handle} - Social Profile` : 'Web Browser Tab',
      url: browserAddress,
      platform: check.platform,
      isProfilePage: check.isProfilePage,
      pageSnippet: check.statusMessage,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Browser Top Window Header */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 items-center">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
            </div>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Google Chrome Browser with Extension Sidebar</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Live URL Checker
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-2.5 py-1 text-xs bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Toggle Chrome Sidebar"
            >
              {sidebarOpen ? (
                <>
                  <PanelRightClose className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Hide Sidebar</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Open Sidebar</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Tabs Bar */}
        <div className="bg-slate-200/90 px-3 pt-2 pb-0 flex items-center gap-1 overflow-x-auto border-b border-slate-300">
          {SAMPLE_TABS.map((tab) => {
            const isSelected = activeTab.url === tab.url;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab);
                  setBrowserAddress(tab.url);
                }}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-medium border-t border-x transition flex items-center gap-1.5 shrink-0 max-w-[200px] cursor-pointer ${
                  isSelected
                    ? 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    : 'bg-slate-200/60 border-transparent text-slate-600 hover:bg-slate-100/70'
                }`}
              >
                {tab.platform === 'linkedin' && <Linkedin className="w-3 h-3 text-[#0a66c2] shrink-0" />}
                {tab.platform === 'x' && <Twitter className="w-3 h-3 text-zinc-900 shrink-0" />}
                {tab.platform === 'instagram' && <Instagram className="w-3 h-3 text-[#e1306c] shrink-0" />}
                {tab.platform === 'other' && <Globe className="w-3 h-3 text-slate-500 shrink-0" />}
                <span className="truncate text-[11px]">{tab.title}</span>
                {tab.isProfilePage && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Profile Page Detected"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Browser Address Bar */}
        <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center gap-2">
          <form onSubmit={handleNavigateAddress} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={browserAddress}
                onChange={(e) => setBrowserAddress(e.target.value)}
                placeholder="Enter any LinkedIn, X, or Instagram profile URL..."
                className="w-full pl-8 pr-20 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    currentCheck.isProfilePage
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {currentCheck.isProfilePage ? 'Profile Detected' : 'Non-Profile'}
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Check URL</span>
            </button>
          </form>
        </div>

        {/* Main Viewport: Tab Content (Left) + Extension Sidebar (Right) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Active Tab Webpage View */}
          <div className="flex-1 bg-slate-100 p-6 overflow-y-auto flex flex-col justify-between">
            <div className="max-w-xl mx-auto w-full space-y-4">
              
              {/* Simulated Browser Webpage Header Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${platformBadge.badgeBg}`}>
                      {platformBadge.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono truncate max-w-[240px]">
                      {browserAddress}
                    </span>
                  </div>
                  <a
                    href={browserAddress}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1"
                  >
                    <span>Open in Real Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Tab Simulation Visual */}
                {currentCheck.isProfilePage ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
                        {currentCheck.handle.replace(/^in\/|^@/, '').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {currentCheck.handle}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                            Active Profile
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {currentCheck.cleanUrl}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {activeTab.pageSnippet || 'Social Profile page detected by extension sidebar.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Zero Web Scraping / Pure URL Capture</div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          The sidebar captures the verified profile URL directly from the tab without scraping or extracting private DOM data. All CRM notes, tags, and follow-ups you enter in the sidebar sync seamlessly.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Non-Profile Page Detected
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      {currentCheck.statusMessage}
                    </p>
                    <p className="text-[11px] text-indigo-600">
                      💡 Click on Satya Nadella, Sam Altman, or Mark Zuckerberg tab above to see instant profile detection!
                    </p>
                  </div>
                )}
              </div>

              {/* CRM Synchronization Status */}
              {existingContact && (
                <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 text-xs text-indigo-900">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Existing Contact in Social CRM Database
                  </div>
                  <p className="text-[11px] text-indigo-700">
                    This profile URL is already saved with <strong>{existingContact.notes?.length || 0} notes</strong> and{' '}
                    <strong>{existingContact.reminders?.filter((r) => !r.completed).length || 0} pending reminders</strong>. The sidebar has pre-loaded all data for immediate updates.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Status Tip */}
            <div className="text-center text-[11px] text-slate-400 pt-4">
              ⌨️ Keyboard Shortcut in Chrome: <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700">Alt+Shift+S</kbd> to toggle the Social CRM Sidebar anytime.
            </div>
          </div>

          {/* Right: Docked Extension Sidebar */}
          {sidebarOpen ? (
            <div className="w-full sm:w-[400px] bg-white border-l border-slate-200 flex flex-col justify-between shadow-xl z-10">
              
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <h2 className="font-bold text-xs text-slate-900">
                      Social CRM Sidebar
                    </h2>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active Tab Monitor
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Side Panel
                </span>
              </div>

              {/* Sidebar Scrollable Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                
                {/* 1. URL Detection Card */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Detected Profile URL
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${platformBadge.badgeBg}`}>
                      {platformBadge.name}
                    </span>
                  </div>

                  {currentCheck.isProfilePage ? (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={currentCheck.cleanUrl}
                          className="w-full text-xs font-mono bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyUrl}
                          className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
                          title="Copy Profile URL"
                        >
                          {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-emerald-600 font-medium">
                        <span>✓ URL verified: {currentCheck.handle}</span>
                        {existingContact && <span className="text-amber-600 font-bold">Already in CRM</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1">
                      <div className="font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        No Social Profile Detected
                      </div>
                      <p className="text-[11px] text-amber-700 leading-tight">
                        Navigate to a LinkedIn, X, or Instagram profile page, or paste a profile URL in the address bar above.
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Controls for Notes, Tags, Stage, Reminders */}
                <form id="sidebar-form" onSubmit={handleSaveToCrm} className="space-y-3.5">
                  
                  {/* Pipeline Stage */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                      Pipeline Stage
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as ContactStage)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {Object.entries(STAGE_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" /> Tags
                      </label>
                      <span className="text-[10px] text-slate-400">Click to assign</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto">
                      {customTags.map((t) => {
                        const active = selectedTags.includes(t);
                        return (
                          <button
                            type="button"
                            key={t}
                            onClick={() => handleToggleTag(t)}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer border ${
                              active
                                ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {active ? '✓ ' : '+ '}
                            {t}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={handleAddNewTag}
                        placeholder="Add new tag..."
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewTag}
                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-md cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Quick Notes */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" /> Add Note / Context
                    </label>
                    <textarea
                      rows={2}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Why saved, conversation notes, discussion context..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    ></textarea>

                    {/* Past Notes history if existing contact */}
                    {existingContact && existingContact.notes.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Existing Notes History ({existingContact.notes.length})
                        </span>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                          {existingContact.notes.map((n) => (
                            <div key={n.id} className="p-2 bg-slate-50 rounded-md border border-slate-200 text-[11px] text-slate-700">
                              <p>{n.content}</p>
                              <span className="text-[9px] text-slate-400 mt-0.5 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Reminder */}
                  <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                    <label className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5 mb-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Set Follow-up Reminder
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Date</label>
                        <input
                          type="date"
                          value={reminderDate}
                          onChange={(e) => setReminderDate(e.target.value)}
                          className="w-full text-xs bg-white border border-indigo-200 rounded-md p-1.5 text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-0.5">Time</label>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="w-full text-xs bg-white border border-indigo-200 rounded-md p-1.5 text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={reminderNote}
                      onChange={(e) => setReminderNote(e.target.value)}
                      placeholder="Task (e.g. Send intro message, share deck)..."
                      className="w-full text-xs bg-white border border-indigo-200 rounded-md p-1.5 text-slate-800 focus:outline-none"
                    />
                  </div>
                </form>
              </div>

              {/* Sidebar Action Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
                <button
                  type="submit"
                  form="sidebar-form"
                  disabled={!currentCheck.cleanUrl && !browserAddress.trim()}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                    savedSuccess
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved & Synced to Social CRM!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{existingContact ? 'Update Contact in CRM' : 'Save Profile to Social CRM'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Real-time Storage Sync
                  </span>
                  <button
                    onClick={onClose}
                    className="text-indigo-600 hover:underline font-medium cursor-pointer"
                  >
                    View in Main CRM ↗
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 border-l border-slate-200 flex flex-col items-center justify-start pt-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition cursor-pointer flex flex-col items-center gap-1"
                title="Expand Extension Sidebar"
              >
                <PanelRightOpen className="w-5 h-5" />
                <span className="text-[10px] font-bold [writing-mode:vertical-rl] py-2">
                  OPEN SIDEBAR
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
