// src/pages/ReportCategories.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ReportCategories() {
  const navigate = useNavigate();
  const { site_name } = useParams(); // Get site_name from URL

  // Define categories
  const categories = ['MACD', 'RSI', 'Stochastic', 'Other1', 'Other2'];

  const handleCategoryClick = (category) => {
    navigate(`/${site_name}/dashboard/reports/${category.toLowerCase()}/dates`);
  };

  const handleBackClick = () => navigate(`/${site_name}/dashboard`);
  const handleHomeClick = () => navigate('/');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between mb-6">
        <button
          onClick={handleHomeClick}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          ← Home
        </button>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Select Report Category</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className="bg-white shadow-md rounded-2xl p-6 text-center cursor-pointer hover:bg-blue-100 transition duration-200"
          >
            <h2 className="text-xl font-semibold">{cat}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportCategories;
