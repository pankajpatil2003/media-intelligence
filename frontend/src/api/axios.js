import axios from "axios";

// Pulls the URL from Vercel in production, or uses localhost in development
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_URL,
});
