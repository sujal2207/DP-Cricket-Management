import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TOURNAMENT_LOGO_PATH } from "@/lib/constants";

export type AppLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeConfig: Record<
  AppLogoSize,
  { className: string; width: number; height: number }
> = {
  xs: { className: "h-8 w-8", width: 32, height: 32 },
  sm: { className: "h-12 w-12", width: 48, height: 48 },
  md: { className: "h-20 w-20 sm:h-24 sm:w-24", width: 96, height: 96 },
  lg: {
    className: "h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44",
    width: 176,
    height: 176,
  },
  xl: {
    className: "h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56",
    width: 224,
    height: 224,
  },
};

interface AppLogoProps {
  size?: AppLogoSize;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  showFrame?: boolean;
  href?: string;
}

export function AppLogo({
  size = "md",
  className,
  imageClassName,
  priority = false,
  showFrame = true,
  href,
}: AppLogoProps) {
  const config = sizeConfig[size];

  const logo = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        showFrame &&
          "rounded-xl bg-[#1a0033] shadow-lg shadow-purple-950/30 ring-1 ring-amber-400/25",
        config.className,
        className
      )}
    >
      <Image
        src={TOURNAMENT_LOGO_PATH}
        alt="DP Cricket Tournament"
        width={config.width}
        height={config.height}
        className={cn("h-full w-full object-cover", imageClassName)}
        priority={priority}
        sizes={`(max-width: 640px) ${Math.min(config.width, 128)}px, ${config.width}px`}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label="DP Cricket Tournament home">
        {logo}
      </Link>
    );
  }

  return logo;
}

/** @deprecated Use AppLogo — kept for existing imports */
export function TournamentLogo({
  size = "md",
  className,
  priority = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}) {
  return (
    <AppLogo
      size={size}
      className={className}
      priority={priority}
      showFrame
    />
  );
}
