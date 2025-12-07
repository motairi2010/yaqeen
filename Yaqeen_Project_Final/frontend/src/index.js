import "./styles/currency.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { RiyalProvider } from "./contexts/RiyalContext";

import "./dev/CrashCatcher";

const container = document.getElementById("root") || (() => {
  const d = document.createElement("div");
  d.id = "root";
  document.body.appendChild(d);
  return d;
})();

const root = createRoot(container);
root.render(
  <RiyalProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </RiyalProvider>
);



