import { Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import { JsonYamlPage } from "./pages/json-yaml";

function App() {
  return (
    <Routes>
      <Route path="/" element={<JsonYamlPage />} />
      <Route path="/view/json-yaml" element={<JsonYamlPage />} />
      <Route path="/view/:viewType" element={<JsonYamlPage />} />
    </Routes>
  );
}

export default App;
