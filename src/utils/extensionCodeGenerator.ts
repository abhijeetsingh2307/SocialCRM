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
      description: 'Manifest V3 configuration with Side Panel API, activeTab, storage, and auto web handshake',
      code: `{
  "manifest_version": 3,
  "name": "SocialCRM - Profile URL Sidebar",
  "version": "2.3.0",
  "description": "Opens a docked sidebar in any tab, auto-detects LinkedIn, X, and Instagram profile URLs, and saves them with tags, notes, and reminders with zero scraping directly to your live SocialCRM.",
  "permissions": [
    "activeTab",
    "storage",
    "tabs",
    "sidePanel",
    "alarms",
    "notifications",
    "scripting"
  ],
  "host_permissions": [
    "https://*.linkedin.com/*",
    "https://*.x.com/*",
    "https://*.twitter.com/*",
    "https://*.instagram.com/*",
    "https://firestore.googleapis.com/*",
    "https://*.run.app/*",
    "https://*/*"
  ],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_title": "Open SocialCRM Sidebar"
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
      "description": "Toggle SocialCRM Sidebar"
    }
  }
}`,
    },
    {
      name: 'sidepanel.html',
      type: 'html',
      description: 'The docked sidebar HTML with pure built-in CSS, 0px border-radius, Manifest V3 CSP, sync status, and manual sync key fallback modal',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SocialCRM Sidebar</title>
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
      padding: 14px;
    }
    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;
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
    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-icon {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      font-size: 10.5px;
      padding: 3px 6px;
      cursor: pointer;
      color: #475569;
    }
    .btn-icon:hover {
      background: #e2e8f0;
      color: #1e293b;
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

    /* Auto Cloud Status Bar */
    .sync-bar {
      margin-top: 8px;
      margin-bottom: 8px;
      padding: 6px 8px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10.5px;
      flex-shrink: 0;
    }
    .sync-bar.unlinked {
      background: #eff6ff;
      border-color: #bfdbfe;
    }
    .sync-status {
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      background: #22c55e;
      display: inline-block;
    }
    .sync-bar.unlinked .status-dot {
      background: #3b82f6;
    }

    /* Auto Connect Button */
    .btn-auto-connect {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 3px 7px;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .btn-auto-connect:hover {
      background: #4338ca;
    }

    /* Sync Settings Modal/Drawer */
    .sync-settings-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 8px;
      margin-bottom: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    /* Content Area */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 4px 2px 8px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 3px;
      display: block;
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge {
      padding: 2px 6px;
      font-size: 9.5px;
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
      padding: 6px 8px;
      font-size: 11.5px;
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
      font-size: 10.5px;
      color: #334155;
    }

    .row-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    /* Alerts */
    .alert-warning {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      color: #92400e;
      padding: 8px;
      font-size: 10.5px;
      line-height: 1.35;
    }
    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10.5px;
      margin-top: 3px;
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
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .reminder-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #312e81;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Footer / Button */
    .footer {
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .btn-primary {
      width: 100%;
      padding: 9px;
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
        <div class="header-title">SocialCRM</div>
        <div id="tab-status" class="header-subtitle">Auto-Sync Active</div>
      </div>
    </div>
    <div class="header-actions">
      <button id="toggle-sync-settings" class="btn-icon" title="Sync Settings">⚙️</button>
      <button id="open-full-crm" class="full-crm-link">Dashboard ↗</button>
    </div>
  </div>

  <!-- Auto Cloud Status Bar -->
  <div id="sync-bar" class="sync-bar unlinked">
    <div class="sync-status">
      <span class="status-dot"></span>
      <span id="sync-status-text">Cloud Sync: Connecting...</span>
    </div>
    <button id="auto-connect-btn" class="btn-auto-connect hidden">
      <span>Auto-Connect</span>
    </button>
    <span id="user-email-label" style="font-size: 9.5px; color: #047857; font-weight: bold;" class="hidden"></span>
  </div>

  <!-- Optional Manual Sync Key Box -->
  <div id="sync-settings-box" class="sync-settings-box hidden">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span class="section-label" style="margin-bottom: 0;">Cloud Sync Key (UID)</span>
      <button id="close-sync-settings" style="background: none; border: none; font-size: 11px; cursor: pointer;">✕</button>
    </div>
    <input type="text" id="manual-sync-key-input" placeholder="Paste UID from Web Dashboard" style="font-size: 10px; font-family: monospace;" />
    <div style="display: flex; gap: 4px;">
      <button id="save-sync-key-btn" style="flex: 1; padding: 4px; background: #4f46e5; color: #fff; font-weight: bold; border: none; cursor: pointer; font-size: 10.5px;">Save Key</button>
      <button id="clear-sync-key-btn" style="padding: 4px 8px; background: #fee2e2; color: #b91c1c; font-weight: bold; border: none; cursor: pointer; font-size: 10.5px;">Reset</button>
    </div>
  </div>

  <!-- Main Scrollable Area -->
  <div class="content">
    
    <!-- Detection Banner -->
    <div id="detection-box" class="card">
      <div class="card-top">
        <span class="section-label" style="margin-bottom: 0;">Active Profile URL</span>
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
      <div id="notes-history-container" class="hidden" style="margin-top: 6px;">
        <span class="section-label" style="font-size: 9px;">Past Notes</span>
        <div id="notes-history-list" style="max-height: 90px; overflow-y: auto;"></div>
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
      code: `/* SocialCRM Chrome Extension Sidebar Stylesheet */
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
  padding: 14px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
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
  padding: 10px 2px 10px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  padding: 2px 6px;
  font-size: 9.5px;
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
  padding: 6px 8px;
  font-size: 11.5px;
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
  font-size: 10.5px;
  color: #334155;
}
.row-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.alert-warning {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
  padding: 8px;
  font-size: 10.5px;
  line-height: 1.35;
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  margin-top: 3px;
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
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.reminder-title {
  font-size: 9.5px;
  font-weight: 700;
  color: #312e81;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.footer {
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.btn-primary {
  width: 100%;
  padding: 9px;
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
      description: 'Sidebar script with automatic background web handshake, active tab URL detection, tab bridge sync, and real-time Firestore sync',
      code: `// SocialCRM Chrome Extension Side Panel Script
const FIREBASE_PROJECT_ID = 'gentle-clone-0nm9t';
const FIRESTORE_DB_ID = 'ai-studio-socialcrmchromee-61492dde-d638-4923-92b8-2ad1d964078e';
const CRM_WEB_APP_URL = 'https://ais-dev-pn4ca7sywpbzwrvh2ea37x-170466239941.asia-southeast1.run.app';

let currentTabUrl = '';
let currentPlatform = 'other';
let currentHandle = '';
let userSyncKey = '';
let userEmail = '';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Check if we already have a saved sync session
  chrome.storage.local.get(['social_crm_sync_key', 'social_crm_user_email'], async (res) => {
    userSyncKey = res.social_crm_sync_key || '';
    userEmail = res.social_crm_user_email || '';
    
    // If not logged in, attempt auto-handshake with any open CRM web app tab
    if (!userSyncKey) {
      await attemptAutoWebHandshake();
    } else {
      updateSyncBar();
    }
  });

  // 2. Query initial active tab
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
    chrome.tabs.create({ url: CRM_WEB_APP_URL });
  });

  // Auto connect button (if not automatically linked yet)
  document.getElementById('auto-connect-btn').addEventListener('click', async () => {
    const connected = await attemptAutoWebHandshake();
    if (!connected) {
      chrome.tabs.create({ url: CRM_WEB_APP_URL });
    }
  });

  // Toggle Sync Settings Box
  const settingsBox = document.getElementById('sync-settings-box');
  document.getElementById('toggle-sync-settings').addEventListener('click', () => {
    settingsBox.classList.toggle('hidden');
    if (!settingsBox.classList.contains('hidden')) {
      document.getElementById('manual-sync-key-input').value = userSyncKey || '';
    }
  });

  document.getElementById('close-sync-settings').addEventListener('click', () => {
    settingsBox.classList.add('hidden');
  });

  document.getElementById('save-sync-key-btn').addEventListener('click', () => {
    const key = document.getElementById('manual-sync-key-input').value.trim();
    if (key) {
      userSyncKey = key;
      userEmail = 'Manual User';
      chrome.storage.local.set({
        social_crm_sync_key: userSyncKey,
        social_crm_user_email: userEmail
      }, () => {
        updateSyncBar();
        settingsBox.classList.add('hidden');
      });
    }
  });

  document.getElementById('clear-sync-key-btn').addEventListener('click', () => {
    userSyncKey = '';
    userEmail = '';
    chrome.storage.local.remove(['social_crm_sync_key', 'social_crm_user_email'], () => {
      updateSyncBar();
      settingsBox.classList.add('hidden');
    });
  });
});

