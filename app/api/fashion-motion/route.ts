import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/lib/supabase/server';
import { saveToLibrary } from '@/lib/library/save-to-library';

// Fashion motion prompt for e-commerce videos
const FASHION_MOTION_PROMPT = `Generate a video that is going to be featured on a product page of an e-commerce store. This is going to be for a clothing or fashion brand. This video must feature this exact same model that is provided in the reference image and the article of clothing shown.

In this video, the model should strike multiple poses to feature the article of clothing so that a person looking at this product on an ecommerce website has a great idea how this article of clothing will look and feel.

The model should move naturally and gracefully, with soft professional lighting. Keep the focus on the clothing details.

Constraints:
- No music or sound effects.
- The final output video should NOT have any audio.
- Muted audio.
- Muted sound effects.`;

interface FashionMotionRequest {
    imageData: string; // base64 encoded image
    mimeType: string;
    aspectRatio?: '9:16' | '16:9';
    durationSeconds?: 4 | 6 | 8;
}

// Helper function to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Download video using direct REST API
 * Uses the /files/{name}?alt=media endpoint
 * This works in serverless environments (Vercel, etc.)
 */
async function downloadVideoREST(
    apiKey: string,
    fileName: string | undefined
): Promise<{ data: string; mimeType: string } | null> {
    if (!fileName) {
        console.log('[Fashion Motion] No video file name available for download');
        return null;
    }

    try {
        // Extract file name - the name might be in format "files/xxxxx" or just "xxxxx"
        const normalizedFileName = fileName.startsWith('files/')
            ? fileName
            : `files/${fileName}`;

        // Construct the download URL using alt=media for binary content
        const downloadUrl = `https://generativelanguage.googleapis.com/v1beta/${normalizedFileName}?alt=media&key=${apiKey}`;
        console.log('[Fashion Motion] Downloading video from:', normalizedFileName);

        const response = await fetch(downloadUrl, {
            method: 'GET',
            headers: {
                'Accept': 'video/mp4,video/*,*/*',
            },
        });

        if (response.ok) {
            const contentType = response.headers.get('content-type') || 'video/mp4';
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');

            console.log('[Fashion Motion] REST download success! Size:', arrayBuffer.byteLength, 'bytes, MIME:', contentType);
            return { data: base64, mimeType: contentType };
        } else {
            const errorText = await response.text();
            console.error('[Fashion Motion] REST download failed. Status:', response.status, 'Error:', errorText);
        }
    } catch (error) {
        console.error('[Fashion Motion] REST download error:', error);
    }

    return null;
}

