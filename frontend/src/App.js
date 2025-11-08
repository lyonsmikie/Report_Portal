// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SitePages from './pages/SitePages';
import Dashboard from './pages/Dashboard';
import ReportCategories from './pages/ReportCategories';
import ReportDates from './pages/ReportDates';
import ReportViewer from './pages/ReportViewer';
import UploadReport from './pages/UploadReport';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<SitePages />} />

        {/* Dashboard for Personal / Shared */}
        <Route path="/:siteId/dashboard" element={<Dashboard />} />

        {/* Reports by Category */}
        <Route path="/:siteId/dashboard/reports/:category" element={<ReportCategories />} />

        {/* Reports by Date */}
        <Route path="/:siteId/dashboard/reports/:category/:date" element={<ReportDates />} />

        {/* Report Viewer */}
        <Route path="/:siteId/dashboard/reports/:category/:date/view" element={<ReportViewer />} />

        {/* Upload Report */}
        <Route path="/upload-report" element={<UploadReport />} />
      </Routes>
    </Router>
  );
}

export default App;