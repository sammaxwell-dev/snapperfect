'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import type { LibraryItem as LibraryItemType } from '@/lib/library/types';

interface LibraryItemProps {
    item: LibraryItemType;
    onClick?: () => void;
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
}

export function LibraryItem({ item, onClick, selected, onSelect }: LibraryItemProps) {
    const isVideo = item.media_type === 'video';

    const handleClick = () => {
        onClick?.();
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelect?.(e.target.checked);
    };

    return (
        <div
            className={`
                group relative aspect-square rounded-xl overflow-hidden cursor-pointer
                bg-zinc-900 border transition-all duration-200
                ${selected
                    ? 'border-[#D4FF00] ring-2 ring-[#D4FF00]/30'
                    : 'border-zinc-800 hover:border-zinc-600'
                }
            `}
            onClick={handleClick}
        >
            {/* Selection checkbox */}
            {onSelect && (
                <div
                    className="absolute top-2 left-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-800/80 
                                   text-[#D4FF00] focus:ring-[#D4FF00] focus:ring-offset-0
                                   cursor-pointer"
                    />
                </div>
            )}

            {/* Media preview */}
            {item.signed_url ? (
                <Image
                    src={item.signed_url}
                    alt={item.metadata?.prompt?.substring(0, 50) || 'Generated media'}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <span className="text-zinc-500 text-sm">Loading...</span>
                </div>
            )}

            {/* Video indicator */}
            {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center
                                    group-hover:bg-[#D4FF00]/90 transition-colors duration-200">
                        <Play className="w-5 h-5 text-white group-hover:text-black ml-0.5" fill="currentColor" />
                    </div>
                </div>
            )}

            {/* Hover overlay with info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs text-zinc-300 truncate">
                        {item.source.replace('-', ' ')}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                        {new Date(item.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
