'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const fullName = formData.get('fullName') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        throw new Error('Failed to update profile')
    }

    revalidatePath('/account')
}

// Placeholder for Pro toggle (Task T017)
export async function toggleTier() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .single()

    const newTier = profile?.tier === 'pro' ? 'free' : 'pro'

    await supabase.from('profiles').update({ tier: newTier }).eq('id', user.id)

    revalidatePath('/account')
    revalidatePath('/', 'layout') // Refresh sidebar
}
