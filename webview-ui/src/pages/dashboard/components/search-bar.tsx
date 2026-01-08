"use client";

import { Input } from "@/components/ui/input";
import { filteredToolsAtom, queryToolsAtom } from "@/stores/tools";
import { useAtomValue, useSetAtom } from "jotai";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

function fuzzySearch(text: string, query: string): boolean {
  if (!query.trim()) return true;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  let searchIndex = 0;

  for (let i = 0; i < lowerText.length; i++) {
    if (lowerText[i] === lowerQuery[searchIndex]) {
      searchIndex++;
      if (searchIndex === lowerQuery.length) {
        return true;
      }
    }
  }
  return false;
}

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredTools = useAtomValue(filteredToolsAtom);
  const setQueryTools = useSetAtom(queryToolsAtom);

  useEffect(() => {
    let result = [...filteredTools];

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (tool) =>
          fuzzySearch(tool.name, query) ||
          fuzzySearch(tool.description, query) ||
          fuzzySearch(tool.category, query),
      );
    }

    setQueryTools(result);
  }, [filteredTools, searchQuery]);
  return (
    <div className="relative w-full md:max-w-sm">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search tools..."
        className="border-border bg-card pl-10 focus:border-primary"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
