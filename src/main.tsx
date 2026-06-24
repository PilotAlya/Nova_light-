import React from "react";
import ReactDOM from "react-dom/client";
import NovaLightDashboard from "./NovaDashboard";
import { ToastProvider } from "./components/ToastProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <NovaLightDashboard />
    </ToastProvider>
  </React.StrictMode>,
);

