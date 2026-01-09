import { vscode, getImageUri } from "@/lib/vscode";
import { useEffect, useState } from "react";

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export function AdaptiveImage({
  src,
  alt,
  className,
  fallbackSrc,
}: AdaptiveImageProps) {
  const [actualSrc, setActualSrc] = useState<string>("");

  useEffect(() => {
    if (vscode.isInVSCode()) {
      setActualSrc(getImageUri(src));
    } else {
      setActualSrc(src);
    }
  }, [src]);

  return (
    <img
      src={actualSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (fallbackSrc) {
          setActualSrc(fallbackSrc);
        }
      }}
    />
  );
}
