import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import { FileText, Loader2 } from "lucide-react";

const ProjectSubmissions = () => {
  const [projectSubmissions, setProjectSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProjectSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects/submissions/all", authHeaders());
      setProjectSubmissions(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching project submissions:", err);
      setError("Failed to load project submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectSubmissions();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8">
            📁 Project File Submissions
          </h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin w-12 h-12 text-indigo-600 mb-4" />
              <p className="text-gray-600">Loading project submissions...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : projectSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📂</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No Project Submissions Yet
              </h2>
              <p className="text-gray-600">
                Project file submissions will appear here once interns start submitting.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-green-100 to-teal-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">
                        #
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">
                        Project Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">
                        Intern Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">
                        File
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-green-900">
                        Submitted At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projectSubmissions.map((sub, idx) => (
                      <tr
                        key={sub.id}
                        className={`${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-green-50 transition-colors`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {sub.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          {sub.project_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {sub.project_description || "No description"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {sub.intern_name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-green-600 hover:text-green-800 font-medium hover:underline"
                          >
                            <FileText size={16} />
                            {sub.filename}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            {sub.project_status || "Submitted"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectSubmissions;
