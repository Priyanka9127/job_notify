import React, { useState } from 'react';
import { X, PlusCircle, Building2, Tag, Calendar, Link2, FileText, Bell } from 'lucide-react';

export default function JobFormModal({ isOpen, onClose, onJobCreated }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    category: 'Computer Science & IT',
    post_date: todayStr,
    last_date: '',
    apply_link: '',
    notes: '',
  });
  const [notify, setNotify] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.department || !formData.last_date || !formData.apply_link) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onJobCreated(formData, notify);
      onClose();
      // Reset form
      setFormData({
        title: '',
        department: '',
        category: 'Computer Science & IT',
        post_date: todayStr,
        last_date: '',
        apply_link: '',
        notes: '',
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Failed to save job.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickDepts = [
    'NIC / MeitY',
    'ISRO',
    'DRDO',
    'CDAC',
    'BARC',
    'IBPS (IT Officer)',
    'UPSC',
    'SSC',
    'Railways (RRB)'
  ];

  const quickCategories = [
    'Computer Science & IT',
    'AI & Data Science',
    'Software / Cloud',
    'Graduate',
    'Engineering',
    'Banking'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Post Sarkari Job</h2>
              <p className="text-xs text-slate-400">Add job post to start deadline tracking & push reminders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Job Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NIC Scientist 'B' (Computer Science & IT)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-sky-400" /> Organization / Department *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. National Informatics Centre (NIC / MeitY)"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            {/* Quick Dept badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickDepts.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setFormData({ ...formData, department: d })}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" /> Category / Stream
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science & IT"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickCategories.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setFormData({ ...formData, category: c })}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Posted Date
              </label>
              <input
                type="date"
                required
                value={formData.post_date}
                onChange={(e) => setFormData({ ...formData, post_date: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-red-400" /> Last Date to Apply *
              </label>
              <input
                type="date"
                required
                value={formData.last_date}
                onChange={(e) => setFormData({ ...formData, last_date: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Official Apply URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-sky-400" /> Official Application Link *
            </label>
            <input
              type="url"
              required
              placeholder="https://... official recruitment portal"
              value={formData.apply_link}
              onChange={(e) => setFormData({ ...formData, apply_link: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes / Eligibility (e.g. B.Tech CS/IT/AI, Pay Matrix, Vacancies)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. B.Tech Computer Science / AI eligible. Pay Level 10 (Rs 56,100). No fee for women."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Instant notification toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="notifyCheck"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
            />
            <label htmlFor="notifyCheck" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              Broadcast instant push notification for this new job
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
