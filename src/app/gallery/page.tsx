'use client';

import React, { useEffect, useState } from 'react';
import { HeaderNav } from '@/components/HeaderNav';
import { FooterSection } from '@/components/FooterSection';
import { getGalleryImages, getSiteSettings, GalleryImage, SiteSettings } from '@/lib/cmsService';
import { Image as ImageIcon, X, Maximize2 } from 'lucide-react';

export default function PublicGalleryPage() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [images, stg] = await Promise.all([
      getGalleryImages(true),
      getSiteSettings(),
    ]);
    setGallery(images);
    setSettings(stg);
    setIsLoading(false);
  };

  const categories = ['All', ...Array.from(new Set(gallery.map(g => g.category_en)))];
  const filtered = activeCategory === 'All' ? gallery : gallery.filter(g => g.category_en === activeCategory);

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-100 flex flex-col justify-between">
      <HeaderNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 w-full flex-grow">
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
            <ImageIcon className="w-4 h-4" />
            <span>Event Photography</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
            Official Photo Gallery
          </h1>
          <p className="text-xs sm:text-sm text-emerald-300/80 leading-relaxed">
            High-resolution event highlights, programme performances, awards ceremonies, and behind-the-scenes moments from {settings?.event_name_en || 'Milad Fest 2K26'}.
          </p>
        </div>

        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-emerald-950 border-amber-500 shadow-md'
                    : 'bg-emerald-900/60 text-emerald-300 border-emerald-800 hover:bg-emerald-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-emerald-400/60 font-semibold text-xs">
            Loading photo gallery...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-emerald-900/30 border border-emerald-800 rounded-3xl p-12 text-center text-emerald-400/60 max-w-md mx-auto space-y-3">
            <ImageIcon className="w-12 h-12 text-emerald-700 mx-auto" />
            <h3 className="text-base font-bold text-emerald-200">No Gallery Photos Published Yet</h3>
            <p className="text-xs">Event photos will appear here as administrators publish them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="group bg-emerald-900/40 border border-emerald-800 rounded-3xl overflow-hidden shadow-xl cursor-pointer hover:border-amber-500/50 transition-all"
              >
                <div className="relative aspect-square overflow-hidden bg-emerald-900/60">
                  <img
                    src={img.image_url}
                    alt={img.title_en || 'Event Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-8 h-8 text-amber-400" />
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    {img.category_en}
                  </span>
                  <h3 className="text-xs font-bold text-emerald-100 line-clamp-1">
                    {img.title_en || 'Official Fest Photo'}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal Viewer */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative max-w-4xl w-full bg-emerald-950 border border-emerald-800 rounded-3xl overflow-hidden shadow-2xl space-y-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-emerald-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title_en || 'Gallery Image'}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>

              <div className="p-6 space-y-2">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  {selectedImage.category_en}
                </span>
                <h3 className="text-lg font-black text-emerald-100">
                  {selectedImage.title_en || 'Event Photo'}
                </h3>
                {selectedImage.caption && (
                  <p className="text-xs text-emerald-300/80 leading-relaxed">
                    {selectedImage.caption}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
