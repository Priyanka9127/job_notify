import React, { useState, useEffect } from 'react';
import { Briefcase, BellRing, Plus, History, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { getJobs, createJob, markApplied, deleteJob } from './api';
import PushBanner from './components/PushBanner';
import JobList from './components/JobList';
import JobFormModal from './components/JobFormModal';
import NotificationLogModal from './components/NotificationLogModal';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCreated = async (formData, notify) => {
    const newJob = await createJob(formData, notify);
    setJobs((prev) => [newJob, ...prev]);
  };

  const handleApplyToggle = async (jobId) => {
    try {
      const updated = await markApplied(jobId);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    } catch (err) {
      console.error('Failed to update job status:', err);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  // Stats calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeCount = jobs.filter((j) => j.status === 'active').length;
  const appliedCount = jobs.filter((j) => j.status === 'applied').length;
  const urgentCount = jobs.filter((j) => {
    if (j.status !== 'active') return false;
    const diffDays = Math.ceil((new Date(j.last_date) - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#090d16]/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Sarkari Job Notifier
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  सरकारी अलर्ट
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Deadline Reminders & Push Notification System</p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLogModalOpen(true)}
              title="View Push Alert Log"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <History className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Alert Log</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl transition shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Job</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Stat Highlights */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 block">Active Tracking</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">{activeCount}</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 block">Urgent (≤ 3 Days)</span>
            <span className={`text-xl sm:text-2xl font-black mt-0.5 block ${urgentCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
              {urgentCount}
            </span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
            <span className="text-[11px] sm:text-xs font-medium text-slate-400 block">Completed / Applied</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">{appliedCount}</span>
          </div>
        </div>

        {/* Push Notification Setup & Trigger Banner */}
        <PushBanner onNotificationSent={loadJobs} />

        {/* Jobs List Section */}
        <JobList
          jobs={jobs}
          loading={loading}
          onApplyToggle={handleApplyToggle}
          onDelete={handleDelete}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sarkari Job Notifier &bull; FastAPI + React PWA</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition inline-flex items-center gap-1"
            >
              API Docs <ExternalLink className="w-3 h-3" />
            </a>
            <span>&bull;</span>
            <span>Add to Home Screen on phone for mobile app mode</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <JobFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onJobCreated={handleJobCreated}
      />

      <NotificationLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  );
}
