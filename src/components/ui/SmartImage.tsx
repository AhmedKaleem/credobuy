"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Aspect wrapper class, e.g. "aspect-square". */
  ratio?: string;
  priority?: boolean;
}

/**
 * A lightweight image with a graceful loading state. Works with local
 * data-URI placeholders and remote Supabase Storage URLs alike (which is why
 * it uses a plain <img> rather than next/image and its remotePatterns config).
 */
export function SmartImage({
  src,
  alt,
  className,
  ratio = "aspect-square",
  priority,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-surface-muted", ratio)}>
      {!loaded && <div className="absolute inset-0 skeleton" aria-hidden />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}
