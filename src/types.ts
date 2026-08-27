export type Platform = 'linkedin' | 'x' | 'instagram' | 'other';

export type ContactStage = 
  | 'lead'
  | 'contacted'
  | 'conversation'
  | 'meeting'
  | 'opportunity'
  | 'customer'
  | 'partner'
  | 'archived';

export interface FollowUpReminder {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface ContactNote {
  id: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface SocialContact {
  id: string;
  profileUrl: string;
  platform: Platform;
  handle: string; // e.g. "in/satyanadella", "@sama", "@zuck"
  stage: ContactStage;
  tags: string[];
  notes: ContactNote[];
  reminders: FollowUpReminder[];
  rating?: number; // 1 to 5
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

export type ViewMode = 'table' | 'reminders' | 'extension-code';

export interface FilterState {
  search: string;
  platform: 'all' | Platform;
  stage: 'all' | ContactStage;
  tag: string;
  reminderFilter: 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
  sortBy: 'recent' | 'url' | 'reminder' | 'rating' | 'stage';
  sortOrder: 'asc' | 'desc';
}

export interface ChromeTabMock {
  id: string;
  title: string;
  url: string;
  platform: Platform;
  isProfilePage: boolean;
  pageSnippet: string;
}
