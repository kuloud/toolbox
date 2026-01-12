import { getImageUri } from "@/lib/utils/image";
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
    const imageUri = getImageUri(src);
    console.log("--->", { imageUri });
    setActualSrc(imageUri);
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
