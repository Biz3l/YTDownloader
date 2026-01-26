import React from "react";
import { createRoot } from "react-dom/client";
import Application from "./app";
import Titlebar from "./Functions/titlebar";

const root = createRoot(document.getElementById("app"));

root.render(
  <React.StrictMode>
    <Titlebar />
    <Application />
  </React.StrictMode>);