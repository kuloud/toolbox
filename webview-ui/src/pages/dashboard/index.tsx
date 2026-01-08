import { Suspense } from "react";
import { CategoryFilter } from "./components/category-filter";
import { DashboardHeader } from "./components/dashboard-header";
import { SearchBar } from "./components/search-bar";
import { ToolsGrid } from "./components/tools-grid";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
            Dev Toolbox
          </h1>
          <p className="text-lg text-muted-foreground">
            Essential tools for your daily development workflow
          </p>
        </div>

        <Suspense fallback={null}>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <SearchBar />
            <CategoryFilter />
          </div>

          <ToolsGrid />
        </Suspense>
      </main>
    </div>
  );
}
