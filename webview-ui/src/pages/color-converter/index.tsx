import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
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
type ColorFormat = "hex" | "rgb" | "hsl" | "cmyk" | "hexa" | "rgba" | "hsla";

// Interface for color values
interface ColorValues {
  hex: string;
  rgb: string;
  hsl: string;
  cmyk: string;
  hexa: string;
  rgba: string;
  hsla: string;
  alpha: number; // 0-1
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

    // Check HEXA
    if (/^#?([0-9A-Fa-f]{4}|[0-9A-Fa-f]{8})$/.test(color)) {
      return "hexa";
    }

    // Check RGB
    if (/^\s*\d+\s*,\s*\d+\s*,\s*\d+\s*$/.test(color)) {
      return "rgb";
    }

    // Check RGBA
    if (/^\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*$/.test(color)) {
      return "rgba";
    }

    // Check HSL
    if (/^\s*\d+\s*°?\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*$/.test(color)) {
      return "hsl";
    }

    // Check HSLA
    if (
      /^\s*\d+\s*°?\s*,\s*\d+\s*%?\s*,\s*\d+\s*%?\s*,\s*[\d.]+\s*$/.test(color)
    ) {
      return "hsla";
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

  static normalizeHexa(hexa: string): string {
    hexa = hexa.replace(/^#/, "").toUpperCase();
    if (hexa.length === 4) {
      // Expand shorthand with alpha
      const r = hexa[0];
      const g = hexa[1];
      const b = hexa[2];
      const a = hexa[3];
      return `#${r}${r}${g}${g}${b}${b}${a}${a}`;
    } else if (hexa.length === 8) {
      return `#${hexa}`;
    }
    return `#${hexa}FF`;
  }

  static normalizeRgb(rgb: string): string {
    const match = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) return "0, 0, 0";

    const r = Math.max(0, Math.min(255, parseInt(match[1])));
    const g = Math.max(0, Math.min(255, parseInt(match[2])));
    const b = Math.max(0, Math.min(255, parseInt(match[3])));

    return `${r}, ${g}, ${b}`;
  }

  static normalizeRgba(rgba: string): { rgb: string; alpha: number } {
    const match = rgba.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)/);
    if (!match) return { rgb: "0, 0, 0", alpha: 1 };

    const r = Math.max(0, Math.min(255, parseInt(match[1])));
    const g = Math.max(0, Math.min(255, parseInt(match[2])));
    const b = Math.max(0, Math.min(255, parseInt(match[3])));
    const alpha = Math.max(0, Math.min(1, parseFloat(match[4])));

