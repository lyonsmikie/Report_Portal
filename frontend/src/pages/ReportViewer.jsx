// src/pages/ReportViewer.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { deleteReport } from "../api";
import HeaderBar from "../components/HeaderBar";

function ReportViewer() {
  const { site_name, category, date } = useParams();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);

  useEffect(() => {
    api
      .get(`/reports/${site_name}/${category}/${date}`)
      .then((res) => setReports(res.data))
      .catch((err) => console.error(err));
  }, [site_name, category, date]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport(id);
        setReports((prev) => prev.filter((r) => r.id !== id));
        alert("Report deleted successfully.");
      } catch (err) {
        alert(`Failed to delete report: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* 🔥 NEW unified navigation + logout bar */}
      <HeaderBar
        backLinks={[
          { label: "Back to Site Selection", path: "/sites" },
          { label: "Back to Dashboard", path: `/${site_name}/dashboard` },
          {
            label: "Back to Dates",
            path: `/${site_name}/dashboard/reports/${category}/dates`,
          },
        ]}
      />

      <h1 className="text-3xl font-bold mt-6 mb-6 text-center">
        {category.toUpperCase()} Report — {date}
      </h1>

      {reports.length === 0 ? (
        <p className="text-center text-gray-600">
          No reports found for this date.
        </p>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white p-6 shadow rounded flex justify-between items-start"
            >
              <div className="flex-1">
                <p className="mb-4">
                  <strong>File Name:</strong> {report.file_name}
                </p>

                {/* PDF Viewer or Download link */}
                {report.file_type === "pdf" ? (
                  <iframe
                    src={`http://localhost:8000/uploaded_reports/${report.file_name}`}
                    width="100%"
                    height="600px"
                    title={report.file_name}
                    className="rounded border"
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

              <button
                onClick={() => handleDelete(report.id)}
                className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReportViewer;
