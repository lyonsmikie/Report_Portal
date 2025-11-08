// src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const { siteId } = useParams(); // Get selected site from URL

  const handleCategoryClick = (category) => {
    navigate(`/${siteId}/dashboard/reports/${category.toLowerCase()}`);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const categories = ['MACD', 'RSI', 'Stochastic', 'Other1', 'Other2'];

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-right">
      <button
        onClick={handleBackClick}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        ← Back to Site Selection
      </button>
      
      <h1 className="text-3xl font-bold mb-6 text-center">
        Report Portal Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* Reports Card */}
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className="bg-white shadow-md rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-200 transition duration-200"
          >
            <h2 className="text-xl font-semibold">{cat}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
