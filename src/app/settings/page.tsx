"use client";

import { useState } from "react";
import { useLang, LANG_LABELS, LANG_FLAGS, type Lang } from "@/context/lang";
import { useNotif } from "@/context/notifications";
import { cn } from "@/lib/utils";
import {
  Settings, Globe, Bell, User, Shield, Check,
  AlertTriangle, FileText, Target, Clock, ChevronRight,
} from "lucide-react";

const TIMEZONES = [
  { value: "Asia/Tokyo", label: "東京 (UTC+9)" },
  { value: "Asia/Seoul", label: "ソウル (UTC+9)" },
  { value: "Asia/Ho_Chi_Minh", label: "ホーチミン (UTC+7)" },
  { value: "Asia/Shanghai", label: "上海 (UTC+8)" },
  { value: "America/Bogota", label: "ボゴタ (UTC-5)" },
];

type NotifSetting = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  slack: boolean;
  email: boolean;
  push: boolean;
};

export default function SettingsPage() {
  const { lang, setLang, t } = useLang();
  const { notifications, markAllRead } = useNotif();
  const [tz, setTz] = useState("Asia/Tokyo");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "language" | "notifications" | "security">("language");

  const [notifSettings, setNotifSettings] = useState<NotifSetting[]>([
    {
      id: "risk", label: "リスクアラート", description: "メンバーの不調・過重労働を検知した時",
      icon: <AlertTriangle size={16} className="text-red-500" />,
      slack: true, email: true, push: true,
    },
    {
      id: "leave_request", label: "休暇申請", description: "チームメンバーから休暇申請が届いた時",
      icon: <FileText size={16} className="text-indigo-500" />,
      slack: true, email: false, push: true,
    },
    {
      id: "okr_update", label: "OKR進捗変化", description: "OKRのステータスが変わった時",
      icon: <Target size={16} className="text-violet-500" />,
      slack: true, email: false, push: false,
    },
    {
      id: "reminder", label: "打刻リマインダー", description: "未打刻メンバーへの通知結果",
      icon: <Clock size={16} className="text-amber-500" />,
      slack: false, email: false, push: true,
    },
    {
      id: "compliance", label: "コンプライアンスアラート", description: "法令違反リスクが検知された時",
      icon: <Shield size={16} className="text-red-600" />,
      slack: true, email: true, push: true,
    },
  ]);

  const toggleNotif = (id: string, channel: "slack" | "email" | "push") => {
    setNotifSettings((prev) =>
      prev.map((s) => s.id === id ? { ...s, [channel]: !s[channel] } : s)
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: "language" as const, label: t("language"), icon: Globe },
    { id: "notifications" as const, label: t("notification_settings"), icon: Bell },
    { id: "profile" as const, label: t("profile"), icon: User },
    { id: "security" as const, label: "セキュリティ", icon: Shield },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 pt-16 md:pt-8">
      <div className="flex items-center gap-2">
        <Settings size={24} className="text-indigo-500" />
        <div>
          <h1 className="text-2xl font-bold">{t("settings")}</h1>
          <p className="text-slate-500 text-sm mt-0.5">表示言語・通知・プロフィールの設定</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab list */}
        <div className="md:w-52 shrink-0">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors",
                  activeTab === id
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon size={16} />
                {label}
                <ChevronRight size={14} className={cn("ml-auto transition-transform", activeTab === id && "rotate-90")} />
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {/* ── 言語・タイムゾーン */}
          {activeTab === "language" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-8">
              <div>
                <h2 className="font-semibold mb-1 flex items-center gap-2"><Globe size={18} className="text-indigo-500" />{t("language")}</h2>
                <p className="text-xs text-slate-400 mb-4">選択した言語でナビゲーションとUIが切り替わります</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.entries(LANG_LABELS) as [Lang, string][]).map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() => setLang(code)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                        lang === code
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      )}
                    >
                      <span className="text-xl">{LANG_FLAGS[code]}</span>
                      <div className="text-left">
                        <div>{label}</div>
                        <div className="text-xs text-slate-400 font-normal">{code.toUpperCase()}</div>
                      </div>
                      {lang === code && <Check size={16} className="ml-auto text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-semibold mb-1 flex items-center gap-2">🕐 {t("timezone")}</h2>
                <p className="text-xs text-slate-400 mb-4">打刻・リマインダーはこのタイムゾーンを基準に動作します</p>
                <div className="space-y-2">
                  {TIMEZONES.map((zone) => (
                    <button
                      key={zone.value}
                      onClick={() => setTz(zone.value)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-all",
                        tz === zone.value
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700 font-medium"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      )}
                    >
                      {zone.label}
                      {tz === zone.value && <Check size={16} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                  saved
                    ? "bg-emerald-500 text-white"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                {saved ? <><Check size={16} /> 保存しました！</> : t("save")}
              </button>
            </div>
          )}

          {/* ── 通知設定 */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              {/* 未読一覧 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2"><Bell size={18} className="text-indigo-500" /> 未読通知</h2>
                  <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">すべて既読にする</button>
                </div>
                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {notifications.filter((n) => !n.read).length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-400">未読通知はありません 🎉</div>
                  )}
                  {notifications.filter((n) => !n.read).map((n) => (
                    <div key={n.id} className="px-6 py-4 bg-indigo-50/30">
                      <div className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 通知チャネル設定 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold">通知チャネル設定</h2>
                  <p className="text-xs text-slate-400 mt-0.5">通知タイプごとに受け取るチャネルを選択</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs text-slate-400">
                        <th className="text-left px-6 py-3 font-medium">通知タイプ</th>
                        <th className="text-center px-4 py-3 font-medium">Slack</th>
                        <th className="text-center px-4 py-3 font-medium">メール</th>
                        <th className="text-center px-6 py-3 font-medium">プッシュ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {notifSettings.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {s.icon}
                              <div>
                                <div className="font-medium text-slate-800">{s.label}</div>
                                <div className="text-xs text-slate-400">{s.description}</div>
                              </div>
                            </div>
                          </td>
                          {(["slack", "email", "push"] as const).map((ch) => (
                            <td key={ch} className="text-center px-4 py-4">
                              <button
                                onClick={() => toggleNotif(s.id, ch)}
                                className={cn(
                                  "w-11 h-6 rounded-full transition-colors relative shrink-0",
                                  s[ch] ? "bg-indigo-500" : "bg-slate-200"
                                )}
                              >
                                <span className={cn(
                                  "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                                  s[ch] ? "translate-x-5" : "translate-x-0.5"
                                )} />
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-100">
                  <button onClick={handleSave} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all", saved ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700")}>
                    {saved ? <><Check size={16} /> 保存しました！</> : t("save")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── プロフィール */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold">IS</div>
                <div>
                  <div className="font-semibold text-lg">鈴木 一郎</div>
                  <div className="text-slate-500 text-sm">Engineering Manager · 🇯🇵 Japan</div>
                  <div className="text-slate-400 text-xs mt-0.5">i.suzuki@company.com</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "氏名", value: "鈴木 一郎" },
                  { label: "表示名（英語）", value: "Ichiro Suzuki" },
                  { label: "メールアドレス", value: "i.suzuki@company.com" },
                  { label: "役職", value: "Engineering Manager" },
                  { label: "部門", value: "Engineering" },
                  { label: "Slack ID", value: "@ichiro.suzuki" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-medium text-slate-500 block mb-1">{field.label}</label>
                    <input
                      defaultValue={field.value}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all", saved ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700")}>
                {saved ? <><Check size={16} /> 保存しました！</> : t("save")}
              </button>
            </div>
          )}

          {/* ── セキュリティ */}
          {activeTab === "security" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div>
                <h2 className="font-semibold mb-4 flex items-center gap-2"><Shield size={18} className="text-indigo-500" /> セキュリティ設定</h2>
                <div className="space-y-4">
                  {[
                    { label: "2段階認証 (2FA)", desc: "Google AuthenticatorやSMSで追加の認証を要求", enabled: true },
                    { label: "シングルサインオン (SSO)", desc: "Google WorkspaceやOktaでログイン", enabled: false },
                    { label: "セッションタイムアウト", desc: "30分間操作がない場合に自動ログアウト", enabled: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{item.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                      <div className={cn("w-11 h-6 rounded-full relative", item.enabled ? "bg-indigo-500" : "bg-slate-200")}>
                        <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", item.enabled ? "translate-x-5" : "translate-x-0.5")} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
