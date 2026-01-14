import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import toast from "@/lib/toast";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { useCallback, useState } from "react";

function generateUUID() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }

  // Fallback simple v4-like generator (not cryptographically perfect)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function UuidGeneratorPage() {
  const [count, setCount] = useState<number>(1);
  const [output, setOutput] = useState<string>("");

  const handleGenerate = useCallback(() => {
    const n = Math.max(1, Math.min(1000, Math.floor(count || 1)));
    const items: string[] = [];
    for (let i = 0; i < n; i++) items.push(generateUUID());
    const result = items.join("\n");
    setOutput(result);
  }, [count]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uuids.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
          UUID Generator
        </h1>
        <p className="text-lg text-muted-foreground">Generate v4 UUIDs for testing and identifiers</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Count</div>
            <Input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-24"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleGenerate}>Generate</Button>
            <Button variant="outline" onClick={handleCopy} disabled={!output}>
              <CopyIcon className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" onClick={handleDownload} disabled={!output}>
              <DownloadIcon className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </div>

        <Textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={8} />
      </div>
    </>
  );
}

export default UuidGeneratorPage;
