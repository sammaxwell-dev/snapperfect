'use client';

import { useState } from 'react';
import { LibraryGrid } from './components/LibraryGrid';
import { ItemModal } from './components/ItemModal';
import { SelectionBar } from './components/SelectionBar';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import type { LibraryItem } from '@/lib/library/types';
import { Image as ImageIcon, Video } from 'lucide-react';

export default function LibraryPage() {
    const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [typeFilter, setTypeFilter] = useState<'image' | 'video' | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleItemClick = (item: LibraryItem) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    const handleBatchDelete = async () => {
        if (selectedIds.size === 0) return;
        setShowDeleteConfirm(true);
    };

    const confirmBatchDelete = async () => {
        setIsDeleting(true);
        setShowDeleteConfirm(false);

        try {
            const response = await fetch('/api/library/batch', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });

            if (response.ok) {
                // Reload page to refresh grid
                window.location.reload();
            } else {
                alert('Failed to delete some items');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#050505]/95 backdrop-blur-sm border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">
                                My Library
                            </h1>
                            <p className="text-sm text-zinc-500">
                                Your generated images and videos
                            </p>
                        </div>

                        {/* Filter buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTypeFilter(null)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                    ${typeFilter === null
                                        ? 'bg-[#D4FF00] text-black'
                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setTypeFilter('image')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                    ${typeFilter === 'image'
                                        ? 'bg-[#D4FF00] text-black'
                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <ImageIcon className="w-4 h-4" />
                                Images
                            </button>
                            <button
                                onClick={() => setTypeFilter('video')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                    ${typeFilter === 'video'
                                        ? 'bg-[#D4FF00] text-black'
                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <Video className="w-4 h-4" />
                                Videos
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Selection Bar */}
            <SelectionBar
                selectedCount={selectedIds.size}
                previewUrl={items.find(item => selectedIds.has(item.id))?.signed_url}
                onDelete={handleBatchDelete}
                isDeleting={isDeleting}
                onDownload={() => alert('Download feature coming soon')}
                onAddToFolder={() => alert('Add to folder feature coming soon')}
            />

            {/* Confirmation Modals */}
            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmBatchDelete}
                count={selectedIds.size}
                isDeleting={isDeleting}
            />

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <LibraryGrid
                    onItemClick={handleItemClick}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    onItemsUpdated={setItems}
                    typeFilter={typeFilter}
                />
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <ItemModal
                    item={selectedItem}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
