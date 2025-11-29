import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminSidebar from "../components/AdminSidebar";
import { FileText, Loader2, Bell } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const AdminDashboard = () => {
  const [interns, setInterns] = useState([]);
  const [pendingInterns, setPendingInterns] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [projectSubmissions, setProjectSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [viewedNotifications, setViewedNotifications] = useState(() => {
    const stored = localStorage.getItem("viewed_notifications");
    return stored ? JSON.parse(stored) : [];
  });

  const [loadingInterns, setLoadingInterns] = useState(true);
  const [errorInterns, setErrorInterns] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [errorSubmissions, setErrorSubmissions] = useState(null);

  const [activeSection, setActiveSection] = useState("");
  const [profile, setProfile] = useState(null);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const navigate = useNavigate();

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // ---------- Fetchers ----------
  const fetchInterns = async () => {
    try {
      setLoadingInterns(true);
      const res = await api.get("/users/interns/", authHeaders());
      setInterns(res.data);
      // set pending from server data
      setPendingInterns(res.data.filter((i) => !i.is_approved));
      setLoadingInterns(false);
    } catch (err) {
      console.error("fetchInterns:", err);
      setErrorInterns("Failed to load interns.");
      setLoadingInterns(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const [taskRes, projectRes] = await Promise.all([
        api.get("/task-submissions", authHeaders()),
        api.get("/projects/submissions/all", authHeaders())
      ]);
      setSubmissions(taskRes.data);
      setProjectSubmissions(projectRes.data);
      setLoadingSubmissions(false);
    } catch (err) {
      console.error("fetchSubmissions:", err);
      setErrorSubmissions("Failed to load submissions.");
      setLoadingSubmissions(false);
    }
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await api.get("/admin/notifications", authHeaders());
      // Filter out viewed notifications
      const viewed = JSON.parse(localStorage.getItem("viewed_notifications") || "[]");
      const filtered = (res.data || []).filter(notif => !viewed.includes(notif.id));
      setNotifications(filtered);
    } catch (err) {
      console.error("fetchNotifications:", err);
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // ---------- Approve intern ----------
  const approveIntern = async (id) => {
    try {
      // Try PATCH first (typical REST)
      try {
        await api.patch(`/users/interns/${id}`, { is_approved: true }, authHeaders());
      } catch (err) {
        // If PATCH returns 404 or not allowed, try admin endpoint
        const status = err?.response?.status;
        if (status === 404 || status === 405 || status === 400) {
          await api.post(`/admin/approve-intern/${id}`, {}, authHeaders());
        } else {
          throw err;
        }
      }

      toast.success("Intern approved successfully");

      // Mark notification as viewed
      markNotificationAsViewed(`intern-${id}`);

      // Refresh all data
      await Promise.all([fetchInterns(), fetchSubmissions(), fetchNotifications()]);
    } catch (err) {
      console.error("approveIntern:", err);
      toast.error("Failed to approve intern");
    }
  };

  // ---------- Mark notification as viewed ----------
  const markNotificationAsViewed = (notificationId) => {
    const viewed = JSON.parse(localStorage.getItem("viewed_notifications") || "[]");
    if (!viewed.includes(notificationId)) {
      viewed.push(notificationId);
      localStorage.setItem("viewed_notifications", JSON.stringify(viewed));
      setViewedNotifications(viewed);
    }
    // Remove from current notifications
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // ---------- View submission ----------
  const viewSubmission = (submissionId, submissionType) => {
    // Mark notification as viewed with correct ID format
    // Backend uses 'task-submission-{id}' or 'project-submission-{id}'
    const notificationId = submissionType === 'project-submission' 
      ? `project-submission-${submissionId}`
      : `task-submission-${submissionId}`;
    
    markNotificationAsViewed(notificationId);
    
    // Navigate to submissions section and highlight the submission
    setActiveSection("submissions");
    // Optionally scroll to the submission
    setTimeout(() => {
      const element = document.getElementById(`submission-${submissionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight-submission");
        setTimeout(() => element.classList.remove("highlight-submission"), 2000);
      }
    }, 100);
  };

  // ---------- Profile ----------
  const fetchProfile = async () => {
    try {
      const res = await api.get("/admin/profile", authHeaders());
      setProfile(res.data);
    } catch (err) {
      console.error("fetchProfile:", err);
    }
  };

  // ---------- On mount ----------
  useEffect(() => {
    // load everything
    fetchInterns();
    fetchSubmissions();
    fetchProfile();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- UI helpers ----------
  const getSectionClass = (section) =>
    `transition-all duration-500 ease-in-out overflow-hidden ${
      activeSection === section ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0"
    }`;

  const COLORS = ["#34D399", "#3B82F6", "#F59E0B", "#F87171", "#8B5CF6"];

  // ---------- Quick Actions (example handlers) ----------
  const handleCreateTask = () => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else navigate("/projects");
  };

  const handleAssignTask = () => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    else navigate("/tasks");
  };

  const handleTrackProgress = () => {
    setActiveSection((s) => (s === "progress" ? "" : "progress"));
  };

  return (
    <div className="flex min-h-screen text-gray-800 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 shadow-lg flex flex-col">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 px-8 py-5 sticky top-0 z-50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, {profile?.full_name || "Admin"} 👋</p>
            </div>

            <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setActiveSection((s) => (s === "notifications" ? "" : "notifications"))}
                className="relative p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Bell className="h-5 w-5 text-indigo-600" />
                {(notifications.length) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {activeSection === "notifications" && (
                <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200/50 z-10 animate-fadeIn overflow-hidden">
                  <div className="p-4 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-indigo-600" />
                      Notifications
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {loadingNotifs ? (
                      <li className="px-4 py-4 text-sm text-gray-500 flex items-center gap-2 justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                        Loading...
                      </li>
                    ) : notifications.length === 0 ? (
                      <li className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-gray-500 font-medium">All caught up!</p>
                          <p className="text-xs text-gray-400">No new notifications</p>
                        </div>
                      </li>
                    ) : (
                      notifications.map((notif) => (
                        <li key={notif.id} className="px-4 py-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 transition-all duration-200">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 text-sm mb-1">{notif.message}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {notif.time ? new Date(notif.time).toLocaleString() : "Just now"}
                              </div>
                            </div>
                            <div className="flex gap-2">
                            {notif.type === "intern" && (
                              <button
                                onClick={() => approveIntern(notif.internId)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                Approve
                              </button>
                            )}
                            {(notif.type === "submission" || notif.type === "project-submission") && (
                              <button
                                onClick={() => viewSubmission(notif.submissionId, notif.type)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                View
                              </button>
                            )}
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Create */}
            <button onClick={handleCreateTask} className="px-6 py-2.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              + Create
            </button>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => setShowProfileDetails((s) => !s)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                  <span className="font-bold text-white text-lg">{profile ? profile.full_name[0] : "A"}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <span className="font-semibold text-gray-800 block text-sm">{profile ? profile.full_name : "Loading..."}</span>
                  <span className="text-xs text-gray-500">Administrator</span>
                </div>
              </button>

              {showProfileDetails && profile && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200/50 overflow-hidden z-10 animate-fadeIn">
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl">{profile.full_name[0]}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{profile.full_name}</p>
                        <p className="text-xs text-indigo-100">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-semibold rounded-full">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }} className="w-full px-4 py-3 text-sm text-white font-semibold bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
        {/* Dashboard Body */}
        <div className="flex-1 p-10">
          {/* Enhanced Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Registered Interns Card */}
            <div
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200/50 overflow-hidden"
              onClick={() => setActiveSection(activeSection === "interns" ? "" : "interns")}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-3xl font-bold text-teal-600">{interns.length}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Registered Interns</h2>
                <p className="text-sm text-gray-600">View and manage all interns</p>
                <div className="mt-4 flex items-center text-teal-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  View Details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* All Submissions Card */}
            <div
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200/50 overflow-hidden"
              onClick={() => setActiveSection(activeSection === "submissions" ? "" : "submissions")}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-3xl font-bold text-indigo-600">{submissions.length + projectSubmissions.length}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">All Submissions</h2>
                <p className="text-sm text-gray-600">{submissions.length} tasks, {projectSubmissions.length} projects</p>
                <div className="mt-4 flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  View Details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Track Progress Card */}
            <div
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200/50 overflow-hidden"
              onClick={() => setActiveSection(activeSection === "progress" ? "" : "progress")}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-3xl font-bold text-purple-600">{Math.round((interns.filter(i => i.is_approved).length / (interns.length || 1)) * 100)}%</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Track Progress</h2>
                <p className="text-sm text-gray-600">Monitor intern performance</p>
                <div className="mt-4 flex items-center text-purple-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  View Analytics
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Interns Section */}
          <div className={getSectionClass("interns")}>
            {activeSection === "interns" && (
              <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-teal-600 mb-6">📋 All Registered Interns</h2>
                {loadingInterns ? (
                  <p className="text-center text-teal-500 animate-pulse py-8 text-lg font-medium">Loading interns...</p>
                ) : errorInterns ? (
                  <p className="text-center text-red-500 py-8 text-lg">{errorInterns}</p>
                ) : interns.length === 0 ? (
                  <p className="text-center text-gray-400 py-8 italic">No interns registered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-gray-700 border border-gray-200">
                      <thead className="bg-gradient-to-r from-teal-100 to-indigo-100 text-teal-900 font-semibold">
                        <tr>
                          <th className="px-4 py-2 text-left border-b">ID</th>
                          <th className="px-4 py-2 text-left border-b">Full Name</th>
                          <th className="px-4 py-2 text-left border-b">Email</th>
                          <th className="px-4 py-2 text-center border-b">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interns.map((intern, idx) => (
                          <tr key={intern.id} className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-teal-50 transition`}>
                            <td className="px-4 py-2 border-b">{intern.id}</td>
                            <td className="px-4 py-2 border-b">{intern.full_name}</td>
                            <td className="px-4 py-2 border-b">{intern.email}</td>
                            <td className="px-4 py-2 text-center border-b">
                              <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">{intern.role}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>
          


          {/* Submissions Section - Unified View */}
          <div className={getSectionClass("submissions")}>
            {activeSection === "submissions" && (
              <section className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 p-6">
                <h2 className="text-2xl font-extrabold text-indigo-600 mb-6">📑 All Submissions</h2>
                {loadingSubmissions ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2 className="animate-spin w-8 h-8 mb-3" />
                    <p>Loading submissions...</p>
                  </div>
                ) : errorSubmissions ? (
                  <div className="p-6 text-center text-red-500">{errorSubmissions}</div>
                ) : submissions.length === 0 && projectSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No submissions yet 🚀</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm text-gray-700">
                      <thead className="bg-gradient-to-r from-teal-100 to-indigo-100 text-teal-900 font-semibold">
                        <tr>
                          <th className="px-6 py-3 font-semibold text-left">Type</th>
                          <th className="px-6 py-3 font-semibold text-left">ID</th>
                          <th className="px-6 py-3 font-semibold text-left">Task/Project</th>
                          <th className="px-6 py-3 font-semibold text-left">Intern</th>
                          <th className="px-6 py-3 font-semibold text-left">Files</th>
                          <th className="px-6 py-3 font-semibold text-left">Submitted At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Task Submissions */}
                        {submissions.map((sub, idx) => (
                          <tr
                            id={`submission-${sub.id}`}
                            key={`task-${sub.id}`}
                            className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50 transition`}
                          >
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                📋 Task
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{sub.id}</td>
                            <td className="px-6 py-4">Task #{sub.task_id}</td>
                            <td className="px-6 py-4">Intern #{sub.intern_id}</td>
                            <td className="px-6 py-4 space-y-1">
                              {sub.files && sub.files.length > 0 ? (
                                sub.files.map((file, fileIdx) => (
                                  <a
                                    key={fileIdx}
                                    href={`http://127.0.0.1:8000/uploads/${file.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition"
                                  >
                                    <FileText size={16} />
                                    {file.filename || `File ${fileIdx + 1}`}
                                  </a>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">No files</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-600">{new Date(sub.submitted_at).toLocaleString()}</td>
                          </tr>
                        ))}
                        
                        {/* Project Submissions */}
                        {projectSubmissions.map((sub, idx) => (
                          <tr
                            id={`submission-${sub.id}`}
                            key={`project-${sub.id}`}
                            className={`${(submissions.length + idx) % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-green-50 transition`}
                          >
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                📁 Project
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{sub.id}</td>
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
                            <td className="px-6 py-4 text-gray-600">{new Date(sub.submitted_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Quick Actions */}
          <div className={getSectionClass("actions")}>
            {activeSection === "actions" && (
              <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-purple-600 mb-4">⚡ Quick Actions</h2>

                {/* Create Task */}
                <button
                  onClick={handleCreateTask}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition w-48"
                >
                  + Create project
                </button>

                {/* Assign Task */}
                <button
                  onClick={handleAssignTask}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition w-48"
                >
                  Assign Task
                </button>

                {/* Track Progress */}
                <button
                  onClick={handleTrackProgress}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition w-48"
                >
                  Track Progress
                </button>
              </section>
            )}
          </div>

          {/* Track Progress Section */}
          <div className={getSectionClass("progress")}>
          {activeSection === "progress" && (
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Intern Performance Analytics</h2>
                <p className="text-sm text-gray-500">Track progress and completion rates</p>
              </div>
            </div>

          {interns.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Task Completion Status</h3>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                data={interns.map((intern) => {
                  const completed = submissions.filter((sub) => sub.intern_id === intern.id).length;
                  const totalAssigned = 5; // Or calculate dynamically from DB
                  return {
                    name: intern.full_name,
                    Completed: completed,
                    Pending: totalAssigned - completed > 0 ? totalAssigned - completed : 0,
                  };
                })}
                margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
              >
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }} 
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }} 
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF", 
                    borderRadius: 12, 
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  itemStyle={{ color: "#111827", fontWeight: 600 }}
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                />
                <Legend 
                  verticalAlign="top" 
                  wrapperStyle={{ fontSize: 13, fontWeight: 600, paddingBottom: 20 }}
                  iconType="circle"
                />
                <Bar
                  dataKey="Completed"
                  fill="url(#colorCompleted)"
                  radius={[8, 8, 0, 0]}
                  barSize={24}
                />
                <Bar
                  dataKey="Pending"
                  fill="url(#colorPending)"
                  radius={[8, 8, 0, 0]}
                  barSize={24}
                />
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Submission Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={interns.map((intern) => {
                    const completed = submissions.filter((sub) => sub.intern_id === intern.id).length;
                    return { name: intern.full_name, value: completed || 0 };
                  })}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={110}
                  innerRadius={65}
                  paddingAngle={3}
                  label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {interns.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF", 
                    borderRadius: 12, 
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  itemStyle={{ color: "#111827", fontWeight: 600 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  wrapperStyle={{ fontSize: 12, fontWeight: 500, paddingTop: 20 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
            </div>
            ) : (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">No Data Available</p>
                  <p className="text-sm text-gray-500">No interns registered yet for progress tracking</p>
                </div>
              </div>
            </div>
            )}
            </section>
          )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
