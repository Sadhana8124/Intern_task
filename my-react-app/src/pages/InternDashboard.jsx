
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const InternDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectSubmissions, setProjectSubmissions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProjectSubmissions, setLoadingProjectSubmissions] = useState(true);
  const [errorTasks, setErrorTasks] = useState(null);
  const [errorProjects, setErrorProjects] = useState(null);
  const [activeTab, setActiveTab] = useState("current");
  const [profile, setProfile] = useState(null);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  // ---------------- FETCH PROFILE ----------------
  const fetchProfile = async () => {
    try {
      const res = await api.get("/intern/profile");
      console.log("Profile data:", res.data);
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err.response?.data || err.message);
    }
  };

  // ---------------- FETCH TASKS ----------------
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await api.get("/intern/tasks");
      setTasks(res.data);
      setErrorTasks(null);
    } catch (err) {
      console.error("Error fetching tasks:", err.response?.data || err.message);
      setErrorTasks("Failed to load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  // ---------------- FETCH PROJECTS ----------------
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);

      // ✅ Ensure token is sent
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorProjects("No token found. Please log in again.");
        setLoadingProjects(false);
        return;
      }

      console.log("Token being sent:", token);

      const res = await api.get("/projects/my_projects", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Projects data:", res.data);
      setProjects(res.data);
      setErrorProjects(null);
    } catch (err) {
      console.error("Error fetching projects:", err.response?.data || err.message);
      setErrorProjects("Failed to load projects.");
    } finally {
      setLoadingProjects(false);
    }
  };

  // ---------------- FETCH PROJECT SUBMISSIONS ----------------
  const fetchProjectSubmissions = async () => {
    try {
      setLoadingProjectSubmissions(true);
      const res = await api.get("/projects/submissions/my");
      console.log("Project submissions:", res.data);
      setProjectSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching project submissions:", err.response?.data || err.message);
    } finally {
      setLoadingProjectSubmissions(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTasks();
    fetchProjects();
    fetchProjectSubmissions();
  }, []);

  // ---------------- SUBMIT TASK FILE ----------------
  const handleTaskSubmit = async (taskId, file) => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/intern/tasks/${taskId}/complete`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File submitted successfully!");
      fetchTasks();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.detail || "Failed to submit file.");
    }
  };

  // ---------------- FILTER TASKS ----------------
  const currentTasks = tasks.filter((t) => !t.is_completed);
  const historyTasks = tasks.filter((t) => t.is_completed);
  
  // Combine task submissions and project submissions for history
  const allSubmissions = [
    ...historyTasks.map(task => ({
      type: 'task',
      id: task.id,
      title: task.title,
      description: task.description,
      submitted_at: task.submitted_at || task.created_at,
      status: 'Completed'
    })),
    ...projectSubmissions.map(sub => ({
      type: 'project',
      id: sub.id,
      title: sub.project_name,
      description: `Project file: ${sub.filename}`,
      submitted_at: sub.submitted_at,
      file_url: sub.file_url,
      status: 'Submitted'
    }))
  ].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

  // ---------------- TASK TABLE ----------------
  const TaskTable = ({ title, data, showUpload }) => (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      {data.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">No tasks available</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="grid grid-cols-4 gap-6 bg-blue-50 px-6 py-3 border-b border-gray-200">
            <div className="text-sm font-bold text-gray-700">Title</div>
            <div className="text-sm font-bold text-gray-700">Description</div>
            <div className="text-sm font-bold text-gray-700">{showUpload ? "Submit Work" : "Status"}</div>
          </div>
          {data.map((task, index) => (
            <div
              key={task.id}
              className="grid grid-cols-4 gap-6 px-6 py-4 border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
            >
              <div className="font-semibold text-gray-900">{task.title}</div>
              <div className="text-gray-600 text-sm">{task.description}</div>
              {showUpload ? (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`file-upload-${task.id}`}
                    className="bg-blue-500 text-white px-3 py-1.5 rounded-lg cursor-pointer text-sm font-medium hover:bg-blue-600 transition"
                  >
                    📂 Choose File
                  </label>
                  <input
                    id={`file-upload-${task.id}`}
                    type="file"
                    onChange={(e) =>
                      setSelectedFiles({
                        ...selectedFiles,
                        [task.id]: e.target.files[0],
                      })
                    }
                    className="hidden"
                  />
                  {selectedFiles?.[task.id] && (
                    <span className="text-xs text-gray-600 truncate max-w-[100px] bg-gray-100 px-2 py-1 rounded">
                      {selectedFiles[task.id].name}
                    </span>
                  )}
                  <button
                    onClick={() =>
                      handleTaskSubmit(task.id, selectedFiles[task.id])
                    }
                    disabled={!selectedFiles?.[task.id]}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-lg text-sm">
                  ✅ Submitted
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ---------------- SUBMISSION HISTORY TABLE ----------------
  const SubmissionHistoryTable = ({ data }) => (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Submission History</h2>
      {data.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 font-medium">No submissions yet</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="grid grid-cols-5 gap-4 bg-green-50 px-6 py-3 border-b border-gray-200">
            <div className="text-sm font-bold text-gray-700">Type</div>
            <div className="text-sm font-bold text-gray-700">Title</div>
            <div className="text-sm font-bold text-gray-700">Description</div>
            <div className="text-sm font-bold text-gray-700">Status</div>
            <div className="text-sm font-bold text-gray-700">Submitted At</div>
          </div>
          {data.map((item, index) => (
            <div
              key={`${item.type}-${item.id}`}
              className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-green-50/50 transition-colors"
            >
              <div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  item.type === 'task' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {item.type === 'task' ? '📋 Task' : '📁 Project'}
                </span>
              </div>
              <div className="font-semibold text-gray-900">{item.title}</div>
              <div className="text-gray-600 text-sm">
                {item.type === 'project' && item.file_url ? (
                  <a 
                    href={item.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {item.description}
                  </a>
                ) : (
                  item.description
                )}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-lg text-sm">
                  ✅ {item.status}
                </span>
              </div>
              <div className="text-gray-600 text-sm font-medium">
                {new Date(item.submitted_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ---------------- PROJECT FILE SUBMISSION ----------------
  const handleProjectFileSubmit = async (projectId, file) => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);

    try {
      await api.post(`/projects/${projectId}/submit-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File submitted successfully!");
      setSelectedFiles({ ...selectedFiles, [`project-${projectId}`]: null });
      // Refresh project submissions
      fetchProjectSubmissions();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.detail || "Failed to submit file.");
    }
  };

  // ---------------- PROJECT TABLE ----------------
