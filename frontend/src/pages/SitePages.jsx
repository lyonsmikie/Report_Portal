// src/pages/SitePages.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function SitePages() {
  const navigate = useNavigate();

  const handleSelectSite = (site_name) => {
    navigate(`/${site_name.toLowerCase()}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Select a Site</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          onClick={() => handleSelectSite('personal')}
          className="bg-white shadow-md rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-100 transition duration-200"
        >
          <h2 className="text-2xl font-semibold mb-2">Personal</h2>
          <p>Access your personal reports and data.</p>
        </div>

        <div
          onClick={() => handleSelectSite('shared')}
          className="bg-white shadow-md rounded-2xl p-8 text-center cursor-pointer hover:bg-green-100 transition duration-200"
        >
          <h2 className="text-2xl font-semibold mb-2">Shared</h2>
          <p>Access shared reports and collaborative data.</p>
        </div>

        <div
          onClick={() => handleSelectSite('admin')}
          className="bg-white shadow-md rounded-2xl p-8 text-center cursor-pointer hover:bg-yellow-100 transition duration-200"
        >
          <h2 className="text-2xl font-semibold mb-2">Admin</h2>
          <p>Manage uploads and all reports.</p>
        </div>
      </div>
    </div>
  );
}

export default SitePages;
