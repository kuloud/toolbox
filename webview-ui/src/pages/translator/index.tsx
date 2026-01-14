import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import toast from "@/lib/toast";
import { ArrowLeftRight, CopyIcon, EraserIcon, Loader2 } from "lucide-react";
import { useCallback, useState, useEffect } from "react";

const defaultLanguages = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
];


export function TranslatorPage() {
  const [languages, setLanguages] = useState(defaultLanguages);
  const [source, setSource] = useState("auto");
  const [target, setTarget] = useState("en");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch languages from server wrapper if available
  useEffect(() => {
    let mounted = true;
    fetch('/api/translate')
      .then((r) => r.json())
      .then((data) => {
        // If the response looks like languages array, map it
        if (Array.isArray(data) && data.length > 0 && data[0].code) {
          const mapped = [{ value: 'auto', label: 'Auto-detect' }, ...data.map((l: any) => ({ value: l.code, label: l.name }))];
          if (mounted) setLanguages(mapped);
        }
      })
      .catch(() => {
        // ignore, keep defaults
      });

    return () => {
      mounted = false;
    };
  }, []);


  const translate = useCallback(async () => {
    if (!inputText.trim()) {
      toast.info("Enter text to translate");
      return;
    }

    setLoading(true);
    setOutputText("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: inputText,
          source: source,
          target: target,
          format: "text",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = json?.error || json?.message || "Translation API error";
        throw new Error(message);
      }

      setOutputText(json.translatedText || json.translated_text || "");
    } catch (e: any) {
      setOutputText(`Error: ${e?.message ?? "Unable to translate"}`);
    } finally {
      setLoading(false);
    }
  }, [inputText, source, target]);

  const handleSwap = () => {
    // Swap languages and move output to input if present
    setSource(target);
    setTarget(source === "auto" ? "en" : source);
    if (outputText.trim()) {
      setInputText(outputText);
      setOutputText("");
    }
  };

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast.success("Copied to clipboard!");
    } catch (e) {
      toast.error("Unable to copy");
    }
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    toast.info("Content cleared");
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
          Translator
        </h1>
        <p className="text-lg text-muted-foreground">
          Quickly translate text between languages
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <h2 className="font-heading scroll-m-28 text-xl font-medium tracking-tight">
          Options
        </h2>

        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-2 font-medium">Source</div>
            <Select value={source} onValueChange={(v) => setSource(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <Button variant="outline" onClick={handleSwap} aria-label="Swap languages">
              <ArrowLeftRight />
            </Button>
          </div>

          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-2 font-medium">Target</div>
            <Select value={target} onValueChange={(v) => setTarget(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages
                  .filter((l) => l.value !== "auto")
                  .map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">Input</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setInputText("")}>
                <EraserIcon />
              </Button>
            </div>
          </div>

          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate..."
            className="min-h-50 font-mono text-sm"
          />

          <div className="flex items-center justify-end gap-2">
            <Button onClick={translate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Translate"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">Output</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyOutput} disabled={!outputText}>
                <CopyIcon />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setOutputText("")}> 
                <EraserIcon />
              </Button>
            </div>
          </div>

          <Textarea
            value={outputText}
            readOnly
            className="min-h-50 bg-gray-50 font-mono text-sm"
            placeholder="Translated text will appear here..."
          />
        </div>
      </div>
    </>
  );
}
