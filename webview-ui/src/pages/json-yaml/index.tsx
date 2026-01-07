import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { vscode } from "@/lib/vscode";
import * as yaml from "js-yaml";

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
            <FieldLegend>Tool options</FieldLegend>
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
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                      >
                        <UploadIcon />
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
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
