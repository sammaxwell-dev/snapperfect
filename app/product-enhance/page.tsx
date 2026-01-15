'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
    Upload,
    Sparkles,
    Download,
    Maximize2,
    Loader2,
    X,
    ChevronDown,
    Package,
    ShoppingBag,
    Store,
    Camera,
    Minus,
    RotateCcw,
    Zap
} from 'lucide-react';

// Model options
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

// Style presets with preview images
const STYLE_PRESETS = [
    {
        id: 'studio',
        label: 'Studio',
        description: 'White background, professional studio shot',
        preview: '/assets/styles/studio.png'
    },
    {
        id: 'lifestyle',
        label: 'Lifestyle',
        description: 'Product in an interior setting',
        preview: '/assets/styles/lifestyle.png'
    },
    {
        id: 'minimalist',
        label: 'Minimalist',
        description: 'Clean minimalist aesthetic',
        preview: '/assets/styles/minimalist.png'
    },
    {
        id: 'luxury',
        label: 'Luxury',
        description: 'Premium luxury style',
        preview: '/assets/styles/luxury.png'
    },
    {
        id: 'bold',
        label: 'Bold',
        description: 'Vibrant and daring',
        preview: '/assets/styles/bold.png'
    },
    {
        id: 'natural',
        label: 'Natural',
        description: 'Eco-friendly natural look',
        preview: '/assets/styles/natural.png'
    }
];

// Platform presets with style guidelines
const PLATFORMS = [
    { id: 'amazon', label: 'Amazon', icon: ShoppingBag, aspectRatio: '1:1', style: 'Pure white background, no shadows, product centered', color: '#FF9900' },
    { id: 'ebay', label: 'eBay', icon: Store, aspectRatio: '1:1', style: 'White/gray gradient, professional lighting', color: '#E53238' },
    { id: 'etsy', label: 'Etsy', icon: Package, aspectRatio: '4:3', style: 'Handmade aesthetic, natural wooden surface', color: '#F56400' },
    { id: 'shopify', label: 'Shopify', icon: ShoppingBag, aspectRatio: '1:1', style: 'Modern minimalist, soft shadows', color: '#96BF48' },
    { id: 'instagram', label: 'Instagram', icon: Camera, aspectRatio: '1:1', style: 'Trendy lifestyle aesthetic, colorful', color: '#E1306C' },
    { id: 'instagram-story', label: 'IG Story', icon: Camera, aspectRatio: '9:16', style: 'Vertical lifestyle, bold colors', color: '#E1306C' },
    { id: 'pinterest', label: 'Pinterest', icon: Camera, aspectRatio: '2:3', style: 'Styled flat lay with props', color: '#BD081C' },
    { id: 'facebook', label: 'Facebook', icon: Store, aspectRatio: '1:1', style: 'Clean professional marketplace style', color: '#1877F2' },
    { id: 'tiktok', label: 'TikTok', icon: Camera, aspectRatio: '9:16', style: 'Dynamic vibrant vertical', color: '#000000' },
    { id: 'alibaba', label: 'Alibaba', icon: Store, aspectRatio: '1:1', style: 'Professional wholesale style', color: '#FF6A00' },
    { id: 'walmart', label: 'Walmart', icon: ShoppingBag, aspectRatio: '1:1', style: 'Clean retail white background', color: '#0071DC' },
];

interface GeneratedImage {
    id: string;
    imageData: string | null;
    mimeType?: string;
    placeholder?: boolean;
    style?: string;
}

