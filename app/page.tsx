import Link from "next/link";
import Image from "next/image";
import { SunMedium, Box, Maximize, Sparkles, ArrowRight, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="p-8 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="w-full rounded-3xl bg-[#121212] relative overflow-hidden mb-12 border border-white/5">
        {/* Neon Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#D4FF00]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#FF0099]/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 py-16 px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4FF00] text-black text-xs font-bold mb-6">
            <span className="bg-black text-[#D4FF00] px-1.5 rounded text-[10px]">NEW</span> <span>AI GENERATION 2.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight italic">
            Transform Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4FF00] to-[#FF0099]">Visuals</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-12 max-w-xl">
            Unlock Unlimited Generations, newest features, and the capacity you need to create without limits.
          </p>

          <div className="flex gap-4 flex-wrap justify-center">
            <QuickAction icon={SunMedium} label="RELIGHT" />
            <QuickAction icon={Box} label="ANGLES" />
            <QuickAction icon={Maximize} label="UPSCALER" />
            <QuickAction icon={Sparkles} label="MORE" />
          </div>
        </div>
      </div>

      {/* Featured Guides */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-[#D4FF00] block"></span> FEATURED GUIDES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GuideCard
            image="/assets/guide-sneakers.png"
            tag="How To Use"
            tagColor="bg-[#FF0099] text-white"
            title="E-COMMERCE LIGHTING"
            subtitle="Master lighting for shoes"
          />
          <GuideCard
            image="/assets/guide-upscale.png"
            tag="Using"
            tagColor="bg-[#D4FF00] text-black"
            title="UPSCALING GOODS"
            subtitle="Enhance jewelry details"
          />
          {/* ... other cards would follow same pattern, ensuring we update them if I could replace all lines ... */}
          <GuideCard
            image="/assets/guide-sneakers.png"
            tag="Creating"
            tagColor="bg-cyan-400 text-black"
            title="PRODUCT ANGLES"
            subtitle="Generate multiple views"
          />
          <div className="rounded-xl overflow-hidden relative group cursor-pointer aspect-[4/3] bg-[#09090b] border border-[#27272a] hover:border-[#D4FF00] transition-colors">
            <Image
              src="/assets/gallery-tech.png"
              alt="More"
              fill
              className="object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold flex items-center gap-2 uppercase text-sm tracking-wider">
                View All <ArrowRight className="w-4 h-4 text-[#D4FF00]" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Creations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-[#FF0099] block"></span> COMMUNITY
          </h2>
          {/* Simple Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <FilterButton active label="Trending" />
            <FilterButton label="Relight" />
            <FilterButton label="Angles" />
            <FilterButton label="Upscaler" />
            <FilterButton label="All" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GalleryItem src="/assets/gallery-tech.png" span="col-span-1 md:col-span-2 row-span-2" />
          <GalleryItem src="/assets/guide-sneakers.png" />
          <GalleryItem src="/assets/guide-upscale.png" />
          <GalleryItem src="/assets/guide-upscale.png" />
          <GalleryItem src="/assets/gallery-tech.png" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex flex-col items-center gap-3 group">
      <div className="w-16 h-16 rounded-xl bg-[#09090b] border border-[#27272a] flex items-center justify-center group-hover:border-[#D4FF00] group-hover:bg-[#D4FF00] transition-all duration-200">
        <Icon className="w-6 h-6 text-white group-hover:text-black transition-colors" />
      </div>
      <span className="text-xs font-bold text-zinc-500 group-hover:text-white transition-colors tracking-wider">{label}</span>
    </button>
  );
}

function GuideCard({ image, tag, tagColor, title, subtitle }: { image: string, tag: string, tagColor: string, title: string, subtitle: string }) {
  return (
    <div className="rounded-xl overflow-hidden bg-[#09090b] border border-[#27272a] group hover:border-[#FF0099] transition-all duration-200">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-lg ${tagColor}`}>
          {tag}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-1">{title}</h3>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div >
  );
}

function FilterButton({ label, active, icon }: { label: string, active?: boolean, icon?: string }) {
  return (
    <button className={`
      px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
      ${active
        ? 'bg-[#D4FF00] text-black border border-[#D4FF00]'
        : 'bg-[#09090b] text-zinc-500 hover:text-white border border-[#27272a] hover:border-zinc-500'}
    `}>
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
}

function GalleryItem({ src, span = "" }: { src: string, span?: string }) {
  return (
    <div className={`relative rounded-xl overflow-hidden group min-h-[200px] border border-white/5 bg-[#12121a] ${span}`}>
      <Image
        src={src}
        alt="Gallery Item"
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="flex gap-2">
            <div className="px-2 py-1 rounded bg-white/20 backdrop-blur-sm text-xs text-white">Relight</div>
          </div>
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors text-white">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
