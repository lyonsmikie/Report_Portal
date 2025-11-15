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

      <h1 className="text-3xl font-bold mt-6 mb-6 text-center">
        {category.toUpperCase()} Reports
      </h1>

      {dates.length === 0 ? (
        <p className="text-center text-gray-600">
          No reports found for this category.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {dates.map((date) => {
            const formattedDate = new Date(date).toLocaleDateString("en-GB");
            return (
              <div
                key={date}
                onClick={() => handleDateClick(date)}
                className="bg-white shadow-md rounded-2xl p-6 text-center cursor-pointer hover:shadow-lg hover:bg-green-100 transition duration-200"
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
