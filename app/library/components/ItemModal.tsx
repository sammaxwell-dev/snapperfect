'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Download, Trash2, Sparkles, Calendar, HardDrive, Palette, Monitor } from 'lucide-react';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import type { LibraryItem } from '@/lib/library/types';

interface ItemModalProps {
    item: LibraryItem;
    onClose: () => void;
    onDelete?: () => void;
}

export function ItemModal({ item, onClose, onDelete }: ItemModalProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const isVideo = item.media_type === 'video';

    const handleDownload = async () => {
        if (!item.signed_url) return;

        try {
            const response = await fetch(item.signed_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `snapperfect-${item.id}.${isVideo ? 'mp4' : 'png'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed');
        }
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        setShowDeleteConfirm(false);
        try {
            const response = await fetch(`/api/library/${item.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onDelete?.();
                onClose();
                window.location.reload();
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRemix = () => {
        const metadata = item.metadata;
        const source = item.source;

        // Build query params for remix
        const params = new URLSearchParams();
        if (metadata.prompt) params.set('prompt', metadata.prompt);
        if (metadata.style) params.set('style', metadata.style);
        if (metadata.platform) params.set('platform', metadata.platform);

        // Navigate to the appropriate page based on source
        const routes: Record<string, string> = {
            'product-enhance': '/product-enhance',
            'fashion-motion': '/fashion-motion',
            'generate': '/generate',
            'angles': '/angles',
        };

        const route = routes[source] || '/generate';
        router.push(`${route}?${params.toString()}`);
        onClose();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Media preview */}
                <div className="relative w-full md:w-1/2 aspect-square bg-black flex-shrink-0">
                    {item.signed_url ? (
                        isVideo ? (
                            <video
                                src={item.signed_url}
                                controls
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <Image
                                src={item.signed_url}
                                alt="Preview"
                                fill
                                className="object-contain"
                            />
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            Loading...
                        </div>
                    )}
                </div>

                {/* Details panel */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Details</h2>

                    {/* Metadata */}
                    <div className="space-y-4 mb-6">
                        {/* Source */}
                        <div className="flex items-start gap-3">
                            <Monitor className="w-5 h-5 text-zinc-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-zinc-400">Source</p>
                                <p className="text-white capitalize">{item.source.replace('-', ' ')}</p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-zinc-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-zinc-400">Created</p>
                                <p className="text-white">{formatDate(item.created_at)}</p>
                            </div>
                        </div>

                        {/* File size */}
                        <div className="flex items-start gap-3">
                            <HardDrive className="w-5 h-5 text-zinc-500 mt-0.5" />
                            <div>
                                <p className="text-sm text-zinc-400">Size</p>
                                <p className="text-white">{formatFileSize(item.file_size)}</p>
                            </div>
                        </div>

                        {/* Style */}
                        {item.metadata.style && (
                            <div className="flex items-start gap-3">
                                <Palette className="w-5 h-5 text-zinc-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-zinc-400">Style</p>
                                    <p className="text-white capitalize">{item.metadata.style}</p>
                                </div>
                            </div>
                        )}

                        {/* Prompt */}
                        {item.metadata.prompt && (
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-zinc-500 mt-0.5" />
                                <div>
                                    <p className="text-sm text-zinc-400">Prompt</p>
                                    <p className="text-white text-sm leading-relaxed">
                                        {item.metadata.prompt.length > 200
                                            ? `${item.metadata.prompt.substring(0, 200)}...`
                                            : item.metadata.prompt
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleRemix}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                     bg-[#D4FF00] text-black font-bold hover:bg-[#c4ef00] transition-colors"
                        >
                            <Sparkles className="w-5 h-5" />
                            Use Prompt
                        </button>

                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                     bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Download
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                     bg-red-600/20 text-red-400 font-medium hover:bg-red-600/30 transition-colors
                                     disabled:opacity-50"
                        >
                            <Trash2 className="w-5 h-5" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                count={1}
                isDeleting={isDeleting}
            />
        </div>
    );
}
