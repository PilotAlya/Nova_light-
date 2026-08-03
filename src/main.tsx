import React from "react";
import ReactDOM from "react-dom/client";
import NovaDemo from "./NovaDashboard.demo";
import NovaV2 from "./NovaDashboard.v2";
import { ToastProvider } from "./components/ToastProvider";
import "./index.css";

/**
 * Two faces, one repo:
 * - v2   → develop Nova Light 2.0 (no password / no Boris welcome)
 * - demo → recruiter portfolio (login + Boris; password prefilled, skip OK)
 *
 * Local:  VITE_APP_FACE=demo npm run dev
 * Vercel: set env VITE_APP_FACE=demo|v2 per project
 */
const face = import.meta.env.VITE_APP_FACE === "demo" ? "demo" : "v2";
const App = face === "demo" ? NovaDemo : NovaV2;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
);
