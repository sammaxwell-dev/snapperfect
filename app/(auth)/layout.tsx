import React from 'react'
import AuthToastManager from '../components/AuthToastManager'
import FloatingBlobs from '../components/FloatingBlobs'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
            <AuthToastManager />
            <FloatingBlobs />

            {/* Glassmorphism Card */}
            <div className="relative z-10 w-full max-w-md p-8 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black uppercase italic tracking-tight text-white mb-2">
                        Snap<span className="text-[#D4FF00]">perfect</span>
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium">AI-Powered Marketplace Optimization</p>
                </div>
                {children}
            </div>
        </div>
    )
}
