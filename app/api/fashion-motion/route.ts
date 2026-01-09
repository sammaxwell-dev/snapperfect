import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

        // Maximum wait time: 5 minutes (30 polls * 10 seconds)
        const maxPolls = 30;
        let pollCount = 0;

        // Poll until the video is ready
        while (!operation.done && pollCount < maxPolls) {
            console.log(`[Fashion Motion] Polling video generation status... (${pollCount + 1}/${maxPolls})`);
            await sleep(10000); // Wait 10 seconds between polls

            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
            pollCount++;
        }

        if (!operation.done) {
            return NextResponse.json(
                { success: false, error: 'Video generation timed out. Please try again.' },
                { status: 504 }
            );
        }

        // Check if we have generated videos
        const generatedVideos = operation.response?.generatedVideos;
        if (!generatedVideos || generatedVideos.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No video was generated. Please try a different image.' },
                { status: 500 }
            );
        }

        // Get the first generated video
        const video = generatedVideos[0];

        // Log the video object structure for debugging
        console.log('[Fashion Motion] Video object keys:', video.video ? Object.keys(video.video) : 'no video object');
        console.log('[Fashion Motion] Video mimeType:', video.video?.mimeType);
        console.log('[Fashion Motion] Video uri:', video.video?.uri);
        console.log('[Fashion Motion] Has videoBytes:', !!video.video?.videoBytes);

        // Get video data
        let videoBytes: string | null = null;
        let videoMimeType = video.video?.mimeType || 'video/mp4';

        // Method 1: Try to get video bytes directly
        if (video.video?.videoBytes) {
            const bytes = video.video.videoBytes as unknown;
            console.log('[Fashion Motion] videoBytes type:', typeof bytes);

            if (typeof bytes === 'string') {
                // Check if it's already base64 or needs encoding
                if (bytes.length > 100) {
                    // Likely already base64 encoded
                    videoBytes = bytes;
                }
            } else if (Buffer.isBuffer(bytes)) {
                videoBytes = bytes.toString('base64');
            } else if (bytes && typeof bytes === 'object') {
                // Could be Uint8Array or similar
                try {
                    const buffer = Buffer.from(bytes as ArrayBuffer);
                    videoBytes = buffer.toString('base64');
                } catch (e) {
                    console.error('[Fashion Motion] Failed to convert bytes:', e);
                }
            }
        }

        // Method 2: Try fetching from URI if available
        if (!videoBytes && video.video?.uri) {
            console.log('[Fashion Motion] Fetching video from URI...');
            try {
                const videoResponse = await fetch(video.video.uri);
                if (videoResponse.ok) {
                    const contentType = videoResponse.headers.get('content-type');
                    if (contentType) {
                        videoMimeType = contentType;
                    }
                    const arrayBuffer = await videoResponse.arrayBuffer();
                    videoBytes = Buffer.from(arrayBuffer).toString('base64');
                    console.log('[Fashion Motion] Successfully fetched video from URI, size:', arrayBuffer.byteLength);
                } else {
                    console.error('[Fashion Motion] Failed to fetch video, status:', videoResponse.status);
                }
            } catch (fetchError) {
                console.error('[Fashion Motion] Error fetching video from URI:', fetchError);
            }
        }

        // Method 3: Try using the video name to download
        const videoObj = video.video as any;
        if (!videoBytes && videoObj?.name) {
            console.log('[Fashion Motion] Attempting to download via file name:', videoObj.name);
            try {
                // Construct the download URL
                const downloadUrl = `https://generativelanguage.googleapis.com/v1beta/${videoObj.name}:download?key=${apiKey}`;
                const videoResponse = await fetch(downloadUrl);
                if (videoResponse.ok) {
                    const contentType = videoResponse.headers.get('content-type');
                    if (contentType) {
                        videoMimeType = contentType;
                    }
                    const arrayBuffer = await videoResponse.arrayBuffer();
                    videoBytes = Buffer.from(arrayBuffer).toString('base64');
                    console.log('[Fashion Motion] Successfully downloaded video via name, size:', arrayBuffer.byteLength);
                } else {
                    const errorText = await videoResponse.text();
                    console.error('[Fashion Motion] Download failed:', videoResponse.status, errorText);
                }
            } catch (downloadError) {
                console.error('[Fashion Motion] Error downloading video:', downloadError);
            }
        }

        if (!videoBytes) {
            console.error('[Fashion Motion] All video retrieval methods failed');
            return NextResponse.json(
                { success: false, error: 'Failed to retrieve video data. The video was generated but could not be downloaded.' },
                { status: 500 }
            );
        }

        console.log('[Fashion Motion] Returning video, mimeType:', videoMimeType, 'base64 length:', videoBytes.length);


        return NextResponse.json({
            success: true,
            videoData: videoBytes,
            mimeType: videoMimeType,
            aspectRatio,
            durationSeconds,
        });

    } catch (error) {
        console.error('[Fashion Motion] Generation error:', error);

        // Extract meaningful error message
        let errorMessage = 'Video generation failed. Please try again.';
        if (error instanceof Error) {
            if (error.message.includes('quota')) {
                errorMessage = 'API quota exceeded. Please try again later.';
            } else if (error.message.includes('safety')) {
                errorMessage = 'The image was blocked by safety filters. Please try a different image.';
            } else if (error.message.includes('permission')) {
                errorMessage = 'Veo 3.1 access not enabled. Please check your API permissions.';
            }
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
