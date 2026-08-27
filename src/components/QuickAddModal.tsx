import React, { useState } from 'react';
import {
  X,
  Plus,
  Tag,
  Clock,
  FileText,
  Save,
  Globe,
  Check,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { SocialContact, ContactStage } from '../types';
import { checkSocialProfile, STAGE_CONFIG, getPlatformBadge } from '../utils/urlParser';
import confetti from 'canvas-confetti';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveContact: (contact: Partial<SocialContact>) => void;
  customTags: string[];
  onAddCustomTag: (tag: string) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSaveContact,
  customTags,
  onAddCustomTag,
}) => {
  if (!isOpen) return null;

  const [rawUrl, setRawUrl] = useState('');
  const [stage, setStage] = useState<ContactStage>('lead');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [noteText, setNoteText] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('10:00');
  const [reminderNote, setReminderNote] = useState('');

  const check = checkSocialProfile(rawUrl);
  const badge = getPlatformBadge(check.platform);

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    onAddCustomTag(trimmed);
    setNewTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawUrl.trim()) return;

    const notes = [];
    if (noteText.trim()) {
      notes.push({
        id: 'note-' + Date.now(),
        content: noteText.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const reminders = [];
    if (reminderDate) {
      reminders.push({
        id: 'rem-' + Date.now(),
        date: reminderDate,
        time: reminderTime || '10:00',
        note: reminderNote.trim() || `Follow up with ${check.handle || 'contact'}`,
        completed: false,
        priority: 'medium' as const,
        createdAt: new Date().toISOString(),
      });
    }

    const newContact: Partial<SocialContact> = {
      id: 'contact-' + Date.now(),
      profileUrl: check.cleanUrl || rawUrl.trim(),
      platform: check.platform,
      handle: check.handle || rawUrl.trim(),
      stage,
      tags: selectedTags.length > 0 ? selectedTags : [badge.name],
      notes,
      reminders,
      rating: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveContact(newContact);
    try {
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              +
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Save Profile URL to CRM
              </h3>
              <p className="text-[11px] text-slate-500">
                Instantly check and add LinkedIn, X, or Instagram profile URLs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          
          {/* URL Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Profile URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={rawUrl}
                onChange={(e) => setRawUrl(e.target.value)}
                placeholder="e.g. https://www.linkedin.com/in/satyanadella, x.com/sama..."
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            
            {rawUrl && (
              <div className="mt-1.5 p-2 rounded-lg border text-xs flex items-center justify-between gap-2 bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2 truncate">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.badgeBg}`}>
                    {badge.name}
                  </span>
                  <span className="text-[11px] text-slate-600 font-mono truncate">
                    {check.handle ? `Identified: ${check.handle}` : check.statusMessage}
                  </span>
                </div>
                {check.isProfilePage && (
                  <span className="text-[10px] font-bold text-emerald-600 shrink-0">
                    ✓ Valid Profile
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pipeline Stage */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1">
              Pipeline Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as ContactStage)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {Object.entries(STAGE_CONFIG).map(([k, cfg]) => (
                <option key={k} value={k}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" /> Tags
            </label>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto mb-2">
              {customTags.map((t) => {
                const active = selectedTags.includes(t);
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => handleToggleTag(t)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
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
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add custom tag..."
                className="flex-1 text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-2.5 py-1.5 bg-slate-200 text-xs font-medium rounded-md cursor-pointer hover:bg-slate-300 text-slate-700"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Initial Note */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" /> Note / Context
            </label>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Why this profile was saved, discussion notes, referral source..."
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Follow-up Reminder */}
          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
            <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1 mb-2">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Schedule Follow-up Reminder (Optional)
            </span>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="text-xs p-1.5 bg-white border border-indigo-200 rounded-lg text-slate-900"
              />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="text-xs p-1.5 bg-white border border-indigo-200 rounded-lg text-slate-900"
              />
            </div>
            <input
              type="text"
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              placeholder="Reminder task (e.g. Send intro message, share deck)..."
              className="w-full text-xs p-1.5 bg-white border border-indigo-200 rounded-lg text-slate-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!rawUrl.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Contact to CRM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
