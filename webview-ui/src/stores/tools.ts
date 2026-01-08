import { tools } from "@/data/tools";
import { atom } from "jotai";

export const activeCategoryAtom = atom("all");

export const filteredToolsAtom = atom((get) => {
  const activeCategory = get(activeCategoryAtom);
  if (activeCategory === "all") {
    return tools;
  }
  return tools.filter((tool) => tool.category === activeCategory);
});

export const queryToolsAtom = atom<typeof tools>([]);
