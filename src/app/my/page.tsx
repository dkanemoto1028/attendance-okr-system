"use client";

import { useState, useRef, useEffect } from "react";
import { healthData, employees } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Heart, Thermometer, Moon, Footprints, Watch,
  Pencil, Upload, X, CheckCircle, Clock, Send,
  Lock, ChevronDown, Calendar, FileText, Paperclip,
} from "lucide-react";
import { useLang } from "@/context/lang";

const ME = employees.find((e) => e.id === "m1")!;
const MY_HEALTH = healthData.find((h) => h.employeeId === "m1")!;

type PunchState = "not_punched" | "in" | "out";
type ChatMsg = { role: "user" | "bot"; text: string; time: string };

const BOT_RESPONSES: { keywords: string[]; reply: string }[] = [
  { keywords: ["頭痛", "頭", "head"], reply: "頭痛のご連絡ありがとうございます。無理せず今日は早退や在宅勤務も検討してください。必要であれば人事まで相談いただけます。この会話は管理者と本人のみが確認できます。" },
  { keywords: ["熱", "発熱", "fever", "temp"], reply: "発熱の症状がある場合、出社を控えていただくことをお勧めします。体温を記録して、必要に応じて医療機関を受診してください。" },
  { keywords: ["疲れ", "睡眠", "眠れ", "tired", "sleep"], reply: "お疲れ様です。睡眠不足が続くと健康に影響が出やすいです。本日の睡眠データも確認しました。無理をせず、上長に状況を共有することも一つの選択肢です。" },
  { keywords: ["ストレス", "つらい", "しんどい", "stress"], reply: "お気持ちを打ち明けてくださりありがとうございます。この内容は管理者との間のみで共有されます。必要であれば1on1を設定することもできますので、お気軽にご相談ください。" },
  { keywords: ["ok", "大丈夫", "元気", "fine"], reply: "それは良かったです！今日も無理せず、体調に変化があればいつでもこちらへ。" },
];

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  for (const { keywords, reply } of BOT_RESPONSES) {
    if (keywords.some((k) => lower.includes(k))) return reply;
  }
  return "ご連絡ありがとうございます。内容を確認しました。この会話は管理者と本人のみが閲覧できます。体調に大きな変化があれば、早めに管理者や医療機関へご相談ください。";
}

