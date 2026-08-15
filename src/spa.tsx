/**
 * Entry point untuk build statis (SPA murni).
 *
 * Tidak memakai SSR sama sekali: HTML hasil ekspor hanya shell kosong, lalu
 * router dijalankan penuh di browser sehingga bisa dipasang di hosting biasa.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import "./styles.css";
import { getRouter } from "./router";

const router = getRouter();
const el = document.getElementById("root");

if (el) {
  createRoot(el).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
