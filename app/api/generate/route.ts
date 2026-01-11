import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google, isDemoMode, handleAIError, GEMINI_IMAGE_MODELS } from '@/lib/ai-provider';
import { createClient } from '@/lib/supabase/server';
import { saveToLibrary } from '@/lib/library/save-to-library';

interface GenerateRequest {
    prompt: string;
    aspectRatio?: string;
    numberOfImages?: number;
    style?: string;
    model?: string;
    imageSize?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json();
        const { prompt, aspectRatio = '1:1', numberOfImages = 1, style, model = GEMINI_IMAGE_MODELS.flash, imageSize = '1K' } = body;

        if (isDemoMode()) {
            // Demo mode - return placeholder images
            return NextResponse.json({
                predictions: Array(numberOfImages).fill(null).map((_, i) => ({
                    bytesBase64Encoded: '', // Empty in demo
                    mimeType: 'image/png',
                    placeholder: true,
                    id: `demo-${Date.now()}-${i}`
                }))
            });
        }

        // Enhancement prompt based on style - using strong descriptive language per Google's prompting guide
        const stylePrompts: Record<string, string> = {
            'photo': 'A photorealistic photograph captured with a professional DSLR camera, natural lighting, sharp focus, 8K resolution, high detail, professional photography, realistic textures, shot with 85mm lens',
            'digital': 'digital art illustration, vibrant saturated colors, clean precise lines, high resolution, modern digital aesthetics, artstation trending',
            'anime': 'anime style artwork, Japanese animation aesthetic, cel-shaded coloring, vibrant colors, highly detailed, studio quality anime, manga inspired',
            'cinema': 'cinematic film still, dramatic lighting, movie scene composition, atmospheric mood, anamorphic lens, professional color grading, 35mm film look, depth of field',
            'abstract': 'abstract art, artistic interpretation, bold colorful shapes, conceptual design, modern art style, geometric patterns',
            'minimal': 'minimalist design, clean simple composition, elegant aesthetics, generous negative space, understated beauty, refined simplicity',
            'fantasy': 'fantasy art illustration, magical ethereal atmosphere, intricate ornate details, mythical elements, dreamlike quality, epic fantasy style',
            'cyber': 'cyberpunk aesthetic, neon lights glow, futuristic urban cityscape, dark atmosphere, high tech low life, blade runner inspired, rain-slicked streets'
        };

        let enhancedPrompt = prompt;
        if (style && style !== 'none') {
            const styleModifier = stylePrompts[style];
            if (styleModifier) {
                enhancedPrompt = `${styleModifier}. ${prompt}`;
            }
        }

        const generateSingleImage = async () => {
            const result = await generateText({
                model: google(model),
                prompt: enhancedPrompt,
                providerOptions: {
                    google: {
                        responseModalities: ['IMAGE'],
                        imageConfig: {
                            aspectRatio,
                            ...(model === GEMINI_IMAGE_MODELS.pro ? { imageSize } : {}),
                        },
                    },
                },
            });

            // Extract image from result files
            // @ts-ignore - 'files' might not be fully typed in all versions yet, or verified in our env
            const file = result.experimental_providerMetadata?.google?.files?.[0] || result.files?.[0]; // Fallback if necessary, but SDK standard is result.files usually? 
            // Actually checking research.md example: result.files

            // Let's rely on documented result.experimental_providerMetadata or result.response... wait, research said result.files
            // But let's check what generateText returns. It returns { text, ... }
            // For image generation it says "Image outputs are available in result.experimental_output... or similar?"
            // Research note said: result.files

            // "for (const file of result.files ?? [])"

            // However, verify if 'files' is on GenerateTextResult.
            // Documentation says generateText returns { text, toolCalls, ... }
            // It might be experimental.
            // Let's try to use experimental_providerMetadata approach or wait, if            // Extract image from result.files
            const files = result.files;

            if (!files || files.length === 0) {
                throw new Error('No image generated');
            }

            const imageFile = files.find(f => f.mediaType.startsWith('image/'));
            if (!imageFile) {
                throw new Error('No image data found in response');
            }

            return {
                bytesBase64Encoded: imageFile.base64,
                mimeType: imageFile.mediaType,
            };
        };

        const fetchImage = async () => {
            return await generateSingleImage();
        }

        // For multiple images, we call the API multiple times
        const predictions = await Promise.all(
            Array(numberOfImages).fill(null).map(() => fetchImage())
        );

        // Save to library for authenticated users
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            for (const prediction of predictions) {
                saveToLibrary({
                    userId: user.id,
                    mediaType: 'image',
                    source: 'generate',
                    fileData: prediction.bytesBase64Encoded,
                    mimeType: prediction.mimeType,
                    metadata: {
                        prompt: enhancedPrompt,
                        model: model,
                        style: style,
                        aspect_ratio: aspectRatio,
                    },
                }).catch(err => console.error('[generate] Failed to save to library:', err));
            }
        }

        return NextResponse.json({
            success: true,
            predictions,
            prompt: enhancedPrompt,
        });

    } catch (error) {
        console.error('Generation error:', error);
        const message = handleAIError(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 } // Or handle status code better
        );
    }
}

