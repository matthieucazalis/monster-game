import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyTheme } from "./utils/theme";
import "./pages/style/theme.css";

applyTheme();

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
