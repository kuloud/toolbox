import { Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import { JsonYamlPage } from "./pages/json-yaml-converter";
import { TimestampPage } from "./pages/timestamp-converter";
import { ImageFormatPage } from "./pages/image-converter";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ImageFormatPage />} />
      <Route path="/view/json-yaml" element={<JsonYamlPage />} />
      <Route path="/view/timestamp" element={<TimestampPage />} />
      <Route path="/view/image-converter" element={<ImageFormatPage />} />
    </Routes>
  );
}

export default App;
