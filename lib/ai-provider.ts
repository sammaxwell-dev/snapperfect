import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Создаём провайдер с API key из env
export const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Модели для генерации изображений
export const GEMINI_IMAGE_MODELS = {
    flash: 'gemini-2.5-flash-image',
    pro: 'gemini-3-pro-image-preview',
} as const;

// Проверка demo-режима
export function isDemoMode(): boolean {
    const apiKey = process.env.GEMINI_API_KEY;
    return !apiKey || apiKey === 'your_api_key_here';
}

// Обработка ошибок
export function handleAIError(error: unknown): string {
    if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('429')) {
            return 'API quota exceeded. Please try again later.';
        }
        if (error.message.includes('safety')) {
            return 'Image was blocked by safety filters.';
        }
    }
    return 'Image generation failed. Please try again.';
}
