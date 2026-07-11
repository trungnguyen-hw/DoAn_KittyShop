const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl && import.meta.env.PROD) {
  throw new Error("VITE_API_URL is required for a production build");
}

export const API_URL = (configuredApiUrl || "http://localhost:5000/api").replace(/\/$/, "");
