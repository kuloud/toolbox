"use client"

import { type LucideIcon, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Tool {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: string
  color: string
  bgColor: string
  borderColor: string
}

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon

  return (
    <Card
      className={`group cursor-pointer bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center ${tool.bgColor} border ${tool.borderColor}`}
          >
            <Icon className={`w-5 h-5 ${tool.color}`} />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{tool.description}</p>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-primary transition-colors">
            <span>Open tool</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
