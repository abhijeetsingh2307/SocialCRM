import { SocialContact } from '../types';

const STORAGE_KEY = 'social_crm_contacts_v2';
const TAGS_KEY = 'social_crm_custom_tags_v2';

export const INITIAL_TAGS: string[] = [
  'Investor',
  'Founder',
  'Warm Lead',
  'Creator',
  'Tech Lead',
  'Advisory',
  'Outreach Needed',
  'VIP',
  'Podcast Guest',
];

const getTodayDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_CONTACTS: SocialContact[] = [
  {
    id: 'contact-1',
    profileUrl: 'https://www.linkedin.com/in/satyanadella',
    platform: 'linkedin',
    handle: 'in/satyanadella',
    stage: 'partner',
    tags: ['Founder', 'VIP', 'Tech Lead'],
    notes: [
      {
        id: 'n-1',
        content: 'Met briefly at the keynote. Discussed developer tooling and browser extension integrations.',
        createdAt: '2026-08-20T14:30:00Z',
        isPinned: true,
      },
      {
        id: 'n-2',
        content: 'Saved profile URL via sidebar extension directly from LinkedIn tab.',
        createdAt: '2026-08-22T09:15:00Z',
      },
    ],
    reminders: [
      {
        id: 'r-1',
        date: getTodayDateStr(0),
        time: '14:00',
        note: 'Send follow-up message regarding social CRM data synchronization pilot.',
        completed: false,
        priority: 'high',
        createdAt: '2026-08-22T09:20:00Z',
      },
    ],
    rating: 5,
    createdAt: '2026-08-20T14:00:00Z',
    updatedAt: '2026-08-22T09:20:00Z',
    lastContactedAt: '2026-08-22T09:15:00Z',
  },
  {
    id: 'contact-2',
    profileUrl: 'https://x.com/sama',
    platform: 'x',
    handle: '@sama',
    stage: 'meeting',
    tags: ['Founder', 'Investor', 'Warm Lead'],
    notes: [
      {
        id: 'n-3',
        content: 'Saved X profile URL from active tab. Discussed browser agents and workflow tools.',
        createdAt: '2026-08-21T18:00:00Z',
        isPinned: true,
      },
    ],
    reminders: [
      {
        id: 'r-2',
        date: getTodayDateStr(2),
        time: '10:30',
        note: 'Follow up on X DM with 2-minute demo link.',
        completed: false,
        priority: 'high',
        createdAt: '2026-08-21T18:05:00Z',
      },
    ],
    rating: 5,
    createdAt: '2026-08-21T18:00:00Z',
    updatedAt: '2026-08-21T18:05:00Z',
    lastContactedAt: '2026-08-21T18:00:00Z',
  },
  {
    id: 'contact-3',
    profileUrl: 'https://www.instagram.com/zuck/',
    platform: 'instagram',
    handle: '@zuck',
    stage: 'lead',
    tags: ['Founder', 'Creator', 'VIP'],
    notes: [
      {
        id: 'n-4',
        content: 'Saved profile URL from Instagram tab after reviewing hardware announcement.',
        createdAt: '2026-08-24T11:00:00Z',
      },
    ],
    reminders: [
      {
        id: 'r-3',
        date: getTodayDateStr(-1), // Overdue
        time: '16:00',
        note: 'Send direct message regarding open source extension.',
        completed: false,
        priority: 'medium',
        createdAt: '2026-08-24T11:05:00Z',
      },
    ],
    rating: 4,
    createdAt: '2026-08-24T11:00:00Z',
    updatedAt: '2026-08-24T11:05:00Z',
  },
  {
    id: 'contact-4',
    profileUrl: 'https://www.linkedin.com/in/reidhoffman',
    platform: 'linkedin',
    handle: 'in/reidhoffman',
    stage: 'opportunity',
    tags: ['Investor', 'Advisory', 'Podcast Guest'],
    notes: [
      {
        id: 'n-5',
        content: 'Referred by angel network. Pitching social CRM sidebar utility for active networking.',
        createdAt: '2026-08-18T10:00:00Z',
        isPinned: true,
      },
    ],
    reminders: [
      {
        id: 'r-4',
        date: getTodayDateStr(4),
        time: '11:00',
        note: 'Send updated traction numbers before upcoming call.',
        completed: false,
        priority: 'high',
        createdAt: '2026-08-18T10:15:00Z',
      },
    ],
    rating: 5,
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-08-18T10:15:00Z',
    lastContactedAt: '2026-08-18T10:00:00Z',
  },
  {
    id: 'contact-5',
    profileUrl: 'https://x.com/paulg',
    platform: 'x',
    handle: '@paulg',
    stage: 'conversation',
    tags: ['Investor', 'Founder', 'Advisory'],
    notes: [
      {
        id: 'n-6',
        content: 'Noticed his essay on organic tool adoption. Shared notes on seamless URL tagging.',
        createdAt: '2026-08-15T08:20:00Z',
      },
    ],
    reminders: [
      {
        id: 'r-5',
        date: getTodayDateStr(-3),
        note: 'Sent initial response to essay reply.',
        completed: true,
        priority: 'low',
        createdAt: '2026-08-15T08:25:00Z',
        completedAt: '2026-08-15T12:00:00Z',
      },
    ],
    rating: 4,
    createdAt: '2026-08-15T08:20:00Z',
    updatedAt: '2026-08-15T12:00:00Z',
  },
  {
    id: 'contact-6',
    profileUrl: 'https://www.instagram.com/garyvee/',
    platform: 'instagram',
    handle: '@garyvee',
    stage: 'contacted',
    tags: ['Creator', 'Warm Lead'],
    notes: [
      {
        id: 'n-7',
        content: 'Captured profile URL directly via extension sidebar while researching social creators.',
        createdAt: '2026-08-25T15:40:00Z',
      },
    ],
    reminders: [
      {
        id: 'r-6',
        date: getTodayDateStr(1),
        time: '15:00',
        note: 'Ping with extension pilot access code.',
        completed: false,
        priority: 'medium',
        createdAt: '2026-08-25T15:45:00Z',
      },
    ],
    rating: 3,
    createdAt: '2026-08-25T15:40:00Z',
    updatedAt: '2026-08-25T15:45:00Z',
  },
];

