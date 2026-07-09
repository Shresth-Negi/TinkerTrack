import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Global reset styles
const style = document.createElement("style");
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  input:focus { border-color: #0f0f0f !important; box-shadow: 0 0 0 3px rgba(15,15,15,0.08); }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
