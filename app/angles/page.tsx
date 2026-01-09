'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Upload, X, Loader2, Sparkles, Rotate3D, Info, RotateCcw, Maximize2, Download } from 'lucide-react';
import AngleSlider from './components/AngleSlider';
import BeforeAfterSlider from './components/BeforeAfterSlider';

// Dynamic import for Three.js component (SSR disabled)
const AnglesCube = dynamic(() => import('./components/AnglesCube'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] rounded-xl">
            <Loader2 className="w-6 h-6 text-[#D4FF00] animate-spin" />
        </div>
    )
});

interface GeneratedResult {
    id: string;
    imageData: string | null;
    mimeType?: string;
    placeholder?: boolean;
    angle: {
        rotation: number;
        tilt: number;
        zoom: number;
    };
}

export default function AnglesPage() {
    // Stage state
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/png');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Angle controls (Bidirectional sync with cube)
    const [rotation, setRotation] = useState(0);
    const [tilt, setTilt] = useState(0);
    const [zoom, setZoom] = useState(0);

    // Options
    const [generateAllAngles, setGenerateAllAngles] = useState(false);

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedImage, setExpandedImage] = useState<GeneratedResult | null>(null);

    // Handle paste from clipboard
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        handleFileUpload(file);
                    }
                    break;
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    // Handle file upload
    const handleFileUpload = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setUploadedImage(result);
            setUploadedMimeType(file.type);
            setError(null);
            setGeneratedResult(null);
        };
        reader.readAsDataURL(file);
    }, []);

    // Handlers for file selection
    const handleButtonClick = useCallback(() => fileInputRef.current?.click(), []);

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

    // Handle angle change from cube drag (throttled/state managed)
    const handleAngleChange = useCallback((newRotation: number, newTilt: number) => {
        setRotation(newRotation);
        setTilt(newTilt);
    }, []);

    // Clear upload
    const handleClearUpload = () => {
        setUploadedImage(null);
        setGeneratedResult(null);
    };

    // Reset angle and zoom
    const handleReset = () => {
        setRotation(0);
        setTilt(0);
        setZoom(0);
    };

    // Generate new angle
    const handleGenerate = async () => {
        if (!uploadedImage) return;

        setIsGenerating(true);
        setError(null);

        try {
            const base64Data = uploadedImage.split(',')[1];

            const response = await fetch('/api/angles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: base64Data,
                    mimeType: uploadedMimeType,
                    rotation,
                    tilt,
                    zoom
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            if (data.prediction) {
                setGeneratedResult({
                    id: `angle-${Date.now()}`,
                    imageData: data.prediction.bytesBase64Encoded,
                    mimeType: data.prediction.mimeType,
                    placeholder: data.prediction.placeholder,
                    angle: data.angle
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    // Download generated image
    const handleDownload = (result: GeneratedResult) => {
        if (!result.imageData) return;
        const link = document.createElement('a');
        link.href = `data:${result.mimeType || 'image/png'};base64,${result.imageData}`;
        link.download = `angles-r${result.angle.rotation}-t${result.angle.tilt}.png`;
        link.click();
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white">
            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-48 pt-16 lg:pt-8">
                {/* Header Container */}
                <div className="max-w-4xl mx-auto mb-6 md:mb-10">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter italic">
                        <span className="text-[#D4FF00]">Angles</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">
                        Rotate, tilt, and explore new angles of your image while preserving every detail.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 gap-6 md:gap-8 max-w-4xl mx-auto lg:grid-cols-2">
                    {/* Left: Upload Zone / Original Image */}
                    <div className="relative">
                        {!uploadedImage ? (
                            <div
                                onClick={handleButtonClick}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    relative cursor-pointer min-h-[450px] lg:h-full rounded-2xl 
                                    flex flex-col items-center justify-center text-center p-8
                                    transition-all duration-300 group
                                    border-2 border-dashed
                                    ${isDragging ? 'border-[#D4FF00] bg-[#D4FF00]/5' : 'border-zinc-800 bg-[#0a0a0a] hover:border-zinc-700'}
                                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                    className="hidden"
                                />

                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-zinc-700 bg-zinc-900/50 group-hover:border-[#D4FF00]/50 transition-colors">
                                    <Upload className="w-6 h-6 text-zinc-500 group-hover:text-[#D4FF00] transition-colors" />
                                </div>

                                <h3 className="text-lg font-black text-white mb-2 uppercase italic tracking-tight">
                                    Upload Image
                                </h3>
                                <p className="text-sm text-zinc-500 font-medium">
                                    PNG, JPG or Paste from Clipboard
                                </p>
                            </div>
                        ) : (
                            <div className="min-h-[450px] lg:h-full rounded-2xl overflow-hidden bg-[#0a0a0a] border border-zinc-800 relative group">
                                {generatedResult && generatedResult.imageData ? (
                                    <BeforeAfterSlider
                                        beforeImage={uploadedImage}
                                        afterImage={`data:${generatedResult.mimeType || 'image/png'};base64,${generatedResult.imageData}`}
                                    />
                                ) : (
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={uploadedImage}
                                            alt="Uploaded image"
                                            fill
                                            className="object-contain p-6"
                                        />

                                        {/* Scanning Animation for Generation */}
                                        {isGenerating && (
                                            <div className="absolute inset-0 z-50 pointer-events-none">
                                                {/* Cyber Grid Pattern */}
                                                <div className="absolute inset-0 scanner-grid opacity-30 animate-scanning-glow" />

                                                {/* Scanning Line with Glow and Particles */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4FF00]/5 to-transparent overflow-hidden">
                                                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4FF00] shadow-[0_0_25px_#D4FF00] animate-scan">
                                                        {/* Particle heads on the scan line */}
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]" />
                                                        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/60 shadow-[0_0_8px_#fff]" />
                                                    </div>
                                                </div>

                                                {/* Scanning HUD labels */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="px-5 py-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-[#D4FF00]/30 shadow-[0_0_40px_rgba(212,255,0,0.15)] animate-pulse">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-[#D4FF00] animate-ping" />
                                                            <span className="text-xs font-black text-white uppercase tracking-[0.2em] italic">
                                                                Analyzing Mesh <span className="text-[#D4FF00]">...</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Top Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 z-40 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                    {generatedResult && generatedResult.imageData && (
                                        <>
                                            <button
                                                onClick={() => setExpandedImage(generatedResult)}
                                                className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all border border-white/5"
                                            >
                                                <Maximize2 className="w-4 h-4 text-white" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(generatedResult)}
                                                className="p-2.5 rounded-xl bg-[#D4FF00] text-black hover:bg-[#eaff4d] transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={handleClearUpload}
                                        className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all border border-white/5"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {/* Angle Overlay for Result */}
                                {generatedResult && (
                                    <div className="absolute top-4 left-4 flex gap-2 z-40">
                                        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/5">
                                            <span className="text-[10px] font-black text-white/50 uppercase">R: </span>
                                            <span className="text-[10px] font-black text-[#D4FF00]">{generatedResult.angle.rotation}°</span>
                                        </div>
                                        <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/5">
                                            <span className="text-[10px] font-black text-white/50 uppercase">T: </span>
                                            <span className="text-[10px] font-black text-[#D4FF00]">{generatedResult.angle.tilt}°</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: 3D Cube + Interaction */}
                    <div className="flex flex-col gap-6">
                        {/* 3D Cube Preview Area - Made even smaller */}
                        <div className="w-full md:w-[65%] aspect-square mx-auto relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-zinc-800/50">
                            <AnglesCube
                                rotation={rotation}
                                tilt={tilt}
                                zoom={zoom}
                                onAngleChange={handleAngleChange}
                                onFrontFaceClick={!uploadedImage ? handleButtonClick : undefined}
                            />

                            {/* Reset Button */}
                            <button
                                onClick={handleReset}
                                className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 hover:bg-black/60 transition-all group pointer-events-auto"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#D4FF00] transition-colors" />
                                <span className="text-[10px] font-black text-zinc-400 group-hover:text-white uppercase tracking-wider">Reset</span>
                            </button>

                            {/* Rotation Indicator */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 px-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 pointer-events-none">
                                <Rotate3D className="w-3.5 h-3.5 text-[#D4FF00]" />
                                <span className="text-[10px] font-black text-white uppercase tracking-wider">3D Preview</span>
                            </div>
                        </div>

                        {/* Interactive Sliders (Manual Controls) */}
                        <div className="flex flex-col gap-3">
                            <AngleSlider
                                label="Rotation"
                                value={rotation}
                                min={-180}
                                max={180}
                                step={1}
                                suffix="°"
                                onChange={setRotation}
                            />
                            <AngleSlider
                                label="Tilt"
                                value={tilt}
                                min={-90}
                                max={90}
                                step={1}
                                suffix="°"
                                onChange={setTilt}
                            />
                            <AngleSlider
                                label="Zoom"
                                value={zoom}
                                min={-50}
                                max={50}
                                step={1}
                                suffix=""
                                onChange={setZoom}
                            />
                        </div>
                    </div>
                </div>

                {/* Generated Result section removed - integrated into slider above */}
            </div>

            {/* Bottom Generate Section */}
            <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-8 md:pt-12 pb-6 md:pb-8 px-4 md:px-8 z-40">
                <div className="max-w-4xl mx-auto flex flex-col gap-5">
                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !uploadedImage}
                        className={`
                            group relative overflow-hidden w-full flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest italic
                            transition-all duration-500 transform active:scale-[0.98]
                            ${isGenerating || !uploadedImage
                                ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
                                : 'bg-[#D4FF00] text-black hover:scale-[1.01] hover:shadow-[0_0_60px_rgba(212,255,0,0.4)]'}
                        `}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span className="relative z-10">Processing Angle...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 fill-current transition-transform group-hover:rotate-12" />
                                <span className="relative z-10">Generate Visual</span>
                            </>
                        )}
                        {/* Hover Gradient Shine */}
                        {!isGenerating && uploadedImage && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        )}
                    </button>

                    {/* Options Toggle */}
                    <div className="flex justify-center">
                        <label className="flex items-center gap-3 cursor-pointer group px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
                            <input
                                type="checkbox"
                                checked={generateAllAngles}
                                onChange={(e) => setGenerateAllAngles(e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-[#D4FF00] focus:ring-[#D4FF00] focus:ring-offset-0 transition-all"
                            />
                            <span className="text-[11px] font-black text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase tracking-widest">
                                Batch Process All Angles
                            </span>
                            <div className="relative group/tooltip">
                                <Info className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Modal remains the same */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 transition-opacity duration-300"
                    onClick={() => setExpandedImage(null)}
                >
                    <button
                        className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                        onClick={() => setExpandedImage(null)}
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="relative max-w-5xl max-h-[85vh] w-full h-full transform transition-all duration-500 scale-100">
                        {expandedImage.imageData ? (
                            <Image
                                src={`data:${expandedImage.mimeType || 'image/png'};base64,${expandedImage.imageData}`}
                                alt="Expanded view"
                                fill
                                className="object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] rounded-3xl border border-white/5">
                                <span className="text-zinc-600 font-bold uppercase tracking-widest">Preview Mode</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
