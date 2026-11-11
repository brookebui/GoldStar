import { cn } from "@/lib/utils";
import starLogo from "@/assets/gold-star-logo.png";
export function StarAvatar({ className }: { className?: string }) {
  return <img src={starLogo} alt="Happy glowing Gold Star" width={1024} height={1024} className={cn("star-avatar size-14 object-contain", className)} />;
}
export function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4 fill-gold", className)} aria-hidden>
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
    </svg>
  );
}
