import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LibraryUsageResponse } from '@/lib/library/types';

const TOTAL_STORAGE_BYTES = 1073741824; // 1 GB (Free tier limit)

export async function GET() {
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

        // Get aggregated stats
        const { data: items, error: queryError } = await supabase
            .from('library_items')
            .select('file_size, media_type')
            .eq('user_id', user.id);

        if (queryError) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch usage data' },
                { status: 500 }
            );
        }

        const allItems = items || [];

        const usedBytes = allItems.reduce((sum, item) => sum + (item.file_size || 0), 0);
        const imagesCount = allItems.filter(item => item.media_type === 'image').length;
        const videosCount = allItems.filter(item => item.media_type === 'video').length;

        const response: LibraryUsageResponse = {
            success: true,
            usage: {
                used_bytes: usedBytes,
                total_bytes: TOTAL_STORAGE_BYTES,
                used_percent: Math.round((usedBytes / TOTAL_STORAGE_BYTES) * 1000) / 10, // 1 decimal
                item_count: allItems.length,
                images_count: imagesCount,
                videos_count: videosCount,
            },
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('[library/usage] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
