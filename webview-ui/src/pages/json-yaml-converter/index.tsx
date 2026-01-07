import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  MinusIcon,
  PlusIcon,
  CopyIcon,
  DownloadIcon,
  UploadIcon,
  EraserIcon,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { vscode } from "@/lib/vscode";
import * as yaml from "js-yaml";
import { HorizonalArrowsIcon } from "@/components/icons/HorizonalArrowsIcon";
import { FormatIndentMoreIcon } from "@/components/icons/FormatIndentMoreIcon";

// Use js-yaml for proper YAML parsing and stringifying
const yamlParser = {
  parse: (text: string) => {
    try {
      return yaml.load(text);
    } catch (error) {
      throw new Error("Invalid YAML format");
    }
  },

  stringify: (obj: any, indent: number = 2): string => {
    try {
      return yaml.dump(obj, {
        indent: indent,
        lineWidth: -1, // No line width limit
        noRefs: true, // Prevent anchor references
      });
    } catch (error) {
      throw new Error("Error converting to YAML");
    }
  },
};

export function JsonYamlPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [conversionDirection, setConversionDirection] = useState<
    "json2yaml" | "yaml2json"
  >("json2yaml");
  const [indentation, setIndentation] = useState(2);

  const convertJsonToYaml = useCallback(
    (jsonText: string) => {
      try {
        const parsed = JSON.parse(jsonText);
        const yamlResult = yamlParser.stringify(parsed, indentation);
        setOutputText(yamlResult);
      } catch (error) {
        setOutputText(
          `Error: ${error instanceof Error ? error.message : "Invalid JSON format"}`,
        );
      }
    },
    [indentation],
  );

  const convertYamlToJson = useCallback(
    (yamlText: string) => {
      try {
        const parsed = yamlParser.parse(yamlText);
        const jsonResult = JSON.stringify(parsed, null, indentation);
        setOutputText(jsonResult);
      } catch (error) {
        setOutputText(
          `Error: ${error instanceof Error ? error.message : "Invalid YAML format"}`,
        );
      }
    },
    [indentation],
  );

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) {
      return;
    }

    if (conversionDirection === "json2yaml") {
      convertJsonToYaml(inputText);
    } else {
      convertYamlToJson(inputText);
    }
  }, [inputText, conversionDirection, convertJsonToYaml, convertYamlToJson]);

  useEffect(() => {
    handleConvert();
  }, [inputText, handleConvert]);

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(outputText).then(() => {
      vscode.toast.success("Copied to clipboard!");
    });
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      conversionDirection === "json2yaml" ? "converted.yaml" : "converted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    vscode.toast.info("Content cleared");
  };

  const increaseIndentation = () => {
    setIndentation((prev) => Math.min(prev + 1, 8));
  };

  const decreaseIndentation = () => {
    setIndentation((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full min-w-sm max-w-6xl p-4 space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight xl:text-4xl">
          JSON - YAML Converter
        </h1>
        <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
          Convert JSON documents to YAML and vice-versa with real-time preview
        </p>
      </div>
      <Separator />
      <div className="space-y-2">
        <h2 className="font-heading scroll-m-28 text-xl font-medium tracking-tight">
          Tool options
        </h2>
        <div className="flex flex-row items-center flex-1 space-x-4">
          <HorizonalArrowsIcon className="ml-4" />
          <div className="flex flex-col flex-1">
            <div className="items-center text-sm font-medium select-none flex w-fit gap-2 leading-snug">
              Conversion Direction
            </div>
            <div className="text-muted-foreground text-sm leading-normal font-normal last:mt-0 nth-last-2:-mt-1 not-md:hidden">
              Select the input format and desired output format
            </div>
          </div>
          <Tabs
            value={conversionDirection}
            onValueChange={(value) =>
              setConversionDirection(value as "json2yaml" | "yaml2json")
            }
            className="w-fit"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json2yaml">JSON → YAML</TabsTrigger>
              <TabsTrigger value="yaml2json">YAML → JSON</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-row items-center flex-1 space-x-4">
          <FormatIndentMoreIcon className="ml-4" />
          <div className="flex flex-col flex-1">
            <div className="items-center text-sm font-medium select-none flex w-fit gap-2 leading-snug">
              Indentation
            </div>
            <div className="text-muted-foreground text-sm leading-normal font-normal last:mt-0 nth-last-2:-mt-1 not-md:hidden">
              Number of spaces used for formatting output
            </div>
          </div>
          <InputGroup className="w-fit outline-none border-none shadow-none">
            <InputGroupInput
              type="number"
              min="1"
              max="8"
              value={indentation}
              onChange={(e) =>
                setIndentation(Math.max(1, Math.min(8, Number(e.target.value))))
              }
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-0 focus:ring-0 focus:outline-none"
            />
            <InputGroupAddon align="inline-end" className="p-0">
              <ButtonGroup className="w-fit">
                <Button
                  variant="outline"
                  onClick={decreaseIndentation}
                  disabled={indentation <= 1}
                >
                  <MinusIcon />
                </Button>
                <Button
                  variant="outline"
                  onClick={increaseIndentation}
                  disabled={indentation >= 8}
                >
                  <PlusIcon />
                </Button>
              </ButtonGroup>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="items-center text-sm font-medium select-none flex w-fit gap-2 leading-snug">
              {conversionDirection === "json2yaml"
                ? "JSON Input"
                : "YAML Input"}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <UploadIcon />
              </Button>
              <input
                id="file-upload"
                type="file"
                accept={
                  conversionDirection === "json2yaml" ? ".json" : ".yaml,.yml"
                }
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button variant="outline" size="sm" onClick={clearAll}>
                <EraserIcon />
              </Button>
            </div>
          </div>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              conversionDirection === "json2yaml"
                ? "Paste your JSON here..."
                : "Paste your YAML here..."
            }
            className="min-h-50 font-mono text-sm"
          />
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="items-center text-sm font-medium select-none flex w-fit gap-2 leading-snug">
              {conversionDirection === "json2yaml"
                ? "YAML Output"
                : "JSON Output"}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyOutput}
                disabled={!outputText}
                aria-label="Copy"
              >
                <CopyIcon />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!outputText}
                aria-label="Download"
              >
                <DownloadIcon />
              </Button>
            </div>
          </div>
          <Textarea
            value={outputText}
            readOnly
            className="min-h-50 font-mono text-sm bg-gray-50"
            placeholder="Converted output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
