'use client';

import { useState, useEffect } from 'react';

interface AngleSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    suffix?: string;
    onChange: (value: number) => void;
}

export default function AngleSlider({
    label,
    value,
    min,
    max,
    step = 1,
    suffix = '°',
    onChange
}: AngleSliderProps) {
    // Local state for immediate visual feedback
    const [localValue, setLocalValue] = useState(value);

    // Keep local value in sync with prop for external changes (like cube drag)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = Number(e.target.value);
        setLocalValue(newVal);
        onChange(newVal);
    };

    // Use localValue for rendering to ensure maximum responsiveness
    const percentage = ((localValue - min) / (max - min)) * 100;
    const centerPercentage = ((0 - min) / (max - min)) * 100;
    const isZeroCentered = min < 0 && max > 0;

    return (
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#0a0a0a] border border-zinc-800/50 group hover:border-zinc-700/50 transition-colors">
            {/* Label */}
            <span className="text-sm font-black text-zinc-500 w-20 flex-shrink-0 uppercase italic tracking-tighter">
                {label}
            </span>

            {/* Slider Track */}
            <div className="flex-1 relative h-8 flex items-center">
                {/* Background Track */}
                <div className="absolute inset-x-0 h-1 bg-zinc-800 rounded-full" />

                {/* Center Line */}
                {isZeroCentered && (
                    <div
                        className="absolute w-0.5 h-3 bg-zinc-700 rounded-full -translate-x-1/2"
                        style={{ left: `${centerPercentage}%` }}
                    />
                )}

                {/* Fill Track - IMMEDIATE (No transition) */}
                {isZeroCentered ? (
                    <div
                        className="absolute h-1 bg-[#D4FF00] rounded-full shadow-[0_0_8px_rgba(212,255,0,0.3)]"
                        style={{
                            left: localValue >= 0 ? `${centerPercentage}%` : `${percentage}%`,
                            width: localValue >= 0 ? `${percentage - centerPercentage}%` : `${centerPercentage - percentage}%`
                        }}
                    />
                ) : (
                    <div
                        className="absolute h-1 bg-[#D4FF00] rounded-full left-0 shadow-[0_0_8px_rgba(212,255,0,0.3)]"
                        style={{ width: `${percentage}%` }}
                    />
                )}

                {/* Input Range - The actual control */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue}
                    onChange={handleChange}
                    className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none"
                />

                {/* Custom Thumb - IMMEDIATE (No transition) */}
                <div
                    className="absolute w-4 h-4 rounded-full bg-[#D4FF00] shadow-[0_0_15px_rgba(212,255,0,0.6)] pointer-events-none z-20"
                    style={{
                        left: `${percentage}%`,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div className="absolute inset-1 rounded-full bg-white/40" />
                </div>
            </div>

            {/* Value Display */}
            <div className="w-16 flex-shrink-0 text-right">
                <span className="text-sm font-black text-white tabular-nums tracking-tight">
                    {localValue > 0 && isZeroCentered ? '+' : ''}{localValue}{suffix}
                </span>
            </div>
        </div>
    );
}
