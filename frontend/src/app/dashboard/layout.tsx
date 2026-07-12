"use client";

import { LayoutDashboard, FileText, Settings, Code, LogOut, CheckCircle, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const urlToken = searchParams.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      router.replace(pathname);
    }

    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      router.replace("/");
    }
  }, [searchParams, pathname, router]);
  
  const navItems = [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Approvals", href: "/dashboard/approvals", icon: <CheckCircle size={20} /> },
    { name: "Generated Posts", href: "/dashboard/posts", icon: <FileText size={20} /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden p-4 gap-6">
      {/* Sidebar */}
      <aside className="w-72 clay-card flex flex-col h-full shrink-0">
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 text-white">
              <Code size={20} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">AutoDev AI</span>
          </div>
          {mounted && (
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="clay-btn p-2 flex items-center justify-center text-secondary hover:text-primary"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 font-medium ${
                  isActive 
                    ? 'clay-btn text-primary' 
                    : 'text-secondary hover:bg-surface-hover hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6">
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/");
            }}
            className="flex items-center gap-3 px-6 py-4 w-full rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto clay-card p-10 relative">
        <div className="max-w-5xl mx-auto h-full">
          {children}
        </div>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}
