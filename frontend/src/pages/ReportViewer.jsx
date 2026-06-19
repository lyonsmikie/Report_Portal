// src/pages/ReportViewer.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { deleteReport, changeReportVisibility } from "../api";
import HeaderBar from "../components/HeaderBar";
import Sidebar from "../components/Sidebar";

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
      {/* Full-width header and title */}
      <HeaderBar backLinks={[]} />
      <div className="w-full bg-gray-200 py-4 mb-6">
        <h1 className="text-3xl font-bold text-center">{category.toUpperCase()} Report — {date}</h1>
      </div>

      <div className="flex">
        <Sidebar
          backLinks={[
            { label: "Back to Site Selection", path: "/sites" },
            { label: "Back to Dashboard", path: `/${site_name}/dashboard` },
            { label: "Back to Dates", path: `/${site_name}/dashboard/reports/${category}/dates` },
          ]}
        />

        <main className="flex-1 px-6">
          {reports.length === 0 ? (
            <p className="text-center text-gray-600">No reports found for this date.</p>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white p-6 shadow rounded flex justify-between items-start">
                  <div className="flex-1">
                    <p className="mb-4"><strong>File Name:</strong> {report.file_name}</p>
                    <p className="mb-2"><strong>Visibility:</strong> {report.visibility || 'shared'}</p>

                    {report.file_type === "pdf" ? (
                      <iframe src={`http://localhost:8000/uploaded_reports/${report.file_name}`} width="100%" height="600px" title={report.file_name} className="rounded border" />
                    ) : (
                      <a href={`http://localhost:8000/uploaded_reports/${report.file_name}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Download {report.file_name}</a>
                    )}
                  </div>

                  {site_name === "admin" && (
                    <div className="flex flex-col ml-4 gap-2">
                      <button onClick={() => handleDelete(report.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>

                      <select value={report.visibility || 'shared'} onChange={async (e) => {
                        const newVis = e.target.value;
                        try {
                          await changeReportVisibility(report.id, newVis);
                          setReports((prev) => prev.map(r => r.id === report.id ? {...r, visibility: newVis} : r));
                          alert('Visibility updated');
                        } catch (err) {
                          alert(`Failed to update visibility: ${err.message}`);
                        }
                      }} className="border px-2 py-1 rounded">
                        <option value="shared">shared</option>
                        <option value="personal">personal</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ReportViewer;
