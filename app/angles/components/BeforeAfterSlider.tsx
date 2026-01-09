'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    aspectRatio?: string;
}

export default function BeforeAfterSlider({
    beforeImage,
    afterImage,
    aspectRatio = 'square'
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setSliderPosition((x / rect.width) * 100);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchend', handleUp);
        return () => {
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full select-none cursor-ew-resize group bg-[#0a0a0a]"
            onMouseDown={(e) => {
                e.preventDefault(); // Prevent text selection and image dragging
                setIsDragging(true);
            }}
            onTouchStart={() => setIsDragging(true)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
        >
            {/* Base Layer: ORIGINAL (Before) */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div className="relative w-full h-full pointer-events-none">
                    <Image
                        src={beforeImage}
                        alt="Original Image"
                        fill
                        className="object-contain p-6"
                        priority
                        draggable={false}
                    />
                </div>
            </div>

            {/* Top Layer: NEW ANGLE (After) - Clipped to reveal right side */}
            <div
                className="absolute inset-0 overflow-hidden rounded-xl bg-[#0a0a0a]"
                style={{
                    // Reveal AFTER image from the left as slider moves right
                    clipPath: `inset(0 0 0 ${sliderPosition}%)`
                }}
            >
                <div className="relative w-full h-full pointer-events-none">
                    <Image
                        src={afterImage}
                        alt="New Angle"
                        fill
                        className="object-contain p-6"
                        priority
                        draggable={false}
                    />
                </div>
            </div>

            {/* Slider Handle Line */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-[#D4FF00] z-20 pointer-events-none shadow-[0_0_15px_rgba(212,255,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
            >
                {/* Handle Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border-2 border-[#D4FF00] flex items-center justify-center shadow-[0_0_30px_rgba(212,255,0,0.4)]">
                    <div className="flex gap-1">
                        <div className="w-1 h-4 bg-[#D4FF00] rounded-full" />
                        <div className="w-1 h-4 bg-[#D4FF00] rounded-full" />
                    </div>
                </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-6 left-6 z-30 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition > 15 ? 1 : 0 }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/5">
                    <Camera className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Original</span>
                </div>
            </div>

            <div className="absolute bottom-6 right-6 z-30 pointer-events-none transition-opacity duration-300" style={{ opacity: sliderPosition < 85 ? 1 : 0 }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-[#D4FF00]/20">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4FF00]" />
                    <span className="text-[10px] font-black text-[#D4FF00] uppercase tracking-wider">New Angle</span>
                </div>
            </div>
        </div>
    );
}
