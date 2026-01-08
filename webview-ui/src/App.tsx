import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/dashboard";
import { ImageFormatPage } from "./pages/image-converter";
import { JsonYamlPage } from "./pages/json-yaml-converter";
import { TimestampPage } from "./pages/timestamp-converter";

function App() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="/view/json-yaml" element={<JsonYamlPage />} />
      <Route path="/view/timestamp" element={<TimestampPage />} />
      <Route path="/view/image-converter" element={<ImageFormatPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
