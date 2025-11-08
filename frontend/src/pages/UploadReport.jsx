// src/pages/UploadReport.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function UploadReport() {
  const navigate = useNavigate();
  const { site_name } = useParams(); // get site_name from URL

  const [category, setCategory] = useState('MACD');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const categories = ['MACD', 'RSI', 'Stochastic', 'Other1', 'Other2'];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('site_id', site_name);
    formData.append('category', category);
    formData.append('file', file);

    try {
      const res = await api.post('/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Uploaded: ${res.data.report.file_name}`);
    } catch (err) {
      console.error(err);
      setMessage('Upload failed.');
    }
  };

  const goBack = () => navigate(`/dashboard/${site_name}`);

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
        {/* Category selection */}
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

        {/* File upload */}
        <div>
          <label className="block mb-1 font-semibold">Select File</label>
          <input type="file" onChange={handleFileChange} className="w-full" />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
        >
          Upload
        </button>

        {message && <p className="mt-2 text-center text-gray-700">{message}</p>}
      </form>
    </div>
  );
}

export default UploadReport;
