"use client";

import { Button } from "@/components/ui/button";
import { tools } from "@/data/tools";
import { activeCategoryAtom } from "@/stores/tools";
import { useAtom } from "jotai";
import { useMemo } from "react";

function generateCategoriesFromTools() {
  const categorySet = new Set<string>();

  tools.forEach((tool) => {
    if (tool.category) {
      categorySet.add(tool.category);
    }
  });

  const categories = Array.from(categorySet).sort();

  return [
    { id: "all", label: "All Tools" },
    ...categories.map((category) => ({
      id: category,
      label: category.charAt(0).toUpperCase() + category.slice(1),
    })),
  ];
}

export function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useAtom(activeCategoryAtom);
  const categories = useMemo(() => generateCategoriesFromTools(), []);

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "secondary"}
          size="sm"
          onClick={() => setActiveCategory(category.id)}
          className={
            activeCategory === category.id
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
