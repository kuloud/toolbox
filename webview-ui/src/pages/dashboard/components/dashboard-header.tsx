"use client";

import { Button } from "@/components/ui/button";
import { Command, Github, Terminal } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              DevToolbox
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-2 text-muted-foreground md:flex"
            >
              <Command className="h-4 w-4" />
              <span>⌘K</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Github className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
