import { createClient } from '@/lib/supabase/server';
import type {
    SaveToLibraryParams,
    SaveToLibraryResult,
    MediaType
} from './types';

/**
 * Generate a unique filename for storage
 */
function generateFilename(mimeType: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'bin';
    return `${timestamp}-${random}.${ext}`;
}

/**
 * Get file size from base64 string
 */
function getBase64FileSize(base64: string): number {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    // Calculate size: base64 adds ~33% overhead
    return Math.ceil((base64Data.length * 3) / 4);
}

/**
 * Determine media type from MIME type
 */
function getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('video/')) {
        return 'video';
    }
    return 'image';
}

/**
 * Save generated content to user's media library
 * 
 * This function performs atomic upload to Storage + insert to DB.
 * If either fails, no orphan data is left behind.
 * 
 * @param params - Save parameters including userId, file data, and metadata
 * @returns Result with id and storage_path, or null on failure
 */
export async function saveToLibrary(
    params: SaveToLibraryParams
): Promise<SaveToLibraryResult | null> {
    const { userId, source, fileData, mimeType, metadata } = params;

    try {
        const supabase = await createClient();

        // Generate unique filename and path
        const filename = generateFilename(mimeType);
        const storagePath = `${userId}/${filename}`;

        // Decode base64 to buffer
        const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        const buffer = Buffer.from(base64Data, 'base64');
        const fileSize = buffer.length;

        // Determine media type
        const mediaType = getMediaType(mimeType);

        // Step 1: Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('user-media')
            .upload(storagePath, buffer, {
                contentType: mimeType,
                upsert: false,
            });

        if (uploadError) {
            console.error('[saveToLibrary] Storage upload failed:', uploadError);
            return null;
        }

        // Step 2: Insert record to database
        const { data: record, error: dbError } = await supabase
            .from('library_items')
            .insert({
                user_id: userId,
                storage_path: storagePath,
                media_type: mediaType,
                metadata: metadata,
                file_size: fileSize,
                source: source,
            })
            .select('id, storage_path')
            .single();

        if (dbError) {
            console.error('[saveToLibrary] DB insert failed:', dbError);
            // Rollback: delete uploaded file
            await supabase.storage.from('user-media').remove([storagePath]);
            return null;
        }

        console.log(`[saveToLibrary] Saved ${mediaType} to library: ${storagePath}`);

        return {
            id: record.id,
            storage_path: record.storage_path,
        };

    } catch (error) {
        console.error('[saveToLibrary] Unexpected error:', error);
        return null;
    }
}