function now() {
  return new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export default function MyPage() {
  const { t } = useLang();

  // ── Punch
  const [punchState, setPunchState] = useState<PunchState>("not_punched");
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const handlePunch = () => {
    const time = now();
    if (punchState === "not_punched") { setPunchState("in"); setPunchTime(time); }
    else if (punchState === "in")    { setPunchState("out"); setPunchTime(time); }
  };

  // ── Health edit
  const [health, setHealth] = useState({ ...MY_HEALTH });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...MY_HEALTH });
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveHealth = () => {
    setHealth(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // ── Leave request
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: "annual", from: "", to: "", reason: "" });
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const submitLeave = () => {
    setLeaveSubmitted(true);
    setLeaveOpen(false);
    setTimeout(() => setLeaveSubmitted(false), 3000);
  };

  // ── Wellness chat
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "bot", text: "こんにちは。体調や気になることがあれば気軽に話しかけてください。この会話はあなたと管理者のみ確認できます。🔒", time: "08:00" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const sendMsg = () => {
    if (!input.trim()) return;
    const userMsg: ChatMsg = { role: "user", text: input.trim(), time: now() };
    setMsgs((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((p) => [...p, { role: "bot", text: getBotReply(userMsg.text), time: now() }]);
      setTyping(false);
    }, 1200);
  };

  const sleepColor = health.sleepQuality === "good" ? "text-emerald-600" : health.sleepQuality === "fair" ? "text-amber-600" : "text-red-500";
  const hrColor = health.heartRate > 90 ? "text-red-500" : health.heartRate > 75 ? "text-amber-600" : "text-emerald-600";
  const tempColor = health.bodyTemp > 37.4 ? "text-red-500" : health.bodyTemp > 37.0 ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="p-4 md:p-8 space-y-5 pt-16 md:pt-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          {t("greeting")}、{ME.nameEn} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">2026-06-09 (Mon) · {ME.role}</p>
      </div>

      {/* ── PUNCH CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
          <Clock size={15} /> 打刻 / Check-in
        </h2>
        {punchState === "not_punched" && (
          <button
            onClick={handlePunch}
            className="w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white text-lg font-bold shadow-lg shadow-emerald-200"
          >
            ✅ Punch In
          </button>
        )}
        {punchState === "in" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-emerald-700">In office — punched in at {punchTime}</span>
            </div>
            <button
              onClick={handlePunch}
              className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white text-base font-bold"
            >
              🚪 Punch Out
            </button>
          </div>
        )}
        {punchState === "out" && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <CheckCircle size={18} className="text-slate-500" />
            <span className="text-sm text-slate-600">Punched out at {punchTime}. Have a good rest! 👋</span>
          </div>
        )}
      </div>

      {/* ── HEALTH DATA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Watch size={15} /> {health.device} — {health.updatedAt} sync
          </h2>
          <button
            onClick={() => { setDraft({ ...health }); setProofFiles([]); setEditing(true); }}
            className="flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
          >
            <Pencil size={12} /> 手動修正
          </button>
        </div>

        {saved && (
          <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <CheckCircle size={13} /> 保存しました
          </div>
        )}

        {!editing ? (
          <div className="grid grid-cols-2 gap-3">
            <HealthMetric icon={<Heart size={18} className={hrColor} />} label="Heart rate" value={`${health.heartRate} bpm`} color={hrColor} />
            <HealthMetric icon={<Thermometer size={18} className={tempColor} />} label="Body temp" value={`${health.bodyTemp} °C`} color={tempColor} />
            <HealthMetric icon={<Moon size={18} className={sleepColor} />} label="Sleep" value={`${health.sleepHours} h`} color={sleepColor} sub={health.sleepQuality} />
            <HealthMetric icon={<Footprints size={18} className="text-blue-500" />} label="Steps" value={health.steps.toLocaleString()} color="text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Heart size={12} /> Heart rate (bpm)</span>
                <input type="number" value={draft.heartRate} onChange={(e) => setDraft((p) => ({ ...p, heartRate: +e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Thermometer size={12} /> Body temp (°C)</span>
                <input type="number" step="0.1" value={draft.bodyTemp} onChange={(e) => setDraft((p) => ({ ...p, bodyTemp: +e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Moon size={12} /> Sleep (hours)</span>
                <input type="number" step="0.1" value={draft.sleepHours} onChange={(e) => setDraft((p) => ({ ...p, sleepHours: +e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Footprints size={12} /> Steps</span>
                <input type="number" value={draft.steps} onChange={(e) => setDraft((p) => ({ ...p, steps: +e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </label>
            </div>

            {/* File proof upload */}
            <div>
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Paperclip size={12} /> 修正の根拠（スクリーンショット・医師の証明書など）</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-4 text-sm text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors flex flex-col items-center gap-1"
              >
                <Upload size={20} className="text-slate-300" />
                ファイルをアップロード / Browse
              </button>
              <input ref={fileRef} type="file" multiple accept="image/*,.pdf" className="hidden"
                onChange={(e) => setProofFiles((p) => [...p, ...Array.from(e.target.files ?? [])])} />
              {proofFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {proofFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-700"><FileText size={12} /> {f.name}</span>
                      <button onClick={() => setProofFiles((p) => p.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={saveHealth} className="flex-1 bg-indigo-600 text-white text-sm py-2.5 rounded-xl font-medium hover:bg-indigo-700">
                保存 / Save
              </button>
              <button onClick={() => setEditing(false)} className="px-4 border border-slate-200 text-sm py-2.5 rounded-xl text-slate-600 hover:bg-slate-50">
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── LEAVE REQUEST */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Calendar size={15} /> 休暇申請 / Leave Request
          </h2>
          <button onClick={() => setLeaveOpen((p) => !p)}
            className="flex items-center gap-1 text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
            + 申請する <ChevronDown size={12} className={cn("transition-transform", leaveOpen && "rotate-180")} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-3">残有給 17日 / Remaining leave: 17 days</p>

        {leaveSubmitted && (
          <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <CheckCircle size={13} /> 申請を送信しました。承認をお待ちください。
          </div>
        )}

        {leaveOpen && (
          <div className="space-y-3 mt-3 border-t border-slate-100 pt-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">種別 / Type</label>
              <select value={leaveForm.type} onChange={(e) => setLeaveForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="annual">有給休暇 / Annual leave</option>
                <option value="sick">病欠 / Sick leave</option>
                <option value="special">特別休暇 / Special leave</option>
                <option value="half">半日休暇 / Half day</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">開始日 / From</label>
                <input type="date" value={leaveForm.from} onChange={(e) => setLeaveForm((p) => ({ ...p, from: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">終了日 / To</label>
                <input type="date" value={leaveForm.to} onChange={(e) => setLeaveForm((p) => ({ ...p, to: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">理由 / Reason (optional)</label>
              <textarea value={leaveForm.reason} onChange={(e) => setLeaveForm((p) => ({ ...p, reason: e.target.value }))}
                rows={2} placeholder="任意記載..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <button onClick={submitLeave}
              disabled={!leaveForm.from || !leaveForm.to}
              className="w-full bg-indigo-600 text-white text-sm py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed">
              申請を送る / Submit
            </button>
          </div>
        )}
      </div>

      {/* ── WELLNESS CHAT */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Lock size={14} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-700">体調チャット / Wellness Chat</h2>
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">管理者 + 本人のみ閲覧</span>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50">
          {msgs.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs shrink-0 mt-0.5">✦</div>
              )}
              <div className={cn("max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
              )}>
                {msg.text}
                <div className={cn("text-[10px] mt-1 opacity-60", msg.role === "user" ? "text-right" : "")}>{msg.time}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs shrink-0">✦</div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-slate-400 shadow-sm">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMsg()}
            placeholder="体調・気になることを入力… / Type how you feel"
            className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
          />
          <button onClick={sendMsg} disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 shrink-0">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HealthMetric({ icon, label, value, color, sub }: {
  icon: React.ReactNode; label: string; value: string; color: string; sub?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-3.5 flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className={cn("text-base font-bold", color)}>{value}</div>
        {sub && <div className="text-[10px] text-slate-400 capitalize">{sub}</div>}
      </div>
    </div>
  );
}
