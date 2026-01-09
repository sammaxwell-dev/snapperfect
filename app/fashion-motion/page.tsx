'use client';

import { useState, useRef, useCallback } from 'react';
import {
    Shirt,
    Upload,
    X,
    Loader2,
    Download,
    Play,
    Pause,
    RotateCcw,
    Sparkles,
    Monitor,
    Smartphone,
    Clock
} from 'lucide-react';
import Image from 'next/image';

// Aspect ratio options
const ASPECT_RATIOS = [
    { id: '9:16', label: '9:16', description: 'Reels / Stories', icon: Smartphone },
    { id: '16:9', label: '16:9', description: 'Web / Desktop', icon: Monitor },
];

// Duration options
const DURATIONS = [
    { id: 4, label: '4s', description: 'Quick Preview' },
    { id: 6, label: '6s', description: 'Standard' },
    { id: 8, label: '8s', description: 'Extended' },
];

interface GenerationState {
    status: 'idle' | 'uploading' | 'generating' | 'completed' | 'error';
    message?: string;
    progress?: number;
}

export default function FashionMotionPage() {
    // Image upload state
    const [uploadedImage, setUploadedImage] = useState<{
        data: string;
        mimeType: string;
        preview: string;
    } | null>(null);

    // Generation config
    const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
    const [duration, setDuration] = useState<4 | 6 | 8>(6);

    // Generation state
    const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });

    // Generated video
    const [generatedVideo, setGeneratedVideo] = useState<{
        data: string;
        mimeType: string;
    } | null>(null);

    // Video player state
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Demo mode flag
    const [isDemo, setIsDemo] = useState(false);

    // Handle file selection
    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            setGenerationState({ status: 'error', message: 'Please upload an image file (JPEG or PNG)' });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setGenerationState({ status: 'error', message: 'Image must be less than 10MB' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            // Extract base64 data without the data URL prefix
            const base64Data = result.split(',')[1];

            setUploadedImage({
                data: base64Data,
                mimeType: file.type,
                preview: result,
            });
            setGenerationState({ status: 'idle' });
            setGeneratedVideo(null);
        };
        reader.readAsDataURL(file);
    }, []);

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    // Handle file input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    // Remove uploaded image
    const handleRemoveImage = useCallback(() => {
        setUploadedImage(null);
        setGeneratedVideo(null);
        setGenerationState({ status: 'idle' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    // Generate video
    const handleGenerate = async () => {
        if (!uploadedImage) return;

        setGenerationState({ status: 'generating', message: 'Starting video generation...' });
        setGeneratedVideo(null);

        try {
            const response = await fetch('/api/fashion-motion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageData: uploadedImage.data,
                    mimeType: uploadedImage.mimeType,
                    aspectRatio,
                    durationSeconds: duration,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            if (data.demo) {
                setIsDemo(true);
                setGenerationState({
                    status: 'idle',
                    message: 'Demo mode: Add GEMINI_API_KEY to generate real videos'
                });
                return;
            }

            if (data.videoData) {
                setGeneratedVideo({
                    data: data.videoData,
                    mimeType: data.mimeType || 'video/mp4',
                });
                setGenerationState({ status: 'completed' });
            } else {
                throw new Error('No video data received');
            }
        } catch (error) {
            setGenerationState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Something went wrong',
            });
        }
    };

    // Video controls
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
    };

    const restartVideo = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    // Download video
    const handleDownload = () => {
        if (!generatedVideo) return;

        const link = document.createElement('a');
        link.href = `data:${generatedVideo.mimeType};base64,${generatedVideo.data}`;
        link.download = `fashion-motion-${Date.now()}.mp4`;
        link.click();
    };

    // Reset everything
    const handleReset = () => {
        handleRemoveImage();
        setIsDemo(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white">
            {/* Header */}
            <div className="border-b border-white/5 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4FF00]/10 flex items-center justify-center">
                        <Shirt className="w-5 h-5 text-[#D4FF00]" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-wide">Fashion Motion</h1>
                        <p className="text-xs text-zinc-500">Transform clothing photos into dynamic e-commerce videos</p>
                    </div>
                </div>
            </div>

            {/* Demo Mode Banner */}
            {isDemo && (
                <div className="mx-6 mt-6 p-4 rounded-xl bg-gradient-to-r from-[#D4FF00]/10 to-[#FF0099]/10 border border-[#D4FF00]/30">
                    <p className="text-sm text-zinc-300">
                        <span className="font-bold text-[#D4FF00]">Demo Mode:</span> Add your GEMINI_API_KEY to .env to generate real videos
                    </p>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Upload & Controls */}
                        <div className="space-y-6">
                            {/* Upload Zone */}
                            <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/5">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                        Upload Image
                                    </span>
                                </div>

                                {!uploadedImage ? (
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors min-h-[300px]"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-zinc-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-white mb-1">
                                                Drop your image here
                                            </p>
                                            <p className="text-xs text-zinc-600">
                                                or click to browse • JPEG, PNG • Max 10MB
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative p-4">
                                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#121212]">
                                            <Image
                                                src={uploadedImage.preview}
                                                alt="Uploaded image"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute top-6 right-6 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleInputChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Generation Controls */}
                            <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/5">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                        Generation Settings
                                    </span>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Aspect Ratio */}
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 mb-2 block">
                                            Aspect Ratio
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ASPECT_RATIOS.map((ratio) => {
                                                const Icon = ratio.icon;
                                                const isActive = aspectRatio === ratio.id;
                                                return (
                                                    <button
                                                        key={ratio.id}
                                                        onClick={() => setAspectRatio(ratio.id as '9:16' | '16:9')}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive
                                                                ? 'border-[#D4FF00]/50 bg-[#D4FF00]/5'
                                                                : 'border-white/5 hover:border-white/10'
                                                            }`}
                                                    >
                                                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4FF00]' : 'text-zinc-600'}`} />
                                                        <div className="text-left">
                                                            <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                                                                {ratio.label}
                                                            </div>
                                                            <div className="text-[10px] text-zinc-600">
                                                                {ratio.description}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 mb-2 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            Duration
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {DURATIONS.map((d) => {
                                                const isActive = duration === d.id;
                                                return (
                                                    <button
                                                        key={d.id}
                                                        onClick={() => setDuration(d.id as 4 | 6 | 8)}
                                                        className={`p-3 rounded-xl border transition-all text-center ${isActive
                                                                ? 'border-[#D4FF00]/50 bg-[#D4FF00]/5'
                                                                : 'border-white/5 hover:border-white/10'
                                                            }`}
                                                    >
                                                        <div className={`text-sm font-black ${isActive ? 'text-[#D4FF00]' : 'text-white'}`}>
                                                            {d.label}
                                                        </div>
                                                        <div className="text-[10px] text-zinc-600">
                                                            {d.description}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Generate Button */}
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!uploadedImage || generationState.status === 'generating'}
                                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${!uploadedImage || generationState.status === 'generating'
                                                ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                                                : 'bg-[#D4FF00] text-black hover:bg-[#eaff4d] hover:shadow-[0_0_30px_rgba(212,255,0,0.4)]'
                                            }`}
                                    >
                                        {generationState.status === 'generating' ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Generating Video...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Generate Motion Video
                                            </>
                                        )}
                                    </button>

                                    {/* Status Message */}
                                    {generationState.message && (
                                        <div className={`p-3 rounded-xl text-xs font-medium ${generationState.status === 'error'
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                : 'bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/20'
                                            }`}>
                                            {generationState.message}
                                        </div>
                                    )}

                                    {/* Generation Info */}
                                    {generationState.status === 'generating' && (
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-[#D4FF00]/5 to-[#FF0099]/5 border border-white/5">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse shadow-[0_0_8px_#D4FF00]" />
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                                    Processing
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500">
                                                Video generation typically takes 30-90 seconds. Please wait while Veo 3.1 creates your fashion video...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Video Preview */}
                        <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                    Video Preview
                                </span>
                                {generatedVideo && (
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4FF00] hover:bg-[#eaff4d] transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5 text-black" />
                                        <span className="text-[10px] font-black text-black uppercase">Download</span>
                                    </button>
                                )}
                            </div>

                            <div className="p-4">
                                {generatedVideo ? (
                                    <div className="relative">
                                        <div className={`relative rounded-xl overflow-hidden bg-black ${aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'
                                            }`}>
                                            <video
                                                ref={videoRef}
                                                src={`data:${generatedVideo.mimeType};base64,${generatedVideo.data}`}
                                                className="w-full h-full object-contain"
                                                onEnded={handleVideoEnded}
                                                playsInline
                                                muted
                                            />

                                            {/* Video Controls Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={restartVideo}
                                                        className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                                                    >
                                                        <RotateCcw className="w-5 h-5 text-white" />
                                                    </button>
                                                    <button
                                                        onClick={togglePlayPause}
                                                        className="p-4 rounded-full bg-[#D4FF00] hover:bg-[#eaff4d] transition-colors"
                                                    >
                                                        {isPlaying ? (
                                                            <Pause className="w-6 h-6 text-black" />
                                                        ) : (
                                                            <Play className="w-6 h-6 text-black ml-0.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Video Meta */}
                                        <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-600 uppercase tracking-wider">
                                            <span>Format: MP4</span>
                                            <span>Aspect: {aspectRatio}</span>
                                            <span>Duration: {duration}s</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`flex flex-col items-center justify-center rounded-xl bg-[#0d0d0d] border border-dashed border-white/5 ${aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'
                                        }`}>
                                        {generationState.status === 'generating' ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-16 h-16 rounded-full border-2 border-[#D4FF00]/20" />
                                                    <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-[#D4FF00] border-t-transparent animate-spin" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-bold text-white mb-1">Creating Your Video</p>
                                                    <p className="text-[10px] text-zinc-600">This may take 30-90 seconds</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-center p-6">
                                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                                    <Play className="w-5 h-5 text-zinc-700" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-zinc-500 mb-1">No Video Yet</p>
                                                    <p className="text-[10px] text-zinc-700">
                                                        Upload an image and generate to preview
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
