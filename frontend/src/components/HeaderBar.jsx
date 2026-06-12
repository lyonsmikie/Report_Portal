import React from "react";
import { useNavigate } from "react-router-dom";

function HeaderBar({ backLinks = [], showLogout = true, showDocumentation = true }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("allowed_sites");
    navigate("/");
  };

  const handleDocumentation = () => {
    navigate("/documentation");
  };

  return (
    <div className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md mb-6">

      {/* LEFT SIDE: BACK BUTTONS */}
      <div className="flex gap-3">
        {backLinks.map((link, index) => (
          <button
            key={index}
            onClick={() => {
              if (link.path === "back") {
                navigate(-1);
              } else {
                navigate(link.path);
              }
            }}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* RIGHT SIDE: DOCUMENTATION & LOGOUT */}
      <div className="flex gap-3">
        {showLogout && showDocumentation && (
          <button
            onClick={handleDocumentation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Documentation
          </button>
        )}
        {showLogout && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default HeaderBar;
