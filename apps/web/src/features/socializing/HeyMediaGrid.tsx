import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export interface HeyMediaGridProps {
  mediaUrls: string[];
  alt?: string;
}

export const HeyMediaGrid: React.FC<HeyMediaGridProps> = ({ mediaUrls, alt = "Post media" }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const count = mediaUrls.length;

  const openLightbox = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex(idx);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + count) % count);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % count);
    }
  };

  return (
    <>
      <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/40 select-none">
        {/* 1 Photo Layout: Full Hero Card */}
        {count === 1 && (
          <div
            onClick={(e) => openLightbox(0, e)}
            className="group relative cursor-pointer overflow-hidden max-h-[460px] bg-slate-900 flex items-center justify-center"
          >
            <img
              src={mediaUrls[0]}
              alt={alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-slate-950/60 backdrop-blur-md text-white border border-white/20">
                <Maximize2 className="w-4 h-4" />
              </span>
            </div>
          </div>
        )}

        {/* 2 Photos Layout: 50 / 50 Side-by-Side Split */}
        {count === 2 && (
          <div className="grid grid-cols-2 gap-1.5 h-64 sm:h-72">
            {mediaUrls.slice(0, 2).map((url, idx) => (
              <div
                key={idx}
                onClick={(e) => openLightbox(idx, e)}
                className="group relative cursor-pointer overflow-hidden bg-slate-900"
              >
                <img
                  src={url}
                  alt={`${alt} ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        )}

        {/* 3 Photos Layout: 1 Hero Left (2/3 width) + 2 Stacked Right */}
        {count === 3 && (
          <div className="grid grid-cols-3 gap-1.5 h-72 sm:h-80">
            <div
              onClick={(e) => openLightbox(0, e)}
              className="col-span-2 group relative cursor-pointer overflow-hidden bg-slate-900"
            >
              <img
                src={mediaUrls[0]}
                alt={`${alt} 1`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>

            <div className="col-span-1 grid grid-rows-2 gap-1.5 h-full">
              {mediaUrls.slice(1, 3).map((url, idx) => (
                <div
                  key={idx + 1}
                  onClick={(e) => openLightbox(idx + 1, e)}
                  className="group relative cursor-pointer overflow-hidden bg-slate-900"
                >
                  <img
                    src={url}
                    alt={`${alt} ${idx + 2}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4+ Photos Layout: 2x2 Grid with +N Overlay on Last Tile */}
        {count >= 4 && (
          <div className="grid grid-cols-2 gap-1.5 h-72 sm:h-80">
            {mediaUrls.slice(0, 4).map((url, idx) => {
              const isLast = idx === 3;
              const remaining = count - 4;
              return (
                <div
                  key={idx}
                  onClick={(e) => openLightbox(idx, e)}
                  className="group relative cursor-pointer overflow-hidden bg-slate-900"
                >
                  <img
                    src={url}
                    alt={`${alt} ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  {isLast && remaining > 0 ? (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <span className="text-2xl font-extrabold tracking-tight">+{remaining}</span>
                      <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">More photos</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-Screen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-150"
        >
          {/* Top Bar Controls */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 left-4 right-4 flex items-center justify-between z-10"
          >
            <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-200">
              {lightboxIndex + 1} / {count}
            </div>

            <button
              onClick={closeLightbox}
              className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Close image viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Previous Button */}
          {count > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 transition-colors z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main Image View */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
          >
            <img
              src={mediaUrls[lightboxIndex]}
              alt={`${alt} full view`}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>

          {/* Next Button */}
          {count > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 transition-colors z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
};
