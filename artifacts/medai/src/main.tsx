import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App.tsx";
import "./index.css";

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_dmFzdC1zbmlwZS02LmNsZXJrLmFjY291bnRzLmRldiQ";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  createRoot(rootElement).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  );
} catch (error) {
  console.error("Rendering error:", error);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;">Failed to load application. ${error instanceof Error ? error.message : ""}</div>`;
}
