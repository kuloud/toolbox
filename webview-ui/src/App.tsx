import { vscode } from "./utilities/vscode";
import { Routes, Route, useParams } from "react-router-dom";
import "./App.css";
import { JsonYamlPage } from "./pages/json-yaml";

function Hello() {
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  return (
    <main>
      <h1>Hello World!</h1>
    </main>
  );
}

function View() {
  const { viewType } = useParams();

  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: `View ${viewType} says howdy!`,
    });
  }

  return (
    <main>
      <h1>View: {viewType}</h1>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Hello />} />
      <Route path="/view/json-yaml" element={<JsonYamlPage />} />
      <Route path="/view/:viewType" element={<View />} />
    </Routes>
  );
}

export default App;
