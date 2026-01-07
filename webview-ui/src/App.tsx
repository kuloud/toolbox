import { Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import { JsonYamlPage } from "./pages/json-yaml";
import { TimestampPage } from "./pages/timestamp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TimestampPage />} />
      <Route path="/view/json-yaml" element={<JsonYamlPage />} />
      <Route path="/view/timestamp" element={<TimestampPage />} />
    </Routes>
  );
}

export default App;
