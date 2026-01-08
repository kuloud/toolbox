import { Routes, Route } from "react-router-dom";
import { JsonYamlPage } from "./pages/json-yaml-converter";
import { TimestampPage } from "./pages/timestamp-converter";
import { ImageFormatPage } from "./pages/image-converter";
import { IndexPage } from "./pages";

function App() {
  return (
    <Routes>
      <Route index element={<IndexPage />} />
      <Route path="/view/json-yaml" element={<JsonYamlPage />} />
      <Route path="/view/timestamp" element={<TimestampPage />} />
      <Route path="/view/image-converter" element={<ImageFormatPage />} />
      <Route path="*" element={<IndexPage />} />
    </Routes>
  );
}

export default App;
