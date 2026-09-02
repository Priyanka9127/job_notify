import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle2, AlertCircle, RefreshCw, Send } from 'lucide-react';
import { registerAndSubscribePush, sendTestPush, triggerDeadlineCheck } from '../api';

export default function PushBanner({ onNotificationSent }) {
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnablePush = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await registerAndSubscribePush();
      setPermission('granted');
      setMessage('Push notifications enabled successfully! You will receive alerts for new jobs and deadlines.');
      if (onNotificationSent) onNotificationSent();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to enable push notifications.');
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestPush = async () => {
    setTesting(true);
    setError('');
    setMessage('');
    try {
      const res = await sendTestPush();
      setMessage(res.message || 'Test notification sent!');
      if (onNotificationSent) onNotificationSent();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Failed to send test push.');
    } finally {
      setTesting(false);
    }
  };

  const handleCheckDeadlines = async () => {
    setTesting(true);
    setError('');
    setMessage('');
    try {
      const res = await triggerDeadlineCheck();
      setMessage(res.message || 'Deadline check completed.');
      if (onNotificationSent) onNotificationSent();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Check failed.');
    } finally {
      setTesting(false);
    }
  };

  if (!('Notification' in window)) {
    return (
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 mb-6 text-amber-200 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
        <span>Push notifications are not supported in this browser environment.</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl ${
            permission === 'granted'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {permission === 'granted' ? (
              <BellRing className="w-6 h-6 animate-pulse" />
            ) : (
              <Bell className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">
                {permission === 'granted' ? 'Instant Alerts Active' : 'Enable Job Alerts & Reminders'}
              </h3>
              {permission === 'granted' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Live
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {permission === 'granted'
                ? 'You will get automatic notifications on job post & 7, 3, 1 day before deadline.'
                : 'Turn on mobile & browser push notifications to never miss a Sarkari job deadline.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {permission !== 'granted' ? (
            <button
              onClick={handleEnablePush}
              disabled={loading || permission === 'denied'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Enabling...
                </>
              ) : permission === 'denied' ? (
                'Notifications Blocked in Browser'
              ) : (
                <>
                  <Bell className="w-4 h-4" /> Enable Notifications
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleTestPush}
                disabled={testing}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs sm:text-sm font-medium px-3 py-2 rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                {testing ? 'Sending...' : 'Test Push Alert'}
              </button>

              <button
                onClick={handleCheckDeadlines}
                disabled={testing}
                title="Run scheduler deadline logic now"
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs sm:text-sm font-medium px-3 py-2 rounded-xl transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-sky-400' : ''}`} />
                Check Deadlines Now
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className="mt-3.5 p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mt-3.5 p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
