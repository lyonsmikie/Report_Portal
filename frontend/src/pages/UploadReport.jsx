// src/pages/UploadReport.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function UploadReport() {
  const navigate = useNavigate();
  const { site_name } = useParams();

  const [category, setCategory] = useState('MACD');
  const [file, setFile] = useState(null);
  const [reportDate, setReportDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['MACD', 'RSI', 'Stochastic', 'Other1', 'Other2'];

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to upload.");
    if (!reportDate) return alert("Please select a date.");

    setLoading(true);
    setMessage('Uploading...');

    try {
      // Step 1: Check if a report already exists
      const existing = await api.get(`/reports/${site_name}/${category}/${reportDate}`);
      let override = false;
      let saveAsNew = false;

      if (existing.data.length > 0) {
        const choice = window.prompt(
          `A report already exists for ${category} on ${reportDate}.\n` +
          `Type 'O' to Override, 'N' to Save as New, 'C' to Cancel`
        );
        if (!choice || choice.toUpperCase() === 'C') {
          setMessage('Upload cancelled.');
          setLoading(false);
          return;
        } else if (choice.toUpperCase() === 'O') {
          override = true;
        } else if (choice.toUpperCase() === 'N') {
          saveAsNew = true;
        }
      }

      // Step 2: Prepare form data
      const formData = new FormData();
      formData.append('site_name', site_name);
      formData.append('category', category);
      formData.append('date', reportDate);
      formData.append('file', file);
      formData.append('override', override); // send override flag to backend
      formData.append('save_as_new', saveAsNew);

      // Step 3: Upload
      const res = await api.post('/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`Uploaded: ${res.data.report.file_name}`);
      setFile(null);

    } catch (err) {
      console.error(err.response?.data || err);
      const detail = err.response?.data?.detail || 'Unknown error';
      setMessage(`Upload failed: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate(`/${site_name}/dashboard`);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={goBack}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center">Upload Report</h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Select Category</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Select Date</label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Select File</label>
          <input type="file" onChange={handleFileChange} className="w-full" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>

        {message && <p className="mt-2 text-center text-gray-700">{message}</p>}
      </form>
    </div>
  );
}

export default UploadReport;
