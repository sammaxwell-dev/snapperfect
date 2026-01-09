import { NextRequest, NextResponse } from 'next/server';

interface AnglesRequest {
    imageBase64: string;
    mimeType: string;
    rotation: number;      // -180 to 180
    tilt: number;          // -90 to 90
    zoom: number;          // 0 to 100
    model?: string;
}

// Build angle-specific prompt with EXPLICIT view names
// Key insight: Use simple, unambiguous view descriptions
const buildAnglePrompt = (rotation: number, tilt: number, zoom: number): string => {
    // Determine the VIEW NAME based on rotation
    let viewDescription = '';
    const absRotation = Math.abs(rotation);

    if (absRotation === 0) {
        viewDescription = 'FRONT VIEW - looking directly at the front of the product';
    } else if (absRotation <= 30) {
        viewDescription = rotation < 0
            ? 'FRONT-LEFT VIEW - slightly angled to show the left side while still seeing the front'
            : 'FRONT-RIGHT VIEW - slightly angled to show the right side while still seeing the front';
    } else if (absRotation <= 60) {
        viewDescription = rotation < 0
            ? 'LEFT THREE-QUARTER VIEW - angled view showing mostly the left side with some front visible'
            : 'RIGHT THREE-QUARTER VIEW - angled view showing mostly the right side with some front visible';
    } else if (absRotation <= 100) {
        viewDescription = rotation < 0
            ? 'LEFT SIDE VIEW - looking directly at the left side of the product'
            : 'RIGHT SIDE VIEW - looking directly at the right side of the product';
    } else if (absRotation <= 150) {
        viewDescription = rotation < 0
            ? 'BACK-LEFT VIEW - angled view showing mostly the back with some left side visible'
            : 'BACK-RIGHT VIEW - angled view showing mostly the back with some right side visible';
    } else {
        viewDescription = 'BACK VIEW - looking directly at the back of the product';
    }

    // Add tilt/elevation description
    let tiltDescription = '';
    const absTilt = Math.abs(tilt);

    if (absTilt > 10) {
        if (tilt > 0) {
            tiltDescription = tilt > 45
                ? ' Camera is positioned ABOVE looking DOWN (top-down view).'
                : ` Camera is slightly ABOVE the product (${tilt}° elevation).`;
        } else {
            tiltDescription = tilt < -45
                ? ' Camera is positioned BELOW looking UP (worm\'s eye view).'
                : ` Camera is slightly BELOW the product (low angle shot, ${absTilt}° below eye level).`;
        }
    }

    // Zoom description
    let zoomDescription = '';
    if (zoom > 30) {
        zoomDescription = ' Close-up shot focusing on details.';
    } else if (zoom < -30) {
        zoomDescription = ' Wide shot showing the full product.';
    }

    return `You are a product photography AI. Generate a NEW PHOTOGRAPH of this EXACT SAME product from a DIFFERENT CAMERA ANGLE.

REQUIRED CAMERA ANGLE: ${viewDescription}${tiltDescription}${zoomDescription}

CRITICAL RULES:
1. The product must be EXACTLY the same - same model, same color, same brand, same every detail
2. ONLY the camera position changes - as if a photographer walked to a new position
3. Generate what you would ACTUALLY SEE from the specified angle
4. Maintain professional product photography quality with clean background
5. Keep realistic lighting appropriate for the new angle

EXAMPLE: If this is a cup with a handle on one side, and I ask for LEFT SIDE VIEW, I should see the product from its left side - if the handle is on the left, the handle should be prominently visible facing the camera.

Generate the ${viewDescription} of this product.`;
};

export async function POST(request: NextRequest) {
    try {
        const body: AnglesRequest = await request.json();
        const {
            imageBase64,
            mimeType,
            rotation = 0,
            tilt = 0,
            zoom = 0,
            model = 'gemini-2.5-flash-image'
        } = body;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_api_key_here') {
            // Demo mode
            return NextResponse.json({
                success: true,
                prediction: {
                    bytesBase64Encoded: '',
                    mimeType: 'image/png',
                    placeholder: true,
                    id: `demo-angles-${Date.now()}`
                },
                angle: { rotation, tilt, zoom }
            });
        }

        const anglePrompt = buildAnglePrompt(rotation, tilt, zoom);

        console.log('=== ANGLES API DEBUG ===');
        console.log('Rotation:', rotation, 'Tilt:', tilt, 'Zoom:', zoom);
        console.log('Generated Prompt:', anglePrompt);
        console.log('========================');

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: imageBase64
                            }
                        },
                        {
                            text: anglePrompt
                        }
                    ]
                }],
                generationConfig: {
                    responseModalities: ['Text', 'Image']
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API Error:', errorData);
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        const part = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

        if (!part || !part.inlineData) {
            console.error('No image data in response:', data);
            throw new Error('No image was generated');
        }

        return NextResponse.json({
            success: true,
            prediction: {
                bytesBase64Encoded: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/png'
            },
            angle: { rotation, tilt, zoom }
        });

    } catch (error) {
        console.error('Angles generation error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
