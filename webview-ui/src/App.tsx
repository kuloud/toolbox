import { Outlet, Route, Routes } from "react-router-dom";

import { Provider as JotaiProvider } from "jotai";
import { DashboardHeader } from "./components/dashboard-header";
import { Toaster } from "./components/ui/sonner";
import { GraphicsColorConverterPage } from "./pages/color-converter";
import DashboardPage from "./pages/dashboard";
import { ImageFormatPage } from "./pages/image-converter";
import { JsonYamlPage } from "./pages/json-yaml-converter";
import { TimestampPage } from "./pages/timestamp-converter";
import UuidGeneratorPage from "./pages/uuid-generator";
import { ThemeProvider } from "./providers/ThemeProvider";

const Layout = () => {
  return (
    <JotaiProvider>
      <ThemeProvider>
        <main className="bg-background">
          <DashboardHeader />
          <div className="mx-auto max-w-7xl space-y-4 px-4 py-8">
            <Outlet />
          </div>
        </main>
        <Toaster />
      </ThemeProvider>
    </JotaiProvider>
  );
};

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route
          path="/view/graphics-color-converter"
          element={<GraphicsColorConverterPage />}
        />
        <Route path="/view/image-converter" element={<ImageFormatPage />} />
        <Route path="/view/json-yaml" element={<JsonYamlPage />} />
        <Route path="/view/timestamp" element={<TimestampPage />} />
        <Route path="/view/generators-uuid" element={<UuidGeneratorPage />} />
      </Route>
    </Routes>
  );
}

export default App;
