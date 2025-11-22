// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // FastAPI backend
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

  const response = await fetch(`http://127.0.0.1:8000/delete-report/${reportId}`, {
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
