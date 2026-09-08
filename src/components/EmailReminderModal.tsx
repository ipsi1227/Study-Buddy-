import React, { useState } from 'react';
import {
  Mail,
  X,
  CheckCircle2,
  BellOff,
  Bell,
  Send,
  ExternalLink,
  Copy,
  Flame,
  Check,
} from 'lucide-react';
import { UpcomingTodo, StudentProfile } from '../types';

interface EmailReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateEmailSettings: (enabled: boolean, emailAddress: string) => void;
  uncompletedTodos: UpcomingTodo[];
}

export const EmailReminderModal: React.FC<EmailReminderModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateEmailSettings,
  uncompletedTodos,
}) => {
  const [enabled, setEnabled] = useState(profile.emailAlertsEnabled !== false);
  const [email, setEmail] = useState(
    profile.emailAlertsAddress || profile.email || 'panda.ipsita2007@gmail.com'
  );
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!isOpen) return null;

  const urgentTodos = uncompletedTodos.filter((t) => t.priority === 'urgent');

  // Format email subject and body
  const emailSubject = `[STUDY BUDDY] Daily Task Reminder - ${uncompletedTodos.length} Unfinished Task(s)`;
  const emailBody = `Hey ${profile.name || 'Student'},

This is your daily STUDY BUDDY academic accountability digest for today (${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })}).

Target CGPA: ${profile.targetCGPA || 9.5} | University: ${profile.university || 'IIT Delhi'}

=== UNFINISHED TASKS (${uncompletedTodos.length}) ===
${
  uncompletedTodos.length === 0
    ? 'All tasks for today are completed! Great job!'
    : uncompletedTodos
        .map(
          (t, idx) =>
            `${idx + 1}. [${t.priority.toUpperCase()}] ${t.title} (${
              t.estimatedMinutes || 30
            } mins)`
        )
        .join('\n')
}

${
  urgentTodos.length > 0
    ? `\nCRITICAL / URGENT TASKS (Must complete before midnight):\n` +
      urgentTodos.map((t) => `• ${t.title}`).join('\n')
    : ''
}

Keep pushing towards your 10 CGPA goals!
- Study Buddy Self-Study Academic Planner`;

  const handleSaveSettings = (newEnabledState?: boolean) => {
    const nextState = newEnabledState !== undefined ? newEnabledState : enabled;
    setEnabled(nextState);
    onUpdateEmailSettings(nextState, email);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleStopStart = () => {
    const nextState = !enabled;
    handleSaveSettings(nextState);
  };

  // 1. Open and Send via Gmail Web (Opens pre-filled compose tab in Gmail)
  const handleOpenGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      email
    )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(gmailUrl, '_blank');

    // Also trigger server dispatch
    triggerServerDispatch();
    setDispatchStatus('opened_gmail');
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  // 2. Open via Default Mail App (mailto)
  const handleOpenDefaultMail = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    // Also trigger server dispatch
    triggerServerDispatch();
    setDispatchStatus('opened_client');
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  // 3. Trigger server email endpoint
  const triggerServerDispatch = async () => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          uncompletedTodos,
        }),
      });
    } catch (err) {
      console.warn('Server dispatch request completed:', err);
    }
  };

  // 4. Copy Email Digest to Clipboard
  const handleCopyEmailText = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#131620] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white font-display">
                Task Incompletion Email Reminders
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Daily evening email reminder containing all unfinished tasks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              enabled
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {enabled ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-neutral-400 dark:bg-neutral-700 text-white flex items-center justify-center">
                  <BellOff className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Status: {enabled ? 'Email Alerts Active' : 'Email Alerts Stopped'}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {enabled
                    ? `Reminders configured for ${email} with ${uncompletedTodos.length} pending task(s).`
                    : 'Daily task email reminders are currently paused.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleStopStart}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap ${
                enabled
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {enabled ? 'Stop Email Alerts' : 'Resume Email Alerts'}
            </button>
          </div>

          {/* Email Destination Field */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Notification Email Address *
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSaveSettings()}
                className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition"
              >
                {savedSuccess ? 'Saved!' : 'Save Address'}
              </button>
            </div>
          </div>

          {/* Direct Send Actions (Real Email Dispatch) */}
          <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 font-mono-code">
                  Send Task Reminder Now
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Send your current {uncompletedTodos.length} unfinished tasks to your email immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Primary: Open & Send via Gmail Web */}
              <button
                onClick={handleOpenGmail}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Send via Gmail</span>
              </button>

              {/* Secondary: Default Email Client (mailto) */}
              <button
                onClick={handleOpenDefaultMail}
                className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition flex items-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Email App</span>
              </button>

              {/* Copy Email Body */}
              <button
                onClick={handleCopyEmailText}
                className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSuccess ? 'Copied!' : 'Copy Digest'}</span>
              </button>
            </div>

            {/* Dispatch Status Feedback */}
            {dispatchStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 font-medium flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {dispatchStatus === 'opened_gmail'
                    ? `Gmail compose tab opened with your task digest ready to send to ${email}!`
                    : `Default email client opened with task digest for ${email}!`}
                </span>
              </div>
            )}
          </div>

          {/* Email Template Preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono-code">
              Live Digest Preview
            </span>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0c0e14] p-4 text-xs space-y-3 font-sans shadow-inner">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-2 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono-code">
                <div>
                  <strong>To:</strong> {email}
                  <br />
                  <strong>Subject:</strong> {emailSubject}
                </div>
                <span className="font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                  {uncompletedTodos.length} Unfinished
                </span>
              </div>

              <div className="bg-white dark:bg-[#131620] p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                <div className="pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <h5 className="font-bold text-neutral-900 dark:text-white">
                    STUDY BUDDY Daily Accountability Check
                  </h5>
                  <p className="text-[11px] text-neutral-500">
                    Hey {profile.name}! Here is your task breakdown.
                  </p>
                </div>

                {/* Urgent Tasks */}
                {urgentTodos.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-1">
                    <span className="font-bold text-red-700 dark:text-red-300 text-[11px] flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-600" />
                      CRITICAL / URGENT:
                    </span>
                    {urgentTodos.map((t) => (
                      <div key={t.id} className="text-red-900 dark:text-red-200 font-medium pl-3">
                        • {t.title} ({t.estimatedMinutes || 30} mins)
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Uncompleted Tasks */}
                <div className="space-y-1">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300 text-[11px]">
                    Pending Tasks:
                  </span>
                  {uncompletedTodos.length === 0 ? (
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium pl-3">
                      ✓ No pending tasks!
                    </div>
                  ) : (
                    uncompletedTodos.slice(0, 4).map((t) => (
                      <div key={t.id} className="text-neutral-600 dark:text-neutral-400 pl-3">
                        • {t.title}
                      </div>
                    ))
                  )}
                  {uncompletedTodos.length > 4 && (
                    <div className="text-[11px] text-neutral-400 pl-3">
                      + {uncompletedTodos.length - 4} more pending task(s)...
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Keep striving for 10 CGPA! 🎯</span>
                  <button
                    onClick={() => handleSaveSettings(false)}
                    className="text-red-600 dark:text-red-400 font-semibold hover:underline"
                  >
                    Click to Stop Daily Emails
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
