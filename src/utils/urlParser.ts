import { Platform } from '../types';

export interface ProfileCheckResult {
  isProfilePage: boolean;
  platform: Platform;
  handle: string;
  cleanUrl: string;
  platformLabel: string;
  statusMessage: string;
}

/**
 * Checks if a given URL represents a profile page on LinkedIn, X (Twitter), or Instagram,
 * without any DOM scraping or personal data fetching.
 */
export function checkSocialProfile(rawUrl: string): ProfileCheckResult {
  let url = (rawUrl || '').trim();
  if (!url) {
    return {
      isProfilePage: false,
      platform: 'other',
      handle: '',
      cleanUrl: '',
      platformLabel: 'Unknown',
      statusMessage: 'No URL provided',
    };
  }

  // Prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith('linkedin.com') || url.startsWith('x.com') || url.startsWith('twitter.com') || url.startsWith('instagram.com')) {
      url = 'https://' + url;
    } else if (url.startsWith('@')) {
      const handle = url.replace(/^@/, '');
      return {
        isProfilePage: true,
        platform: 'x',
        handle: `@${handle}`,
        cleanUrl: `https://x.com/${handle}`,
        platformLabel: 'X (Twitter)',
        statusMessage: `Valid X profile detected: @${handle}`,
      };
    } else {
      url = 'https://' + url;
    }
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname.replace(/\/+$/, ''); // strip trailing slashes
    const segments = pathname.split('/').filter(Boolean);

    // 1. LinkedIn Check
    if (host.includes('linkedin.com')) {
      if (segments[0] === 'in' && segments[1]) {
        const username = decodeURIComponent(segments[1]);
        return {
          isProfilePage: true,
          platform: 'linkedin',
          handle: `in/${username}`,
          cleanUrl: `https://www.linkedin.com/in/${username}`,
          platformLabel: 'LinkedIn',
          statusMessage: `Valid LinkedIn profile detected: in/${username}`,
        };
      }
      if (segments[0] === 'company' && segments[1]) {
        const companyName = decodeURIComponent(segments[1]);
        return {
          isProfilePage: true,
          platform: 'linkedin',
          handle: `company/${companyName}`,
          cleanUrl: `https://www.linkedin.com/company/${companyName}`,
          platformLabel: 'LinkedIn',
          statusMessage: `Valid LinkedIn company page detected: company/${companyName}`,
        };
      }
      return {
        isProfilePage: false,
        platform: 'linkedin',
        handle: '',
        cleanUrl: url,
        platformLabel: 'LinkedIn',
        statusMessage: 'Not on a profile page (e.g. Feed, Search, or Messages). Open a LinkedIn member profile.',
      };
    }

    // 2. X / Twitter Check
    if (host.includes('x.com') || host.includes('twitter.com')) {
      const systemRoutes = ['home', 'explore', 'notifications', 'messages', 'i', 'settings', 'search', 'intent', 'tos', 'privacy', 'lists', 'communities'];
      if (segments.length > 0) {
        const first = segments[0].toLowerCase().replace(/^@/, '');
        if (!systemRoutes.includes(first)) {
          return {
            isProfilePage: true,
            platform: 'x',
            handle: `@${first}`,
            cleanUrl: `https://x.com/${first}`,
            platformLabel: 'X (Twitter)',
            statusMessage: `Valid X profile detected: @${first}`,
          };
        }
      }
      return {
        isProfilePage: false,
        platform: 'x',
        handle: '',
        cleanUrl: url,
        platformLabel: 'X (Twitter)',
        statusMessage: 'Not on a user profile (e.g. Home timeline or Explore). Open an X profile page.',
      };
    }

    // 3. Instagram Check
    if (host.includes('instagram.com') || host.includes('instagr.am')) {
      const systemRoutes = ['p', 'reel', 'reels', 'stories', 'explore', 'direct', 'accounts', 'tv', 'about', 'developer'];
      if (segments.length > 0) {
        const first = segments[0].toLowerCase().replace(/^@/, '');
        if (!systemRoutes.includes(first)) {
          return {
            isProfilePage: true,
            platform: 'instagram',
            handle: `@${first}`,
            cleanUrl: `https://www.instagram.com/${first}/`,
            platformLabel: 'Instagram',
            statusMessage: `Valid Instagram profile detected: @${first}`,
          };
        }
      }
      return {
        isProfilePage: false,
        platform: 'instagram',
        handle: '',
        cleanUrl: url,
        platformLabel: 'Instagram',
        statusMessage: 'Not on a user profile (e.g. Feed, Post, or Reels). Open an Instagram user profile.',
      };
    }

    // 4. Other web URL
    const lastSeg = segments[segments.length - 1] || host;
    return {
      isProfilePage: true,
      platform: 'other',
      handle: lastSeg || host,
      cleanUrl: url,
      platformLabel: 'Web Profile',
      statusMessage: `Web link detected: ${host}`,
    };
  } catch {
    return {
      isProfilePage: false,
      platform: 'other',
      handle: '',
      cleanUrl: rawUrl,
      platformLabel: 'Invalid URL',
      statusMessage: 'Invalid URL format. Please paste a valid web address.',
    };
  }
}

export function getPlatformBadge(platform: Platform): {
  name: string;
  badgeBg: string;
  badgeText: string;
  colorHex: string;
} {
  switch (platform) {
    case 'linkedin':
      return {
        name: 'LinkedIn',
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
        badgeText: 'text-sky-700',
        colorHex: '#0a66c2',
      };
    case 'x':
      return {
        name: 'X (Twitter)',
        badgeBg: 'bg-zinc-100 text-zinc-900 border-zinc-300',
        badgeText: 'text-zinc-900',
        colorHex: '#000000',
      };
    case 'instagram':
      return {
        name: 'Instagram',
        badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
        badgeText: 'text-pink-700',
        colorHex: '#e1306c',
      };
    default:
      return {
        name: 'Web Profile',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        badgeText: 'text-slate-700',
        colorHex: '#64748b',
      };
  }
}

export const STAGE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  lead: {
    label: 'Lead',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  contacted: {
    label: 'Contacted',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  conversation: {
    label: 'In Discussion',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  meeting: {
    label: 'Meeting Booked',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  opportunity: {
    label: 'Opportunity',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  customer: {
    label: 'Customer / Closed',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
  },
  partner: {
    label: 'Partner / VIP',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-zinc-100',
    text: 'text-zinc-600',
    border: 'border-zinc-200',
    dot: 'bg-zinc-400',
  },
};
