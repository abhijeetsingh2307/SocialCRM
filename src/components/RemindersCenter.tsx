import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ExternalLink,
  Plus,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
} from 'lucide-react';
import { SocialContact, FollowUpReminder } from '../types';
import confetti from 'canvas-confetti';

interface RemindersCenterProps {
  contacts: SocialContact[];
  onSelectContact: (contact: SocialContact) => void;
  onUpdateContact: (contact: SocialContact) => void;
}

export const RemindersCenter: React.FC<RemindersCenterProps> = ({
  contacts,
  onSelectContact,
  onUpdateContact,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Flatten all reminders with their associated contact info
  const allReminders: { reminder: FollowUpReminder; contact: SocialContact }[] = [];
  contacts.forEach((c) => {
    (c.reminders || []).forEach((r) => {
      allReminders.push({ reminder: r, contact: c });
    });
  });

  const overdue = allReminders.filter((item) => !item.reminder.completed && item.reminder.date < todayStr);
  const dueToday = allReminders.filter((item) => !item.reminder.completed && item.reminder.date === todayStr);
  const upcoming = allReminders.filter((item) => !item.reminder.completed && item.reminder.date > todayStr);
  const completed = allReminders.filter((item) => item.reminder.completed);

  const handleToggleReminder = (contact: SocialContact, reminderId: string) => {
    const rem = contact.reminders.find((r) => r.id === reminderId);
    const willComplete = !rem?.completed;

    const updated: SocialContact = {
      ...contact,
      reminders: contact.reminders.map((r) =>
        r.id === reminderId
          ? {
              ...r,
              completed: willComplete,
              completedAt: willComplete ? new Date().toISOString() : undefined,
            }
          : r
      ),
      updatedAt: new Date().toISOString(),
    };

    if (willComplete) {
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      } catch {}
    }

    onUpdateContact(updated);
  };

  const handleSnooze = (contact: SocialContact, reminderId: string, days: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const dateStr = targetDate.toISOString().split('T')[0];

    const updated: SocialContact = {
      ...contact,
      reminders: contact.reminders.map((r) =>
        r.id === reminderId ? { ...r, date: dateStr, completed: false } : r
      ),
      updatedAt: new Date().toISOString(),
    };
    onUpdateContact(updated);
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
    <div className="space-y-6">
      {/* Reminders Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Overdue
            </span>
            <div className="text-2xl font-black text-rose-900 mt-0.5">
              {overdue.length}
            </div>
          </div>
          <AlertCircle className="w-8 h-8 text-rose-500/80" />
        </div>

        <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Due Today
            </span>
            <div className="text-2xl font-black text-amber-900 mt-0.5">
              {dueToday.length}
            </div>
          </div>
          <Clock className="w-8 h-8 text-amber-500/80" />
        </div>

        <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              Upcoming
            </span>
            <div className="text-2xl font-black text-indigo-900 mt-0.5">
              {upcoming.length}
            </div>
          </div>
          <Calendar className="w-8 h-8 text-indigo-500/80" />
        </div>

        <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Completed
            </span>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">
              {completed.length}
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/80" />
        </div>
      </div>

      {/* Overdue Section */}
      {overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <h3 className="font-bold text-sm text-slate-900">
              Overdue Reminders ({overdue.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdue.map(({ reminder, contact }) => {
              return (
                <div
                  key={reminder.id}
                  className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        onClick={() => onSelectContact(contact)}
                        className="text-left font-bold text-xs text-slate-900 hover:text-indigo-600 truncate flex items-center gap-1.5 cursor-pointer"
                      >
                        {getPlatformIcon(contact.platform)}
                        <span>{contact.handle}</span>
                      </button>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                        {reminder.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mb-3">
                      {reminder.note}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSnooze(contact, reminder.id, 1)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-medium rounded cursor-pointer"
                      >
                        +1 Day
                      </button>
                      <button
                        onClick={() => handleSnooze(contact, reminder.id, 3)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-medium rounded cursor-pointer"
                      >
                        +3 Days
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={contact.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-600 p-1"
                        title="Open Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleToggleReminder(contact, reminder.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Due Today Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <h3 className="font-bold text-sm text-slate-900">
            Due Today ({dueToday.length})
          </h3>
        </div>
        {dueToday.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dueToday.map(({ reminder, contact }) => {
              return (
                <div
                  key={reminder.id}
                  className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        onClick={() => onSelectContact(contact)}
                        className="text-left font-bold text-xs text-slate-900 hover:text-indigo-600 truncate flex items-center gap-1.5 cursor-pointer"
                      >
                        {getPlatformIcon(contact.platform)}
                        <span>{contact.handle}</span>
                      </button>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        Today {reminder.time ? `at ${reminder.time}` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mb-3">
                      {reminder.note}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSnooze(contact, reminder.id, 1)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-medium rounded cursor-pointer"
                      >
                        +1 Day
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={contact.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-600 p-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleToggleReminder(contact, reminder.id)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
            No follow-up reminders scheduled for today. Great job!
          </div>
        )}
      </div>

      {/* Upcoming Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <h3 className="font-bold text-sm text-slate-900">
            Upcoming Schedule ({upcoming.length})
          </h3>
        </div>
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcoming.map(({ reminder, contact }) => (
              <div
                key={reminder.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <button
                      onClick={() => onSelectContact(contact)}
                      className="text-left font-bold text-xs text-slate-900 hover:text-indigo-600 truncate flex items-center gap-1.5 cursor-pointer"
                    >
                      {getPlatformIcon(contact.platform)}
                      <span>{contact.handle}</span>
                    </button>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      📅 {reminder.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-normal mb-3">
                    {reminder.note}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Priority: {reminder.priority?.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleToggleReminder(contact, reminder.id)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
            No upcoming reminders.
          </div>
        )}
      </div>
    </div>
  );
};
