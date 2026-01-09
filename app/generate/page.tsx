'use client';

import { useState } from 'react';
import {
    Sparkles,
    Image as ImageIcon,
    Download,
    Maximize2,
    Loader2,
    Camera,
    Palette,
    Wand2,
    Film,
    Shapes,
    Minus,
    Zap,
    Ghost,
    X
} from 'lucide-react';
import Image from 'next/image';

// Style presets with icons and colors
const STYLE_PRESETS = [
    { id: 'none', label: 'None', icon: Sparkles, color: 'zinc' },
    { id: 'photo', label: 'Photo', icon: Camera, color: 'blue' },
    { id: 'digital', label: 'Digital', icon: Palette, color: 'purple' },
    { id: 'anime', label: 'Anime', icon: Ghost, color: 'pink' },
    { id: 'cinema', label: 'Cinema', icon: Film, color: 'amber' },
    { id: 'abstract', label: 'Abstract', icon: Shapes, color: 'cyan' },
    { id: 'minimal', label: 'Minimal', icon: Minus, color: 'gray' },
    { id: 'fantasy', label: 'Fantasy', icon: Wand2, color: 'violet' },
    { id: 'cyber', label: 'Cyber', icon: Zap, color: 'lime' },
];

const ASPECT_RATIOS = [
    { id: '1:1', label: '1:1', width: 1, height: 1 },
    { id: '3:4', label: '3:4', width: 3, height: 4 },
    { id: '4:3', label: '4:3', width: 4, height: 3 },
    { id: '9:16', label: '9:16', width: 9, height: 16 },
    { id: '16:9', label: '16:9', width: 16, height: 9 },
];

const MODELS = [
    {
        id: 'gemini-3-pro-image-preview',
        label: 'Nano Banana Pro',
        description: "Google's Flagship Generation Model",
        icon: Sparkles,
        premium: false
    },
    {
        id: 'gemini-2.5-flash-image',
        label: 'Nano Banana Flash',
        description: "Google's Standard Generation Model",
        icon: Zap,
        premium: true
    },
];

const RESOLUTIONS = [
    { id: '1K', label: '1k', description: 'Fastest And Cheapest' },
    { id: '2K', label: '2k', description: 'Best Visual Fidelity' },
    { id: '4K', label: '4k', description: 'Professional Ultra HD' },
];

interface GeneratedImage {
    id: string;
    imageData: string | null;
    mimeType?: string;
    placeholder?: boolean;
    style?: string;
    prompt?: string;
    modelId?: string;
}

