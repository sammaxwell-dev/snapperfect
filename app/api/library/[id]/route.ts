import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LibraryItemResponse } from '@/lib/library/types';

const SIGNED_URL_TTL = 3600; // 1 hour

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch item (RLS will ensure user owns it)
        const { data: item, error: queryError } = await supabase
            .from('library_items')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (queryError || !item) {
            return NextResponse.json(
                { success: false, error: 'Item not found' },
                { status: 404 }
            );
        }

        // Generate signed URL
        const { data: signedUrlData } = await supabase.storage
            .from('user-media')
            .createSignedUrl(item.storage_path, SIGNED_URL_TTL);

        const response: LibraryItemResponse = {
            success: true,
            item: {
                ...item,
                signed_url: signedUrlData?.signedUrl || undefined,
            },
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('[library/[id]] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // First get the item to get storage_path
        const { data: item, error: fetchError } = await supabase
            .from('library_items')
            .select('storage_path')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !item) {
            return NextResponse.json(
                { success: false, error: 'Item not found' },
                { status: 404 }
            );
        }

        // Delete from storage first
        const { error: storageError } = await supabase.storage
            .from('user-media')
            .remove([item.storage_path]);

        if (storageError) {
            console.error('[library/[id]] Storage delete error:', storageError);
            // Continue with DB delete even if storage fails
        }

        // Delete from database
        const { error: deleteError } = await supabase
            .from('library_items')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (deleteError) {
            return NextResponse.json(
                { success: false, error: 'Failed to delete item' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[library/[id]] Delete error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
