'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    count: number;
    isDeleting?: boolean;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    count,
    isDeleting
}: DeleteConfirmationModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm bg-[#121212]/90 backdrop-blur-xl 
                       border border-zinc-800/50 rounded-[28px] p-6 
                       shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex flex-col items-center text-center mb-8 mt-2">
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                Delete {count > 1 ? `${count} items` : 'item'}?
                            </h3>
                            <p className="text-[15px] text-zinc-400 font-medium">
                                This action cannot be undone.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-bold rounded-[20px]
                           transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50
                           shadow-[0_8px_20px_rgba(220,38,38,0.2)]"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="w-full h-12 bg-zinc-800/50 hover:bg-zinc-800 text-white font-bold rounded-[20px]
                           transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
