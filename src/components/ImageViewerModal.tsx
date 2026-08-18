import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';

interface ImageViewerModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  title?: string;
  lang?: 'ar' | 'en';
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  title,
  lang = 'ar'
}) => {
  const isAr = lang === 'ar';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        if (isAr) {
          if (currentIndex > 0) onNavigate(currentIndex - 1);
        } else {
          if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
        }
      }
      if (e.key === 'ArrowLeft') {
        if (isAr) {
          if (currentIndex < images.length - 1) onNavigate(currentIndex + 1);
        } else {
          if (currentIndex > 0) onNavigate(currentIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate, isAr]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `masar-report-attachment-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Top action bar */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between text-white z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#17181D]/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#2D3039] pointer-events-auto">
          <span className="text-xs font-bold text-[#FB923C]">{title || (isAr ? 'معاينة المرفق' : 'Image Preview')}</span>
          {images.length > 1 && (
            <span className="text-xs text-[#9CA3AF] font-mono">
              ({currentIndex + 1} / {images.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl bg-[#17181D]/80 hover:bg-[#262831] border border-[#2D3039] text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            title={isAr ? 'تحميل الصورة' : 'Download Image'}
          >
            <Download className="w-4 h-4 stroke-[1.75]" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#17181D]/80 hover:bg-[#262831] border border-[#2D3039] text-[#9CA3AF] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="relative max-w-5xl max-h-[82vh] w-full flex items-center justify-center select-none">
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
            className="absolute left-2 rtl:left-auto rtl:right-2 z-10 p-2.5 rounded-full bg-[#17181D]/80 hover:bg-[#E06D28] border border-[#2D3039] text-white transition-all cursor-pointer shadow-lg hover:scale-105"
            title={isAr ? 'السابق' : 'Previous'}
          >
            {isAr ? <ChevronRight className="w-5 h-5 stroke-[2]" /> : <ChevronLeft className="w-5 h-5 stroke-[2]" />}
          </button>
        )}

        <img
          src={currentImage}
          alt={`Attached report preview ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-[#2D3039]"
        />

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
            className="absolute right-2 rtl:right-auto rtl:left-2 z-10 p-2.5 rounded-full bg-[#17181D]/80 hover:bg-[#E06D28] border border-[#2D3039] text-white transition-all cursor-pointer shadow-lg hover:scale-105"
            title={isAr ? 'التالي' : 'Next'}
          >
            {isAr ? <ChevronLeft className="w-5 h-5 stroke-[2]" /> : <ChevronRight className="w-5 h-5 stroke-[2]" />}
          </button>
        )}
      </div>

      {/* Bottom thumbnails strip if multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-2 z-20 pointer-events-auto overflow-x-auto py-1">
          <div className="flex items-center gap-2 bg-[#17181D]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#2D3039]">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigate(idx)}
                className={`w-11 h-11 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'border-[#E06D28] scale-105 shadow-md shadow-[#E06D28]/30'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
