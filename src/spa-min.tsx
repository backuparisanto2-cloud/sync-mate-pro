import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import "./styles.css";
import { getRouter } from "./router";

function Field() {
  const [v, setV] = useState("");
  return <input id="email" value={v} onChange={(e) => setV(e.target.value)} />;
}

const mode = new URLSearchParams(window.location.search).get("mode") ?? "bare";

const rootRoute = createRootRoute({ component: () => <Outlet /> });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: Field });
const miniRouter = createRouter({ routeTree: rootRoute.addChildren([indexRoute]) });

function App() {
  if (mode === "minirouter") return <RouterProvider router={miniRouter} />;
  if (mode === "router") return <RouterProvider router={getRouter()} />;
  return <Field />;
}

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
