import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import SymptomChecker from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster />
    <SymptomChecker />
  </StrictMode>
);
