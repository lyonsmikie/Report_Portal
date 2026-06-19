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
    <div className="w-full flex justify-between items-center px-6 py-4 bg-blue-500 shadow-md mb-6">

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
            className="text-white px-3 py-2 hover:underline transition"
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
