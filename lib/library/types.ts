// Library item types for User Media Library feature

export type MediaType = 'image' | 'video';

export type GenerationSource = 'product-enhance' | 'fashion-motion' | 'generate' | 'angles';

export interface LibraryItemMetadata {
    prompt?: string;
    model?: string;
    seed?: number;
    aspect_ratio?: string;
    style?: string;
    platform?: string;
    duration_seconds?: number;
}

export interface LibraryItem {
    id: string;
    user_id: string;
    storage_path: string;
    media_type: MediaType;
    metadata: LibraryItemMetadata;
    file_size: number;
    source: GenerationSource;
    created_at: string;
    signed_url?: string;
}

export interface LibraryListResponse {
    success: boolean;
    items: LibraryItem[];
    total: number;
    has_more: boolean;
}

export interface LibraryItemResponse {
    success: boolean;
    item: LibraryItem;
}

export interface LibraryUsage {
    used_bytes: number;
    total_bytes: number;
    used_percent: number;
    item_count: number;
    images_count: number;
    videos_count: number;
}

export interface LibraryUsageResponse {
    success: boolean;
    usage: LibraryUsage;
}

export interface SaveToLibraryParams {
    userId: string;
    mediaType: MediaType;
    source: GenerationSource;
    fileData: string; // base64
    mimeType: string;
    metadata: LibraryItemMetadata;
}

export interface SaveToLibraryResult {
    id: string;
    storage_path: string;
}
