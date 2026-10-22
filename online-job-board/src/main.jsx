import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// The app is intentionally frontend-only. Demo data is persisted in this browser.
createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);