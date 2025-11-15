import React from "react";
import { useNavigate } from "react-router-dom";

function HeaderBar({ backLinks = [], showLogout = true }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("allowed_sites");
    navigate("/");
  };

  return (
    <div className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md mb-6">

      {/* LEFT SIDE: BACK BUTTONS */}
      <div className="flex gap-3">
        {backLinks.map((link, index) => (
          <button
            key={index}
            onClick={() => navigate(link.path)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* RIGHT SIDE: LOGOUT */}
      {showLogout && (
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      )}
    </div>
  );
}

export default HeaderBar;
