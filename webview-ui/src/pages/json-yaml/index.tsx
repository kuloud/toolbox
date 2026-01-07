import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  MinusIcon,
  PlusIcon,
  CopyIcon,
  DownloadIcon,
  UploadIcon,
  PlayIcon,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { vscode } from "@/lib/vscode";

// Simple YAML parser/stringifier (for demo purposes)
// In production, consider using a library like 'yaml' or 'js-yaml'
const yamlParser = {
  parse: (text: string) => {
    try {
      // Basic YAML to JSON conversion
      const lines = text.split("\n");
      const result: any = {};
      let currentPath: string[] = [];

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;

        const indent = line.match(/^\s*/)?.[0].length || 0;
        const level = Math.floor(indent / 2);
        currentPath = currentPath.slice(0, level);

        const colonIndex = trimmed.indexOf(":");
        if (colonIndex > -1) {
          const key = trimmed.slice(0, colonIndex).trim();
          const value = trimmed.slice(colonIndex + 1).trim();

          currentPath.push(key);
          let current = result;

          for (let i = 0; i < currentPath.length - 1; i++) {
            if (!current[currentPath[i]]) {
              current[currentPath[i]] = {};
            }
            current = current[currentPath[i]];
          }

          if (value) {
            if (value === "true") current[key] = true;
            else if (value === "false") current[key] = false;
            else if (value === "null") current[key] = null;
            else if (!isNaN(Number(value)) && value !== "")
              current[key] = Number(value);
            else current[key] = value.replace(/^['"](.*)['"]$/, "$1");
          } else {
            current[key] = {};
          }
        }
      });

      return result;
    } catch (error) {
      throw new Error("Invalid YAML format");
    }
  },

  stringify: (obj: any, indent: number = 2): string => {
    const convertValue = (value: any, currentIndent: number): string => {
      if (value === null) return "null";
      if (value === undefined) return "";
      if (typeof value === "boolean") return value.toString();
      if (typeof value === "number") return value.toString();
      if (typeof value === "string") {
        if (
          value.includes(":") ||
          value.includes('"') ||
          value.includes("'") ||
          value.includes("\n")
        ) {
          return `"${value.replace(/"/g, '\\"')}"`;
        }
        return value;
      }
      if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        return value
          .map(
            (item) =>
              " ".repeat(currentIndent) +
              "- " +
              convertValue(item, currentIndent + 2),
          )
          .join("\n");
      }
      if (typeof value === "object") {
        const entries = Object.entries(value);
        if (entries.length === 0) return "{}";
        return entries
          .map(
            ([key, val]) =>
              " ".repeat(currentIndent) +
              key +
              ": " +
              convertValue(val, currentIndent + 2),
          )
          .join("\n");
      }
      return String(value);
    };

    return convertValue(obj, 0);
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

        vscode.toast.success("Conversion successful!");
      } catch (error) {
        setOutputText(
          `Error: ${error instanceof Error ? error.message : "Invalid JSON format"}`,
        );
        vscode.toast.error("JSON format error");
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
        vscode.toast.success("Conversion successful!");
      } catch (error) {
        setOutputText(
          `Error: ${error instanceof Error ? error.message : "Invalid YAML format"}`,
        );
        vscode.toast.error("YAML format error");
      }
    },
    [indentation],
  );

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) {
      vscode.toast.error("Please enter content to convert");
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

  const sampleData = {
    json: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "address": {
    "street": "123 Main St",
    "zipcode": "10001"
  }
}`,
    yaml: `name: John Doe
age: 30
city: New York
hobbies:
  - reading
  - swimming
  - coding
address:
  street: 123 Main St
  zipcode: 10001`,
  };

  const loadSampleData = () => {
    if (conversionDirection === "json2yaml") {
      setInputText(sampleData.json);
    } else {
      setInputText(sampleData.yaml);
    }
  };

  return (
    <div className="w-full min-w-sm max-w-6xl p-4 space-y-6">
      <FieldSet>
        <FieldLegend>JSON - YAML Converter</FieldLegend>
        <FieldDescription>
          Convert JSON documents to YAML and vice-versa with real-time preview
        </FieldDescription>
      </FieldSet>
      <Separator />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleConvert();
        }}
      >
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Conversion Settings</FieldLegend>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Conversion Direction</FieldLabel>
                  <FieldDescription className="not-md:hidden">
                    Select the input format and desired output format
                  </FieldDescription>
                </FieldContent>
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
              </Field>

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Indentation</FieldLabel>
                  <FieldDescription className="not-md:hidden">
                    Number of spaces used for formatting output
                  </FieldDescription>
                </FieldContent>
                <InputGroup className="w-32">
                  <InputGroupInput
                    type="number"
                    min="1"
                    max="8"
                    value={indentation}
                    onChange={(e) =>
                      setIndentation(
                        Math.max(1, Math.min(8, Number(e.target.value))),
                      )
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <ButtonGroup
                      aria-label="Indentation controls"
                      className="w-fit"
                    >
                      <InputGroupButton
                        variant="outline"
                        onClick={decreaseIndentation}
                        disabled={indentation <= 1}
                      >
                        <MinusIcon />
                      </InputGroupButton>
                      <InputGroupButton
                        variant="outline"
                        onClick={increaseIndentation}
                        disabled={indentation >= 8}
                      >
                        <PlusIcon />
                      </InputGroupButton>
                    </ButtonGroup>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldGroup className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FieldLabel>
                      {conversionDirection === "json2yaml"
                        ? "JSON Input"
                        : "YAML Input"}
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadSampleData}
                      >
                        Load Sample
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                      >
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept={
                          conversionDirection === "json2yaml"
                            ? ".json"
                            : ".yaml,.yml"
                        }
                        onChange={handleFileUpload}
                        className="hidden"
                      />
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
                    <FieldLabel>
                      {conversionDirection === "json2yaml"
                        ? "YAML Output"
                        : "JSON Output"}
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyOutput}
                        disabled={!outputText}
                        aria-label="Copy"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        disabled={!outputText}
                        aria-label="Download"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[200px] font-mono text-sm bg-gray-50"
                    placeholder="Converted output will appear here..."
                  />
                </div>
              </div>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
