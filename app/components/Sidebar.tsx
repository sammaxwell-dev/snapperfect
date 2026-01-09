"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  SunMedium,
  Box,
  Maximize,
  Sparkles,
  Package,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getLinkClass = (path: string) => {
    const baseClass = isCollapsed 
      ? "flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 cursor-pointer group relative"
      : "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer";
    
    if (pathname === path) {
      return `${baseClass} text-[#D4FF00] bg-[#D4FF00]/5 font-bold ${!isCollapsed ? 'border-l-2 border-[#D4FF00]' : ''}`;
    }
    return `${baseClass} text-zinc-400 hover:text-white hover:bg-white/5`;
  };

  const Tooltip = ({ children }: { children: string }) => (
    <span className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-zinc-800">
      {children}
    </span>
  );

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className={`${isCollapsed ? 'p-4' : 'p-8'} transition-all duration-300`}>
        <Link href="/" className="flex items-center gap-4 group" onClick={() => setIsMobileOpen(false)}>
          <div className={`relative ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'} shrink-0 transition-all duration-300`}>
            <Image
              src="/assets/logo_s.png"
              alt="SnapPerfect Logo"
              fill
              className="object-contain filter drop-shadow-[0_0_12px_rgba(212,255,0,0.4)] group-hover:scale-110 transition-transform"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-black text-white leading-none tracking-tighter uppercase italic group-hover:text-[#D4FF00] transition-colors">
                SNAP<span className="text-white group-hover:text-[#D4FF00]">PERFECT</span>
              </span>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-[#D4FF00] tracking-[0.15em] uppercase leading-none">AI Studio</span>
                <span className="text-[8px] font-bold text-zinc-500 tracking-[0.1em] uppercase leading-tight mt-0.5">for Ecommerce</span>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-8">
        {/* Core Links */}
        <div className="space-y-1">
          <Link href="/" className={getLinkClass("/")} onClick={() => setIsMobileOpen(false)}>
            <Home className="w-5 h-5 shrink-0" />
            {isCollapsed ? <Tooltip>Home</Tooltip> : <span>Home</span>}
          </Link>
          <Link href="/library" className={getLinkClass("/library")} onClick={() => setIsMobileOpen(false)}>
            <LayoutGrid className="w-5 h-5 shrink-0" />
            {isCollapsed ? <Tooltip>Library</Tooltip> : <span>Library</span>}
          </Link>
        </div>

        {/* AI Tools */}
        <div>
          {!isCollapsed && (
            <h3 className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">
              AI Creation Tools
            </h3>
          )}
          <div className="space-y-1">
            <Link href="/relight" className={getLinkClass("/relight")} onClick={() => setIsMobileOpen(false)}>
              <SunMedium className="w-5 h-5 shrink-0" />
              {isCollapsed ? <Tooltip>Relight</Tooltip> : <span>Relight</span>}
            </Link>
            <Link href="/angles" className={getLinkClass("/angles")} onClick={() => setIsMobileOpen(false)}>
              <Box className="w-5 h-5 shrink-0" />
              {isCollapsed ? <Tooltip>Angles</Tooltip> : <span>Angles</span>}
            </Link>
            <Link href="/upscaler" className={getLinkClass("/upscaler")} onClick={() => setIsMobileOpen(false)}>
              <Maximize className="w-5 h-5 shrink-0" />
              {isCollapsed ? <Tooltip>Upscaler</Tooltip> : <span>Upscaler</span>}
            </Link>
            <Link href="/generate" className={`${getLinkClass("/generate")} ${!isCollapsed ? 'group relative' : ''}`} onClick={() => setIsMobileOpen(false)}>
              <Sparkles className="w-5 h-5 shrink-0" />
              {isCollapsed ? (
                <Tooltip>Generate (NEW)</Tooltip>
              ) : (
                <>
                  <span>Generate</span>
                  <span className="absolute right-2 px-1.5 py-0.5 rounded text-[8px] font-black bg-[#D4FF00] text-black uppercase">NEW</span>
                </>
              )}
            </Link>
            <Link href="/product-enhance" className={`${getLinkClass("/product-enhance")} ${!isCollapsed ? 'group relative' : ''}`} onClick={() => setIsMobileOpen(false)}>
              <Package className="w-5 h-5 shrink-0" />
              {isCollapsed ? (
                <Tooltip>Product Enhance (HOT)</Tooltip>
              ) : (
                <>
                  <span>Product Enhance</span>
                  <span className="absolute right-2 px-1.5 py-0.5 rounded text-[8px] font-black bg-[#FF0099] text-white uppercase">HOT</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Footer Area: Profile & Settings */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} bg-black/20 border-t border-white/5 space-y-4 transition-all duration-300`}>
        {/* Premium Profile Section */}
        {!isCollapsed && (
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
        )}

        <div className="space-y-1">
          <Link href="/settings" className={getLinkClass("/settings")} onClick={() => setIsMobileOpen(false)}>
            <Settings className="w-5 h-5 shrink-0" />
            {isCollapsed ? <Tooltip>Settings</Tooltip> : <span>Settings</span>}
          </Link>
          <button className={`${getLinkClass("")} w-full text-red-500/70 hover:text-red-500 hover:bg-red-500/5`}>
            <LogOut className="w-5 h-5 shrink-0" />
            {isCollapsed ? <Tooltip>Logout</Tooltip> : <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        lg:hidden fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-white/5 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex fixed left-0 top-0 h-screen bg-sidebar border-r border-white/5 flex-col z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <SidebarContent />
        
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#D4FF00] flex items-center justify-center transition-colors group"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#D4FF00] transition-colors" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#D4FF00] transition-colors" />
          )}
        </button>
      </aside>
    </>
  );
}
