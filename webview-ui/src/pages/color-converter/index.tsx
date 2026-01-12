import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import toast from "@/lib/toast";
import {
  CopyIcon,
  DownloadIcon,
  Pipette,
  RefreshCw,
  SearchIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Color formats
type ColorFormat = "hex" | "rgb" | "hsl" | "cmyk";

// Interface for color values
interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
}

// Color conversion utilities
class ColorConverter {
  // Detect color format
  static detectFormat(color: string): ColorFormat | null {
    if (!color.trim()) return null;

    // Check HEX
    if (/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)) {
      return "hex";
    }

    // Check RGB
    if (/^\s*\d+\s*,\s*\d+\s*,\s*\d+\s*$/.test(color)) {
      return "rgb";
    }

    // Check HSL
    if (/^\s*\d+\s*°?\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*$/.test(color)) {
      return "hsl";
    }

    // Check CMYK
    if (
      /^\s*\d+\s*%?\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*$/.test(
        color,
      )
    ) {
      return "cmyk";
    }

    return null;
  }

  // Normalize color values
  static normalizeHex(hex: string): string {
    hex = hex.replace(/^#/, "").toUpperCase();
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    return `#${hex}`;
  }

  static normalizeRgb(rgb: string): string {
    const match = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) return "0, 0, 0";

    const r = Math.max(0, Math.min(255, parseInt(match[1])));
    const g = Math.max(0, Math.min(255, parseInt(match[2])));
    const b = Math.max(0, Math.min(255, parseInt(match[3])));

    return `${r}, ${g}, ${b}`;
  }

  static normalizeHsl(hsl: string): string {
    const match = hsl.match(/(\d+)\s*°?\s*,\s*(\d+)\s*%?\s*,\s*(\d+)\s*%?/);
    if (!match) return "0°, 0%, 0%";

    const h = Math.max(0, Math.min(360, parseInt(match[1])));
    const s = Math.max(0, Math.min(100, parseInt(match[2])));
    const l = Math.max(0, Math.min(100, parseInt(match[3])));

    return `${h}°, ${s}%, ${l}%`;
  }

  static normalizeCmyk(cmyk: string): string {
    const match = cmyk.match(
      /(\d+)\s*%?\s*,\s*(\d+)\s*%?\s*,\s*(\d+)\s*%?\s*,\s*(\d+)\s*%?/,
    );
    if (!match) return "0%, 0%, 0%, 0%";

    const c = Math.max(0, Math.min(100, parseInt(match[1])));
    const m = Math.max(0, Math.min(100, parseInt(match[2])));
    const y = Math.max(0, Math.min(100, parseInt(match[3])));
    const k = Math.max(0, Math.min(100, parseInt(match[4])));

    return `${c}%, ${m}%, ${y}%, ${k}%`;
  }

  // Conversion methods
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const normalized = this.normalizeHex(hex).replace(/^#/, "");
    if (!/^[0-9A-F]{6}$/.test(normalized)) return null;

    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);

    return { r, g, b };
  }

  static rgbToHex(r: number, g: number, b: number): string {
    return (
      "#" +
      [r, g, b]
        .map((x) => Math.max(0, Math.min(255, x)))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }

  static rgbToHsl(
    r: number,
    g: number,
    b: number,
  ): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  static hslToRgb(
    h: number,
    s: number,
    l: number,
  ): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    if (s === 0) {
      const val = Math.round(l * 255);
      return { r: val, g: val, b: val };
    }

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
  }

  static rgbToCmyk(
    r: number,
    g: number,
    b: number,
  ): { c: number; m: number; y: number; k: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const k = 1 - Math.max(r, g, b);

    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    return {
      c: Math.round(((1 - r - k) / (1 - k)) * 100),
      m: Math.round(((1 - g - k) / (1 - k)) * 100),
      y: Math.round(((1 - b - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  }

  // Main conversion function
  static convertAllFormats(
    color: string,
    sourceFormat: ColorFormat,
  ): ColorValues | null {
    let rgb: { r: number; g: number; b: number };

    try {
      // Convert to RGB first
      switch (sourceFormat) {
        case "hex":
          const hexRgb = this.hexToRgb(color);
          if (!hexRgb) return null;
          rgb = hexRgb;
          break;

        case "rgb":
          const match = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
          if (!match) return null;
          rgb = {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
          };
          break;

        case "hsl":
          const hslMatch = color.match(
            /(\d+)\s*°?\s*,\s*(\d+)\s*%?\s*,\s*(\d+)\s*%?/,
          );
          if (!hslMatch) return null;
          const hsl = this.hslToRgb(
            parseInt(hslMatch[1]),
            parseInt(hslMatch[2]),
            parseInt(hslMatch[3]),
          );
          rgb = hsl;
          break;

        case "cmyk":
          // CMYK to RGB conversion
          const cmykMatch = color.match(
            /(\d+)\s*%?\s*,\s*(\d+)\s*%?\s*,\s*(\d+)\s*%?\s*,\s*(\d+)\s*%?/,
          );
          if (!cmykMatch) return null;

          const c = parseInt(cmykMatch[1]) / 100;
          const m = parseInt(cmykMatch[2]) / 100;
          const y = parseInt(cmykMatch[3]) / 100;
          const k = parseInt(cmykMatch[4]) / 100;

          rgb = {
            r: Math.round(255 * (1 - Math.min(1, c * (1 - k) + k))),
            g: Math.round(255 * (1 - Math.min(1, m * (1 - k) + k))),
            b: Math.round(255 * (1 - Math.min(1, y * (1 - k) + k))),
          };
          break;

        default:
          return null;
      }

      // Convert RGB to all other formats
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);

      return {
        hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
        rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
        hsl: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`,
        cmyk: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
      };
    } catch (error) {
      console.error("Conversion error:", error);
      return null;
    }
  }
}

// Fixed Color Picker component
function EnhancedColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);

  const handlePreviewClick = () => {
    if (pickerRef.current) {
      pickerRef.current.click();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handlePreviewClick}
        className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-accent transition-colors"
        title="Click to pick color"
      >
        <Pipette className="h-4 w-4" />
        <div
          className="h-6 w-6 rounded border"
          style={{ backgroundColor: value }}
        />
        <code className="text-sm font-medium">{value}</code>
      </button>
      <input
        ref={pickerRef}
        type="color"
        value={value}
        onChange={handleColorChange}
        className="hidden"
      />
    </div>
  );
}

// Example colors
const EXAMPLE_COLORS = [
  "#FF5733", // Red-Orange
  "#33FF57", // Green
  "#3357FF", // Blue
  "#F3FF33", // Yellow
  "#FF33F3", // Pink
  "#33FFF3", // Cyan
  "#8B33FF", // Purple
  "#FF8B33", // Orange
  "#33FF8B", // Mint
  "#FF338B", // Rose
];

export function GraphicsColorConverterPage() {
  const [colorValues, setColorValues] = useState<ColorValues>({
    hex: "#FF5733",
    rgb: "255, 87, 51",
    hsl: "11°, 100%, 60%",
    cmyk: "0%, 66%, 80%, 0%",
  });
  const [editingFormat, setEditingFormat] = useState<ColorFormat>("hex");
  const [editingValue, setEditingValue] = useState(colorValues.hex);
  const [isValid, setIsValid] = useState(true);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Initialize with example
  useEffect(() => {
    handleColorChange("#FF5733", "hex");
  }, []);

  // Handle color change from any input
  const handleColorChange = useCallback(
    (color: string, sourceFormat: ColorFormat) => {
      const normalizedColor = (() => {
        switch (sourceFormat) {
          case "hex":
            return ColorConverter.normalizeHex(color);
          case "rgb":
            return ColorConverter.normalizeRgb(color);
          case "hsl":
            return ColorConverter.normalizeHsl(color);
          case "cmyk":
            return ColorConverter.normalizeCmyk(color);
          default:
            return color;
        }
      })();

      const format = ColorConverter.detectFormat(normalizedColor);

      if (format) {
        const converted = ColorConverter.convertAllFormats(
          normalizedColor,
          format,
        );
        if (converted) {
          setColorValues(converted);
          setEditingFormat(sourceFormat);
          setEditingValue(normalizedColor);
          setIsValid(true);

          // Add to recent colors
          setRecentColors((prev) => {
            const newRecent = [
              converted.hex,
              ...prev.filter((c) => c !== converted.hex),
            ];
            return newRecent.slice(0, 6);
          });
          return;
        }
      }

      setIsValid(false);
    },
    [],
  );

  // Handle input change
  const handleInputChange = (value: string, format: ColorFormat) => {
    setEditingFormat(format);
    setEditingValue(value);
    handleColorChange(value, format);
  };

  // Set example color
  const setExample = () => {
    const randomColor =
      EXAMPLE_COLORS[Math.floor(Math.random() * EXAMPLE_COLORS.length)];
    handleColorChange(randomColor, "hex");
  };

  // Reset to default
  const resetInput = () => {
    handleColorChange("#FF5733", "hex");
  };

  // Copy color to clipboard
  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  // Download all color values
  const downloadResults = () => {
    const content = `Color Converter Results:

HEX: ${colorValues.hex}
RGB: ${colorValues.rgb}
HSL: ${colorValues.hsl}
CMYK: ${colorValues.cmyk}

Generated at: ${new Date().toISOString()}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "color-conversion-results.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
          Color Converter
        </h1>
        <p className="text-lg text-muted-foreground">
          Convert colors between different formats with real-time editing
        </p>
      </div>

      <Separator />

      {/* Enhanced Color Picker Section */}
      <div className="space-y-6">
        <h2 className="font-heading scroll-m-28 text-xl font-medium tracking-tight">
          Color
        </h2>

        <div className="flex items-center justify-between">
          <EnhancedColorPicker
            value={colorValues.hex}
            onChange={(color) => handleColorChange(color, "hex")}
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={setExample} size="sm">
              <SearchIcon className="mr-2 h-4 w-4" />
              Random
            </Button>
            <Button variant="outline" onClick={resetInput} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="default" onClick={downloadResults} size="sm">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Color Format Inputs */}
      <div className="space-y-6">
        <h2 className="font-heading scroll-m-28 text-xl font-medium tracking-tight">
          Color Formats
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* HEX */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="hex-input"
                className="flex items-center gap-2 text-sm font-medium"
              >
                HEX
                {editingFormat === "hex" && (
                  <span className="text-xs text-muted-foreground">
                    (editing)
                  </span>
                )}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(colorValues.hex)}
                className="h-8 w-8 p-0"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="hex-input"
              value={editingFormat === "hex" ? editingValue : colorValues.hex}
              onChange={(e) => handleInputChange(e.target.value, "hex")}
              placeholder="#FF5733 or #F53"
              className="font-mono"
              onFocus={() => setEditingFormat("hex")}
            />
          </div>

          {/* RGB */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="rgb-input"
                className="flex items-center gap-2 text-sm font-medium"
              >
                RGB
                {editingFormat === "rgb" && (
                  <span className="text-xs text-muted-foreground">
                    (editing)
                  </span>
                )}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(colorValues.rgb)}
                className="h-8 w-8 p-0"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="rgb-input"
              value={editingFormat === "rgb" ? editingValue : colorValues.rgb}
              onChange={(e) => handleInputChange(e.target.value, "rgb")}
              placeholder="255, 87, 51"
              className="font-mono"
              onFocus={() => setEditingFormat("rgb")}
            />
          </div>

          {/* HSL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="hsl-input"
                className="flex items-center gap-2 text-sm font-medium"
              >
                HSL
                {editingFormat === "hsl" && (
                  <span className="text-xs text-muted-foreground">
                    (editing)
                  </span>
                )}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(colorValues.hsl)}
                className="h-8 w-8 p-0"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="hsl-input"
              value={editingFormat === "hsl" ? editingValue : colorValues.hsl}
              onChange={(e) => handleInputChange(e.target.value, "hsl")}
              placeholder="11°, 100%, 60%"
              className="font-mono"
              onFocus={() => setEditingFormat("hsl")}
            />
          </div>

          {/* CMYK */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="cmyk-input"
                className="flex items-center gap-2 text-sm font-medium"
              >
                CMYK
                {editingFormat === "cmyk" && (
                  <span className="text-xs text-muted-foreground">
                    (editing)
                  </span>
                )}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(colorValues.cmyk)}
                className="h-8 w-8 p-0"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="cmyk-input"
              value={editingFormat === "cmyk" ? editingValue : colorValues.cmyk}
              onChange={(e) => handleInputChange(e.target.value, "cmyk")}
              placeholder="0%, 66%, 80%, 0%"
              className="font-mono"
              onFocus={() => setEditingFormat("cmyk")}
            />
          </div>
        </div>
      </div>

      {/* Error State */}
      {!isValid && (
        <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">
                Invalid color format
              </h3>
              <div className="mt-2 text-sm text-destructive/80">
                <p>Please enter a valid color in one of these formats:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>
                    <code className="rounded bg-destructive/10 px-1.5 py-0.5">
                      #FF5733
                    </code>{" "}
                    or{" "}
                    <code className="rounded bg-destructive/10 px-1.5 py-0.5">
                      #F53
                    </code>
                  </li>
                  <li>
                    <code className="rounded bg-destructive/10 px-1.5 py-0.5">
                      255, 87, 51
                    </code>
                  </li>
                  <li>
                    <code className="rounded bg-destructive/10 px-1.5 py-0.5">
                      11°, 100%, 60%
                    </code>
                  </li>
                  <li>
                    <code className="rounded bg-destructive/10 px-1.5 py-0.5">
                      0%, 66%, 80%, 0%
                    </code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Recent Colors
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentColors.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  type="button"
                  onClick={() => handleColorChange(color, "hex")}
                  className="group relative h-8 w-8 rounded border shadow-sm transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  <span className="sr-only">{color}</span>
                  <div className="absolute inset-0 rounded bg-black/0 transition-colors group-hover:bg-black/20" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}