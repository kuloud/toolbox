import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import toast from "@/lib/toast";
import { vscode } from "@/lib/vscode";
import {
  CopyIcon,
  DownloadIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  ImageIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Supported image formats
const SUPPORTED_FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "webp", label: "WebP" },
  { value: "gif", label: "GIF" },
  { value: "bmp", label: "BMP" },
  { value: "avif", label: "AVIF" },
];

// Quality presets
const QUALITY_PRESETS = [
  { value: 0.1, label: "Low (10%)" },
  { value: 0.5, label: "Medium (50%)" },
  { value: 0.8, label: "High (80%)" },
  { value: 1, label: "Maximum (100%)" },
];

export function ImageFormatPage() {
  const [selectedFormat, setSelectedFormat] = useState<string>("png");
  const [quality, setQuality] = useState<number>(0.8);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [flipVertical, setFlipVertical] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string>("");
  const [convertedImageSize, setConvertedImageSize] = useState<number>(0);
  const [originalImageSize, setOriginalImageSize] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);
      setImageName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      setOriginalImageSize(file.size);

      // Reset transformations
      setRotation(0);
      setFlipHorizontal(false);
      setFlipVertical(false);

      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  // Handle image URL input
  const handleImageUrlInput = (url: string) => {
    if (!url.trim()) return;

    setImageUrl(url);
    setImageName("remote-image");
    setOriginalImageSize(0);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
    };
    img.onerror = () => {
      toast.error("Failed to load image from URL");
    };
    img.src = url;
  };

  // Process image
  const processImage = useCallback(async () => {
    if (!imageUrl || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();

      // Translate to center
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply flips
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);

      // Draw image
      ctx.drawImage(
        img,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height,
      );

      ctx.restore();

      // Convert to selected format
      let mimeType = "image/png";
      let qualityParam: number | undefined = undefined;

      switch (selectedFormat) {
        case "jpeg":
          mimeType = "image/jpeg";
          qualityParam = quality;
          break;
        case "webp":
          mimeType = "image/webp";
          qualityParam = quality;
          break;
        case "gif":
          mimeType = "image/gif";
          break;
        case "bmp":
          mimeType = "image/bmp";
          break;
        case "avif":
          mimeType = "image/avif";
          qualityParam = quality;
          break;
        default:
          mimeType = "image/png";
      }

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), mimeType, qualityParam);
      });

      if (blob) {
        if (vscode.isInVSCode()) {
          const base64Data = await blobToBase64(blob);
          setConvertedImageUrl(base64Data);
        } else {
          const url = URL.createObjectURL(blob);
          setConvertedImageUrl(url);
        }
        setConvertedImageSize(blob.size);
        // toast.success(`Image converted to ${selectedFormat.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  }, [
    imageUrl,
    selectedFormat,
    quality,
    width,
    height,
    rotation,
    flipHorizontal,
    flipVertical,
  ]);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Handle width change with aspect ratio
  const handleWidthChange = (value: number) => {
    setWidth(value);
    if (maintainAspectRatio && originalWidth > 0 && originalHeight > 0) {
      const newHeight = Math.round((value * originalHeight) / originalWidth);
      setHeight(newHeight);
    }
  };

  // Handle height change with aspect ratio
  const handleHeightChange = (value: number) => {
    setHeight(value);
    if (maintainAspectRatio && originalWidth > 0 && originalHeight > 0) {
      const newWidth = Math.round((value * originalWidth) / originalHeight);
      setWidth(newWidth);
    }
  };

  // Reset dimensions
  const resetDimensions = () => {
    setWidth(originalWidth);
    setHeight(originalHeight);
  };

  // Reset all transformations
  const resetTransformations = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
  };

  // Copy image to clipboard
  const copyToClipboard = async () => {
    if (!convertedImageUrl) return;

    try {
      // If running inside VS Code, delegate to the extension host for more
      // reliable handling of base64 data and to work around clipboard
      // limitations in the webview environment.
      if (vscode.isInVSCode()) {
        // If already a data URL, send it directly; otherwise convert to base64
        if (convertedImageUrl.startsWith("data:")) {
          vscode.postMessage({
            command: "copyImage",
            data: convertedImageUrl,
            name: `${imageName}.${selectedFormat}`,
          });
        } else {
          // Convert object URL / blob to base64 before sending
          const resp = await fetch(convertedImageUrl);
          const blob = await resp.blob();
          const base64 = await blobToBase64(blob);
          vscode.postMessage({
            command: "copyImage",
            data: base64,
            name: `${imageName}.${selectedFormat}`,
          });
        }

        toast.success("Image copy requested (VS Code)");
        return;
      }

      // Browser fallback: use the clipboard API with Blob/ClipboardItem
      if (convertedImageUrl.startsWith("data:")) {
        // Convert data URL to Blob
        const res = await fetch(convertedImageUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
      } else {
        const resp = await fetch(convertedImageUrl);
        const blob = await resp.blob();

        if (
          blob.type === "image/webp" ||
          blob.type === "image/jpeg" ||
          blob.type === "image/bmp"
        ) {
          const convertedBlob = await convertToSupportedImageFormat(blob);
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": convertedBlob }),
          ]);
        } else {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ]);
        }
      }

      toast.success("Image copied to clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Image copy failed!");
    }
  };

  const convertToSupportedImageFormat = async (
    webpBlob: Blob,
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context not available"));
            return;
          }

          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (pngBlob) => {
              if (pngBlob) {
                resolve(pngBlob);
              } else {
                reject(new Error("Failed to convert to PNG"));
              }
            },
            "image/png",
            1.0,
          );
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load WebP image for conversion"));
      };

      img.src = URL.createObjectURL(webpBlob);
    });
  };

  // Download image
  const downloadImage = async () => {
    if (!convertedImageUrl) return;

    // In VS Code we send the base64/data URL to the extension which can show
    // a save dialog and write the file using the extension API—this is more
    // reliable than trying to trigger a download from the webview.
    if (vscode.isInVSCode()) {
      if (convertedImageUrl.startsWith("data:")) {
        vscode.postMessage({
          command: "saveImage",
          data: convertedImageUrl,
          name: `${imageName}.${selectedFormat}`,
        });
      } else {
        const resp = await fetch(convertedImageUrl);
        const blob = await resp.blob();
        const base64 = await blobToBase64(blob);
        vscode.postMessage({
          command: "saveImage",
          data: base64,
          name: `${imageName}.${selectedFormat}`,
        });
      }

      toast.success("Save image requested (VS Code)");
      return;
    }

    const link = document.createElement("a");
    link.href = convertedImageUrl;
    link.download = `${imageName}.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all
  const clearAll = () => {
    setImageUrl("");
    setConvertedImageUrl("");
    setImageName("");
    setWidth(0);
    setHeight(0);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setOriginalImageSize(0);
    setConvertedImageSize(0);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Calculate size reduction
  const getSizeReduction = () => {
    if (!originalImageSize || !convertedImageSize) return null;
    const reduction =
      ((originalImageSize - convertedImageSize) / originalImageSize) * 100;
    return reduction > 0 ? reduction.toFixed(1) : "0.0";
  };

  useEffect(() => {
    if (!imageUrl) return;
    processImage();
  }, [
    imageUrl,
    selectedFormat,
    quality,
    width,
    height,
    rotation,
    flipHorizontal,
    flipVertical,
  ]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
          Image Format Converter
        </h1>
        <p className="text-lg text-muted-foreground">
          Convert images between different formats with editing options
        </p>
      </div>

      <Separator />

      {/* File Upload Section */}
      <div className="space-y-4">
        <h2 className="font-heading scroll-m-28 text-xl font-medium tracking-tight">
          Upload Image
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Upload from file */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Upload File</span>
              </div>
              {imageUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="h-8"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div
              className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium">
                {imageUrl ? imageName : "Click to upload image"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPEG, WebP, GIF, BMP, AVIF
              </p>
              {originalImageSize > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Original size: {formatFileSize(originalImageSize)}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Or enter URL */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UploadIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Or Enter Image URL</span>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleImageUrlInput(e.currentTarget.value);
                  }
                }}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const input = document.querySelector(
                    "input[placeholder*='example.com']",
                  ) as HTMLInputElement;
                  if (input?.value) {
                    handleImageUrlInput(input.value);
                  }
                }}
              >
                Load from URL
              </Button>
            </div>
          </div>
        </div>
      </div>

      {imageUrl && (
        <>
          <Separator />

          {/* Image Preview Section */}
          <div className="space-y-6">
            <h2 className="font-heading scroll-m-28 text-xl font-medium tracking-tight">
              Preview & Edit
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Original Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Original</span>
                  {originalImageSize > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(originalImageSize)}
                    </span>
                  )}
                </div>
                <div className="overflow-hidden rounded-lg border bg-muted/20">
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="h-auto max-h-64 w-full object-contain"
                    ref={imageRef}
                  />
                </div>
                {originalWidth > 0 && originalHeight > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {originalWidth} × {originalHeight}px
                  </p>
                )}
              </div>

              {/* Converted Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Converted ({selectedFormat.toUpperCase()})
                  </span>
                  {convertedImageSize > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(convertedImageSize)}
                      </span>
                      {originalImageSize > 0 && (
                        <span
                          className={`text-xs ${Number(getSizeReduction()) > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {getSizeReduction()}%{" "}
                          {Number(getSizeReduction()) > 0
                            ? "smaller"
                            : "larger"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden rounded-lg border bg-muted/20">
                  {convertedImageUrl ? (
                    <img
                      src={convertedImageUrl}
                      alt="Converted"
                      className="h-auto max-h-64 w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-muted-foreground">
                      Converted image will appear here
                    </div>
                  )}
                </div>
                {width > 0 && height > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {width} × {height}px
                  </p>
                )}
              </div>

              {/* Image Actions */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Transformations</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetTransformations}
                      disabled={
                        rotation === 0 && !flipHorizontal && !flipVertical
                      }
                    >
                      <RefreshCwIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setRotation(rotation - 90)}
                      className="w-full"
                    >
                      <RotateCcwIcon className="mr-2 h-4 w-4" />
                      90° Left
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setRotation(rotation + 90)}
                      className="w-full"
                    >
                      <RotateCwIcon className="mr-2 h-4 w-4" />
                      90° Right
                    </Button>
                    <Button
                      variant={flipHorizontal ? "default" : "outline"}
                      onClick={() => setFlipHorizontal(!flipHorizontal)}
                      className="w-full"
                    >
                      <FlipHorizontalIcon className="mr-2 h-4 w-4" />
                      Flip H
                    </Button>
                    <Button
                      variant={flipVertical ? "default" : "outline"}
                      onClick={() => setFlipVertical(!flipVertical)}
                      className="w-full"
                    >
                      <FlipVerticalIcon className="mr-2 h-4 w-4" />
                      Flip V
                    </Button>
                  </div>
                </div>

                {/* Converted Image Actions */}
                {convertedImageUrl && (
                  <div className="space-y-4">
                    <span className="text-sm font-medium">Export</span>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={copyToClipboard}
                        className="w-full"
                      >
                        <CopyIcon className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        variant="default"
                        onClick={downloadImage}
                        className="w-full"
                      >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Conversion Settings */}
          <div className="space-y-6">
            <h2 className="font-heading scroll-m-28 text-xl font-medium tracking-tight">
              Conversion Settings
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Format Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Output Format</label>
                <Select
                  value={selectedFormat}
                  onValueChange={setSelectedFormat}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Control */}
              {(selectedFormat === "jpeg" ||
                selectedFormat === "webp" ||
                selectedFormat === "avif") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Quality</label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <div className="space-y-4">
                    <Slider
                      value={[quality]}
                      onValueChange={([value]) => setQuality(value)}
                      min={0.1}
                      max={1}
                      step={0.05}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {QUALITY_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          variant="outline"
                          size="sm"
                          onClick={() => setQuality(preset.value)}
                          className={
                            quality === preset.value ? "border-primary" : ""
                          }
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dimensions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Dimensions</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetDimensions}
                    disabled={
                      width === originalWidth && height === originalHeight
                    }
                  >
                    Reset
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Width (px)
                      </label>
                      <Input
                        type="number"
                        value={width}
                        onChange={(e) =>
                          handleWidthChange(parseInt(e.target.value) || 0)
                        }
                        min={1}
                        max={10000}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Height (px)
                      </label>
                      <Input
                        type="number"
                        value={height}
                        onChange={(e) =>
                          handleHeightChange(parseInt(e.target.value) || 0)
                        }
                        min={1}
                        max={10000}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Maintain Aspect Ratio
                    </label>
                    <Switch
                      checked={maintainAspectRatio}
                      onCheckedChange={setMaintainAspectRatio}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
