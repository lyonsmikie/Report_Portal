// src/pages/SitePages.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from "../components/HeaderBar";

function SitePages() {
  const navigate = useNavigate();

  // Retrieve allowed sites from localStorage (saved after login)
  const allowedSites = JSON.parse(localStorage.getItem('allowed_sites')) || [];

  const siteOptions = [
    {
      key: 'personal',
      title: 'Personal',
      description: 'Access your personal reports and data.',
      color: 'hover:bg-blue-100',
    },
    {
      key: 'shared',
      title: 'Shared',
      description: 'Access shared reports and collaborative data.',
      color: 'hover:bg-green-100',
    },
    {
      key: 'admin',
      title: 'Admin',
      description: 'Manage uploads and all reports.',
      color: 'hover:bg-yellow-100',
    },
  ];

  const handleSelectSite = (site_name) => {
    navigate(`/${site_name.toLowerCase()}/dashboard`);
  };

  // Filter based on user’s allowed sites
  const visibleSites = siteOptions.filter((site) =>
    allowedSites.includes(site.key)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">

      {/* 🔥 NEW: Unified top bar with Logout only */}
      <HeaderBar backLinks={[]} />

      <div className="w-full bg-gray-200 py-4 mb-6">
        <h1 className="text-3xl font-bold text-center">Select a Site</h1>
      </div>

      <div className="flex flex-wrap justify-center items-stretch gap-6 max-w-4xl w-full">
        {visibleSites.length > 0 ? (
          visibleSites.map((site) => (
            <div
              key={site.key}
              onClick={() => handleSelectSite(site.key)}
              className={`bg-white text-black shadow-md rounded-2xl p-8 text-center cursor-pointer ${site.color} transition duration-200 w-80 h-40 flex flex-col justify-center items-center hover:bg-blue-500 hover:text-white`}
            >
              <h2 className="text-2xl font-semibold mb-2">{site.title}</h2>
              <p>{site.description}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center w-full">
            No sites available for this account.
          </p>
        )}
      </div>
    </div>
  );
}

export default SitePages;
