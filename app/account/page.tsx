import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signout } from '../(auth)/actions'
import { updateProfile, toggleTier } from '@/app/account/actions'
import SubmitButton from '../components/SubmitButton'

export default async function AccountPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                            My <span className="text-[#D4FF00]">Account</span>
                        </h1>
                        <p className="text-zinc-500 font-medium">Manage your profile and subscription</p>
                    </div>
                    <form action={signout}>
                        <button className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-bold uppercase tracking-wider">
                            Sign Out
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
                            <h2 className="text-xl font-bold mb-6">Profile Settings</h2>

                            <form action={updateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Email Address</label>
                                    <input
                                        disabled
                                        value={user.email}
                                        className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-zinc-400 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Full Name</label>
                                    <input
                                        name="fullName"
                                        defaultValue={profile?.full_name || ''}
                                        placeholder="Enter your name"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4FF00] transition-colors"
                                    />
                                </div>

                                <SubmitButton
                                    formAction={updateProfile}
                                    className="bg-[#D4FF00] text-black font-black uppercase tracking-wider px-8 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
                                >
                                    Save Changes
                                </SubmitButton>
                            </form>
                        </div>
                    </div>

                    {/* Subscription / Stats Card */}
                    <div className="space-y-8">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${profile?.tier === 'pro' ? 'bg-[#D4FF00]/20 border-[#D4FF00]/50 text-[#D4FF00]' : 'bg-white/10 border-white/20 text-white'}`}>
                                    {profile?.tier || 'Free'}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-4">Account Status</h3>
                            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                                {profile?.tier === 'pro'
                                    ? 'You have unlimited access to all AI features and high-resolution exports.'
                                    : 'Upgrade to Pro to unlock premium backgrounds and high-quality generation.'}
                            </p>

                            <form action={toggleTier}>
                                <SubmitButton
                                    formAction={toggleTier}
                                    className={`w-full font-black uppercase tracking-wider py-3 rounded-xl transition-colors ${profile?.tier === 'pro'
                                        ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                                        : 'bg-[#D4FF00] text-black hover:bg-[#b8e600]'
                                        }`}
                                >
                                    {profile?.tier === 'pro' ? 'Downgrade to Free' : 'Upgrade to Pro'}
                                </SubmitButton>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
