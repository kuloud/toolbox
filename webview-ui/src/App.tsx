import { Outlet, Route, Routes } from "react-router-dom";

import { Provider as JotaiProvider } from "jotai";
import { Toaster } from "./components/ui/sonner";
import DashboardPage from "./pages/dashboard";
import { ImageFormatPage } from "./pages/image-converter";
import { JsonYamlPage } from "./pages/json-yaml-converter";
import { TimestampPage } from "./pages/timestamp-converter";
import { ThemeProvider } from "./providers/ThemeProvider";

const Layout = () => {
  return (
    <JotaiProvider>
      <ThemeProvider>
        <main>
          <Outlet />
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
        <Route path="/view/json-yaml" element={<JsonYamlPage />} />
        <Route path="/view/timestamp" element={<TimestampPage />} />
        <Route path="/view/image-converter" element={<ImageFormatPage />} />
        {/* <Route path="*" element={<DashboardPage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
