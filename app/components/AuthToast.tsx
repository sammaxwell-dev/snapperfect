'use client'

import { useEffect, useState } from 'react'
import { X, AlertCircle, CheckCircle2 } from 'lucide-react'

interface AuthToastProps {
    message: string | null
    type?: 'error' | 'success'
}

export default function AuthToast({ message, type = 'error' }: AuthToastProps) {
    const [internalMessage, setInternalMessage] = useState<string | null>(message)

    useEffect(() => {
        setInternalMessage(message)
    }, [message])

    useEffect(() => {
        if (internalMessage) {
            const timer = setTimeout(() => setInternalMessage(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [internalMessage])

    if (!internalMessage) return null

    return (
        <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-right-8 fade-in duration-300">
            <div className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[300px] ${type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-[#D4FF00]/10 border-[#D4FF00]/20 text-[#D4FF00]'
                }`}>
                {type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                <p className="text-sm font-medium flex-1">{message}</p>
                <button onClick={() => setInternalMessage(null)} className="hover:opacity-70 transition-opacity">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
