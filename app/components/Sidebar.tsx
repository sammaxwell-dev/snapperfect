import Image from "next/image";
import Link from "next/link";
import {
  Home,
  LayoutGrid,
  SunMedium,
  Box,
  Maximize,
  Sparkles,
  Settings,
  ChevronDown,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-sidebar border-r border-white/5 flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10">
            <Image
              src="/assets/logo.png"
              alt="SnapPerfect Logo"
              fill
              className="object-contain filter drop-shadow-[0_0_8px_rgba(212,255,0,0.5)] group-hover:scale-110 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white leading-none tracking-tighter uppercase italic">
              SNAP<span className="text-[#D4FF00]">PERFECT</span>
            </span>
            <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Visual AI</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-8">
        {/* Core Links */}
        <div className="space-y-1">
          <Link href="/" className="sidebar-link-active">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/library" className="sidebar-link">
            <LayoutGrid className="w-5 h-5" />
            <span>Library</span>
          </Link>
        </div>

        {/* AI Tools */}
        <div>
          <h3 className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">
            AI Creation Tools
          </h3>
          <div className="space-y-1">
            <Link href="/relight" className="sidebar-link">
              <SunMedium className="w-5 h-5" />
              <span>Relight</span>
            </Link>
            <Link href="/angles" className="sidebar-link">
              <Box className="w-5 h-5" />
              <span>Angles</span>
            </Link>
            <Link href="/upscaler" className="sidebar-link">
              <Maximize className="w-5 h-5" />
              <span>Upscaler</span>
            </Link>
            <Link href="/generate" className="sidebar-link group relative">
              <Sparkles className="w-5 h-5" />
              <span>Generate</span>
              <span className="absolute right-2 px-1.5 py-0.5 rounded text-[8px] font-black bg-[#D4FF00] text-black uppercase">NEW</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Footer Area: Profile & Settings */}
      <div className="p-4 bg-black/20 border-t border-white/5 space-y-4">
        {/* Premium Profile Section */}
        <button className="w-full group">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#D4FF00]/30 group-hover:border-[#D4FF00] transition-colors">
              <Image
                src="/assets/avatar.png"
                alt="User Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#D4FF00] transition-colors">
                ELITE CREATOR
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shadow-[0_0_4px_#D4FF00]" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Pro Account</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
          </div>
        </button>

        <div className="space-y-1">
          <Link href="/settings" className="sidebar-link">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button className="sidebar-link w-full text-red-500/70 hover:text-red-500 hover:bg-red-500/5">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
