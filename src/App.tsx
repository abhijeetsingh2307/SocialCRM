import React, { useState, useEffect, useMemo } from 'react';
import {
  SocialContact,
  ViewMode,
  FilterState,
  ContactStage,
} from './types';
import {
  getStoredContacts,
  saveStoredContacts,
  getStoredCustomTags,
  saveStoredCustomTags,
  exportContactsAsJson,
  exportContactsAsCsv,
} from './services/storage';
import {
  subscribeToUserContacts,
  saveContactToCloud,
  deleteContactFromCloud,
  saveBatchContactsToCloud,
  subscribeToUserTags,
  saveUserTagsToCloud,
} from './services/firebase';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { ContactsTable } from './components/ContactsTable';
import { RemindersCenter } from './components/RemindersCenter';
import { ExtensionFilesViewer } from './components/ExtensionFilesViewer';
import { ExtensionSimulatorModal } from './components/ExtensionSimulatorModal';
import { ContactDetailDrawer } from './components/ContactDetailDrawer';
import { QuickAddModal } from './components/QuickAddModal';
import {
  Users,
  Clock,
  Sparkles,
  Layers,
  Plus,
  Compass,
  ArrowRight,
  CheckCircle2,
  Cloud,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, login } = useAuth();
  const [contacts, setContacts] = useState<SocialContact[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedContact, setSelectedContact] = useState<SocialContact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExtensionSimOpen, setIsExtensionSimOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [simInitialUrl, setSimInitialUrl] = useState<string | undefined>(undefined);

  const [filter, setFilter] = useState<FilterState>({
    search: '',
    platform: 'all',
    stage: 'all',
    tag: 'all',
    reminderFilter: 'all',
    sortBy: 'recent',
    sortOrder: 'desc',
  });

  // Load contacts and custom tags on mount or auth change
  useEffect(() => {
    if (user) {
      // User is logged in: Subscribe to live Firestore database
      let isFirstEmission = true;
      const unsubContacts = subscribeToUserContacts(
        user.uid,
        (cloudContacts) => {
          if (cloudContacts.length === 0 && isFirstEmission) {
            // First time cloud user: Seed with local contacts if available
            const localContacts = getStoredContacts();
            if (localContacts.length > 0) {
              saveBatchContactsToCloud(user.uid, localContacts).catch(console.error);
            }
          }
          isFirstEmission = false;
          setContacts(cloudContacts);
          saveStoredContacts(cloudContacts);
        },
        (error) => {
          console.warn('Fallback to local storage due to cloud error:', error);
          const fallback = getStoredContacts();
          setContacts(fallback);
        }
      );

      const unsubTags = subscribeToUserTags(user.uid, (cloudTags) => {
        if (cloudTags && cloudTags.length > 0) {
          setCustomTags(cloudTags);
          saveStoredCustomTags(cloudTags);
        }
      });

      return () => {
        unsubContacts();
        unsubTags();
      };
    } else {
      // User is in local / guest mode
      const loadedContacts = getStoredContacts();
      setContacts(loadedContacts);
      const loadedTags = getStoredCustomTags();
      setCustomTags(loadedTags);

      const handleSync = (e: any) => {
        if (e.detail) {
          setContacts(e.detail);
        }
      };

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'social_crm_contacts_v2' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setContacts(parsed);
          } catch (err) {
            // ignore
          }
        }
      };

      window.addEventListener('social_crm_updated', handleSync);
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('social_crm_updated', handleSync);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [user]);

  // Save contacts whenever updated
  const updateContactsState = (updatedList: SocialContact[]) => {
    setContacts(updatedList);
    saveStoredContacts(updatedList);
  };

  const handleAddCustomTag = (newTag: string) => {
    if (!customTags.includes(newTag)) {
      const updated = [...customTags, newTag];
      setCustomTags(updated);
      saveStoredCustomTags(updated);
      if (user) {
        saveUserTagsToCloud(user.uid, updated).catch(console.error);
      }
    }
  };

  // Save or Update contact from Simulator / Quick Add Modal
  const handleSaveContactFromModal = (contactData: Partial<SocialContact>) => {
    const targetUrl = (contactData.profileUrl || '').toLowerCase();
    const existingIndex = contacts.findIndex(
      (c) =>
        c.id === contactData.id ||
        c.profileUrl.toLowerCase() === targetUrl
    );

    let updatedList: SocialContact[];
    let contactToPersist: SocialContact;

    if (existingIndex >= 0) {
      const merged: SocialContact = {
        ...contacts[existingIndex],
        ...contactData,
        updatedAt: new Date().toISOString(),
      } as SocialContact;
      updatedList = [...contacts];
      updatedList[existingIndex] = merged;
      contactToPersist = merged;
    } else {
      const newContact: SocialContact = {
        id: contactData.id || 'contact-' + Date.now(),
        profileUrl: contactData.profileUrl || '',
        platform: contactData.platform || 'other',
        handle: contactData.handle || contactData.profileUrl || 'Profile',
        stage: contactData.stage || 'lead',
        tags: contactData.tags || ['Social Lead'],
        notes: contactData.notes || [],
        reminders: contactData.reminders || [],
        rating: contactData.rating || 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList = [newContact, ...contacts];
      contactToPersist = newContact;
    }

    updateContactsState(updatedList);

    // Save to Cloud if logged in
    if (user) {
      saveContactToCloud(user.uid, contactToPersist).catch(console.error);
    }

    // If currently selected, keep drawer updated
    if (selectedContact && (selectedContact.id === contactData.id || selectedContact.profileUrl.toLowerCase() === targetUrl)) {
      const current = updatedList.find((c) => c.id === contactData.id || c.profileUrl.toLowerCase() === targetUrl);
      if (current) setSelectedContact(current);
    }
  };

  // Direct contact update (e.g. from drawer or table stage change)
  const handleUpdateContact = (updatedContact: SocialContact) => {
    const updatedList = contacts.map((c) =>
      c.id === updatedContact.id ? updatedContact : c
    );
    updateContactsState(updatedList);
    if (selectedContact?.id === updatedContact.id) {
      setSelectedContact(updatedContact);
    }
    if (user) {
      saveContactToCloud(user.uid, updatedContact).catch(console.error);
    }
  };

  const handleUpdateStage = (contactId: string, newStage: ContactStage) => {
    const target = contacts.find((c) => c.id === contactId);
    if (!target) return;
    const updated = { ...target, stage: newStage, updatedAt: new Date().toISOString() };
    const updatedList = contacts.map((c) => (c.id === contactId ? updated : c));
    updateContactsState(updatedList);
    if (user) {
      saveContactToCloud(user.uid, updated).catch(console.error);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    const updatedList = contacts.filter((c) => c.id !== contactId);
    updateContactsState(updatedList);
    if (selectedContact?.id === contactId) {
      setSelectedContact(null);
      setIsDetailOpen(false);
    }
    if (user) {
      deleteContactFromCloud(user.uid, contactId).catch(console.error);
    }
  };

  const handleSelectContact = (contact: SocialContact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleClearFilters = () => {
    setFilter({
      search: '',
      platform: 'all',
      stage: 'all',
      tag: 'all',
      reminderFilter: 'all',
      sortBy: 'recent',
      sortOrder: 'desc',
    });
  };

  // Filtered & Sorted contacts
  const filteredContacts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const q = filter.search.toLowerCase().trim();

    return contacts.filter((c) => {
      // Platform filter
      if (filter.platform !== 'all' && c.platform !== filter.platform) return false;

      // Stage filter
      if (filter.stage !== 'all' && c.stage !== filter.stage) return false;

      // Tag filter
      if (filter.tag && filter.tag !== 'all' && !c.tags?.includes(filter.tag)) return false;

      // Reminder status filter
      if (filter.reminderFilter !== 'all') {
        const pending = (c.reminders || []).filter((r) => !r.completed);
        const hasToday = pending.some((r) => r.date === todayStr);
        const hasOverdue = pending.some((r) => r.date < todayStr);
        const hasUpcoming = pending.some((r) => r.date > todayStr);
        const hasCompleted = (c.reminders || []).some((r) => r.completed);

        if (filter.reminderFilter === 'today' && !hasToday) return false;
        if (filter.reminderFilter === 'overdue' && !hasOverdue) return false;
        if (filter.reminderFilter === 'upcoming' && !hasUpcoming) return false;
        if (filter.reminderFilter === 'completed' && !hasCompleted) return false;
      }

      // Search query filter
      if (q) {
        const inHandle = c.handle?.toLowerCase().includes(q);
        const inUrl = c.profileUrl?.toLowerCase().includes(q);
        const inTags = c.tags?.some((t) => t.toLowerCase().includes(q));
        const inNotes = c.notes?.some((n) => n.content.toLowerCase().includes(q));
        const inReminders = c.reminders?.some((r) => r.note.toLowerCase().includes(q));

        if (!inHandle && !inUrl && !inTags && !inNotes && !inReminders) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filter.sortBy === 'url') {
        const res = (a.handle || a.profileUrl).localeCompare(b.handle || b.profileUrl);
        return filter.sortOrder === 'asc' ? res : -res;
      }
      if (filter.sortBy === 'rating') {
        const res = (a.rating || 0) - (b.rating || 0);
        return filter.sortOrder === 'asc' ? res : -res;
      }
      if (filter.sortBy === 'stage') {
        const res = a.stage.localeCompare(b.stage);
        return filter.sortOrder === 'asc' ? res : -res;
      }
      // default recent
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return filter.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [contacts, filter]);

  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = contacts.reduce((acc, c) => {
    return acc + (c.reminders || []).filter((r) => !r.completed && r.date === todayStr).length;
  }, 0);

  // Available tags list
  const availableTags = useMemo(() => {
    const set = new Set<string>(customTags);
    contacts.forEach((c) => (c.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [contacts, customTags]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top App Navbar */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenExtensionSimulator={() => {
          setSimInitialUrl(undefined);
          setIsExtensionSimOpen(true);
        }}
        onExportJson={() => exportContactsAsJson(contacts)}
        onExportCsv={() => exportContactsAsCsv(contacts)}
        totalContacts={contacts.length}
        dueTodayCount={dueTodayCount}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Live Cloud Banner for Guest Users */}
        {!user && !authLoading && (
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 border border-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="font-bold text-xs">Free 1000 contacts for each platform</p>
                <p className="text-[11px] text-slate-300">
                  Get started for free · Sync your contacts, notes, and reminders across all devices.
                </p>
              </div>
            </div>
            <button
              onClick={login}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 shadow-xs active:bg-slate-200"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              <span>Get Started for Free</span>
            </button>
          </div>
        )}

        {/* Quick Filter Bar (shown on contacts and reminder views) */}
        {viewMode !== 'extension-code' && (
          <FilterBar
            filter={filter}
            onFilterChange={setFilter}
            availableTags={availableTags}
            totalCount={contacts.length}
            filteredCount={filteredContacts.length}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* View 1: Table Mode */}
        {viewMode === 'table' && (
          <div>
            {filteredContacts.length > 0 ? (
              <ContactsTable
                contacts={filteredContacts}
                onSelectContact={handleSelectContact}
                onUpdateStage={handleUpdateStage}
                onDeleteContact={handleDeleteContact}
              />
            ) : (
              <div className="py-16 text-center bg-white border border-slate-200 shadow-xs space-y-2">
                <p className="text-sm font-semibold text-slate-700">No contacts found</p>
                <p className="text-xs text-slate-400">
                  Try clearing your search filters or click <strong>Extension Sidebar</strong> to save profile URLs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* View 2: Follow-up Reminders Center */}
        {viewMode === 'reminders' && (
          <RemindersCenter
            contacts={contacts}
            onSelectContact={handleSelectContact}
            onUpdateContact={handleUpdateContact}
          />
        )}

        {/* View 3: Extension Package Files */}
        {viewMode === 'extension-code' && <ExtensionFilesViewer />}
      </main>

      {/* Slide-over Contact Detail Drawer */}
      <ContactDetailDrawer
        contact={selectedContact}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedContact(null);
        }}
        onUpdateContact={handleUpdateContact}
        onDeleteContact={handleDeleteContact}
        customTags={customTags}
        onAddCustomTag={handleAddCustomTag}
      />

      {/* Chrome Extension Live Tab Simulator Modal */}
      <ExtensionSimulatorModal
        isOpen={isExtensionSimOpen}
        onClose={() => setIsExtensionSimOpen(false)}
        onSaveContact={handleSaveContactFromModal}
        existingContacts={contacts}
        initialUrl={simInitialUrl}
        customTags={customTags}
        onAddCustomTag={handleAddCustomTag}
      />

      {/* Quick Add URL Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSaveContact={handleSaveContactFromModal}
        customTags={customTags}
        onAddCustomTag={handleAddCustomTag}
      />

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 py-4 bg-white text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SocialCRM · Privacy-Safe Profile URL Management</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-emerald-600 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {user ? '🟢 Live Firestore Cloud Sync' : 'Local Storage Sync'}
            </span>
            <button
              onClick={() => {
                setSimInitialUrl(undefined);
                setIsExtensionSimOpen(true);
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Open Extension Sidebar Simulator
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
