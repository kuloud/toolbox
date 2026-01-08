import { queryToolsAtom } from "@/stores/tools";
import { useAtomValue } from "jotai";
import { ToolCard } from "./tool-card";

export function ToolsGrid() {
  const filteredTools = useAtomValue(queryToolsAtom);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredTools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
