import React from 'react';
import { Calendar, Building2, ExternalLink, CheckCircle, Clock, Trash2, Tag, AlertTriangle } from 'lucide-react';

export default function JobCard({ job, onApplyToggle, onDelete }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = new Date(job.last_date);
  lastDate.setHours(0, 0, 0, 0);

  const diffTime = lastDate - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getDaysBadge = () => {
    if (job.status === 'applied') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle className="w-3.5 h-3.5" /> Applied
        </span>
      );
    }
    if (job.status === 'expired' || daysLeft < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          <Clock className="w-3.5 h-3.5" /> Expired
        </span>
      );
    }
    if (daysLeft === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/25 text-red-300 border border-red-500/40 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Last Day Today!
        </span>
      );
    }
    if (daysLeft === 1) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
          <Clock className="w-3.5 h-3.5 text-red-400" /> 1 Day Left
        </span>
      );
    }
    if (daysLeft <= 3) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
          <Clock className="w-3.5 h-3.5 text-orange-400" /> {daysLeft} Days Left
        </span>
      );
    }
    if (daysLeft <= 7) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5 text-amber-400" /> {daysLeft} Days Left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
        <Clock className="w-3.5 h-3.5 text-sky-400" /> {daysLeft} Days Left
      </span>
    );
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 bg-slate-900/90 p-5 flex flex-col justify-between hover:shadow-xl ${
      job.status === 'applied'
        ? 'border-emerald-900/40 opacity-90'
        : job.status === 'expired'
        ? 'border-slate-800 opacity-75'
        : 'border-slate-700/70 hover:border-slate-600'
    }`}>
      <div>
        {/* Top meta tags */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
              <Building2 className="w-3 h-3 text-sky-400" />
              {job.department}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-800/60 text-slate-400 px-2 py-1 rounded-lg border border-slate-700/50">
              <Tag className="w-3 h-3 text-amber-400" />
              {job.category}
            </span>
          </div>
          {getDaysBadge()}
        </div>

        {/* Job Title */}
        <h3 className="text-lg font-bold text-white tracking-tight mb-2 line-clamp-2">
          {job.title}
        </h3>

        {/* Notes (if available) */}
        {job.notes && (
          <p className="text-xs text-slate-400 mb-4 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            {job.notes}
          </p>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-800/80 mb-4">
          <div>
            <span className="text-slate-500 block">Posted Date</span>
            <span className="text-slate-300 font-medium inline-flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-400" /> {job.post_date}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Last Date to Apply</span>
            <span className={`font-semibold inline-flex items-center gap-1 mt-0.5 ${
              daysLeft <= 3 && job.status === 'active' ? 'text-red-400' : 'text-slate-200'
            }`}>
              <Calendar className="w-3 h-3 text-amber-400" /> {job.last_date}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <a
          href={job.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition shadow-md shadow-sky-500/15"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Apply Online
        </a>

        <button
          onClick={() => onApplyToggle(job.id)}
          title={job.status === 'applied' ? 'Mark as Not Applied' : 'Mark as Applied'}
          className={`inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2.5 px-3 rounded-xl transition border ${
            job.status === 'applied'
              ? 'bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border-emerald-700/60'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <CheckCircle className={`w-3.5 h-3.5 ${job.status === 'applied' ? 'text-emerald-400' : ''}`} />
          <span>{job.status === 'applied' ? 'Applied' : 'Mark Applied'}</span>
        </button>

        <button
          onClick={() => onDelete(job.id)}
          title="Delete job"
          className="p-2.5 bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/80 hover:border-rose-800/60 rounded-xl transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
