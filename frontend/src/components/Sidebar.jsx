import React from "react";
import { useNavigate } from "react-router-dom";

function Sidebar({ backLinks = [] }) {
  const navigate = useNavigate();

  if (!backLinks || backLinks.length === 0) return null;

  return (
    <aside className="bg-white border-r shadow-sm flex-shrink-0
      w-44 sm:w-56 md:w-64 lg:w-72 p-4 h-screen sticky top-0">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Navigation</h3>
      </div>

      <nav className="flex flex-col gap-2">
        {backLinks.map((link, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (link.path === "back") navigate(-1);
              else navigate(link.path);
            }}
            className="text-left px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition"
          >
            {link.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
