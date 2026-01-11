'use client';

import { useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';
import type { LibraryUsage } from '@/lib/library/types';

interface UsageIndicatorProps {
    className?: string;
}

export function UsageIndicator({ className = '' }: UsageIndicatorProps) {
    const [usage, setUsage] = useState<LibraryUsage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const response = await fetch('/api/library/usage');
                const data = await response.json();
                if (data.success) {
                    setUsage(data.usage);
                }
            } catch (error) {
                console.error('Failed to fetch usage:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsage();
    }, []);

    const formatBytes = (bytes: number) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    if (loading) {
        return (
            <div className={`animate-pulse bg-zinc-800 rounded-lg h-16 ${className}`} />
        );
    }

    if (!usage) {
        return null;
    }

    // Determine color based on usage percentage
    let progressColor = 'bg-[#D4FF00]';
    if (usage.used_percent > 80) {
        progressColor = 'bg-red-500';
    } else if (usage.used_percent > 60) {
        progressColor = 'bg-yellow-500';
    }

    return (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-300">Storage</span>
                </div>
                <span className="text-xs text-zinc-500">
                    {usage.item_count} items
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full ${progressColor} transition-all duration-500`}
                    style={{ width: `${Math.min(usage.used_percent, 100)}%` }}
                />
            </div>

            {/* Usage text */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                    {formatBytes(usage.used_bytes)} used
                </span>
                <span className="text-zinc-500">
                    {formatBytes(usage.total_bytes)} total
                </span>
            </div>

            {/* Breakdown */}
            <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                <span>📷 {usage.images_count} images</span>
                <span>🎬 {usage.videos_count} videos</span>
            </div>
        </div>
    );
}
