'use client';

import { Settings as SettingsIcon, Shield, Bell, CreditCard, HardDrive } from 'lucide-react';
import { UsageIndicator } from '../components/UsageIndicator';

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#050505]/95 backdrop-blur-sm border-b border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6 text-[#D4FF00]" />
                        Settings
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Manage your account, preferences, and storage
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Storage Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-xs tracking-widest">
                        <HardDrive className="w-4 h-4" />
                        Storage & Usage
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <p className="text-sm text-zinc-400 mb-6">
                            You are currently on the <span className="text-[#D4FF00] font-bold">Free Tier</span>.
                            Your library has a limit of 1GB for images and videos.
                        </p>
                        <UsageIndicator />
                    </div>
                </section>

                {/* Account Sections (Placeholders) */}
                <section className="space-y-4 opacity-50">
                    <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-xs tracking-widest">
                        <Shield className="w-4 h-4" />
                        Security & Privacy
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">Password & Auth</h3>
                                <p className="text-sm text-zinc-500">Manage your login methods and security settings</p>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-zinc-800 text-sm font-medium">Manage</button>
                        </div>
                    </div>
                </section>

                <section className="space-y-4 opacity-50">
                    <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-xs tracking-widest">
                        <Bell className="w-4 h-4" />
                        Notifications
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">Email Notifications</h3>
                                <p className="text-sm text-zinc-500">Choose what updates you want to receive</p>
                            </div>
                            <div className="w-11 h-6 bg-zinc-700 rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-zinc-400 rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4 opacity-50">
                    <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-xs tracking-widest">
                        <CreditCard className="w-4 h-4" />
                        Billing & Subscription
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">Current Plan</h3>
                                <p className="text-sm text-zinc-500 text-[#D4FF00]">Free Tier (1GB Storage)</p>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-[#D4FF00] text-black font-bold text-sm">Upgrade</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
