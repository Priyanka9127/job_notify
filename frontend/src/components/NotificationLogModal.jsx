import React, { useState, useEffect } from 'react';
import { X, History, Bell, CheckCircle2, Clock } from 'lucide-react';
import { getNotificationLogs } from '../api';

export default function NotificationLogModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getNotificationLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Push Alert History</h2>
              <p className="text-xs text-slate-400">All recent notifications sent by the scheduler</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500">Loading history...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">No notifications sent yet.</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    {log.title}
                  </span>
                  <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    {log.type}
                  </span>
                </div>
                <p className="text-slate-300">{log.message}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                  <Clock className="w-3 h-3" />
                  {new Date(log.sent_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
