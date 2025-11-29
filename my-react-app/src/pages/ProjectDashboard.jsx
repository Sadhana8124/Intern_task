import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FiSearch, FiMoreVertical, FiUser } from "react-icons/fi";
import { MdArrowDropDown } from "react-icons/md";
import api from "../services/api";
function ColumnDropdown({ coords, onClose, onAction }) {
  const menuRef = useRef(null);
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    function handleMousedown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleMousedown);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleMousedown);
    };
  }, [onClose]);
  const style = {
    position: "absolute",
    top: coords.top + "px",
    left: coords.left + "px",
    minWidth: 220,
    zIndex: 9999,
  };
  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={style}
      className="bg-white border border-gray-200 rounded-md shadow-xl"
    >
      <ul className="text-sm text-gray-700">
        {["sort-asc", "sort-desc", "filter", "move-left", "move-right", "add-column", "remove-column"].map(
          (action) => (
            <li
              key={action}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                action === "remove-column" ? "text-red-600" : ""
              }`}
              onClick={() => onAction(action)}
            >
              {action.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </li>
          )
        )}
      </ul>
    </div>,
    document.body
  );
}
export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [statusMenuCoords, setStatusMenuCoords] = useState(null);
  const statusButtonRef = useRef(null);
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);
  const [publicMenuCoords, setPublicMenuCoords] = useState(null);
  const publicButtonRef = useRef(null);
  const [toolbarFilter, setToolbarFilter] = useState("All Projects");
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects/");
        setProjects(res.data);
      } catch (err) {
        console.warn("API fetch failed — using fallback data", err);
      }
    };
    fetchProjects();
  }, []);
  const filteredProjects = projects
    .filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (toolbarFilter === "All Projects") return true;
      if (toolbarFilter === "Active Projects")
        return p.status === "On Track" || p.status === "In Progress";
      if (toolbarFilter === "Pending") return p.status === "Pending";
      if (toolbarFilter === "At Risk") return p.status === "At Risk";
      if (toolbarFilter === "Off Track") return p.status === "Off Track";
      if (toolbarFilter === "Completed") return p.status === "Completed";
      return true;
    });
    const toggleStatusMenu = () => {
    if (!statusMenuOpen && statusButtonRef.current) {
      const rect = statusButtonRef.current.getBoundingClientRect();
      setStatusMenuCoords({
        top: Math.round(rect.bottom + window.scrollY + 6),
        left: Math.round(rect.left + window.scrollX),
      });
      setStatusMenuOpen(true);
    } else setStatusMenuOpen(false);
  };
  const togglePublicMenu = () => {
    if (!publicMenuOpen && publicButtonRef.current) {
      const rect = publicButtonRef.current.getBoundingClientRect();
      setPublicMenuCoords({
        top: Math.round(rect.bottom + window.scrollY + 6),
        left: Math.round(rect.left + window.scrollX),
      });
      setPublicMenuOpen(true);
    } else setPublicMenuOpen(false);
  };
  const handleStatusAction = (action) => {
    setStatusMenuOpen(false);
    if (action === "sort-asc")
      setProjects((prev) =>
        [...prev].sort((a, b) => (a.status || "").localeCompare(b.status || ""))
      );
    if (action === "sort-desc")
      setProjects((prev) =>
        [...prev].sort((a, b) => (b.status || "").localeCompare(a.status || ""))
      );
  };
  const handlePublicAction = (action) => {
    setPublicMenuOpen(false);
    if (action === "sort-asc")
      setProjects((prev) =>
        [...prev].sort((a, b) =>
          a.is_public === b.is_public ? 0 : a.is_public ? -1 : 1
        )
      );
    if (action === "sort-desc")
      setProjects((prev) =>
        [...prev].sort((a, b) =>
          a.is_public === b.is_public ? 0 : a.is_public ? 1 : -1
        )
      );
  };
  const handleProjectClick = async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      console.log("Project details:", res.data);
      console.log("Submissions:", res.data.submissions);
      setSelectedProject(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch project details", err);
    }
  };
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-8 tracking-wide">
          Projects
        </h2>
        <nav className="space-y-3 text-gray-700">
          {["Active projects", "My projects", "Favorite projects"].map((label) => (
            <button
              key={label}
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 font-medium transition"
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Projects Dashboard</h1>
          <div className="relative">
            <button
              onClick={() => setToolbarOpen(!toolbarOpen)}
              className="px-4 py-2 border rounded-lg flex items-center space-x-2 hover:bg-indigo-50 hover:border-indigo-300 transition"
            >
              <span>{toolbarFilter}</span>
              <MdArrowDropDown className="text-lg text-gray-700" />
            </button>
            {toolbarOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                {[
                  "All Projects",
                  "Active Projects",
                  "Pending",
                  "At Risk",
                  "Off Track",
                  "Completed",
                ].map((opt) => (
                  <div
                    key={opt}
                    className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer transition"
                    onClick={() => {
                      setToolbarFilter(opt);
                      setToolbarOpen(false);
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-sm"
            />
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-indigo-50 text-gray-700 font-semibold">
              <tr>
                <th className="px-6 py-3">★</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3 relative">
                  <button
                    ref={statusButtonRef}
                    className="flex items-center space-x-1 focus:outline-none hover:text-indigo-700"
                    onClick={toggleStatusMenu}
                  >
                    Status <MdArrowDropDown className="text-lg" />
                  </button>
                </th>
                <th className="px-6 py-3 relative">
                  <button
                    ref={publicButtonRef}
                    className="flex items-center space-x-1 focus:outline-none hover:text-indigo-700"
                    onClick={togglePublicMenu}
                  >
                    Public <MdArrowDropDown className="text-lg" />
                  </button>
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
                  const statusText = (project.status || "Pending").toUpperCase();
                  const statusClasses =
                    project.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : project.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : project.status === "Pending"
                      ? "bg-gray-100 text-gray-700"
                      : project.status === "Off Track"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700";
                      return (
                    <tr
                      key={project.id}
                      className="hover:bg-indigo-50 transition cursor-pointer"
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <td className="px-6 py-3 text-lg">⭐</td>
                      <td className="px-6 py-3 text-indigo-600 font-medium hover:underline">
                        {project.name}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusClasses}`}
                        >
                          ● {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {project.is_public ? "✔️" : ""}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <FiMoreVertical className="text-gray-500 cursor-pointer hover:text-indigo-700 transition" />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-gray-500">
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {modalOpen && selectedProject && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-2xl w-3/5 max-h-[85vh] overflow-y-auto shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold text-indigo-700">{selectedProject.name}</h2>
        <button
          onClick={() => setModalOpen(false)}
          className="text-gray-400 hover:text-gray-700 font-bold text-2xl transition"
        >
          &times;
        </button>
      </div>
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Created By:</span>
          <span className="text-gray-600">{selectedProject.created_by || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            selectedProject.status === "Completed" ? "bg-green-100 text-green-700" :
            selectedProject.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
            selectedProject.status === "Pending" ? "bg-gray-100 text-gray-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            {selectedProject.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Team Leader:</span>
          <span className="text-gray-600">
            {selectedProject.team_leader?.full_name || "Not assigned"}
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Team Members:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedProject.team_members && selectedProject.team_members.length > 0 ? (
              selectedProject.team_members.map((member, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {member.full_name}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic">No members assigned</span>
            )}
          </div>
        </div>
      </div>
      <div className="border-t pt-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📁 Project Submissions</h3>
        {selectedProject.submissions && selectedProject.submissions.length > 0 ? (
          <div className="space-y-3">
            {selectedProject.submissions.map((sub) => (
              <div key={sub.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FiUser className="text-indigo-600" />
                      <span className="font-semibold text-gray-700">{sub.intern_name}</span>
                      {sub.type && (
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          sub.type === 'project' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {sub.type === 'project' ? 'Project' : 'Task'}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Submitted: {formatDate(sub.submitted_at)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">File:</span>
                      <span className="text-sm font-medium text-gray-700">{sub.filename}</span>
                    </div>
                  </div>
                  {sub.file_url ? (
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                    >
                      View File
                    </a>
                  ) : (
                    <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium text-sm cursor-not-allowed">
                      No File
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
            No submissions yet
          </div>
        )}
      </div>
    </div>
  </div>
)}
{statusMenuOpen && statusMenuCoords && (
          <ColumnDropdown
            coords={statusMenuCoords}
            onClose={() => setStatusMenuOpen(false)}
            onAction={handleStatusAction}
          />
        )}
        {publicMenuOpen && publicMenuCoords && (
          <ColumnDropdown
            coords={publicMenuCoords}
            onClose={() => setPublicMenuOpen(false)}
            onAction={handlePublicAction}
          />
        )}
      </main>
    </div>
  );
}
