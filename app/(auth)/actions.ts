'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithGoogle(formData: FormData) {
    const supabase = await createClient()
    const origin = formData.get('origin') as string

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/callback`,
        },
    })

    if (error) {
        return redirect('/login?error=' + error.message)
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect('/login?error=Invalid login credentials')
    }

    revalidatePath('/', 'layout')
    redirect('/account')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/callback`, // Ensure NEXT_PUBLIC_BASE_URL is set or use relative URL logic if possible but Supabase needs full URL usually? No, request.origin in callback
        },
    })

    if (error) {
        return redirect('/register?error=' + error.message)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
