'use client';

import React, { useEffect, useState } from 'react';
import { getGalleryImages, GalleryImage } from '@/lib/cmsService';
import { Image as ImageIcon, X, Maximize2 } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    getGalleryImages(true).then((data) => {
      setImages(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || images.length === 0) {
    return null; // Automatically hide gallery section if no published images exist
  }

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-emerald-950 text-emerald-100 border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>Event Highlights</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-gold-gradient tracking-tight">
            Photo Gallery
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className="bg-emerald-900/40 border border-emerald-800 rounded-3xl overflow-hidden shadow-xl group cursor-pointer relative"
            >
              <img src={img.image_url} alt={img.title_en} className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-8 h-8 text-amber-400" />
              </div>
              <div className="p-4 bg-emerald-950/80 backdrop-blur-md border-t border-emerald-800/60">
                <h3 className="text-sm font-bold text-emerald-100">{img.title_en}</h3>
                {img.caption && <p className="text-xs text-emerald-300/80 mt-1">{img.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Image Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-emerald-900 text-amber-400 hover:text-white border border-emerald-700 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={selectedImage.image_url}
              alt={selectedImage.title_en}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl border-2 border-amber-500/50 shadow-2xl"
            />

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-amber-400">{selectedImage.title_en}</h3>
              {selectedImage.caption && <p className="text-xs text-emerald-200">{selectedImage.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
