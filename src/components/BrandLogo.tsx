import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string | number;
  showText?: boolean;
  textSubtitle?: string;
  className?: string;
  lang?: 'ar' | 'en' | string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  textSubtitle,
  className = '',
  lang = 'ar',
}) => {
  const sizeMap: Record<string, { box: string; icon: string; text: string; sub: string }> = {
    xs: { box: 'w-5 h-5', icon: 'w-3 h-3', text: 'text-sm', sub: 'text-[8px]' },
    sm: { box: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-11 h-11', icon: 'w-6 h-6', text: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-14 h-14', icon: 'w-8 h-8', text: 'text-2xl', sub: 'text-xs' },
  };

  const key = String(size);
  const currentSize = sizeMap[key] || sizeMap['md'];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Mark: Integrates 'M' loop (الكلمة), Ascending Trajectory Path (المعنى), and Creative Playhead/Milestone (العمل) */}
      <div
        className={`${currentSize.box} rounded-xl bg-gradient-to-br from-[#27201D] to-[#1B1B20] border border-[#E06D28]/40 shadow-sm shadow-[#E06D28]/20 flex items-center justify-center shrink-0 relative group overflow-hidden`}
        title={lang === 'ar' ? 'مسار - الكلمة، المعنى، والعمل' : 'MASAR - Word, Meaning & Action'}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[#E06D28]/10 group-hover:bg-[#E06D28]/20 transition-colors" />

        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${currentSize.icon} relative z-10`}
        >
          <defs>
            {/* Terracotta / Orange Gradient */}
            <linearGradient id="masarGradient" x1="4" y1="32" x2="32" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#E06D28" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>

            {/* Glowing Accent */}
            <linearGradient id="masarPlay" x1="18" y1="8" x2="32" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FED7AA" />
            </linearGradient>
          </defs>

          {/* 1. Base Loop of Letter 'م' (الكلمة - مسار) */}
          <circle
            cx="11"
            cy="24"
            r="4.5"
            stroke="url(#masarGradient)"
            strokeWidth="2.5"
            className="transition-all"
          />

          {/* 2. Ascending Trajectory Track (المعنى - مسار النمو والارتقاء من التجربة إلى التثبيت) */}
          <path
            d="M 13.5 20.5 C 15.5 14.5, 20 12, 28 10"
            stroke="url(#masarGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 3. Milestone Node (محطة التقييم الأسبوعي) */}
          <circle
            cx="19"
            cy="15"
            r="1.75"
            fill="#FB923C"
          />

          {/* 4. Creative Playhead / Arrow Vertex at Apex (العمل - إنتاج الفيديو، المونتاج، والانطلاق للأمام) */}
          <path
            d="M 27 6.5 L 32 10 L 26 13.5 Z"
            fill="url(#masarPlay)"
            className="filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          />
        </svg>
      </div>

      {/* Brand Text if requested */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-[#FFFFFF] ${currentSize.text} leading-none`}>
              {lang === 'ar' ? 'مسار' : 'MASAR'}
            </span>
          </div>
          {textSubtitle && (
            <span className={`text-[#9CA3AF] ${currentSize.sub} font-medium mt-0.5 leading-none`}>
              {textSubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