    return { rgb: `${r}, ${g}, ${b}`, alpha };
  }

  static normalizeHsl(hsl: string): string {
    const match = hsl.match(/(\d+)\s*°?\s*,\s*(\d+)\s*%?\s*,\s*(\d+)\s*%?/);
    if (!match) return "0°, 0%, 0%";

    const h = Math.max(0, Math.min(360, parseInt(match[1])));
    const s = Math.max(0, Math.min(100, parseInt(match[2])));
    const l = Math.max(0, Math.min(100, parseInt(match[3])));

    return `${h}°, ${s}%, ${l}%`;
  }

  static normalizeHsla(hsla: string): { hsl: string; alpha: number } {
    const match = hsla.match(
      /(\d+)\s*°?\s*,\s*(\d+)\s*%?\s*,\s*(\d+)\s*%?\s*,\s*([\d.]+)/,
    );
    if (!match) return { hsl: "0°, 0%, 0%", alpha: 1 };

    const h = Math.max(0, Math.min(360, parseInt(match[1])));
    const s = Math.max(0, Math.min(100, parseInt(match[2])));
    const l = Math.max(0, Math.min(100, parseInt(match[3])));
    const alpha = Math.max(0, Math.min(1, parseFloat(match[4])));

    return { hsl: `${h}°, ${s}%, ${l}%`, alpha };
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

  static hexaToRgba(
    hexa: string,
  ): { r: number; g: number; b: number; a: number } | null {
    const normalized = this.normalizeHexa(hexa).replace(/^#/, "");
    if (!/^[0-9A-F]{8}$/.test(normalized)) return null;

    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);
    const a = parseInt(normalized.substring(6, 8), 16) / 255;

    return { r, g, b, a };
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

  static rgbaToHexa(r: number, g: number, b: number, a: number): string {
    const hex = this.rgbToHex(r, g, b);
    const alphaHex = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
    return hex.replace("#", "#") + alphaHex;
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

  // Extract alpha from format
  static extractAlpha(color: string, format: ColorFormat): number {
    switch (format) {
      case "hexa":
        const hexaMatch = color.match(/^#?([0-9A-Fa-f]{8})$/);
        if (hexaMatch) {
          const alphaHex = hexaMatch[1].substring(6, 8);
          return parseInt(alphaHex, 16) / 255;
        }
        break;
      case "rgba":
        const rgbaMatch = color.match(
          /(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)/,
        );
        if (rgbaMatch) {
          return Math.max(0, Math.min(1, parseFloat(rgbaMatch[4])));
        }
        break;
      case "hsla":
        const hslaMatch = color.match(
          /(\d+)\s*°?\s*,\s*(\d+)\s*%?\s*,\s*(\d+)\s*%?\s*,\s*([\d.]+)/,
        );
        if (hslaMatch) {
          return Math.max(0, Math.min(1, parseFloat(hslaMatch[4])));
        }
        break;
    }
    return 1; // Default to fully opaque
  }

  // Main conversion function
  static convertAllFormats(
    color: string,
    sourceFormat: ColorFormat,
    alpha: number = 1,
  ): ColorValues | null {
    let rgb: { r: number; g: number; b: number };
    let finalAlpha = alpha;

    try {
      // Extract alpha from source format if it has alpha
      if (
        sourceFormat === "hexa" ||
        sourceFormat === "rgba" ||
        sourceFormat === "hsla"
      ) {
        finalAlpha = this.extractAlpha(color, sourceFormat);
      }

      // Convert to RGB first
      switch (sourceFormat) {
        case "hex":
        case "hexa":
          const hexColor =
            sourceFormat === "hexa" ? color.substring(0, 7) : color;
          const hexRgb = this.hexToRgb(hexColor);
          if (!hexRgb) return null;
          rgb = hexRgb;
          break;

        case "rgb":
        case "rgba":
          const rgbColor =
            sourceFormat === "rgba"
              ? color.split(",").slice(0, 3).join(",")
              : color;
          const match = rgbColor.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
          if (!match) return null;
          rgb = {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
          };
          break;

        case "hsl":
        case "hsla":
          const hslColor =
            sourceFormat === "hsla"
              ? color.split(",").slice(0, 3).join(",")
              : color;
          const hslMatch = hslColor.match(
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
        hexa: this.rgbaToHexa(rgb.r, rgb.g, rgb.b, finalAlpha),
        rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
        rgba: `${rgb.r}, ${rgb.g}, ${rgb.b}, ${finalAlpha.toFixed(3).replace(/\.?0+$/, "")}`,
        hsl: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`,
        hsla: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%, ${finalAlpha.toFixed(3).replace(/\.?0+$/, "")}`,
        cmyk: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
        alpha: finalAlpha,
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
        className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-accent"
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
    hexa: "#FF5733FF",
    rgba: "255, 87, 51, 1",
    hsla: "11°, 100%, 60%, 1",
    alpha: 1,
  });
  const [editingFormat, setEditingFormat] = useState<ColorFormat>("hex");
  const [editingValue, setEditingValue] = useState(colorValues.hex);
  const [isValid, setIsValid] = useState(true);
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Initialize with example
  useEffect(() => {
    handleColorChange("#FF5733", "hex", 1);
  }, []);

  // Handle color change from any input
  const handleColorChange = useCallback(
    (color: string, sourceFormat: ColorFormat, alpha: number = 1) => {
      let normalizedColor = color;
      let normalizedAlpha = alpha;

      // Extract alpha from RGBA/HSLA/HEXA
      if (sourceFormat === "rgba") {
        const rgba = ColorConverter.normalizeRgba(color);
        normalizedColor = rgba.rgb;
        normalizedAlpha = rgba.alpha;
      } else if (sourceFormat === "hsla") {
        const hsla = ColorConverter.normalizeHsla(color);
        normalizedColor = hsla.hsl;
        normalizedAlpha = hsla.alpha;
      } else if (sourceFormat === "hexa") {
        const rgba = ColorConverter.hexaToRgba(color);
        if (rgba) {
          normalizedColor = ColorConverter.rgbToHex(rgba.r, rgba.g, rgba.b);
          normalizedAlpha = rgba.a;
        }
      } else {
        // Normalize other formats
        normalizedColor = (() => {
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
      }

      const format = ColorConverter.detectFormat(
        sourceFormat === "hexa" ||
          sourceFormat === "rgba" ||
          sourceFormat === "hsla"
          ? color
          : normalizedColor,
      );

      if (format) {
        const converted = ColorConverter.convertAllFormats(
          sourceFormat === "hexa" ||
            sourceFormat === "rgba" ||
            sourceFormat === "hsla"
            ? color
            : normalizedColor,
          format,
          normalizedAlpha,
        );
        if (converted) {
          setColorValues(converted);
          setEditingFormat(sourceFormat);
          setEditingValue(color);
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
    handleColorChange(value, format, colorValues.alpha);
  };

  const handleAlphaInputChange = (value: string, format: ColorFormat) => {
    if (format === "hexa") {
      const rgba = ColorConverter.hexaToRgba(value);
      if (rgba) {
        const newAlpha = rgba.a;
        const hex = ColorConverter.rgbToHex(rgba.r, rgba.g, rgba.b);
        const newColorValues = ColorConverter.convertAllFormats(
          hex,
          "hex",
          newAlpha,
        );
        if (newColorValues) {
          setColorValues(newColorValues);
        }
      }
    } else if (format === "rgba") {
      const rgba = ColorConverter.normalizeRgba(value);
      const newAlpha = rgba.alpha;
      const newColorValues = ColorConverter.convertAllFormats(
        rgba.rgb,
        "rgb",
        newAlpha,
      );
      if (newColorValues) {
        setColorValues(newColorValues);
      }
    } else if (format === "hsla") {
      const hsla = ColorConverter.normalizeHsla(value);
      const newAlpha = hsla.alpha;
      const newColorValues = ColorConverter.convertAllFormats(
        hsla.hsl,
        "hsl",
        newAlpha,
      );
      if (newColorValues) {
        setColorValues(newColorValues);
      }
    }
  };

  // Handle alpha change
  const handleAlphaChange = (alpha: number) => {
    const newAlpha = Math.max(0, Math.min(1, alpha));
    const newColorValues = ColorConverter.convertAllFormats(
      colorValues.hex,
      "hex",
      newAlpha,
    );
    if (newColorValues) {
      setColorValues(newColorValues);
      setIsValid(true);
    }
  };

  // Set example color
  const setExample = () => {
    const randomColor =
      EXAMPLE_COLORS[Math.floor(Math.random() * EXAMPLE_COLORS.length)];
    handleColorChange(randomColor, "hex", 1);
  };

  // Reset to default
  const resetInput = () => {
    handleColorChange("#FF5733", "hex", 1);
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
HEXA: ${colorValues.hexa}
RGB: ${colorValues.rgb}
RGBA: ${colorValues.rgba}
HSL: ${colorValues.hsl}
HSLA: ${colorValues.hsla}
CMYK: ${colorValues.cmyk}
Alpha: ${colorValues.alpha.toFixed(2)}

Generated at: ${new Date().toISOString()}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "color-conversion-results.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get placeholder text for each format
  const getPlaceholder = (format: ColorFormat) => {
    switch (format) {
      case "hex":
        return "#FF5733 or #F53";
      case "hexa":
        return "#FF5733FF or #F53F";
      case "rgb":
        return "255, 87, 51";
      case "rgba":
        return "255, 87, 51, 0.5";
      case "hsl":
        return "11°, 100%, 60%";
      case "hsla":
        return "11°, 100%, 60%, 0.5";
      case "cmyk":
        return "0%, 66%, 80%, 0%";
      default:
        return "Enter color";
    }
  };

  // Get display value for each format
  const getDisplayValue = (format: ColorFormat) => {
    if (editingFormat === format) {
      return editingValue;
    }

    switch (format) {
      case "hex":
        return colorValues.hex;
      case "hexa":
        return colorValues.hexa;
      case "rgb":
        return colorValues.rgb;
      case "rgba":
        return colorValues.rgba;
      case "hsl":
        return colorValues.hsl;
      case "hsla":
        return colorValues.hsla;
      case "cmyk":
        return colorValues.cmyk;
      default:
        return "";
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
          Color Converter
        </h1>
        <p className="text-lg text-muted-foreground">
          Convert colors between different formats with real-time editing and
          alpha support
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
            onChange={(color) =>
              handleColorChange(color, "hex", colorValues.alpha)
            }
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

        {/* Alpha/Opacity Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Opacity: {(colorValues.alpha * 100).toFixed(0)}%
            </Label>
          </div>
          <Slider
            value={[colorValues.alpha]}
            onValueChange={([value]) => handleAlphaChange(value)}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>

        <div>
          <h1
            className="text-center text-6xl font-extrabold"
            style={{ color: colorValues.hexa }}
          >
            X Toolbox
          </h1>
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
              value={getDisplayValue("hex")}
              onChange={(e) => handleInputChange(e.target.value, "hex")}
              placeholder={getPlaceholder("hex")}
              className="font-mono"
              // onFocus={() => setEditingFormat("hex")}
            />
          </div>

          {/* HEXA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="hexa-input"
                className="flex items-center gap-2 text-sm font-medium"
              >
                HEXA
                {editingFormat === "hexa" && (
                  <span className="text-xs text-muted-foreground">
                    (editing)
                  </span>
                )}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(colorValues.hexa)}
                className="h-8 w-8 p-0"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="hexa-input"
              value={getDisplayValue("hexa")}
              onChange={(e) => handleInputChange(e.target.value, "hexa")}
              placeholder={getPlaceholder("hexa")}
              className="font-mono"
              // onFocus={() => setEditingFormat("hexa")}
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
              value={getDisplayValue("rgb")}
              onChange={(e) => handleInputChange(e.target.value, "rgb")}
              placeholder={getPlaceholder("rgb")}
              className="font-mono"
              // onFocus={() => setEditingFormat("rgb")}
            />
          </div>

          {/* RGBA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="rgba-input"
                className="flex items-center gap-2 text-sm font-medium"
              >
                RGBA
                {editingFormat === "rgba" && (
                  <span className="text-xs text-muted-foreground">
                    (editing)
                  </span>
                )}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(colorValues.rgba)}
                className="h-8 w-8 p-0"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="rgba-input"
              value={getDisplayValue("rgba")}
              onChange={(e) => handleInputChange(e.target.value, "rgba")}
              placeholder={getPlaceholder("rgba")}
              className="font-mono"
              // onFocus={() => setEditingFormat("rgba")}
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
              value={getDisplayValue("hsl")}
              onChange={(e) => handleInputChange(e.target.value, "hsl")}
              placeholder={getPlaceholder("hsl")}
              className="font-mono"
              // onFocus={() => setEditingFormat("hsl")}
            />
          </div>

          {/* HSLA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="hsla-input"
                className="flex items-center gap-2 text-sm font-medium"
              >
                HSLA
                {editingFormat === "hsla" && (
                  <span className="text-xs text-muted-foreground">
                    (editing)
                  </span>
                )}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(colorValues.hsla)}
                className="h-8 w-8 p-0"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <Input
              id="hsla-input"
              value={getDisplayValue("hsla")}
              onChange={(e) => handleInputChange(e.target.value, "hsla")}
              placeholder={getPlaceholder("hsla")}
              className="font-mono"
              // onFocus={() => setEditingFormat("hsla")}
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
              value={getDisplayValue("cmyk")}
              onChange={(e) => handleInputChange(e.target.value, "cmyk")}
              placeholder={getPlaceholder("cmyk")}
              className="font-mono"
              // onFocus={() => setEditingFormat("cmyk")}
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
                      #FF5733FF
                    </code>{" "}
                    (with alpha)
                  </li>
                  <li>
                    <code className="rounded bg-destructive/10 px-1.5 py-0.5">
                      255, 87, 51
                    </code>
                  </li>
                  <li>
                    <code className="rounded bg-destructive/10 px-1.5 py-0.5">
                      255, 87, 51, 0.5
                    </code>{" "}
                    (with alpha)
                  </li>
                  <li>
                    <code className="rounded bg-destructive/10 px-1.5 py-0.5">
                      11°, 100%, 60%
                    </code>
                  </li>
                  <li>
                    <code className="rounded bg-destructive/10 px-1.5 py-0.5">
                      11°, 100%, 60%, 0.5
                    </code>{" "}
                    (with alpha)
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
                  onClick={() =>
                    handleColorChange(color, "hex", colorValues.alpha)
                  }
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
