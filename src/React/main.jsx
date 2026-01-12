import React from "react";
import { createRoot } from "react-dom/client";
import Application from "./app";

const root = createRoot(document.getElementById("app"));

root.render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>);