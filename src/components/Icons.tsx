import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { filled?: boolean };

const base = "w-6 h-6";

export const HomeIcon = ({ filled, className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z" />
  </svg>
);

export const SearchIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const CompassIcon = ({ filled, className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5.5-5.5 2 2-5.5 5.5-2Z" />
  </svg>
);

export const ReelsIcon = ({ filled, className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M3 9h18M9 3l3 6M15 3l3 6" />
    <path d="m10 13 5 3-5 3v-6Z" fill="currentColor" stroke="none" />
  </svg>
);

export const PlusSquareIcon = ({ filled, className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const HeartIcon = ({ filled, className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M12 20s-7-4.35-9.33-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.33 11C19 15.65 12 20 12 20Z" />
  </svg>
);

export const CommentIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.5-5.4A8.5 8.5 0 1 1 21 12Z" />
  </svg>
);

export const ShareIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M22 2 11 13" />
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
  </svg>
);

export const BookmarkIcon = ({ filled, className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M6 3h12v18l-6-4-6 4V3Z" />
  </svg>
);

export const MenuIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const MoreIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? base} {...p}>
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);

export const MusicIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const MuteIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="m22 9-6 6M16 9l6 6" />
  </svg>
);

export const UnmuteIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />
  </svg>
);

export const GridIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

export const PlayIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? base} {...p}>
    <path d="M6 4v16l14-8L6 4Z" />
  </svg>
);

export const CloseIcon = ({ className, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className ?? base} {...p}>
    <path d="M6 6 18 18M18 6 6 18" />
  </svg>
);

export const VerifiedIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className ?? "w-4 h-4"}>
    <path
      fill="#3897f0"
      d="m23 12-2.4-2.8.3-3.7-3.6-.8-1.9-3.2L12 3 8.6 1.5 6.7 4.7l-3.6.8.3 3.7L1 12l2.4 2.8-.3 3.7 3.6.8 1.9 3.2L12 21l3.4 1.5 1.9-3.2 3.6-.8-.3-3.7L23 12Z"
    />
    <path fill="#fff" d="m10.6 15.6-3-3 1.4-1.4 1.6 1.6 4-4 1.4 1.4-5.4 5.4Z" />
  </svg>
);
