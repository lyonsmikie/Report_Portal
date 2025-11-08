// src/pages/ReportViewer.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function ReportViewer() {
  const { site_name, category, date } = useParams(); // get site_name from URL
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get(`/reports/${site_name}/${category}/${date}`)
      .then(res => setReports(res.data))
      .catch(err => console.error(err));
  }, [site_name, category, date]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Back Button */}
      <div className="flex justify-between mb-6">
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
          ← Home
        </button>
        <button onClick={() => navigate(`/${site_name}/dashboard`)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          ← Dashboard
        </button>
        <button onClick={() => navigate(`/${site_name}/dashboard/reports/${category}`)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          ← Dates
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">
        {category.toUpperCase()} Report — {date}
      </h1>

      {reports.length === 0 ? (
        <p className="text-center text-gray-600">No reports found for this date.</p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white p-6 shadow rounded">
              <p className="mb-4"><strong>File Name:</strong> {report.file_name}</p>

              {report.file_type === 'pdf' ? (
                <iframe
                  src={`http://localhost:8000/uploaded_reports/${report.file_name}`}
                  width="100%"
                  height="600px"
                  title={report.file_name}
                />
              ) : (
                <a
                  href={`http://localhost:8000/uploaded_reports/${report.file_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Download {report.file_name}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportViewer;
