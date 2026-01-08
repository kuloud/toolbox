"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = [
  { id: "all", label: "All Tools" },
  { id: "encoding", label: "Encoding" },
  { id: "formatting", label: "Formatting" },
  { id: "generators", label: "Generators" },
  { id: "converters", label: "Converters" },
];

export function CategoryFilter() {
  const [active, setActive] = useState("all");

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={active === category.id ? "default" : "secondary"}
          size="sm"
          onClick={() => setActive(category.id)}
          className={
            active === category.id
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
