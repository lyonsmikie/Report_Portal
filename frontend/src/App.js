// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SitePages from "./pages/SitePages";
import Dashboard from "./pages/Dashboard";
import ReportDates from "./pages/ReportDates";
import ReportViewer from "./pages/ReportViewer";
import UploadReport from "./pages/UploadReport";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔐 Login Page (entry point) */}
        <Route path="/" element={<LoginPage />} />

        {/* 🌐 Site Selection Page (after login) */}
        <Route path="/sites" element={<SitePages />} />

        {/* 🏠 Dashboard for Personal / Shared / Admin */}
        <Route path="/:site_name/dashboard" element={<Dashboard />} />

        {/* 📅 Reports by Date */}
        <Route
          path="/:site_name/dashboard/reports/:category/dates"
          element={<ReportDates />}
        />

        {/* 📊 Report Viewer */}
        <Route
          path="/:site_name/dashboard/reports/:category/:date/view"
          element={<ReportViewer />}
        />

        {/* ⬆️ Upload Report (Admin only) */}
        <Route
          path="/:site_name/dashboard/upload"
          element={<UploadReport />}
        />
      </Routes>
    </Router>
  );
}

export default App;
