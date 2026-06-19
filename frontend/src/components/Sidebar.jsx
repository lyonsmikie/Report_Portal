import React from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";

function Sidebar({ backLinks = [] }) {
  const navigate = useNavigate();
  const { open, close } = useSidebar();

  if (!backLinks || backLinks.length === 0) return null;

  // On small screens, show as an overlay when `open` is true. On larger screens always visible.
  return (
    <>
      {open && (
        <div
          className="sm:hidden fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={close}
        />
      )}
      <aside
      className={`bg-white border-r shadow-sm flex-shrink-0 w-44 sm:w-56 md:w-64 lg:w-72 p-4 h-full sm:h-screen transform transition-transform duration-200 z-40
        ${open ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 fixed sm:relative left-0 top-0`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Navigation</h3>
        {/* close button visible only on small screens */}
        <button
          onClick={close}
          className="text-gray-600 sm:hidden px-2 py-1 rounded hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        {backLinks.map((link, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (link.path === "back") navigate(-1);
              else navigate(link.path);
              close();
            }}
            className="text-left px-3 py-2 rounded hover:bg-blue-500 hover:text-white transition"
          >
            {link.label}
          </button>
        ))}
      </nav>
      </aside>
    </>
  );
}

export default Sidebar;
