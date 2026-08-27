import React from 'react';
import {
  Plus,
  Chrome,
  Download,
  Upload,
  Database,
  Sparkles,
  List,
  Clock,
  Code2,
  Share2,
  PanelRight,
} from 'lucide-react';
import { ViewMode } from '../types';
import { UserAuthMenu } from './UserAuthMenu';

interface NavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenQuickAdd: () => void;
  onOpenExtensionSimulator: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  totalContacts: number;
  dueTodayCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onViewModeChange,
  onOpenQuickAdd,
  onOpenExtensionSimulator,
  onExportJson,
  onExportCsv,
  totalContacts,
  dueTodayCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-xs">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-slate-900 leading-none">
                  Social Contact CRM
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                Zero-scraping profile URL capture for LinkedIn, X & Instagram
              </p>
            </div>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Contacts Table</span>
            </button>

            <button
              onClick={() => onViewModeChange('reminders')}
              className={`px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'reminders'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Follow-ups</span>
              {dueTodayCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => onViewModeChange('extension-code')}
              className={`px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'extension-code'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Extension Files</span>
            </button>
          </div>

          {/* Action Buttons & Google Auth */}
          <div className="flex items-center gap-2">
            
            {/* Launch Extension Simulator Modal */}
            <button
              onClick={onOpenExtensionSimulator}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Test the Chrome Extension Sidebar live on simulated browser tabs"
            >
              <PanelRight className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Extension Sidebar</span>
            </button>

            {/* Quick Add URL Modal */}
            <button
              onClick={onOpenQuickAdd}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add URL</span>
            </button>

            {/* User Google Auth & Profile Menu */}
            <UserAuthMenu totalContacts={totalContacts} />
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-1 font-medium ${viewMode === 'table' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
          >
            Contacts Table
          </button>
          <button
            onClick={() => onViewModeChange('reminders')}
            className={`px-3 py-1 font-medium flex items-center gap-1 ${viewMode === 'reminders' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
          >
            <span>Reminders</span>
            {dueTodayCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
          </button>
          <button
            onClick={() => onViewModeChange('extension-code')}
            className={`px-3 py-1 font-medium ${viewMode === 'extension-code' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}
          >
            Extension Files
          </button>
        </div>
      </div>
    </header>
  );
};
