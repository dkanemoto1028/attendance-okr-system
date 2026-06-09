"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Clock, Target, Globe, Bell, Settings, Users, Menu, X, UserCircle, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/context/lang";
import { useNotif } from "@/context/notifications";

type Role = "manager" | "employee";

const managerNav = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/attendance", key: "attendance", icon: Clock },
  { href: "/okr", key: "okr", icon: Target },
  { href: "/team", key: "team", icon: Users },
  { href: "/global", key: "global", icon: Globe },
];

const employeeNav = [
  { href: "/my", label: "My Page", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLang();
  const { unreadCount } = useNotif();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<Role>(pathname === "/my" ? "employee" : "manager");

  const isEmployee = role === "employee";
  const navItems = isEmployee ? employeeNav.map(n => ({ ...n, key: n.label })) : managerNav;

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">PM</div>
          <div>
            <div className="text-sm font-semibold leading-tight">PeopleOS</div>
            <div className="text-xs text-slate-400">勤怠 × OKR Platform</div>
          </div>
        </div>
        <button className="md:hidden text-slate-400" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* Role switcher */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex rounded-lg bg-slate-800 p-1 gap-1">
          <button
            onClick={() => { setRole("employee"); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors",
              isEmployee ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <UserCircle size={13} /> My Page
          </button>
          <button
            onClick={() => { setRole("manager"); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors",
              !isEmployee ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <BarChart2 size={13} /> Manager
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {isEmployee ? (
          <Link
            href="/my"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/my" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <UserCircle size={18} /> My Page
          </Link>
        ) : (
          managerNav.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {t(key)}
            </Link>
          ))
        )}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-700 space-y-1">
        <Link
          href="/settings#notifications"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white relative"
        >
          <Bell size={18} />
          {t("notifications")}
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-indigo-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
        >
          <Settings size={18} />
          {t("settings")}
        </Link>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">IS</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">Ichiro Suzuki （鈴木 一郎）</div>
          <div className="text-xs text-slate-400">Engineering Manager</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-slate-900 text-white flex-col h-screen sticky top-0 shrink-0">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-xs font-bold">PM</div>
          <span className="text-sm font-semibold">PeopleOS</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-slate-300">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-72 bg-slate-900 text-white flex flex-col z-50 md:hidden shadow-2xl">
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}
