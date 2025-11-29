import React, { useState, useEffect } from "react";
import api from "../services/api";
import AdminSidebar from "../components/AdminSidebar";
import { FileText, Loader2, CheckCircle, Clock } from "lucide-react"; // icons

const TaskSubmission = () => {
  const [submissions, setSubmissions] = useState([]);
  const [projectSubmissions, setProjectSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const [taskRes, projectRes] = await Promise.all([
          api.get("/task-submissions", authHeaders()),
          api.get("/projects/submissions/all", authHeaders())
        ]);
        setSubmissions(taskRes.data);
        setProjectSubmissions(projectRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm mb-2">
              📑 All Submissions
            </h1>
            <p className="text-gray-600 text-lg">
              Review all task and project submissions uploaded by interns.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Loader2 className="animate-spin w-8 h-8 mb-3" />
                <p>Loading submissions...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : submissions.length === 0 && projectSubmissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No submissions yet 🚀
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-gradient-to-r from-teal-100 to-indigo-100 text-teal-900 font-semibold">
                    <tr className="text-left">
                      <th className="px-6 py-3 font-semibold">Type</th>
                      <th className="px-6 py-3 font-semibold">#</th>
                      <th className="px-6 py-3 font-semibold">Task/Project</th>
                      <th className="px-6 py-3 font-semibold">Intern</th>
                      <th className="px-6 py-3 font-semibold">Files</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Task Submissions */}
                    {submissions.map((sub, index) => (
                      <tr
                        key={`task-${sub.id}`}
                        className={`transition hover:bg-indigo-50 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            📋 Task
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {sub.id}
                        </td>
                        <td className="px-6 py-4">Task #{sub.task_id}</td>
                        <td className="px-6 py-4">Intern #{sub.intern_id}</td>
                        <td className="px-6 py-4 space-y-1">
                          {sub.files && sub.files.length > 0 ? (
                            sub.files.map((file, idx) => (
                              <a
                                key={idx}
                                href={`http://127.0.0.1:8000/uploads/${file.filename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition"
                              >
                                <FileText size={16} />
                                {file.filename || `File ${idx + 1}`}
                              </a>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">No files</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            sub.status === "submitted" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {sub.status === "pending" ? "submitted" : sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Project Submissions */}
                    {projectSubmissions.map((sub, index) => (
                      <tr
                        key={`project-${sub.id}`}
                        className={`transition hover:bg-green-50 ${
                          (submissions.length + index) % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            📁 Project
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {sub.id}
                        </td>
                        <td className="px-6 py-4">{sub.project_name}</td>
                        <td className="px-6 py-4">{sub.intern_name}</td>
                        <td className="px-6 py-4">
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-green-600 hover:text-green-800 transition"
                          >
                            <FileText size={16} />
                            {sub.filename}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            {sub.project_status || "Submitted"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSubmission;
