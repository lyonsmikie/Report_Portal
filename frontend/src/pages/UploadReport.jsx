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
  const [showOptions, setShowOptions] = useState(false); // NEW
  const [pendingUpload, setPendingUpload] = useState(null); // NEW

  const categories = ['MACD', 'RSI', 'Stochastic', 'Other1', 'Other2'];

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file to upload.");
    if (!reportDate) return alert("Please select a date.");

    setLoading(true);
    setMessage('Checking for existing reports...');

    try {
      // Step 1: Check if report exists
      const existing = await api.get(`/reports/${site_name}/${category}/${reportDate}`);

      if (existing.data.length > 0) {
        // Show options instead of prompt
        setPendingUpload({ file, category, reportDate });
        setShowOptions(true);
        setLoading(false);
        return;
      }

      // No existing report → upload directly
      await doUpload(file, category, reportDate, false);
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage(`Upload failed: ${err.response?.data?.detail || 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Step 2: Perform upload
  const doUpload = async (file, category, reportDate, override, saveAsNew = false) => {
    const formData = new FormData();
    formData.append('site_name', site_name);
    formData.append('category', category);
    formData.append('date', reportDate);
    formData.append('file', file);
    formData.append('override', override);
    formData.append('save_as_new', saveAsNew); // NEW

    setMessage('Uploading...');
    try {
      const res = await api.post('/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Uploaded: ${res.data.report.file_name}`);
      setFile(null);
      setShowOptions(false);
      setPendingUpload(null);
    } catch (err) {
      console.error(err.response?.data || err);
      setMessage(`Upload failed: ${err.response?.data?.detail || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Button handlers for existing file
  const handleOption = (option) => {
    if (!pendingUpload) return;
    if (option === 'override') {
      doUpload(pendingUpload.file, pendingUpload.category, pendingUpload.reportDate, true, false);
    } else if (option === 'new') {
      doUpload(pendingUpload.file, pendingUpload.category, pendingUpload.reportDate, false, true);
    } else if (option === 'cancel') {
      setShowOptions(false);
      setPendingUpload(null);
      setMessage('Upload cancelled');
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
          disabled={loading || showOptions}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>

        {message && <p className="mt-2 text-center text-gray-700">{message}</p>}
      </form>

      {/* === Override / New / Cancel Options === */}
      {showOptions && (
        <div className="max-w-md mx-auto mt-4 p-4 bg-yellow-100 rounded shadow space-x-2 text-center">
          <p className="mb-2 font-semibold">A report already exists for this category and date.</p>
          <button
            onClick={() => handleOption('override')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Override
          </button>
          <button
            onClick={() => handleOption('new')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save as New
          </button>
          <button
            onClick={() => handleOption('cancel')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadReport;
