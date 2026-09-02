import React, { useState } from 'react';
import { Search, Plus, Briefcase, Filter, CheckCircle2, Clock, Layers, Laptop, Sparkles } from 'lucide-react';
import JobCard from './JobCard';

export default function JobList({ jobs, loading, onApplyToggle, onDelete, onOpenAddModal }) {
  const [activeTab, setActiveTab] = useState('active'); // 'all', 'active', 'applied', 'expired'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Derive categories with Computer Science & IT prioritized
  const rawCategories = [...new Set(jobs.map((j) => j.category).filter(Boolean))];
  const sortedCategories = [
    'all',
    ...rawCategories.sort((a, b) => {
      if (a.toLowerCase().includes('computer') || a.toLowerCase().includes('it')) return -1;
      if (b.toLowerCase().includes('computer') || b.toLowerCase().includes('it')) return 1;
      return a.localeCompare(b);
    })
  ];

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    // Tab filter
    if (activeTab === 'active' && job.status !== 'active') return false;
    if (activeTab === 'applied' && job.status !== 'applied') return false;
    if (activeTab === 'expired' && job.status !== 'expired') return false;

    // Category filter
    if (selectedCategory !== 'all' && job.category !== selectedCategory) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = job.title?.toLowerCase().includes(q);
      const matchDept = job.department?.toLowerCase().includes(q);
      const matchCat = job.category?.toLowerCase().includes(q);
      const matchNotes = job.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchDept && !matchCat && !matchNotes) return false;
    }

    return true;
  });

  const countActive = jobs.filter((j) => j.status === 'active').length;
  const countApplied = jobs.filter((j) => j.status === 'applied').length;
  const countExpired = jobs.filter((j) => j.status === 'expired').length;
  const countCsIt = jobs.filter((j) => j.category?.toLowerCase().includes('computer') || j.category?.toLowerCase().includes('it')).length;

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Active Reminders ({countActive})
          </button>

          <button
            onClick={() => setActiveTab('applied')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'applied'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Applied ({countApplied})
          </button>

          <button
            onClick={() => setActiveTab('expired')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'expired'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Expired ({countExpired})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All ({jobs.length})
          </button>
        </div>

        {/* Search and Add Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search CSE, IT, ISRO, NIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Post Job</span>
          </button>
        </div>
      </div>

      {/* Category Pills with Special CS/IT Badge */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 flex items-center gap-1 mr-1 text-[11px] whitespace-nowrap">
          <Filter className="w-3 h-3" /> Stream:
        </span>
        {sortedCategories.map((cat) => {
          const isCsIt = cat.toLowerCase().includes('computer') || cat.toLowerCase().includes('it');
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl capitalize transition text-[11px] whitespace-nowrap font-medium ${
                isSelected
                  ? isCsIt
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'bg-slate-700 text-white font-bold'
                  : isCsIt
                  ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isCsIt && <Laptop className="w-3.5 h-3.5 text-cyan-400" />}
              {cat === 'all' ? 'All Streams' : cat}
              {isCsIt && ` (${countCsIt})`}
            </button>
          );
        })}
      </div>

      {/* Job Grid / List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading jobs...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300">No jobs found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'active'
              ? 'No active job deadlines found for this selection.'
              : activeTab === 'applied'
              ? 'No jobs marked as applied yet in this category.'
              : 'Try changing your search keywords or stream filter.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" /> Post Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApplyToggle={onApplyToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
