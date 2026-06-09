"use client";

import { useState } from "react";
import { useNotif, type NotifType } from "@/context/notifications";
import { cn } from "@/lib/utils";
import { Bell, X, CheckCheck, AlertTriangle, FileText, Target, Clock, Shield } from "lucide-react";

const TYPE_ICON: Record<NotifType, React.ReactNode> = {
  risk: <AlertTriangle size={14} className="text-red-500" />,
  leave_request: <FileText size={14} className="text-indigo-500" />,
  okr_update: <Target size={14} className="text-violet-500" />,
  reminder: <Clock size={14} className="text-amber-500" />,
  compliance: <Shield size={14} className="text-red-600" />,
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotif();

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors relative"
      >
        <Bell size={16} />
        通知
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-11 w-96 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">通知</h3>
                <p className="text-xs text-slate-400 mt-0.5">未読 {unreadCount}件</p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <CheckCheck size={13} /> すべて既読
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  通知はありません
                </div>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group",
                    !n.read && "bg-indigo-50/40"
                  )}
                  onClick={() => markRead(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium leading-snug", !n.read ? "text-slate-900" : "text-slate-600")}>
                          {n.title}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 shrink-0 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-400">{n.time}</span>
                        {n.actionLabel && (
                          <button className="text-xs text-indigo-600 font-medium hover:underline">
                            {n.actionLabel} →
                          </button>
                        )}
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 text-center">
              <a href="/settings" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors">
                通知設定を変更 →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
