import React from "react";
import { useNavigate } from "react-router-dom";

function HeaderBar({ backLinks = [], showLogout = true, showDocumentation = true }) {
  const navigate = useNavigate();
  // derive simple site name from URL (first path segment)
  const siteFromPath = window.location.pathname.split('/').filter(Boolean)[0] || '';
  const compactSiteTitle = siteFromPath ? siteFromPath.toUpperCase() : 'Report Portal';
  // Sidebar toggle handled via window event 'toggleSidebar'

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("allowed_sites");
    navigate("/");
  };

  const handleDocumentation = () => {
    navigate("/documentation");
  };

  return (
    <div className="w-full flex justify-between items-center px-6 py-4 bg-blue-500 shadow-md mb-6">

      {/* LEFT SIDE: Hamburger (small) + Back Buttons (larger screens) */}
      <div className="flex gap-3 items-center">
        {/* hamburger visible on small screens */}
        <button
          onClick={() => {
            const ev = new CustomEvent('toggleSidebar');
            window.dispatchEvent(ev);
          }}
          className="text-white px-2 py-1 sm:hidden"
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        {/* compact site title on small screens */}
        <div className="block sm:hidden text-white font-semibold mr-2">{compactSiteTitle}</div>

        <div className="hidden sm:flex gap-3">
          {backLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => {
                if (link.path === "back") navigate(-1);
                else navigate(link.path);
              }}
              className="text-white px-3 py-2 hover:underline transition"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE: DOCUMENTATION & LOGOUT */}
      <div className="flex gap-3">
        {showLogout && showDocumentation && (
          <button
            onClick={handleDocumentation}
            className="text-white px-3 py-2 hover:underline transition"
          >
            Documentation
          </button>
        )}
        {showLogout && (
          <button
            onClick={handleLogout}
            className="text-white px-3 py-2 hover:underline transition"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default HeaderBar;
