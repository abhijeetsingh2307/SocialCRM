export interface ExtensionFile {
  name: string;
  type: string;
  description: string;
  code: string;
}

export function generateExtensionFiles(): ExtensionFile[] {
  return [
    {
      name: 'manifest.json',
      type: 'json',
      description: 'Manifest V3 configuration with Side Panel API and profile URL permissions',
      code: `{
  "manifest_version": 3,
  "name": "Social CRM - Profile URL Sidebar",
  "version": "2.0.0",
  "description": "Opens a docked sidebar in any tab, detects LinkedIn, X, and Instagram profile URLs, and saves them with tags, notes, and reminders with zero scraping.",
  "permissions": [
    "activeTab",
    "storage",
    "tabs",
    "sidePanel",
    "alarms",
    "notifications"
  ],
  "host_permissions": [
    "https://*.linkedin.com/*",
    "https://*.x.com/*",
    "https://*.twitter.com/*",
    "https://*.instagram.com/*"
  ],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_title": "Open Social CRM Sidebar"
  },
  "background": {
    "service_worker": "background.js"
  },
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Alt+Shift+S",
        "mac": "Alt+Shift+S"
      },
      "description": "Toggle Social CRM Sidebar"
    }
  }
}`,
    },
    {
      name: 'sidepanel.html',
      type: 'html',
      description: 'The docked sidebar HTML with pure built-in CSS matching 0px border-radius and Manifest V3 security rules',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social CRM Sidebar</title>
  <link rel="stylesheet" href="sidepanel.css">
  <style>
    /* Reset and base styles */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border-radius: 0px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background-color: #f8fafc;
      color: #1e293b;
      font-size: 12px;
      line-height: 1.4;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 16px;
    }
    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .header-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .header-icon {
      width: 24px;
      height: 24px;
      background: #4f46e5;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 11px;
    }
    .header-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.1;
    }
    .header-subtitle {
      font-size: 10px;
      color: #059669;
      font-weight: 600;
    }
    .full-crm-link {
      font-size: 11px;
      color: #4f46e5;
      background: none;
      border: none;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }
    .full-crm-link:hover {
      color: #3730a3;
    }

    /* Content Area */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 12px 2px 12px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 4px;
      display: block;
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge {
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }

    /* Inputs */
    input[type="text"],
    input[type="date"],
    input[type="time"],
    select,
    textarea {
      width: 100%;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      font-size: 12px;
      color: #1e293b;
      outline: none;
      transition: border-color 0.15s ease;
    }
    input:focus,
    select:focus,
    textarea:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 1px #4f46e5;
    }
    input[readonly] {
      background: #f8fafc;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #334155;
    }

    .row-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    /* Alerts */
    .alert-warning {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      color: #92400e;
      padding: 10px;
      font-size: 11px;
      line-height: 1.4;
    }
    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      margin-top: 4px;
    }
    .status-found {
      color: #047857;
      font-weight: 600;
    }
    .status-existing {
      color: #d97706;
      font-weight: 700;
    }

    /* Reminder Box */
    .reminder-box {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .reminder-title {
      font-size: 10px;
      font-weight: 700;
      color: #312e81;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Notes list */
    .note-bubble {
      padding: 6px 8px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      font-size: 11px;
      color: #334155;
      margin-top: 4px;
    }

    /* Footer / Button */
    .footer {
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .btn-primary {
      width: 100%;
      padding: 10px;
      background: #4f46e5;
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-primary:hover {
      background: #4338ca;
    }
    .btn-primary.btn-saved {
      background: #059669;
    }
    .hidden {
      display: none !important;
    }
  </style>
</head>
<body>
  
  <!-- Header -->
  <div class="header">
    <div class="header-title-wrap">
      <div class="header-icon">⚡</div>
      <div>
        <div class="header-title">Social CRM</div>
        <div id="tab-status" class="header-subtitle">Active Tab Monitor</div>
      </div>
    </div>
    <button id="open-full-crm" class="full-crm-link">
      Full CRM ↗
    </button>
  </div>

  <!-- Main Scrollable Area -->
  <div class="content">
    
    <!-- Detection Banner -->
    <div id="detection-box" class="card">
      <div class="card-top">
        <span class="section-label" style="margin-bottom: 0;">Detected URL</span>
        <span id="platform-badge" class="badge">Detecting...</span>
      </div>

      <div id="valid-profile-view">
        <input type="text" id="profile-url" readonly />
        <div class="status-row">
          <span id="handle-display" class="status-found">✓ Profile Detected</span>
          <span id="existing-status" class="status-existing hidden">Already in CRM</span>
        </div>
      </div>

      <div id="invalid-profile-view" class="alert-warning hidden">
        ⚠️ Not a social profile page. Open any profile on LinkedIn, X, or Instagram.
      </div>
    </div>

    <!-- Pipeline Stage -->
    <div>
      <label class="section-label">Pipeline Stage</label>
      <select id="stage-select">
        <option value="lead">Lead</option>
        <option value="contacted">Contacted</option>
        <option value="conversation">In Discussion</option>
        <option value="meeting">Meeting Booked</option>
        <option value="opportunity">Opportunity</option>
        <option value="customer">Customer / Closed</option>
        <option value="partner">Partner / VIP</option>
      </select>
    </div>

    <!-- Tags -->
    <div>
      <label class="section-label">Tags (comma separated)</label>
      <input type="text" id="tags-input" placeholder="Investor, Founder, Warm Lead..." />
    </div>

    <!-- Notes -->
    <div>
      <label class="section-label">Add Note / Context</label>
      <textarea id="note-input" rows="2" placeholder="Discussion context, referral source, ideas..."></textarea>
      
      <!-- Notes History Container -->
      <div id="notes-history-container" class="hidden" style="margin-top: 8px;">
        <span class="section-label" style="font-size: 9px;">Past Notes</span>
        <div id="notes-history-list" style="max-height: 100px; overflow-y: auto;"></div>
      </div>
    </div>

    <!-- Follow-up Reminder -->
    <div class="reminder-box">
      <span class="reminder-title">⏰ Follow-up Reminder</span>
      <div class="row-split">
        <input type="date" id="reminder-date" />
        <input type="time" id="reminder-time" value="10:00" />
      </div>
      <input type="text" id="reminder-note" placeholder="Task (e.g. Send follow-up DM)..." />
    </div>

  </div>

  <!-- Action Footer -->
  <div class="footer">
    <button id="save-btn" class="btn-primary">
      💾 Save Profile URL to CRM
    </button>
  </div>

  <script src="sidepanel.js"></script>
</body>
</html>`,
    },
    {
      name: 'sidepanel.css',
      type: 'css',
      description: 'Sidebar styling sheet with 0px border-radius and clean typography',
      code: `/* Social CRM Chrome Extension Sidebar Stylesheet */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border-radius: 0px !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
body {
  background-color: #f8fafc;
  color: #1e293b;
  font-size: 12px;
  line-height: 1.4;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-icon {
  width: 24px;
  height: 24px;
  background: #4f46e5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 11px;
}
.header-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.1;
}
.header-subtitle {
  font-size: 10px;
  color: #059669;
  font-weight: 600;
}
.full-crm-link {
  font-size: 11px;
  color: #4f46e5;
  background: none;
  border: none;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
.full-crm-link:hover {
  color: #3730a3;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 2px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.section-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 4px;
  display: block;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.badge {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}
input[type="text"],
input[type="date"],
input[type="time"],
select,
textarea {
  width: 100%;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 7px 10px;
  font-size: 12px;
  color: #1e293b;
  outline: none;
  transition: border-color 0.15s ease;
}
input:focus,
select:focus,
textarea:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 1px #4f46e5;
}
input[readonly] {
  background: #f8fafc;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: #334155;
}
.row-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.alert-warning {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
  padding: 10px;
  font-size: 11px;
  line-height: 1.4;
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  margin-top: 4px;
}
.status-found {
  color: #047857;
  font-weight: 600;
}
.status-existing {
  color: #d97706;
  font-weight: 700;
}
.reminder-box {
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.reminder-title {
  font-size: 10px;
  font-weight: 700;
  color: #312e81;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.note-bubble {
  padding: 6px 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-size: 11px;
  color: #334155;
  margin-top: 4px;
}
.footer {
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.btn-primary {
  width: 100%;
  padding: 10px;
  background: #4f46e5;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: #4338ca;
}
.btn-primary.btn-saved {
  background: #059669;
}
.hidden {
  display: none !important;
}`,
    },
    {
      name: 'sidepanel.js',
      type: 'javascript',
      description: 'Sidebar script that listens for active tab URL changes and syncs with chrome.storage with zero scraping',
      code: `// Social CRM Chrome Extension Side Panel Script
let currentTabUrl = '';
let currentPlatform = 'other';
let currentHandle = '';

document.addEventListener('DOMContentLoaded', async () => {
  // Query initial active tab
  await checkActiveTab();

  // Listen for tab switching
  chrome.tabs.onActivated.addListener(() => {
    checkActiveTab();
  });

  // Listen for tab URL changes
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      checkActiveTab();
    }
  });

  // Save button
  document.getElementById('save-btn').addEventListener('click', handleSave);

  // Full CRM dashboard
  document.getElementById('open-full-crm').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  });
});

async function checkActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;

  currentTabUrl = tab.url;
  const check = parseProfileUrl(currentTabUrl);
  currentPlatform = check.platform;
  currentHandle = check.handle;

  const urlInput = document.getElementById('profile-url');
  const badge = document.getElementById('platform-badge');
  const validView = document.getElementById('valid-profile-view');
  const invalidView = document.getElementById('invalid-profile-view');
  const handleDisplay = document.getElementById('handle-display');
  const existingStatus = document.getElementById('existing-status');

  urlInput.value = check.cleanUrl || currentTabUrl;
  badge.textContent = check.platformLabel;

  if (check.isProfilePage) {
    validView.classList.remove('hidden');
    invalidView.classList.add('hidden');
    handleDisplay.textContent = '✓ ' + check.handle;
  } else {
    validView.classList.add('hidden');
    invalidView.classList.remove('hidden');
  }

  // Check if contact already exists in chrome.storage
  chrome.storage.local.get(['social_crm_contacts_v2'], (result) => {
    const contacts = result.social_crm_contacts_v2 || [];
    const existing = contacts.find(c => c.profileUrl === check.cleanUrl || c.profileUrl === currentTabUrl);

    const notesHistory = document.getElementById('notes-history-container');
    const notesList = document.getElementById('notes-history-list');

    if (existing) {
      existingStatus.classList.remove('hidden');
      document.getElementById('stage-select').value = existing.stage || 'lead';
      document.getElementById('tags-input').value = (existing.tags || []).join(', ');
      document.getElementById('save-btn').textContent = 'Update Contact in CRM';

      if (existing.notes && existing.notes.length > 0) {
        notesHistory.classList.remove('hidden');
        notesList.innerHTML = existing.notes.map(n => 
          \`<div class="p-1.5 bg-slate-100 rounded text-[10px] text-slate-700">\${n.content}</div>\`
        ).join('');
      } else {
        notesHistory.classList.add('hidden');
      }
    } else {
      existingStatus.classList.add('hidden');
      notesHistory.classList.add('hidden');
      document.getElementById('stage-select').value = 'lead';
      document.getElementById('tags-input').value = check.platform === 'linkedin' ? 'LinkedIn' : check.platform === 'x' ? 'X' : 'Instagram';
      document.getElementById('save-btn').textContent = 'Save Profile URL to CRM';
    }
  });
}

function handleSave() {
  const url = document.getElementById('profile-url').value || currentTabUrl;
  if (!url) return;

  const rawTags = document.getElementById('tags-input').value;
  const tags = rawTags.split(',').map(t => t.trim()).filter(Boolean);
  const noteText = document.getElementById('note-input').value.trim();
  const reminderDate = document.getElementById('reminder-date').value;
  const reminderTime = document.getElementById('reminder-time').value;
  const reminderNote = document.getElementById('reminder-note').value.trim();
  const stage = document.getElementById('stage-select').value;

  chrome.storage.local.get(['social_crm_contacts_v2'], (result) => {
    let contacts = result.social_crm_contacts_v2 || [];
    const index = contacts.findIndex(c => c.profileUrl === url);

    const contactId = index >= 0 ? contacts[index].id : 'contact-' + Date.now();
    const existingNotes = index >= 0 ? (contacts[index].notes || []) : [];
    const existingReminders = index >= 0 ? (contacts[index].reminders || []) : [];

    if (noteText) {
      existingNotes.unshift({
        id: 'note-' + Date.now(),
        content: noteText,
        createdAt: new Date().toISOString()
      });
    }

    if (reminderDate) {
      existingReminders.unshift({
        id: 'rem-' + Date.now(),
        date: reminderDate,
        time: reminderTime || '10:00',
        note: reminderNote || 'Follow up with ' + currentHandle,
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString()
      });
    }

    const updatedContact = {
      id: contactId,
      profileUrl: url,
      platform: currentPlatform,
      handle: currentHandle || url,
      stage: stage,
      tags: tags.length > 0 ? tags : ['Social Contact'],
      notes: existingNotes,
      reminders: existingReminders,
      rating: index >= 0 ? (contacts[index].rating || 3) : 3,
      createdAt: index >= 0 ? contacts[index].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      contacts[index] = updatedContact;
    } else {
      contacts.unshift(updatedContact);
    }

    chrome.storage.local.set({ social_crm_contacts_v2: contacts }, () => {
      const btn = document.getElementById('save-btn');
      btn.textContent = '✓ Saved Successfully!';
      btn.classList.add('btn-saved');
      document.getElementById('note-input').value = '';
      document.getElementById('reminder-date').value = '';
      document.getElementById('reminder-note').value = '';
      setTimeout(() => {
        btn.textContent = 'Update Contact in CRM';
        btn.classList.remove('btn-saved');
        checkActiveTab();
      }, 1500);
    });
  });
}

function parseProfileUrl(url) {
  if (!url) return { isProfilePage: false, platform: 'other', handle: '', cleanUrl: '', platformLabel: 'Unknown' };
  
  if (url.includes('linkedin.com/in/')) {
    const username = url.split('linkedin.com/in/')[1].split('/')[0].split('?')[0];
    return {
      isProfilePage: true,
      platform: 'linkedin',
      handle: 'in/' + username,
      cleanUrl: 'https://www.linkedin.com/in/' + username,
      platformLabel: 'LinkedIn'
    };
  }

  if (url.includes('x.com/') || url.includes('twitter.com/')) {
    const host = url.includes('x.com/') ? 'x.com/' : 'twitter.com/';
    const path = url.split(host)[1].split('/')[0].split('?')[0];
    const system = ['home', 'explore', 'notifications', 'messages', 'i', 'settings'];
    if (path && !system.includes(path)) {
      return {
        isProfilePage: true,
        platform: 'x',
        handle: '@' + path,
        cleanUrl: 'https://x.com/' + path,
        platformLabel: 'X (Twitter)'
      };
    }
  }

  if (url.includes('instagram.com/')) {
    const path = url.split('instagram.com/')[1].split('/')[0].split('?')[0];
    const system = ['p', 'reel', 'stories', 'explore', 'direct'];
    if (path && !system.includes(path)) {
      return {
        isProfilePage: true,
        platform: 'instagram',
        handle: '@' + path,
        cleanUrl: 'https://www.instagram.com/' + path + '/',
        platformLabel: 'Instagram'
      };
    }
  }

  return { isProfilePage: false, platform: 'other', handle: '', cleanUrl: url, platformLabel: 'Non-Profile' };
}`,
    },
    {
      name: 'background.js',
      type: 'javascript',
      description: 'Background service worker for Side Panel open action and reminder alarms',
      code: `// Social CRM Chrome Extension Background Service Worker
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  console.log('Social CRM Sidebar Extension installed.');
});

// Periodic check for follow-up reminders
chrome.alarms.create('checkReminders', { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkReminders') {
    chrome.storage.local.get(['social_crm_contacts_v2'], (result) => {
      const contacts = result.social_crm_contacts_v2 || [];
      const today = new Date().toISOString().split('T')[0];
      let due = 0;
      contacts.forEach(c => {
        (c.reminders || []).forEach(r => {
          if (!r.completed && r.date <= today) due++;
        });
      });
      if (due > 0) {
        chrome.action.setBadgeText({ text: String(due) });
        chrome.action.setBadgeBackgroundColor({ color: '#e11d48' });
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    });
  }
});`,
    },
    {
      name: 'README.md',
      type: 'markdown',
      description: 'Instructions to install the Social CRM Sidebar into Google Chrome',
      code: `# Social CRM Chrome Extension Sidebar (Manifest V3)

A full-size Google Chrome extension sidebar that docks in any tab, verifies if the active page is a LinkedIn, X, or Instagram profile, and captures the profile URL with zero DOM scraping.

## 🚀 How to Load in Google Chrome:

1. Create a folder named \`social-crm-extension\`.
2. Save the files inside:
   - \`manifest.json\`
   - \`sidepanel.html\`
   - \`sidepanel.js\`
   - \`background.js\`
3. Open Chrome and go to \`chrome://extensions/\`.
4. Turn on **Developer mode** in the top right.
5. Click **"Load unpacked"** and select the folder.
6. Click the extension icon or press **\`Alt+Shift+S\`** on any tab to open the docked sidebar!`,
    },
  ];
}
