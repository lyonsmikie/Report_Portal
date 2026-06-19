// src/pages/ReportDates.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import HeaderBar from "../components/HeaderBar";

function ReportDates() {
  const { site_name, category } = useParams();
  const navigate = useNavigate();

  const [dates, setDates] = useState([]);

  useEffect(() => {
    async function fetchDates() {
      const res = await api.get(`/report-dates/${site_name}/${category}`);
      setDates(res.data);
    }
    fetchDates();
  }, [site_name, category]);

  const handleDateClick = (date) => {
    navigate(`/${site_name}/dashboard/reports/${category}/${date}/view`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* 🔥 NEW: Standardized top bar */}
      <HeaderBar
        backLinks={[
          { label: "Back to Site Selection", path: "/sites" },
          { label: "Back to Dashboard", path: `/${site_name}/dashboard` }
        ]}
      />

      <div className="w-full bg-gray-200 py-4 mb-6">
        <h1 className="text-3xl font-bold text-center">{category.toUpperCase()} Reports</h1>
      </div>

      {dates.length === 0 ? (
        <p className="text-center text-gray-600">
          No reports found for this category.
        </p>
      ) : (
        <div className="flex flex-wrap justify-center items-stretch gap-6 max-w-4xl mx-auto">
          {dates.map((date) => {
            const formattedDate = new Date(date).toLocaleDateString("en-GB");
            return (
              <div
                key={date}
                onClick={() => handleDateClick(date)}
                className="bg-white text-black shadow-md rounded-2xl p-6 text-center cursor-pointer hover:bg-blue-500 hover:text-white transition duration-200 w-64 h-28 flex items-center justify-center"
              >
                <h2 className="text-xl font-semibold">{formattedDate}</h2>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReportDates;