const ProjectTable = ({ data, profile }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-gray-800 mb-4">My Projects</h2>
    {data.length === 0 ? (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500 font-medium">No assigned projects</p>
      </div>
    ) : (
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="grid grid-cols-5 gap-4 bg-purple-50 px-6 py-3 border-b border-gray-200">
          <div className="text-sm font-bold text-gray-700">Name</div>
          <div className="text-sm font-bold text-gray-700">Description</div>
          <div className="text-sm font-bold text-gray-700">Status</div>
          <div className="text-sm font-bold text-gray-700">Role</div>
          <div className="text-sm font-bold text-gray-700">Submit File</div>
        </div>
        {data.map((project, index) => {
          const member = project.members?.find(
            (m) => Number(m.user_id) === Number(profile?.id)
          );
          const role = member?.role || "Member";

          return (
            <div
              key={project.id}
              className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-purple-50/50 transition-colors"
            >
              <div className="font-semibold text-gray-900">{project.name}</div>
              <div className="text-gray-600 text-sm">{project.description}</div>
              <div className="text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold text-xs">{project.status}</span>
              </div>
              <div className="text-sm">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-semibold text-xs">{role}</span>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`project-file-upload-${project.id}`}
                  className="bg-purple-500 text-white px-3 py-1.5 rounded-lg cursor-pointer text-sm font-medium hover:bg-purple-600 transition"
                >
                  📂 Choose File
                </label>
                <input
                  id={`project-file-upload-${project.id}`}
                  type="file"
                  onChange={(e) =>
                    setSelectedFiles({
                      ...selectedFiles,
                      [`project-${project.id}`]: e.target.files[0],
                    })
                  }
                  className="hidden"
                />
                {selectedFiles?.[`project-${project.id}`] && (
                  <span className="text-xs text-gray-600 truncate max-w-[80px] bg-gray-100 px-2 py-1 rounded">
                    {selectedFiles[`project-${project.id}`].name}
                  </span>
                )}
                <button
                  onClick={() =>
                    handleProjectFileSubmit(project.id, selectedFiles[`project-${project.id}`])
                  }
                  disabled={!selectedFiles?.[`project-${project.id}`]}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);



  // Calculate stats
  const submittedTasks = tasks.filter(t => t.is_completed);
  const pendingTasks = tasks.filter(t => !t.is_completed);

  // ---------------- RENDER ----------------
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 text-gray-800 flex flex-col h-screen shadow-sm">
        {/* Profile Section */}
        <div className="p-5 border-b border-gray-200 bg-blue-50">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowProfileDetails(!showProfileDetails)}
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">{profile?.full_name?.[0] || "I"}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-900">
                {profile?.full_name || "Loading..."}
              </h2>
              <p className="text-xs text-gray-600">Intern</p>
            </div>
          </div>
          {showProfileDetails && profile && (
            <div className="mt-3 bg-white p-3 rounded-lg space-y-2 text-sm">
              <p>
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="text-gray-600 ml-2">{profile.email}</span>
              </p>
              <p>
                <span className="font-semibold text-gray-700">Role:</span>
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{profile.role}</span>
              </p>
            </div>
          )}
        </div>

        {/* Menu Buttons */}
        <div className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab("current")}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "current"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">📋</span>
            <span>Current Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "history"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">📜</span>
            <span>Task History</span>
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === "projects"
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">📁</span>
            <span>My Projects</span>
          </button>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-all"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Intern Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {profile?.full_name || "Intern"}!</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto bg-gray-50">

          {activeTab === "current" && (
            <>
              {loadingTasks ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600 font-medium">Loading tasks...</p>
                  </div>
                </div>
              ) : errorTasks ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-600 font-semibold">{errorTasks}</p>
                </div>
              ) : (
                <TaskTable title="Current Tasks" data={currentTasks} showUpload />
              )}
            </>
          )}

          {activeTab === "history" && (
            <>
              {loadingTasks || loadingProjectSubmissions ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600 font-medium">Loading history...</p>
                  </div>
                </div>
              ) : errorTasks ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-600 font-semibold">{errorTasks}</p>
                </div>
              ) : (
                <SubmissionHistoryTable data={allSubmissions} />
              )}
            </>
          )}

          {activeTab === "projects" && (
            <>
              {loadingProjects || !profile ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600 font-medium">Loading projects...</p>
                  </div>
                </div>
              ) : errorProjects ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-600 font-semibold">{errorProjects}</p>
                </div>
              ) : (
                <ProjectTable data={projects} profile={profile} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;

