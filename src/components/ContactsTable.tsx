import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Clock,
  FileText,
  Trash2,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Tag,
  Star,
} from 'lucide-react';
import { SocialContact, ContactStage } from '../types';
import { STAGE_CONFIG } from '../utils/urlParser';

interface ContactsTableProps {
  contacts: SocialContact[];
  onSelectContact: (contact: SocialContact) => void;
  onUpdateStage: (contactId: string, stage: ContactStage) => void;
  onDeleteContact: (contactId: string) => void;
}

export const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  onSelectContact,
  onUpdateStage,
  onDeleteContact,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleCopyUrl = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" />;
      case 'x':
        return <Twitter className="w-3.5 h-3.5 text-zinc-900" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-[#e1306c]" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Platform & Profile URL</th>
              <th className="py-3 px-3">Pipeline Stage</th>
              <th className="py-3 px-3">Tags</th>
              <th className="py-3 px-3">Follow-up Reminder</th>
              <th className="py-3 px-3 text-center">Notes</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {contacts.map((contact) => {
              const stageCfg = STAGE_CONFIG[contact.stage] || STAGE_CONFIG.lead;

              const pendingReminders = (contact.reminders || []).filter((r) => !r.completed);
              const overdueReminder = pendingReminders.find((r) => r.date < todayStr);
              const todayReminder = pendingReminders.find((r) => r.date === todayStr);
              const nextReminder = overdueReminder || todayReminder || pendingReminders[0];

              return (
                <tr
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className="hover:bg-slate-50/90 transition cursor-pointer group"
                >
                  {/* Platform & Profile URL */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                        {getPlatformIcon(contact.platform)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                            {contact.handle || 'Social Profile'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono truncate mt-0.5">
                          <span className="truncate">{contact.profileUrl}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Stage Dropdown */}
                  <td className="py-3.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={contact.stage}
                      onChange={(e) => onUpdateStage(contact.id, e.target.value as ContactStage)}
                      className={`text-xs font-semibold py-1 px-2.5 rounded-lg border focus:outline-none transition cursor-pointer ${stageCfg.bg} ${stageCfg.text} ${stageCfg.border}`}
                    >
                      {Object.entries(STAGE_CONFIG).map(([k, cfg]) => (
                        <option key={k} value={k}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Tags */}
                  <td className="py-3.5 px-3 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags && contact.tags.length > 0 ? (
                        contact.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400">No tags</span>
                      )}
                      {contact.tags && contact.tags.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          +{contact.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Follow-up Reminder */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {nextReminder ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            nextReminder.date < todayStr
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : nextReminder.date === todayStr
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{nextReminder.date < todayStr ? 'Overdue: ' : nextReminder.date === todayStr ? 'Today: ' : ''}{nextReminder.date}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">None scheduled</span>
                    )}
                  </td>

                  {/* Notes Count */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                      <FileText className="w-3 h-3 text-slate-400" />
                      {contact.notes?.length || 0}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleCopyUrl(e, contact.profileUrl, contact.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Copy Profile URL"
                      >
                        {copiedId === contact.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <a
                        href={contact.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => {
                          if (confirm(`Remove this contact (${contact.handle}) from CRM?`)) {
                            onDeleteContact(contact.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
