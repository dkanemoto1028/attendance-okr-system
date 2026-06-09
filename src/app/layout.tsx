import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { LangProvider } from "@/context/lang";
import { NotifProvider } from "@/context/notifications";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PeopleOS — 勤怠 × OKR Platform",
  description: "グローバル多拠点対応 次世代ピープルマネジメントプラットフォーム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <LangProvider>
          <NotifProvider>
            <div className="flex">
              <Sidebar />
              <main className="flex-1 min-h-screen overflow-auto">
                {children}
              </main>
            </div>
          </NotifProvider>
        </LangProvider>
      </body>
    </html>
  );
}
