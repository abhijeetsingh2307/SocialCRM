import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Tag,
  Clock,
  FileText,
  Trash2,
  Calendar,
  Send,
  Plus,
  Star,
  CheckCircle2,
  MessageSquare,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Pin,
  Share2,
} from 'lucide-react';
import { SocialContact, ContactStage, ContactNote, FollowUpReminder } from '../types';
import { getPlatformBadge, STAGE_CONFIG } from '../utils/urlParser';
import confetti from 'canvas-confetti';

interface ContactDetailDrawerProps {
  contact: SocialContact | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateContact: (contact: SocialContact) => void;
  onDeleteContact: (id: string) => void;
  customTags: string[];
  onAddCustomTag: (tag: string) => void;
}

export const ContactDetailDrawer: React.FC<ContactDetailDrawerProps> = ({
  contact,
  isOpen,
  onClose,
  onUpdateContact,
  onDeleteContact,
  customTags,
  onAddCustomTag,
}) => {
  if (!isOpen || !contact) return null;

  const [activeTab, setActiveTab] = useState<'notes' | 'reminders' | 'templates'>('notes');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Note form state
  const [newNoteContent, setNewNoteContent] = useState('');

  // Reminder form state
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('10:00');
  const [newReminderNote, setNewReminderNote] = useState('');
  const [newReminderPriority, setNewReminderPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Tag state
  const [newTagInput, setNewTagInput] = useState('');

  const badge = getPlatformBadge(contact.platform);
  const stageCfg = STAGE_CONFIG[contact.stage] || STAGE_CONFIG.lead;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(contact.profileUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleStageChange = (newStage: ContactStage) => {
    onUpdateContact({
      ...contact,
      stage: newStage,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRatingChange = (newRating: number) => {
    onUpdateContact({
      ...contact,
      rating: newRating,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleTag = (tag: string) => {
    const currentTags = contact.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    onUpdateContact({
      ...contact,
      tags: updatedTags,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const currentTags = contact.tags || [];
    if (!currentTags.includes(trimmed)) {
      onUpdateContact({
        ...contact,
        tags: [...currentTags, trimmed],
        updatedAt: new Date().toISOString(),
      });
    }
    onAddCustomTag(trimmed);
    setNewTagInput('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const newNote: ContactNote = {
      id: 'note-' + Date.now(),
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
      isPinned: false,
    };

    onUpdateContact({
      ...contact,
      notes: [newNote, ...(contact.notes || [])],
      updatedAt: new Date().toISOString(),
    });

    setNewNoteContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateContact({
      ...contact,
      notes: contact.notes.filter((n) => n.id !== noteId),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleTogglePinNote = (noteId: string) => {
    onUpdateContact({
      ...contact,
      notes: contact.notes.map((n) =>
        n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderDate) return;

    const newRem: FollowUpReminder = {
      id: 'rem-' + Date.now(),
      date: newReminderDate,
      time: newReminderTime,
      note: newReminderNote.trim() || `Follow up with ${contact.handle}`,
      completed: false,
      priority: newReminderPriority,
      createdAt: new Date().toISOString(),
    };

    onUpdateContact({
      ...contact,
      reminders: [newRem, ...(contact.reminders || [])],
      updatedAt: new Date().toISOString(),
    });

    setNewReminderDate('');
    setNewReminderNote('');
  };

  const handleToggleReminder = (remId: string) => {
    const rem = contact.reminders.find((r) => r.id === remId);
    const willComplete = !rem?.completed;

    onUpdateContact({
      ...contact,
      reminders: contact.reminders.map((r) =>
        r.id === remId
          ? {
              ...r,
              completed: willComplete,
              completedAt: willComplete ? new Date().toISOString() : undefined,
            }
          : r
      ),
      updatedAt: new Date().toISOString(),
    });

    if (willComplete) {
      try {
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleDeleteReminder = (remId: string) => {
    onUpdateContact({
      ...contact,
      reminders: contact.reminders.filter((r) => r.id !== remId),
      updatedAt: new Date().toISOString(),
    });
  };

  const outreachTemplates = [
    {
      id: 'intro',
      title: 'Intro Message (LinkedIn / X DM)',
      text: `Hi ${contact.handle}! Came across your profile and noticed your inspiring work. Would love to connect and follow along with your journey!`,
    },
    {
      id: 'followup',
      title: 'Post-Discussion Follow Up',
      text: `Hi ${contact.handle}, following up on our recent exchange. Here is the link we discussed: ${contact.profileUrl}. Looking forward to continuing our conversation!`,
    },
    {
      id: 'meeting',
      title: 'Quick Chat Request',
      text: `Hi ${contact.handle}, would you be open to a brief 10-minute chat sometime next week? Let me know if anytime works best for you!`,
    },
  ];

  const handleCopyTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.badgeBg}`}>
                {badge.name}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${stageCfg.bg} ${stageCfg.text} ${stageCfg.border}`}>
                {stageCfg.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (confirm(`Remove this contact from CRM?`)) {
                    onDeleteContact(contact.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                title="Delete Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile Handle & URL Bar */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                {contact.handle}
              </h2>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyUrl}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>
                <a
                  href={contact.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-xs flex items-center gap-1.5 transition"
                >
                  <span>Visit Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-mono truncate mt-1">
              {contact.profileUrl}
            </p>
          </div>

          {/* Pipeline Stage Select & Priority Rating */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Pipeline Stage
              </label>
              <select
                value={contact.stage}
                onChange={(e) => handleStageChange(e.target.value as ContactStage)}
                className="w-full text-xs font-semibold p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                {Object.entries(STAGE_CONFIG).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Priority Rating
              </label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className="p-0.5 text-amber-400 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        (contact.rating || 0) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags Manager */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {customTags.map((t) => {
                const isSelected = (contact.tags || []).includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => handleToggleTag(t)}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
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
                placeholder="Create custom tag..."
                className="flex-1 text-xs p-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-5">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes ({contact.notes?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reminders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Follow-up Reminders ({contact.reminders?.filter((r) => !r.completed).length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'templates'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Outreach Templates</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50 space-y-4">
          
          {/* TAB 1: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <textarea
                  rows={2}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add note on discussions, background, mutual interests..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNoteContent.trim()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Note</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-2">
                {contact.notes && contact.notes.length > 0 ? (
                  contact.notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-xl border shadow-xs transition ${
                        note.isPinned
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTogglePinNote(note.id)}
                            className={`p-1 rounded hover:bg-slate-100 ${
                              note.isPinned ? 'text-amber-600 font-bold' : 'text-slate-400'
                            }`}
                            title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                    No notes recorded yet. Add your first context note above.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              {/* Add Reminder Form */}
              <form onSubmit={handleAddReminder} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Schedule Follow-up
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                  <input
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <input
                  type="text"
                  value={newReminderNote}
                  onChange={(e) => setNewReminderNote(e.target.value)}
                  placeholder="Task details (e.g. Ping on X DM with deck)..."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
                <div className="flex items-center justify-between pt-1">
                  <select
                    value={newReminderPriority}
                    onChange={(e) => setNewReminderPriority(e.target.value as any)}
                    className="text-[11px] p-1 bg-slate-100 border border-slate-200 rounded text-slate-700"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!newReminderDate}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Set Reminder</span>
                  </button>
                </div>
              </form>

              {/* Reminders List */}
              <div className="space-y-2">
                {contact.reminders && contact.reminders.length > 0 ? (
                  contact.reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className={`p-3 rounded-xl border shadow-xs flex items-start justify-between gap-3 ${
                        rem.completed
                          ? 'bg-slate-100/60 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => handleToggleReminder(rem.id)}
                          className={`mt-0.5 transition cursor-pointer ${
                            rem.completed ? 'text-emerald-600' : 'text-slate-300 hover:text-indigo-600'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              rem.completed ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {rem.date} {rem.time ? `at ${rem.time}` : ''}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              {rem.priority}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 ${rem.completed ? 'line-through text-slate-500' : 'text-slate-800 font-medium'}`}>
                            {rem.note}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                    No follow-up reminders scheduled.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: OUTREACH TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Pre-formatted personalized direct message templates for quick outreach:
              </div>

              {outreachTemplates.map((t) => (
                <div key={t.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {t.title}
                    </span>
                    <button
                      onClick={() => handleCopyTemplate(t.text, t.id)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-md flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedTemplate === t.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed">
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
          <span>Created: {new Date(contact.createdAt).toLocaleDateString()}</span>
          <span>Last updated: {new Date(contact.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
