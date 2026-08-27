import React from 'react';
import {
  Search,
  Filter,
  X,
  Tag,
  Clock,
  ArrowUpDown,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Plus,
} from 'lucide-react';
import { FilterState, Platform, ContactStage } from '../types';
import { STAGE_CONFIG } from '../utils/urlParser';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  availableTags: string[];
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  availableTags,
  totalCount,
  filteredCount,
  onClearFilters,
}) => {
  const hasActiveFilters =
    filter.search ||
    filter.platform !== 'all' ||
    filter.stage !== 'all' ||
    filter.tag !== 'all' ||
    filter.reminderFilter !== 'all';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search Input for Profile URL / Handle / Note */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            placeholder="Search by profile URL, handle (@sama), note, or tag..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ ...filter, search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Platform Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => onFilterChange({ ...filter, platform: 'all' })}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
              filter.platform === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Platforms
          </button>

          <button
            onClick={() => onFilterChange({ ...filter, platform: 'linkedin' })}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 ${
              filter.platform === 'linkedin'
                ? 'bg-[#0a66c2] text-white shadow-xs'
                : 'bg-sky-50 text-[#0a66c2] hover:bg-sky-100'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </button>

          <button
            onClick={() => onFilterChange({ ...filter, platform: 'x' })}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 ${
              filter.platform === 'x'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
            }`}
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>X (Twitter)</span>
          </button>

          <button
            onClick={() => onFilterChange({ ...filter, platform: 'instagram' })}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0 ${
              filter.platform === 'instagram'
                ? 'bg-[#e1306c] text-white shadow-xs'
                : 'bg-pink-50 text-[#e1306c] hover:bg-pink-100'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </button>
        </div>
      </div>

      {/* Secondary Filter Row: Stage, Tag, Follow-ups, Sort, Clear */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        
        {/* Stage Filter */}
        <select
          value={filter.stage}
          onChange={(e) => onFilterChange({ ...filter, stage: e.target.value as any })}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
        >
          <option value="all">All Stages</option>
          {Object.entries(STAGE_CONFIG).map(([k, cfg]) => (
            <option key={k} value={k}>
              Stage: {cfg.label}
            </option>
          ))}
        </select>

        {/* Tag Filter */}
        <select
          value={filter.tag}
          onChange={(e) => onFilterChange({ ...filter, tag: e.target.value })}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
        >
          <option value="all">All Tags</option>
          {availableTags.map((t) => (
            <option key={t} value={t}>
              Tag: {t}
            </option>
          ))}
        </select>

        {/* Follow-up Reminder Filter */}
        <select
          value={filter.reminderFilter}
          onChange={(e) => onFilterChange({ ...filter, reminderFilter: e.target.value as any })}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
        >
          <option value="all">All Reminders</option>
          <option value="today">Due Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="overdue">Overdue</option>
          <option value="completed">Completed</option>
        </select>

        {/* Sort selector */}
        <div className="flex items-center gap-1 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filter.sortBy}
            onChange={(e) => onFilterChange({ ...filter, sortBy: e.target.value as any })}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="recent">Recently Updated</option>
            <option value="url">URL / Handle</option>
            <option value="reminder">Next Reminder</option>
            <option value="rating">Priority Rating</option>
            <option value="stage">Pipeline Stage</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}

        <div className="text-[11px] text-slate-400 font-mono">
          Showing {filteredCount} of {totalCount} contacts
        </div>
      </div>
    </div>
  );
};
