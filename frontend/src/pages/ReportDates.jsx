// src/pages/ReportDates.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function ReportDates() {
  const { siteId, category } = useParams(); // siteId from URL
  const navigate = useNavigate();

  const [dates, setDates] = useState([]);

  useEffect(() => {
    api.get(`/reports/${siteId}/${category}`)
      .then(res => {
        const uniqueDates = [
          ...new Set(res.data.map(r => new Date(r.date).toISOString().split('T')[0]))
        ];
        setDates(uniqueDates);
      })
      .catch(err => console.error(err));
  }, [siteId, category]);

  const handleDateClick = (date) => {
    navigate(`/${siteId}/dashboard/reports/${category}/${date}/view`);
  };

  const goBackToDashboard = () => navigate(`/${siteId}/dashboard`);
  const goHome = () => navigate('/');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Back Button */}
      <div className="flex justify-between mb-6">
        <button onClick={goHome} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
          ← Home
        </button>
        <button onClick={goBackToDashboard} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">
        {category.toUpperCase()} Reports
      </h1>

      {dates.length === 0 ? (
        <p className="text-center text-gray-600">No reports found for this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {dates.map(date => (
            <div
              key={date}
              onClick={() => handleDateClick(date)}
              className="bg-white shadow-md rounded-2xl p-6 text-center cursor-pointer hover:shadow-lg hover:bg-green-100 transition duration-200"
            >
              <h2 className="text-xl font-semibold">{date}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportDates;
