import { Braces, Image, Palette, Timer } from "lucide-react";

export const tools = [
  {
    id: "json-yaml",
    name: "JSON - YAML Converter",
    description:
      "Convert JSON documents to YAML and vice-versa with real-time preview",
    icon: Braces,
    category: "converters",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    description: "Convert UNIX timestamps to and from plain dates",
    icon: Timer,
    category: "converters",
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/20",
  },
  {
    id: "image-converter",
    name: "Image Format Converter",
    description: "Convert images to different formats",
    icon: Image,
    category: "graphics",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  {
    id: "graphics-color-converter",
    name: "Color Converter",
    description: "Convert colors between formats",
    icon: Palette,
    category: "graphics",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/20",
  },
];

export const categories = [
  { id: "all", label: "All Tools" },
  { id: "encoding", label: "Encoding" },
  { id: "formatting", label: "Formatting" },
  { id: "graphics", label: "Graphics" },
  { id: "converters", label: "Converters" },
];