// Automatic Web Handshake: scans open tabs for SocialCRM and pulls user session automatically
async function attemptAutoWebHandshake() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url && (tab.url.includes('.run.app') || tab.url.includes('localhost') || tab.url.includes('ai.studio'))) {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              return window.localStorage.getItem('social_crm_user_session');
            }
          });

          if (results && results[0] && results[0].result) {
            const session = JSON.parse(results[0].result);
            if (session && session.uid) {
              userSyncKey = session.uid;
              userEmail = session.email || '';
              chrome.storage.local.set({
                social_crm_sync_key: userSyncKey,
                social_crm_user_email: userEmail
              });
              updateSyncBar();
              return true;
            }
          }
        } catch (scriptErr) {
          // Tab might have restricted access, continue loop
        }
      }
    }
  } catch (e) {
    console.warn('Auto handshake check:', e);
  }

  updateSyncBar();
  return false;
}

function updateSyncBar() {
  const syncBar = document.getElementById('sync-bar');
  const statusText = document.getElementById('sync-status-text');
  const autoBtn = document.getElementById('auto-connect-btn');
  const emailLabel = document.getElementById('user-email-label');

  if (userSyncKey) {
    syncBar.classList.remove('unlinked');
    statusText.textContent = '🟢 Cloud Sync: Live Connected';
    autoBtn.classList.add('hidden');
    emailLabel.classList.remove('hidden');
    emailLabel.textContent = userEmail ? userEmail.split('@')[0] : 'Synced';
  } else {
    syncBar.classList.add('unlinked');
    statusText.textContent = '⚡ Local Mode (Sign in on web to sync)';
    autoBtn.classList.remove('hidden');
    emailLabel.classList.add('hidden');
  }
}

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
          \`<div style="padding: 4px; background: #f1f5f9; margin-bottom: 3px; font-size: 10px; color: #334155;">\${n.content}</div>\`
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

    // 1. Save locally inside extension storage
    chrome.storage.local.set({ social_crm_contacts_v2: contacts }, () => {
      // 2. Broadcast and write directly to open CRM tab localStorage for instant UI reflection
      broadcastToWebTab(updatedContact);

      // 3. If connected to Cloud, sync directly to Firestore REST API
      if (userSyncKey) {
        syncToCloudFirestore(userSyncKey, updatedContact);
      }

      const btn = document.getElementById('save-btn');
      btn.textContent = userSyncKey ? '✓ Saved to Live Cloud!' : '✓ Saved to CRM!';
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

// Injects the updated contact directly into any active SocialCRM tab so the UI instantly updates
async function broadcastToWebTab(contact) {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url && (tab.url.includes('.run.app') || tab.url.includes('localhost') || tab.url.includes('ai.studio'))) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (newContact) => {
            try {
              const raw = localStorage.getItem('social_crm_contacts_v2');
              let list = raw ? JSON.parse(raw) : [];
              const idx = list.findIndex(c => c.id === newContact.id || c.profileUrl.toLowerCase() === newContact.profileUrl.toLowerCase());
              if (idx >= 0) {
                list[idx] = newContact;
              } else {
                list.unshift(newContact);
              }
              localStorage.setItem('social_crm_contacts_v2', JSON.stringify(list));
              window.dispatchEvent(new CustomEvent('social_crm_updated', { detail: list }));
            } catch (e) {
              console.warn('Storage sync injection:', e);
            }
          },
          args: [contact]
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.warn('broadcastToWebTab error:', e);
  }
}

// Direct Firestore REST API sync
async function syncToCloudFirestore(userId, contact) {
  try {
    const url = \`https://firestore.googleapis.com/v1/projects/\${FIREBASE_PROJECT_ID}/databases/\${FIRESTORE_DB_ID}/documents/users/\${userId}/contacts/\${contact.id}\`;
    
    const body = {
      fields: {
        id: { stringValue: contact.id },
        profileUrl: { stringValue: contact.profileUrl },
        platform: { stringValue: contact.platform },
        handle: { stringValue: contact.handle || '' },
        stage: { stringValue: contact.stage || 'lead' },
        tags: { arrayValue: { values: (contact.tags || []).map(t => ({ stringValue: t })) } },
        notes: {
          arrayValue: {
            values: (contact.notes || []).map(n => ({
              mapValue: {
                fields: {
                  id: { stringValue: n.id },
                  content: { stringValue: n.content },
                  createdAt: { stringValue: n.createdAt }
                }
              }
            }))
          }
        },
        reminders: {
          arrayValue: {
            values: (contact.reminders || []).map(r => ({
              mapValue: {
                fields: {
                  id: { stringValue: r.id },
                  date: { stringValue: r.date },
                  time: { stringValue: r.time || '10:00' },
                  note: { stringValue: r.note || '' },
                  completed: { booleanValue: !!r.completed },
                  priority: { stringValue: r.priority || 'medium' },
                  createdAt: { stringValue: r.createdAt }
                }
              }
            }))
          }
        },
        rating: { integerValue: String(contact.rating || 3) },
        createdAt: { stringValue: contact.createdAt },
        updatedAt: { stringValue: contact.updatedAt || new Date().toISOString() }
      }
    };

    await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.warn('Cloud sync background error:', err);
  }
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
      code: `// SocialCRM Chrome Extension Background Service Worker
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
  console.log('SocialCRM Sidebar Extension installed.');
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
      description: 'Instructions to install the SocialCRM Sidebar and publish to Chrome Web Store',
      code: `# SocialCRM Chrome Extension Sidebar (Manifest V3)

A zero-scraping Google Chrome extension sidebar that docks in any tab, auto-detects LinkedIn, X, and Instagram profile URLs, and seamlessly syncs to your live SocialCRM account with automatic authentication.

## 🚀 Instant Installation & Setup:

1. Download or export the extension files into a folder:
   - \`manifest.json\`
   - \`sidepanel.html\`
   - \`sidepanel.css\`
   - \`sidepanel.js\`
   - \`background.js\`
2. In Google Chrome, navigate to \`chrome://extensions/\`.
3. Enable **Developer mode** in the top right.
4. Click **"Load unpacked"** and select the folder.
5. Log into the SocialCRM web dashboard once with your Google account.
6. Open any tab and press **\`Alt+Shift+S\`** or click the extension icon. The extension will automatically detect your logged-in Google account without having to enter any sync key!

## 📦 Ready for Chrome Web Store Submission:
- Fully Manifest V3 compliant
- Zero DOM scraping (safe from platform account bans)
- Real-time cloud synchronization`,
    },
  ];
}
