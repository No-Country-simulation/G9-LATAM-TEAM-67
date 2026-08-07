const configuredApiUrl = import.meta.env.VITE_API_URL

if (!configuredApiUrl) {
  throw new Error("VITE_API_URL es obligatoria")
}

export const API_URL = configuredApiUrl.replace(/\/$/, "")
