const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export async function request(endpoint, options = {}) {
  const url = `${baseURL}${endpoint}`;

  // Read adminToken from localStorage
  const token = localStorage.getItem("adminToken");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.message || `API error with status ${response.status}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}
