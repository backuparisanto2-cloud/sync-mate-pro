import { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [v, setV] = useState("");
  return <input id="email" value={v} onChange={(e) => setV(e.target.value)} />;
}
const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
