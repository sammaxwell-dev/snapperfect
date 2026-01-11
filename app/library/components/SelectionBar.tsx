'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    Upload,
    FolderPlus,
    ArrowLeftRight,
    Trash2
} from 'lucide-react';
import Image from 'next/image';

interface SelectionBarProps {
    selectedCount: number;
    previewUrl?: string;
    onDelete: () => void;
    onDownload?: () => void;
    onAddToFolder?: () => void;
    isDeleting?: boolean;
}

export function SelectionBar({
    selectedCount,
    previewUrl,
    onDelete,
    onDownload,
    onAddToFolder,
    isDeleting
}: SelectionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-8 inset-x-0 mx-auto z-50 
                   bg-[#121212]/90 backdrop-blur-xl border border-zinc-800/50 
                   rounded-[24px] px-1.5 py-1.5 flex items-center gap-1
                   shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-max max-w-[95vw]"
            >
                {/* Count and Preview */}
                <div className="flex items-center gap-3 pl-3 pr-4 py-1.5">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50">
                        {previewUrl ? (
                            <Image
                                src={previewUrl}
                                alt="Selected preview"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-zinc-700 rounded-full animate-pulse" />
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-bold text-white whitespace-nowrap tracking-tight">
                        {selectedCount} selected
                    </span>
                </div>

                {/* Main Actions */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={onDownload}
                        className="flex items-center gap-2 bg-[#D4FF00] text-black h-11 px-5 rounded-[18px]
                       text-sm font-black uppercase tracking-tight hover:scale-[1.02] 
                       active:scale-[0.98] transition-all hover:bg-[#e1ff33]"
                    >
                        <Download className="w-4 h-4" strokeWidth={3} />
                        Download
                    </button>

                    <button
                        onClick={onAddToFolder}
                        className="flex items-center gap-2 bg-zinc-800/50 text-zinc-300 border border-zinc-700/50
                       h-11 px-5 rounded-[18px] text-sm font-bold hover:bg-zinc-800 
                       hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <FolderPlus className="w-4 h-4" />
                        Add to folder
                    </button>
                </div>

                {/* Icon only actions */}
                <div className="flex items-center gap-1.5 ml-1 mr-1.5">
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="w-11 h-11 flex items-center justify-center rounded-[18px]
                        bg-zinc-800/50 text-zinc-300 border border-zinc-700/50
                        hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50
                        transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Trash2 className="w-4.5 h-4.5" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
