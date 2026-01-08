import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict';

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
        const { prompt, aspectRatio = '1:1', numberOfImages = 1, style, model = 'gemini-2.5-flash-image', imageSize = '1K' } = body;

        const apiKey = process.env.GEMINI_API_KEY;

        // Construct the URL based on the selected model
        // Create the correct API URL based on the selected model
        // For Banana models, the method is generateContent
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        if (!apiKey || apiKey === 'your_api_key_here') {
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

        const fetchImage = async () => {
            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: enhancedPrompt
                        }]
                    }],
                    generationConfig: {
                        responseModalities: ['Image'],
                        imageConfig: {
                            ...(model === 'gemini-3-pro-image-preview' ? { imageSize } : {}),
                            aspectRatio: aspectRatio
                        }
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Gemini API Error:', errorData);
                throw new Error(errorData.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();

            // Extract image from Gemini response parts
            const part = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
            if (!part || !part.inlineData) {
                console.error('No image data in response:', data);
                throw new Error('No image was generated');
            }

            return {
                bytesBase64Encoded: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/png'
            };
        };

        // For multiple images, we call the API multiple times as these models currently return one image per generation via REST
        const predictions = await Promise.all(
            Array(numberOfImages).fill(null).map(() => fetchImage())
        );

        return NextResponse.json({
            success: true,
            predictions,
            prompt: enhancedPrompt,
        });

    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