export function getStoredContacts(): SocialContact[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONTACTS));
      return INITIAL_CONTACTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_CONTACTS;
  }
}

export function saveStoredContacts(contacts: SocialContact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    window.dispatchEvent(new CustomEvent('social_crm_updated', { detail: contacts }));
  } catch (e) {
    console.error('Failed to save contacts to storage', e);
  }
}

export function getStoredCustomTags(): string[] {
  try {
    const data = localStorage.getItem(TAGS_KEY);
    if (!data) {
      localStorage.setItem(TAGS_KEY, JSON.stringify(INITIAL_TAGS));
      return INITIAL_TAGS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_TAGS;
  }
}

export function saveStoredCustomTags(tags: string[]): void {
  try {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  } catch (e) {
    console.error('Failed to save custom tags', e);
  }
}

export function exportContactsAsJson(contacts: SocialContact[]): void {
  const jsonStr = JSON.stringify(contacts, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `social-crm-urls-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportContactsAsCsv(contacts: SocialContact[]): void {
  const headers = [
    'ID',
    'Platform',
    'Handle',
    'ProfileURL',
    'Stage',
    'Tags',
    'Rating',
    'PendingReminders',
    'NotesCount',
    'CreatedAt',
    'UpdatedAt',
  ];

  const rows = contacts.map((c) => [
    c.id,
    c.platform,
    `"${(c.handle || '').replace(/"/g, '""')}"`,
    `"${(c.profileUrl || '').replace(/"/g, '""')}"`,
    c.stage,
    `"${c.tags.join('; ')}"`,
    c.rating || 0,
    c.reminders.filter((r) => !r.completed).length,
    c.notes.length,
    c.createdAt,
    c.updatedAt,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `social-crm-urls-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
