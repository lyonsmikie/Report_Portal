// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // FastAPI backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export async function deleteReport(reportId) {
  const response = await fetch(`http://127.0.0.1:8000/delete-report/${reportId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete report');
  }
  return response.json();
}
