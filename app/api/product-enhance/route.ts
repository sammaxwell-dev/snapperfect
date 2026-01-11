import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google, isDemoMode, handleAIError, GEMINI_IMAGE_MODELS } from '@/lib/ai-provider';
import { createClient } from '@/lib/supabase/server';
import { saveToLibrary } from '@/lib/library/save-to-library';

interface ProductEnhanceRequest {
    imageBase64: string;
    mimeType: string;
    style: string;
    platform?: string;
    numberOfImages?: number;
    model?: string;
}

// Style-specific prompts for product enhancement
const STYLE_PROMPTS: Record<string, string> = {
    'studio': 'E-commerce professional commercial product photography, pure white isolated background, high-end studio lighting, soft sharp focus, 8k resolution, high detail, clean minimalist shot',
    'lifestyle': 'Lifestyle product photography, high-end modern interior, cozy atmosphere, elegant props around, soft focus background, warm natural lighting through a window, professional magazine editorial style',
    'minimalist': 'Ultra-minimalist product photography, solid soft pastel neutral background, architectural shadows, zen aesthetic, clean sharp lines, high-end fashion design aesthetic',
    'luxury': 'Extreme luxury product photography, dramatic noir lighting, dark velvet surface, golden hour reflections, expensive jewelry aesthetic, Vogue campaign style, sharp contrast, deep shadows',
    'bold': 'Creative avant-garde product photography, vibrant neon backlight, holographic surfaces, futuristic vaporwave aesthetic, bold saturated colors, high energy, sharp focus',
    'natural': 'Organic product photography, rustic textured wood surface, surrounded by real botanical elements, dried eucalyptus and moss, earth tones, soft sun dappled lighting, nature-inspired aesthetic'
};

// Platform-specific specs with aspect ratios only
const PLATFORM_SPECS: Record<string, { aspectRatio: string; description: string }> = {
    'amazon': { aspectRatio: '1:1', description: 'Amazon Marketplace (1:1 square)' },
    'ebay': { aspectRatio: '1:1', description: 'eBay Listing (1:1 square)' },
    'etsy': { aspectRatio: '4:3', description: 'Etsy Shop (4:3 landscape)' },
    'shopify': { aspectRatio: '1:1', description: 'Shopify Store (1:1 square)' },
    'instagram': { aspectRatio: '1:1', description: 'Instagram Post (1:1 square)' },
    'instagram-story': { aspectRatio: '9:16', description: 'Instagram Story (9:16 vertical)' },
    'pinterest': { aspectRatio: '2:3', description: 'Pinterest Pin (2:3 vertical)' },
    'facebook': { aspectRatio: '1:1', description: 'Facebook Shop (1:1 square)' },
    'tiktok': { aspectRatio: '9:16', description: 'TikTok Shop (9:16 vertical)' },
    'alibaba': { aspectRatio: '1:1', description: 'Alibaba/AliExpress (1:1 square)' },
    'walmart': { aspectRatio: '1:1', description: 'Walmart Marketplace (1:1 square)' },
    'custom': { aspectRatio: '1:1', description: 'Custom (1:1 default)' }
};

export async function POST(request: NextRequest) {
    try {
        const body: ProductEnhanceRequest = await request.json();
        const {
            imageBase64,
            mimeType,
            style = 'studio',
            platform = 'custom',
            numberOfImages = 1,
            model = GEMINI_IMAGE_MODELS.pro
        } = body;

        if (isDemoMode()) {
            // Demo mode
            return NextResponse.json({
                predictions: Array(numberOfImages).fill(null).map((_, i) => ({
                    bytesBase64Encoded: '',
                    mimeType: 'image/png',
                    placeholder: true,
                    id: `demo-${Date.now()}-${i}`
                }))
            });
        }

        const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS['studio'];
        const platformSpec = PLATFORM_SPECS[platform] || PLATFORM_SPECS['custom'];

        // Use only the style prompt
        const combinedPrompt = stylePrompt;

        // Debug logging
        console.log('=== Product Enhance Request ===');
        console.log('Style:', style);
        console.log('Platform:', platform);
        console.log('Model:', model);
        console.log('Number of Images:', numberOfImages);
        console.log('Combined Prompt:', combinedPrompt);
        console.log('==============================');

        const generateEnhancedImage = async () => {
            const result = await generateText({
                model: google(model),
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                image: Buffer.from(imageBase64, 'base64'),
                            },
                            {
                                type: 'text',
                                text: combinedPrompt
                            }
                        ]
                    }
                ],
                providerOptions: {
                    google: {
                        responseModalities: ['IMAGE'],
                        imageConfig: {
                            aspectRatio: platformSpec.aspectRatio,
                            ...(model === GEMINI_IMAGE_MODELS.pro ? { imageSize: '1K' } : {}),
                        }
                    }
                }
            });

            // Extract image from result.files
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

        const fetchEnhancedImage = async () => {
            return await generateEnhancedImage();
        }

        const predictions = await Promise.all(
            Array(numberOfImages).fill(null).map(() => fetchEnhancedImage())
        );

        // Save to library for authenticated users
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Save each generated image in background (don't block response)
            for (const prediction of predictions) {
                saveToLibrary({
                    userId: user.id,
                    mediaType: 'image',
                    source: 'product-enhance',
                    fileData: prediction.bytesBase64Encoded,
                    mimeType: prediction.mimeType,
                    metadata: {
                        prompt: combinedPrompt,
                        model: model,
                        style: style,
                        platform: platform,
                        aspect_ratio: platformSpec.aspectRatio,
                    },
                }).catch(err => console.error('[product-enhance] Failed to save to library:', err));
            }
        }

        return NextResponse.json({
            success: true,
            predictions,
            style,
            platform
        });

    } catch (error) {
        console.error('Product enhance error:', error);
        const message = handleAIError(error);
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
