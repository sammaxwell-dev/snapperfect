import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Compresses an image file or base64 string.
 * @param fileOrBase64 - The input File object or base64 string.
 * @param maxWidth - The maximum width of the output image.
 * @param quality - The quality of the output JPEG (0 to 1).
 * @returns A promise that resolves to an object containing the compressed base64 string and mime type.
 */
export async function compressImage(
    fileOrBase64: File | string,
    maxWidth = 2048,
    quality = 0.8
): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            const mimeType = "image/jpeg";
            const dataUrl = canvas.toDataURL(mimeType, quality);
            // Remove the prefix "data:image/jpeg;base64,"
            const base64 = dataUrl.split(",")[1];

            resolve({ base64, mimeType });
        };

        img.onerror = (err) => {
            reject(new Error("Failed to load image for compression"));
        };

        if (typeof fileOrBase64 === "string") {
            img.src = fileOrBase64;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(fileOrBase64);
        }
    });
}
