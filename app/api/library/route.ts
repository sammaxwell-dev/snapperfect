import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LibraryListResponse, LibraryItem } from '@/lib/library/types';

const SIGNED_URL_TTL = 3600; // 1 hour

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const offset = parseInt(searchParams.get('offset') || '0');
        const typeFilter = searchParams.get('type'); // 'image' | 'video' | null

        // Build query
        let query = supabase
            .from('library_items')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply type filter if specified
        if (typeFilter && (typeFilter === 'image' || typeFilter === 'video')) {
            query = query.eq('media_type', typeFilter);
        }

        const { data: items, error: queryError, count } = await query;

        if (queryError) {
            console.error('[library] Query error:', queryError);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch library items' },
                { status: 500 }
            );
        }

        // Generate signed URLs for all items
        const itemsWithUrls: LibraryItem[] = await Promise.all(
            (items || []).map(async (item) => {
                const { data: signedUrlData } = await supabase.storage
                    .from('user-media')
                    .createSignedUrl(item.storage_path, SIGNED_URL_TTL);

                return {
                    ...item,
                    signed_url: signedUrlData?.signedUrl || undefined,
                };
            })
        );

        const total = count || 0;
        const hasMore = offset + limit < total;

        const response: LibraryListResponse = {
            success: true,
            items: itemsWithUrls,
            total,
            has_more: hasMore,
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('[library] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
