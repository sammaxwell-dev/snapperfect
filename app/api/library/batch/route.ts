import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_BATCH_SIZE = 20;

export async function DELETE(request: NextRequest) {
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

        const body = await request.json();
        const ids: string[] = body.ids || [];

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No IDs provided' },
                { status: 400 }
            );
        }

        if (ids.length > MAX_BATCH_SIZE) {
            return NextResponse.json(
                { success: false, error: `Maximum ${MAX_BATCH_SIZE} items per request` },
                { status: 400 }
            );
        }

        // Get all items to get their storage paths
        const { data: items, error: fetchError } = await supabase
            .from('library_items')
            .select('id, storage_path')
            .in('id', ids)
            .eq('user_id', user.id);

        if (fetchError) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch items' },
                { status: 500 }
            );
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No items found' },
                { status: 404 }
            );
        }

        // Delete files from storage
        const storagePaths = items.map(item => item.storage_path);
        const { error: storageError } = await supabase.storage
            .from('user-media')
            .remove(storagePaths);

        if (storageError) {
            console.error('[library/batch] Storage delete error:', storageError);
            // Continue with DB delete even if some storage deletes fail
        }

        // Delete from database
        const itemIds = items.map(item => item.id);
        const { error: deleteError } = await supabase
            .from('library_items')
            .delete()
            .in('id', itemIds)
            .eq('user_id', user.id);

        if (deleteError) {
            return NextResponse.json(
                { success: false, error: 'Failed to delete items' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            deleted: items.length,
        });

    } catch (error) {
        console.error('[library/batch] Delete error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