export default function ProductEnhancePage() {
    // Upload state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/png');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Settings state
    const [selectedStyle, setSelectedStyle] = useState('studio');
    const [selectedPlatform, setSelectedPlatform] = useState('amazon');
    const [numberOfImages, setNumberOfImages] = useState(1);
    const [selectedModel, setSelectedModel] = useState('gemini-3-pro-image-preview');

    // UI state
    const [showStyleModal, setShowStyleModal] = useState(false);
    const [showPlatformPopover, setShowPlatformPopover] = useState(false);
    const [showModelPopover, setShowModelPopover] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [expandedImage, setExpandedImage] = useState<GeneratedImage | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Handle file upload
    const handleFileUpload = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            // Remove data URL prefix for API
            setUploadedImage(result);
            setUploadedMimeType(file.type);
            setError(null);
        };
        reader.readAsDataURL(file);
    }, []);

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    }, [handleFileUpload]);

    // Generate enhanced images
    const handleGenerate = async () => {
        if (!uploadedImage) return;

        setIsGenerating(true);
        setError(null);
        // Clear previous results to avoid confusion
        setGeneratedImages([]);

        try {
            // Extract base64 data from data URL
            const base64Data = uploadedImage.split(',')[1];

            const response = await fetch('/api/product-enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: base64Data,
                    mimeType: uploadedMimeType,
                    style: selectedStyle,
                    platform: selectedPlatform,
                    numberOfImages,
                    model: selectedModel
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            if (data.predictions && Array.isArray(data.predictions)) {
                const newImages: GeneratedImage[] = data.predictions.map((p: any, i: number) => ({
                    id: `enhanced-${Date.now()}-${i}`,
                    imageData: p.bytesBase64Encoded,
                    mimeType: p.mimeType,
                    placeholder: p.placeholder,
                    style: selectedStyle
                }));
                setGeneratedImages(prev => [...newImages, ...prev]);
            }
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
        link.download = `enhanced-${image.id}.png`;
        link.click();
    };

    const clearUpload = () => {
        setUploadedImage(null);
        setGeneratedImages([]);
    };

    const currentStyle = STYLE_PRESETS.find(s => s.id === selectedStyle);
    const currentPlatform = PLATFORMS.find(p => p.id === selectedPlatform);

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white">
            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6 pb-24">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                        Product <span className="text-[#D4FF00]">Enhance</span>
                    </h1>
                    <p className="text-zinc-500 mt-2">
                        Enhance product photos for marketplaces using AI
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Upload Zone */}
                {!uploadedImage ? (
                    <div className="flex items-center justify-center min-h-[400px] lg:min-h-[500px] py-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`
                                relative cursor-pointer w-full max-w-[320px] aspect-[9/16] max-h-[70vh] rounded-[32px] 
                                flex flex-col items-center justify-center text-center p-8
                                transition-all duration-300 group
                                border border-white/5 bg-[#0a0a0a]
                                ${isDragging
                                    ? 'border-[#D4FF00] bg-[#D4FF00]/5 scale-[1.02]'
                                    : 'hover:border-zinc-700 hover:bg-[#0f0f0f]'
                                }
                            `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                className="hidden"
                            />

                            {/* Stars background effect */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-[32px]">
                                <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full opacity-50" />
                                <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-white rounded-full opacity-30" />
                                <div className="absolute bottom-32 left-1/3 w-1 h-1 bg-white rounded-full opacity-40" />
                                <div className="absolute top-1/3 right-10 w-1 h-1 bg-white rounded-full opacity-20" />
                            </div>

                            <div className={`
                                w-16 h-16 rounded-full flex items-center justify-center mb-6
                                border border-white/20 bg-white/5 backdrop-blur-sm
                                transition-all duration-300 group-hover:scale-110 group-hover:border-white/40
                            `}>
                                <div className="text-2xl font-light text-white mb-1">+</div>
                            </div>

                            <h3 className="text-base font-medium text-zinc-300 mb-2 max-w-[200px] leading-tight">
                                Drag or click to upload your photo
                            </h3>

                            <div className="absolute bottom-10 left-0 right-0 px-8">
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                    Single product, centered, clear view, high quality
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[450px] lg:h-[500px]">
                        {/* Original Image Preview */}
                        <div className="h-full relative rounded-3xl overflow-hidden bg-[#0a0a0a] border border-zinc-800">
                            <div className="absolute inset-0">
                                <Image
                                    src={uploadedImage}
                                    alt="Original product"
                                    fill
                                    className="object-contain p-4"
                                />
                            </div>
                            <button
                                onClick={clearUpload}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                            <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                                    Original
                                </span>
                            </div>
                            <button
                                onClick={clearUpload}
                                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4FF00] text-black text-xs font-black uppercase tracking-wider hover:bg-[#eaff4d] transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset
                            </button>
                        </div>

                        {/* Result Area */}
                        <div className="h-full relative rounded-3xl overflow-hidden bg-[#0a0a0a] border border-zinc-800 flex flex-col">
                            {isGenerating ? (
                                /* Loading Animation with Shimmer */
                                <div className="flex-1 flex items-center justify-center relative">
                                    <div className="flex flex-col items-center gap-4 z-10">
                                        <Loader2 className="w-12 h-12 text-[#D4FF00] animate-spin" />
                                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                                            Enhancing...
                                        </span>
                                    </div>
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4FF00]/5 to-transparent animate-shimmer" />
                                </div>
                            ) : generatedImages.length > 0 ? (
                                <div className="flex-1 relative">
                                    {/* Show only the most recent image to avoid stacking issues */}
                                    {generatedImages[0] && (
                                        <div key={generatedImages[0].id} className="absolute inset-0">
                                            {generatedImages[0].placeholder ? (
                                                <div className="w-full h-full flex items-center justify-center bg-[#121212]">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <Loader2 className="w-10 h-10 text-[#D4FF00] animate-spin" />
                                                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                                                            Enhancing...
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : generatedImages[0].imageData ? (
                                                <>
                                                    <Image
                                                        src={`data:${generatedImages[0].mimeType || 'image/png'};base64,${generatedImages[0].imageData}`}
                                                        alt="Enhanced result"
                                                        fill
                                                        className="object-contain p-4"
                                                    />
                                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                                        <button
                                                            onClick={() => setExpandedImage(generatedImages[0])}
                                                            className="p-2.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-colors"
                                                        >
                                                            <Maximize2 className="w-4 h-4 text-white" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(generatedImages[0])}
                                                            className="p-2.5 rounded-lg bg-[#D4FF00] text-black hover:bg-[#eaff4d] transition-colors"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-800/50 m-4 rounded-2xl">
                                    <Sparkles className="w-16 h-16 text-zinc-800 mb-6" />
                                    <h3 className="text-xl font-bold text-white mb-2">Ready to Enhance</h3>
                                    <p className="text-zinc-500 max-w-xs mx-auto">
                                        Select a style below and click Enhance to transform your product image
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-4 pb-4 px-4 md:px-6 z-40">
                <div className="max-w-6xl mx-auto">
                    {/* Compact Controls Bar */}
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#09090b]/80 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/5">
                        {/* Style Selector */}
                        <button
                            onClick={() => setShowStyleModal(true)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-[#121212] border border-white/5 hover:border-white/20 transition-all group min-w-[50px] sm:min-w-[140px]"
                        >
                            <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0 border border-white/10">
                                {currentStyle && (
                                    <Image
                                        src={currentStyle.preview}
                                        alt={currentStyle.label}
                                        fill
                                        sizes="32px"
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0 hidden sm:block">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider leading-none mb-0.5">Style</div>
                                <div className="text-xs font-bold text-white truncate">{currentStyle?.label}</div>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors hidden sm:block" />
                        </button>

                        <div className="w-px h-8 bg-[#27272a]" />

                        {/* Platform Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPlatformPopover(!showPlatformPopover)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#121212] border border-white/5 hover:border-white/20 transition-all"
                            >
                                {currentPlatform && <currentPlatform.icon className="w-3.5 h-3.5 text-[#D4FF00]" />}
                                <span className="text-xs font-bold text-white whitespace-nowrap hidden sm:inline">{currentPlatform?.label}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
                            </button>

                            {showPlatformPopover && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowPlatformPopover(false)} />
                                    <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#0f0f0f] border border-[#27272a] rounded-2xl p-2 shadow-2xl z-50">
                                        <div className="px-3 py-2 border-b border-[#27272a] mb-1">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                                                Platform
                                            </span>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {PLATFORMS.map((platform) => (
                                                <button
                                                    key={platform.id}
                                                    onClick={() => {
                                                        setSelectedPlatform(platform.id);
                                                        setShowPlatformPopover(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all"
                                                >
                                                    <platform.icon className={`w-4 h-4 ${platform.id === selectedPlatform ? 'text-[#D4FF00]' : 'text-zinc-500'}`} />
                                                    <span className={`text-sm font-medium ${platform.id === selectedPlatform ? 'text-white' : 'text-zinc-400'}`}>
                                                        {platform.label}
                                                    </span>
                                                    <span className="text-xs text-zinc-600 ml-auto">{platform.aspectRatio}</span>
                                                    {platform.id === selectedPlatform && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Model Selector */}
                        <div className="relative hidden md:block">
                            <button
                                onClick={() => setShowModelPopover(!showModelPopover)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#121212] border border-white/5 hover:border-white/20 transition-all"
                            >
                                {(() => {
                                    const currentModel = MODELS.find(m => m.id === selectedModel);
                                    const Icon = currentModel?.icon || Sparkles;
                                    return <Icon className="w-3.5 h-3.5 text-[#D4FF00]" />;
                                })()}
                                <span className="text-xs font-bold text-white whitespace-nowrap">
                                    {MODELS.find(m => m.id === selectedModel)?.label || 'Pro'}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
                            </button>

                            {showModelPopover && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowModelPopover(false)} />
                                    <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#0f0f0f] border border-[#27272a] rounded-2xl p-2 shadow-2xl z-50">
                                        <div className="px-3 py-2 border-b border-[#27272a] mb-1">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                                                Model
                                            </span>
                                        </div>
                                        {MODELS.map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => {
                                                    setSelectedModel(model.id);
                                                    setShowModelPopover(false);
                                                }}
                                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all"
                                            >
                                                <model.icon className={`w-4 h-4 ${model.id === selectedModel ? 'text-[#D4FF00]' : 'text-zinc-500'}`} />
                                                <div className="flex-1 text-left">
                                                    <span className={`text-sm font-medium ${model.id === selectedModel ? 'text-white' : 'text-zinc-400'}`}>
                                                        {model.label}
                                                    </span>
                                                    <p className="text-[10px] text-zinc-600">{model.description}</p>
                                                </div>
                                                {model.id === selectedModel && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="w-px h-8 bg-[#27272a] hidden sm:block" />

                        {/* Number of images */}
                        <div className="items-center gap-2 bg-[#121212]/50 rounded-xl border border-white/5 px-2 py-1.5 hidden sm:flex">
                            <button
                                onClick={() => setNumberOfImages(Math.max(1, numberOfImages - 1))}
                                disabled={numberOfImages <= 1}
                                className="text-zinc-600 hover:text-white disabled:opacity-30 p-0.5 hover:bg-white/5 rounded-md transition-colors"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] font-black text-[#D4FF00] w-6 text-center tabular-nums">{numberOfImages}/4</span>
                            <button
                                onClick={() => setNumberOfImages(Math.min(4, numberOfImages + 1))}
                                disabled={numberOfImages >= 4}
                                className="text-zinc-600 hover:text-white disabled:opacity-30 p-0.5 hover:bg-white/5 rounded-md transition-colors"
                            >
                                <span className="text-sm leading-none font-medium">+</span>
                            </button>
                        </div>

                        <div className="flex-1" />

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !uploadedImage}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider
                                transition-all duration-300 transform active:scale-95
                                ${isGenerating || !uploadedImage
                                    ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'
                                    : 'bg-[#D4FF00] text-black hover:bg-[#eaff4d] hover:shadow-[0_0_20px_rgba(212,255,0,0.3)]'}
                            `}
                        >
                            {isGenerating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                                    Enhance
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Style Selection Modal */}
            {showStyleModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
                    onClick={() => setShowStyleModal(false)}
                >
                    <div
                        className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase">Choose a Style</h2>
                                <p className="text-zinc-500 text-sm mt-1">Click a card to select a style</p>
                            </div>
                            <button
                                onClick={() => setShowStyleModal(false)}
                                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {STYLE_PRESETS.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => {
                                        setSelectedStyle(style.id);
                                        setShowStyleModal(false);
                                    }}
                                    className={`
                                        group relative rounded-2xl overflow-hidden border-2 transition-all duration-300
                                        ${selectedStyle === style.id
                                            ? 'border-[#D4FF00] ring-2 ring-[#D4FF00]/30'
                                            : 'border-transparent hover:border-zinc-700'}
                                    `}
                                >
                                    <div className="aspect-square relative">
                                        <Image
                                            src={style.preview}
                                            alt={style.label}
                                            fill
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-lg font-black text-white uppercase">{style.label}</h3>
                                        <p className="text-xs text-zinc-400 mt-1">{style.description}</p>
                                    </div>
                                    {selectedStyle === style.id && (
                                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#D4FF00] flex items-center justify-center">
                                            <span className="text-black text-xs font-bold">✓</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Expanded Image Modal */}
            {expandedImage && (
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
            )}

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
