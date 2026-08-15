import { useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import "./styles.css";
import { Toaster } from "@/components/ui/sonner";
import { getRouter } from "./router";

function Field() {
  const [v, setV] = useState("");
  return <input id="email" value={v} onChange={(e) => setV(e.target.value)} />;
}

const mode = new URLSearchParams(window.location.search).get("mode") ?? "bare";

function App() {
  if (mode === "toaster")
    return (
      <>
        <Field />
        <Toaster position="top-right" richColors />
      </>
    );
  if (mode === "query")
    return (
      <QueryClientProvider client={new QueryClient()}>
        <Field />
      </QueryClientProvider>
    );
  if (mode === "router") return <RouterProvider router={getRouter()} />;
  return <Field />;
}

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
