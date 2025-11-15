// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";

function Dashboard() {
  const navigate = useNavigate();
  const { site_name } = useParams();

  const handleCategoryClick = (category) => {
    navigate(`/${site_name}/dashboard/reports/${category.toLowerCase()}/dates`);
  };

  const handleUploadClick = () => {
    if (site_name.toLowerCase() === "admin") {
      navigate(`/${site_name}/dashboard/upload`);
    }
  };

  const categories = ["MACD", "RSI", "Stochastic", "Other1", "Other2"];

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">

      {/* 🔥 NEW: HeaderBar with back button & logout */}
      <HeaderBar
        backLinks={[
          { label: "Back to Site Selection", path: "/sites" }
        ]}
      />

      <h1 className="text-3xl font-bold mb-6 text-center">
        Report Portal Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className="bg-white shadow-md rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-200 transition duration-200"
          >
            <h2 className="text-xl font-semibold">{cat}</h2>
          </div>
        ))}

        {site_name.toLowerCase() === "admin" && (
          <div
            onClick={handleUploadClick}
            className="bg-white shadow-md rounded-2xl p-6 text-center cursor-pointer hover:bg-yellow-200 transition duration-200"
          >
            <h2 className="text-xl font-semibold">Upload Report</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
