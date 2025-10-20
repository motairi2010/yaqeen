import "./styles/sar-symbol.css";
import "./styles/currency.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "./styles/riyal.runtime.css";
import { watchRiyal } from "./utils/riyalPatch";
import "./bootstrap";
import "./dev/CrashCatcher";

const container = document.getElementById("root") || (() => {
  const d = document.createElement("div");
  d.id = "root";
  document.body.appendChild(d);
  return d;
})();

const root = createRoot(container);
root.render(<App />);

// Riyal watcher: run once
if (typeof window !== "undefined" && !window.__RIYAL_WATCHING__) {
  window.__RIYAL_WATCHING__ = true;
  requestAnimationFrame(() => { try { watchRiyal(); } catch (e) { console.warn("[watchRiyal failed]", e); } });
}



