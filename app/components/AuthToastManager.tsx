'use client'

import { useSearchParams } from 'next/navigation'
import AuthToast from './AuthToast'
import { Suspense } from 'react'

function ToastContent() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const error = searchParams.get('error')

    return (
        <>
            {message && <AuthToast message={message} type="success" />}
            {error && <AuthToast message={error} type="error" />}
        </>
    )
}

export default function AuthToastManager() {
    return (
        <Suspense fallback={null}>
            <ToastContent />
        </Suspense>
    )
}
