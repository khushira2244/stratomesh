import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="min-h-screen pl-72">
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}