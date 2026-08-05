import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

// Instantiate the visual application shell mounted onto the DOM runtime core
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Target viewport mounting failure: Element with container ID '#root' was not resolved in the DOM.",
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