export default function GeneratePage() {
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('none');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [numberOfImages, setNumberOfImages] = useState(1);
    const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-image');
    const [imageSize, setImageSize] = useState('1K');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDemo, setIsDemo] = useState(false);
    const [expandedImage, setExpandedImage] = useState<GeneratedImage | null>(null);

    // UI State for popovers
    const [activePopover, setActivePopover] = useState<'model' | 'ratio' | 'quality' | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    aspectRatio,
                    numberOfImages,
                    style: selectedStyle,
                    model: selectedModel,
                    imageSize: selectedModel === 'gemini-3-pro-image-preview' ? imageSize : '1K',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            if (data.predictions && Array.isArray(data.predictions)) {
                const newImages: GeneratedImage[] = data.predictions.map((p: any, i: number) => ({
                    id: `gen-${Date.now()}-${i}`,
                    imageData: p.bytesBase64Encoded,
                    mimeType: p.mimeType,
                    placeholder: p.placeholder,
                    style: selectedStyle,
                    prompt: prompt,
                    modelId: selectedModel
                }));
                setGeneratedImages(prev => [...newImages, ...prev]);
            }
            setIsDemo(data.predictions?.[0]?.placeholder || false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = (image: GeneratedImage) => {
        if (!image.imageData) return;

        const link = document.createElement('a');
        link.href = `data:${image.mimeType || 'image/png'};base64,${image.imageData}`;
        link.download = `generated-${image.id}.png`;
        link.click();
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white">
            {/* Main Content - Gallery */}
            <div className="flex-1 overflow-auto p-6 pb-40">
                {/* Demo Mode Banner */}
                {isDemo && (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#D4FF00]/10 to-[#FF0099]/10 border border-[#D4FF00]/30">
                        <p className="text-sm text-zinc-300">
                            <span className="font-bold text-[#D4FF00]">Demo Mode:</span> Add your GEMINI_API_KEY to .env to generate real images
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Unified Image Grid (Loading + Generated) */}
                {(isGenerating || generatedImages.length > 0) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Shimmer/Loading Placeholders */}
                        {isGenerating && Array(numberOfImages).fill(null).map((_, i) => (
                            <div
                                key={`loading-${i}`}
                                className="aspect-square rounded-xl bg-[#121212] border border-[#D4FF00]/20 overflow-hidden relative"
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 text-[#D4FF00] animate-spin" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Generating</span>
                                    </div>
                                </div>
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4FF00]/5 to-transparent animate-shimmer" />
                            </div>
                        ))}

                        {/* Generated Images */}
                        {generatedImages.map((image) => {
                            const modelLabel = MODELS.find(m => m.id === image.modelId)?.label || 'Banana Model';
                            const styleLabel = STYLE_PRESETS.find(s => s.id === image.style)?.label || 'None';

                            return (
                                <div
                                    key={image.id}
                                    className="group flex flex-col gap-3 p-3 rounded-2xl bg-[#0d0d0d] border border-white/5 hover:border-[#D4FF00]/30 transition-all duration-500"
                                >
                                    <div className="relative aspect-square rounded-xl bg-[#121212] overflow-hidden">
                                        {image.placeholder ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a]">
                                                <div className="text-center">
                                                    <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                                    <span className="text-xs text-zinc-500">Demo placeholder</span>
                                                </div>
                                            </div>
                                        ) : image.imageData ? (
                                            <Image
                                                src={`data:${image.mimeType || 'image/png'};base64,${image.imageData}`}
                                                alt="Generated image"
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : null}

                                        {/* Premium Style Badge (Top Left) */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <div className="px-2.5 py-1 bg-white rounded-md shadow-2xl transform -skew-x-12 ring-1 ring-black/10">
                                                <span className="text-[9px] font-black text-black uppercase tracking-widest italic leading-none block">
                                                    {styleLabel === 'None' ? 'Standard' : styleLabel}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hover overlay with actions */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                                                <button
                                                    onClick={() => setExpandedImage(image)}
                                                    className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                                                >
                                                    <Maximize2 className="w-4 h-4 text-white" />
                                                </button>
                                                {image.imageData && (
                                                    <button
                                                        onClick={() => handleDownload(image)}
                                                        className="p-2 rounded-lg bg-[#D4FF00] hover:bg-[#c4ef00] transition-colors"
                                                    >
                                                        <Download className="w-4 h-4 text-black" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Metadata Footer (Screenshot inspired) */}
                                    <div className="px-1 flex items-center justify-between mt-auto">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-[11px] text-zinc-500 line-clamp-2 leading-tight italic">
                                                {image.prompt || "No prompt metadata"}
                                            </p>
                                        </div>

                                        {/* Lime Model Badge */}
                                        <div className="flex-shrink-0">
                                            <div className="px-2 py-1 bg-[#D4FF00] rounded-md shadow-[0_0_15px_rgba(212,255,0,0.3)]">
                                                <span className="text-[9px] font-black text-black uppercase tracking-wider leading-none block">
                                                    {image.modelId?.includes('pro') ? 'PRO' : 'FLASH'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Unified Bottom Toolbar */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-6 pb-4 md:pb-6 px-4 md:px-8 z-40">
                <div className="max-w-5xl mx-auto flex flex-col gap-3">

                    {/* Style Presets Row */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {STYLE_PRESETS.map((style) => {
                            const Icon = style.icon;
                            const isActive = selectedStyle === style.id;
                            return (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap
                    transition-all duration-200 border
                    ${isActive
                                            ? 'bg-[#D4FF00] text-black border-[#D4FF00] shadow-[0_0_10px_rgba(212,255,0,0.3)]'
                                            : 'bg-[#09090b] text-zinc-500 border-[#27272a] hover:border-zinc-500 hover:text-white'}
                  `}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {style.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Unified Interaction Bar */}
                    <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#09090b] border border-[#27272a] shadow-2xl shadow-black/50 ring-1 ring-white/5 relative">

                        {/* Prompt Input */}
                        <div className="flex-1">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleGenerate();
                                }}
                                placeholder="Describe the image you want to create..."
                                className="w-full px-4 py-3 bg-transparent text-white placeholder-zinc-600 focus:outline-none text-sm"
                            />
                        </div>

                        {/* Separator */}
                        <div className="w-px h-8 bg-[#27272a]" />

                        {/* Controls Group */}
                        <div className="flex items-center gap-2 pr-2">

                            {/* Model Selector Popover */}
                            <div className="relative">
                                {/* Click-outside backdrop */}
                                {activePopover && (
                                    <div
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={() => setActivePopover(null)}
                                    />
                                )}

                                <button
                                    onClick={() => setActivePopover(activePopover === 'model' ? null : 'model')}
                                    className={`relative z-50 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${activePopover === 'model' ? 'bg-[#121212] border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'
                                        }`}
                                >
                                    {(() => {
                                        const model = MODELS.find(m => m.id === selectedModel);
                                        const Icon = model?.icon || Sparkles;
                                        // Show Pro or Flash
                                        const labelText = selectedModel.includes('pro') ? 'PRO' : 'FLASH';
                                        return (
                                            <>
                                                <Icon className="w-4 h-4 text-[#D4FF00]" />
                                                <span className="text-[11px] font-bold text-white uppercase tracking-wider">{labelText}</span>
                                            </>
                                        );
                                    })()}
                                    <span className="text-zinc-500 ml-1">›</span>
                                </button>

                                {activePopover === 'model' && (
                                    <div className="absolute bottom-full mb-4 left-0 w-80 bg-[#0f0f0f] border border-[#27272a] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <div className="px-3 py-2 border-b border-[#27272a] mb-1">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Select model</span>
                                        </div>
                                        {MODELS.map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setSelectedModel(model.id);
                                                    setActivePopover(null);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-[#D4FF00]/30 transition-all">
                                                    <model.icon className={`w-5 h-5 ${model.id === selectedModel ? 'text-[#D4FF00]' : 'text-zinc-500'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold ${model.id === selectedModel ? 'text-white' : 'text-zinc-400'}`}>{model.label}</span>
                                                        {model.premium && (
                                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-[#D4FF00]/10 text-[#D4FF00] uppercase tracking-tighter">Premium</span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-600 font-medium">{model.description}</div>
                                                </div>
                                                {model.id === selectedModel && <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Aspect Ratio Popover */}
                            <div className="relative">
                                <button
                                    onClick={() => setActivePopover(activePopover === 'ratio' ? null : 'ratio')}
                                    className={`relative z-50 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${activePopover === 'ratio' ? 'bg-[#121212] border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'
                                        }`}
                                >
                                    <div className="w-3.5 h-5 border-2 border-zinc-500 rounded-sm" />
                                    <span className="text-[11px] font-bold text-white tracking-wider">{aspectRatio}</span>
                                </button>

                                {activePopover === 'ratio' && (
                                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 bg-[#0f0f0f] border border-[#27272a] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <div className="px-3 py-2 border-b border-[#27272a] mb-1 text-center">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Aspect Ratio</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 mt-1">
                                            {ASPECT_RATIOS.map((ratio) => (
                                                <button
                                                    key={ratio.id}
                                                    onClick={() => {
                                                        setAspectRatio(ratio.id);
                                                        setActivePopover(null);
                                                    }}
                                                    className={`p-2 rounded-xl hover:bg-white/5 transition-all text-center border ${aspectRatio === ratio.id ? 'border-[#D4FF00]/50 bg-[#D4FF00]/5' : 'border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div
                                                            className={`border-2 rounded-[2px] ${aspectRatio === ratio.id ? 'border-[#D4FF00]' : 'border-zinc-700'}`}
                                                            style={{
                                                                width: ratio.width > ratio.height ? '24px' : ratio.width === ratio.height ? '20px' : '16px',
                                                                height: ratio.height > ratio.width ? '24px' : ratio.height === ratio.height ? '20px' : '16px'
                                                            }}
                                                        />
                                                        <span className={`text-[10px] font-bold ${aspectRatio === ratio.id ? 'text-white' : 'text-zinc-500'}`}>{ratio.label}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quality Popover */}
                            <div className="relative">
                                <button
                                    onClick={() => setActivePopover(activePopover === 'quality' ? null : 'quality')}
                                    disabled={selectedModel === 'gemini-2.5-flash-image'}
                                    className={`relative z-50 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${selectedModel === 'gemini-2.5-flash-image' ? 'opacity-40 grayscale cursor-not-allowed' :
                                        activePopover === 'quality' ? 'bg-[#121212] border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'
                                        }`}
                                >
                                    <Shapes className="w-4 h-4 text-zinc-500" />
                                    <span className="text-[11px] font-bold text-white tracking-wider uppercase">{imageSize}</span>
                                </button>

                                {activePopover === 'quality' && (
                                    <div className="absolute bottom-full mb-4 right-0 w-64 bg-[#0f0f0f] border border-[#27272a] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <div className="px-3 py-2 border-b border-[#27272a] mb-1">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Select quality</span>
                                        </div>
                                        {RESOLUTIONS.map((res) => (
                                            <button
                                                key={res.id}
                                                onClick={() => {
                                                    setImageSize(res.id);
                                                    setActivePopover(null);
                                                }}
                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left"
                                            >
                                                <div>
                                                    <div className={`text-xs font-bold ${imageSize === res.id ? 'text-white' : 'text-zinc-400'}`}>{res.label}</div>
                                                    <div className="text-[10px] text-zinc-600 font-medium">{res.description}</div>
                                                </div>
                                                {imageSize === res.id && <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Count */}
                            <div className="flex items-center gap-3 bg-[#121212]/50 rounded-xl border border-white/5 px-3 py-2 mx-1">
                                <button
                                    onClick={() => setNumberOfImages(Math.max(1, numberOfImages - 1))}
                                    disabled={numberOfImages <= 1}
                                    className="text-zinc-600 hover:text-white disabled:opacity-30 p-0.5 hover:bg-white/5 rounded-md transition-colors"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-black text-[#D4FF00] w-6 text-center tabular-nums">{numberOfImages}/4</span>
                                <button
                                    onClick={() => setNumberOfImages(Math.min(4, numberOfImages + 1))}
                                    disabled={numberOfImages >= 4}
                                    className="text-zinc-600 hover:text-white disabled:opacity-30 p-0.5 hover:bg-white/5 rounded-md transition-colors"
                                >
                                    <span className="text-lg leading-none font-medium">+</span>
                                </button>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider
                  transition-all duration-300 transform active:scale-95
                  ${isGenerating || !prompt.trim()
                                        ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'
                                        : 'bg-[#D4FF00] text-black hover:bg-[#eaff4d] hover:shadow-[0_0_30px_rgba(212,255,0,0.4)]'}
                `}
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 fill-current" />
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Image Modal */}
            {
                expandedImage && (
                    <div
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
                        onClick={() => setExpandedImage(null)}
                    >
                        <button
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            onClick={() => setExpandedImage(null)}
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>

                        <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
                            {expandedImage.imageData ? (
                                <Image
                                    src={`data:${expandedImage.mimeType || 'image/png'};base64,${expandedImage.imageData}`}
                                    alt="Expanded image"
                                    fill
                                    className="object-contain"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#121212] rounded-xl">
                                    <span className="text-zinc-500">Demo placeholder</span>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div >
    );
}
