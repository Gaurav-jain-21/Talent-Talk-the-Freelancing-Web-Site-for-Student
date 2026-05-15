import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(15, 23, 42, 0.9)",
          color: "#F8FAFC",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          backdropFilter: "blur(10px)",
        },
        success: {
          iconTheme: {
            primary: "#22C55E",
            secondary: "#0F172A",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#0F172A",
          },
        },
      }}
    />
  </StrictMode>,
);
