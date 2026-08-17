import React from "react";
import ReactDOM from "react-dom/client";
import NovaDemo from "./NovaDashboard.demo";
import NovaV2 from "./NovaDashboard.v2";
import NovaWork from "./work/NovaWork";
import { ToastProvider } from "./components/ToastProvider";
import "./index.css";

/**
 * Three faces, one repo:
 * - work → Nova 2.0 salon desk (light, SQLite). Default for `npm run dev`.
 * - demo → recruiter portfolio (login + Boris)
 * - v2   → previous dark dashboard
 */
const face = import.meta.env.VITE_APP_FACE;
const App = face === "demo" ? NovaDemo : face === "v2" ? NovaV2 : NovaWork;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
);
