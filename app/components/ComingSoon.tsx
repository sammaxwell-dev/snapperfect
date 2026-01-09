'use client';

import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ComingSoonProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white p-8 overflow-hidden relative">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#D4FF00] rounded-full blur-[160px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#FF0099] rounded-full blur-[160px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-2xl w-full text-center">
                {/* Icon/Badge */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-10 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-[#D4FF00]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    {icon || <Sparkles className="w-8 h-8 text-[#D4FF00]" />}
                </div>

                {/* Title */}
                <h1 className="text-6xl font-black uppercase italic tracking-tighter mb-6 leading-tight">
                    <span className="block text-zinc-600">FEATURE</span>
                    <span className="text-white">{title}</span>
                </h1>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/30 mb-8">
                    <div className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse shadow-[0_0_8px_#D4FF00]" />
                    <span className="text-[10px] font-black text-[#D4FF00] uppercase tracking-widest">Under Construction</span>
                </div>

                {/* Description */}
                <p className="text-xl text-zinc-500 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
                    {description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black uppercase tracking-widest text-xs group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <button className="px-8 py-4 rounded-2xl bg-[#D4FF00] text-black hover:scale-105 transition-all font-black uppercase tracking-widest text-xs shadow-[0_0_40px_rgba(212,255,0,0.3)]">
                        Notify Me
                    </button>
                </div>
            </div>

            {/* Bottom HUD Detail */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-20 pointer-events-none">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol</span>
                    <span className="text-xs font-mono">X-001/SNAP</span>
                </div>
                <div className="w-px h-8 bg-zinc-800" />
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Status</span>
                    <span className="text-xs font-mono">ENCRYPTED</span>
                </div>
            </div>
        </div>
    );
}
