// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000', // FastAPI backend
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export async function deleteReport(reportId) {
  const token = localStorage.getItem("token");
  const base = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const response = await fetch(`${base}/delete-report/${reportId}`, {
    method: 'DELETE',
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      throw new Error("Failed to delete report");
    }
    throw new Error(error.detail || "Failed to delete report");
  }

  return response.json();
}
