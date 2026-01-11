'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface Profile {
    full_name: string | null
    avatar_url: string | null
    tier: 'free' | 'pro'
}

export default function SidebarUser() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
            }
            setLoading(false)
        }
        getProfile()
    }, [])

    if (loading) return <div className="h-14 animate-pulse bg-white/5 rounded-xl" />
    if (!profile) return (
        <Link href="/login" className="block w-full text-center py-2 text-xs font-bold text-[#D4FF00] border border-[#D4FF00]/20 rounded-xl hover:bg-[#D4FF00]/5 transition-colors">
            Sign In
        </Link>
    )

    return (
        <Link href="/account" className="w-full group">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#D4FF00]/30 group-hover:border-[#D4FF00] transition-colors">
                    <Image
                        src={profile.avatar_url || '/avatar/avatar.jpeg'}
                        alt="User Avatar"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                    <div className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#D4FF00] transition-colors truncate">
                        {profile.full_name || 'User'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${profile.tier === 'pro' ? 'bg-[#D4FF00] shadow-[0_0_4px_#D4FF00]' : 'bg-zinc-600'}`} />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">
                            {profile.tier === 'pro' ? 'Pro' : 'Free'} Tier
                        </span>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </div>
        </Link>
    )
}