export async function POST(request: NextRequest) {
    try {
        const body: FashionMotionRequest = await request.json();
        const {
            imageData,
            mimeType = 'image/jpeg',
            aspectRatio = '9:16',
            durationSeconds = 6
        } = body;

        if (!imageData) {
            return NextResponse.json(
                { success: false, error: 'No image provided' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_api_key_here') {
            // Demo mode - return placeholder
            return NextResponse.json({
                success: true,
                demo: true,
                message: 'Demo mode: Add GEMINI_API_KEY to .env to generate real videos',
                videoData: null,
            });
        }

        // Initialize the Google GenAI client
        const ai = new GoogleGenAI({ apiKey });

        console.log('[Fashion Motion] Starting video generation with Veo 3.1...');
        console.log('[Fashion Motion] Config: aspectRatio:', aspectRatio, 'duration:', durationSeconds, 'seconds');

        // Start video generation with the uploaded image as reference
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-generate-preview',
            prompt: FASHION_MOTION_PROMPT,
            image: {
                imageBytes: imageData,
                mimeType: mimeType,
            },
            config: {
                aspectRatio: aspectRatio,
                durationSeconds: durationSeconds,
                personGeneration: 'allow_adult',
            },
        });

        console.log('[Fashion Motion] Operation started! Name:', operation.name);

        // Maximum wait time: 10 minutes (60 polls * 10 seconds)
        // Video generation typically takes 30-120 seconds
        const maxPolls = 60;
        let pollCount = 0;

        // Poll until the video is ready
        while (!operation.done && pollCount < maxPolls) {
            console.log(`[Fashion Motion] Polling status... (${pollCount + 1}/${maxPolls})`);
            await sleep(10000); // Wait 10 seconds between polls

            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
            pollCount++;
        }

        if (!operation.done) {
            console.error('[Fashion Motion] Generation timed out after', pollCount * 10, 'seconds');
            return NextResponse.json(
                { success: false, error: 'Video generation timed out. Please try again.' },
                { status: 504 }
            );
        }

        console.log('[Fashion Motion] Video generation completed!');

        // Check if we have generated videos
        const generatedVideos = operation.response?.generatedVideos;
        if (!generatedVideos || generatedVideos.length === 0) {
            console.error('[Fashion Motion] No videos in response:', JSON.stringify(operation.response));

            // Check for safety filter reasons
            const response = operation.response as {
                raiMediaFilteredCount?: number;
                raiMediaFilteredReasons?: string[]
            };

            if (response?.raiMediaFilteredReasons && response.raiMediaFilteredReasons.length > 0) {
                const reason = response.raiMediaFilteredReasons[0];

                // Check for celebrity detection (often false positive)
                if (reason.includes('celebrity')) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'The AI incorrectly detected a celebrity in your image. This is a false positive. Try using a different photo where the face is less visible, or generate a new model image.'
                        },
                        { status: 422 }
                    );
                }

                // Return the actual reason from the API
                return NextResponse.json(
                    { success: false, error: reason },
                    { status: 422 }
                );
            }

            return NextResponse.json(
                { success: false, error: 'No video was generated. Please try a different image.' },
                { status: 500 }
            );
        }

        // Get the first generated video
        const video = generatedVideos[0];
        const videoFile = video.video as { name?: string; mimeType?: string; uri?: string };

        // Log the video object structure for debugging
        console.log('[Fashion Motion] Video object:', JSON.stringify({
            name: videoFile?.name,
            mimeType: videoFile?.mimeType,
            uri: videoFile?.uri,
        }, null, 2));

        // Download video using REST API (works in serverless environments)
        let downloadResult: { data: string; mimeType: string } | null = null;

        // Method 1: REST API with file name (if available)
        if (videoFile?.name) {
            downloadResult = await downloadVideoREST(apiKey, videoFile.name);
        }

        // Method 2: Extract file name from URI and use REST API
        // URI format: https://generativelanguage.googleapis.com/v1beta/files/XXXX:download?alt=media
        if (!downloadResult && videoFile?.uri) {
            console.log('[Fashion Motion] Trying to extract file name from URI...');

            // Extract file ID from URI like "files/duw9njm4snsx:download" or similar
            const uriMatch = videoFile.uri.match(/files\/([^:/?]+)/);
            if (uriMatch && uriMatch[1]) {
                const extractedFileName = `files/${uriMatch[1]}`;
                console.log('[Fashion Motion] Extracted file name:', extractedFileName);
                downloadResult = await downloadVideoREST(apiKey, extractedFileName);
            }
        }

        // Method 3: Try URI with API key appended (last resort fallback)
        if (!downloadResult && videoFile?.uri) {
            console.log('[Fashion Motion] Last resort: URI fetch with API key...');
            try {
                // Add API key to the URI for authentication
                const uriWithKey = videoFile.uri.includes('?')
                    ? `${videoFile.uri}&key=${apiKey}`
                    : `${videoFile.uri}?key=${apiKey}`;

                const response = await fetch(uriWithKey);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    const contentType = response.headers.get('content-type') || 'video/mp4';
                    downloadResult = { data: base64, mimeType: contentType };
                    console.log('[Fashion Motion] URI+key fetch success! Size:', arrayBuffer.byteLength, 'bytes');
                } else {
                    const errorText = await response.text();
                    console.error('[Fashion Motion] URI+key fetch failed, status:', response.status, errorText);
                }
            } catch (uriError) {
                console.error('[Fashion Motion] URI+key fetch error:', uriError);
            }
        }

        if (!downloadResult) {
            console.error('[Fashion Motion] All video download methods failed');
            return NextResponse.json(
                { success: false, error: 'Failed to retrieve video data. The video was generated but could not be downloaded.' },
                { status: 500 }
            );
        }

        console.log('[Fashion Motion] SUCCESS! Returning video. MIME:', downloadResult.mimeType, 'Base64 length:', downloadResult.data.length);

        // Save to library for authenticated users
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            saveToLibrary({
                userId: user.id,
                mediaType: 'video',
                source: 'fashion-motion',
                fileData: downloadResult.data,
                mimeType: downloadResult.mimeType,
                metadata: {
                    prompt: FASHION_MOTION_PROMPT,
                    aspect_ratio: aspectRatio,
                    duration_seconds: durationSeconds,
                },
            }).catch(err => console.error('[fashion-motion] Failed to save to library:', err));
        }

        return NextResponse.json({
            success: true,
            videoData: downloadResult.data,
            mimeType: downloadResult.mimeType,
            aspectRatio,
            durationSeconds,
        });

    } catch (error) {
        console.error('[Fashion Motion] Generation error:', error);

        // Extract meaningful error message
        let errorMessage = 'Video generation failed. Please try again.';
        if (error instanceof Error) {
            console.error('[Fashion Motion] Error stack:', error.stack);

            if (error.message.includes('quota')) {
                errorMessage = 'API quota exceeded. Please try again later.';
            } else if (error.message.includes('safety') || error.message.includes('SAFETY')) {
                errorMessage = 'The image was blocked by safety filters. Please try a different image.';
            } else if (error.message.includes('permission') || error.message.includes('403')) {
                errorMessage = 'Veo 3.1 access not enabled. Please check your API permissions.';
            } else if (error.message.includes('not found') || error.message.includes('404')) {
                errorMessage = 'Video model not available. Please check API access.';
            } else {
                // Include part of the error for debugging
                errorMessage = `Generation failed: ${error.message.substring(0, 100)}`;
            }
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
