import { tools } from "@/data/tools";
import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

export const activeCategoryAtom = atomWithReset("all");

export const filteredToolsAtom = atom((get) => {
  const activeCategory = get(activeCategoryAtom);
  if (!activeCategory || activeCategory === "all") {
    return tools;
  }
  return tools.filter((tool) => tool.category === activeCategory);
});

export const queryToolsAtom = atom<typeof tools>([]);
