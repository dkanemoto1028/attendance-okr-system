"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type NotifType = "risk" | "leave_request" | "okr_update" | "reminder" | "compliance";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  actionLabel?: string;
}

const INITIAL: Notification[] = [
  {
    id: "n1", type: "risk", title: "⚠️ 山田さんのリスクアラート",
    body: "今月残業42h・有給未取得。1on1での確認を推奨します。",
    time: "10分前", read: false, actionLabel: "1on1をスケジュール",
  },
  {
    id: "n2", type: "leave_request", title: "📋 休暇申請 — 田中 花子",
    body: "6月16日〜17日（2日間）の有給休暇申請が届いています。",
    time: "1時間前", read: false, actionLabel: "承認する",
  },
  {
    id: "n3", type: "compliance", title: "🇰🇷 韓国 コンプライアンスアラート",
    body: "週52時間超過の可能性あり。3名該当。確認が必要です。",
    time: "3時間前", read: false, actionLabel: "詳細を見る",
  },
  {
    id: "n4", type: "okr_update", title: "🎯 OKR進捗更新",
    body: "チームOKR「開発チームの持続可能なペース」が要注意ステータスになりました。",
    time: "昨日", read: true,
  },
  {
    id: "n5", type: "reminder", title: "⏰ 未打刻リマインダー送信済み",
    body: "山田 太郎さんへ朝の打刻リマインダーを送信しました。",
    time: "昨日", read: true,
  },
];

interface NotifContextType {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

const NotifContext = createContext<NotifContextType>({
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  dismiss: () => {},
});

export function NotifProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, dismiss }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotif = () => useContext(NotifContext);
