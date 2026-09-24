import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { auth } from "./firebase.js";
import "./styles/global.css";
import App from "./App.jsx";

if (import.meta.env.VITE_DEBUG_MODE === "true") {
  console.debug("[brewlette] Firebase Auth ready:", auth.app.name);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
