import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./kidty-alert.js";
import "./kidty-scroll-overrides.css";
import "./kidty-animations.css";

createRoot(document.getElementById("root")).render(<App />);
