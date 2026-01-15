'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LibraryItem } from './LibraryItem';
import type { LibraryItem as LibraryItemType, LibraryListResponse } from '@/lib/library/types';
import { Loader2, Lock } from 'lucide-react';
import Link from 'next/link';

interface LibraryGridProps {
    initialItems?: LibraryItemType[];
    onItemClick?: (item: LibraryItemType) => void;
    selectedIds?: Set<string>;
    onSelectionChange?: (ids: Set<string>) => void;
    onItemsUpdated?: (items: LibraryItemType[]) => void;
    typeFilter?: 'image' | 'video' | null;
}

const ITEMS_PER_PAGE = 20;

export function LibraryGrid({
    initialItems = [],
    onItemClick,
    selectedIds = new Set(),
    onSelectionChange,
    onItemsUpdated,
    typeFilter
}: LibraryGridProps) {
    const [items, setItems] = useState<LibraryItemType[]>(initialItems);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(initialItems.length);
    const [error, setError] = useState<string | null>(null);
    const [unauthorized, setUnauthorized] = useState(false);

    // Notify parent of items update
    useEffect(() => {
        onItemsUpdated?.(items);
    }, [items, onItemsUpdated]);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Fetch items from API
    const fetchItems = useCallback(async (currentOffset: number, reset = false) => {
        if (loading || unauthorized) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                limit: ITEMS_PER_PAGE.toString(),
                offset: currentOffset.toString(),
            });

            if (typeFilter) {
                params.set('type', typeFilter);
            }

            const response = await fetch(`/api/library?${params}`);

            // Handle unauthorized - stop all future requests
            if (response.status === 401) {
                setUnauthorized(true);
                setHasMore(false);
                return;
            }

            const data: LibraryListResponse = await response.json();

            if (!data.success) {
                throw new Error(data.items ? 'Failed to fetch' : 'Unknown error');
            }

            if (reset) {
                setItems(data.items);
            } else {
                setItems(prev => [...prev, ...data.items]);
            }

            setHasMore(data.has_more);
            setOffset(currentOffset + data.items.length);

        } catch (err) {
            console.error('[LibraryGrid] Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [loading, typeFilter, unauthorized]);

    // Initial load
    useEffect(() => {
        if (initialItems.length === 0) {
            fetchItems(0, true);
        }
    }, []);

    // Reset when filter changes
    useEffect(() => {
        setItems([]);
        setOffset(0);
        setHasMore(true);
        fetchItems(0, true);
    }, [typeFilter]);

    // Setup Intersection Observer for infinite scroll
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchItems(offset);
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => observerRef.current?.disconnect();
    }, [hasMore, loading, offset, fetchItems]);

    // Handle selection
    const handleSelect = (id: string, selected: boolean) => {
        const newSelection = new Set(selectedIds);
        if (selected) {
            newSelection.add(id);
        } else {
            newSelection.delete(id);
        }
        onSelectionChange?.(newSelection);
    };



    // Show login prompt for unauthorized users
    if (unauthorized) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    Sign in required
                </h3>
                <p className="text-zinc-400 mb-6 max-w-md">
                    Please sign in to access your personal library of generated images and videos.
                </p>
                <Link
                    href="/login"
                    className="px-6 py-2.5 bg-[#D4FF00] text-black font-semibold rounded-lg hover:bg-[#c5ef00] transition-colors"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {items.map((item) => (
                    <LibraryItem
                        key={item.id}
                        item={item}
                        onClick={() => onItemClick?.(item)}
                        selected={selectedIds.has(item.id)}
                        onSelect={onSelectionChange ? (selected) => handleSelect(item.id, selected) : undefined}
                    />
                ))}
            </div>

            {/* Loading indicator / Load more trigger */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
                {loading && (
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                    </div>
                )}
                {error && (
                    <div className="text-red-400 text-sm">
                        {error}
                        <button
                            onClick={() => fetchItems(offset)}
                            className="ml-2 underline hover:no-underline"
                        >
                            Retry
                        </button>
                    </div>
                )}
                {!hasMore && items.length > 0 && (
                    <div className="h-4" />
                )}
            </div>
        </div>
    );
}
