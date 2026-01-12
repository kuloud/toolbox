"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const navigate = useNavigate();
  const Icon = tool.icon;

  const handleToolOpen = () => {
    navigate(`/view/${tool.id}`);
  };

  return (
    <Card
      className={`group cursor-pointer border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5`}
      onClick={handleToolOpen}
    >
      <CardContent className="px-4">
        <div className="flex flex-col gap-4">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-lg ${tool.bgColor} border ${tool.borderColor}`}
          >
            <Icon className={`h-5 w-5 ${tool.color}`} />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
              {tool.name}
            </h3>
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors group-hover:text-primary">
            <span>Open tool</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
