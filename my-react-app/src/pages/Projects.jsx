import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import axios from "axios";
import { FiFolderPlus, FiFolder } from "react-icons/fi";
const Projects = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    members: [], 
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); 
  const [showDropdown, setShowDropdown] = useState(false);
  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },};
  const removeMember = (user_id) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.user_id !== user_id),
    }));};
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:8000/projects", axiosConfig);
        setProjects(res.data.projects || res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }};
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8000/projects/users_by_role", axiosConfig);
        const allUsers = [...res.data.admins, ...res.data.interns];
        setUsers(allUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }};
    if (token) {
      fetchProjects();
      fetchUsers();
    }}, [token]);
    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSelectUser = (user, role) => {
    setFormData((prev) => ({
      ...prev,
      members: [
        ...prev.members.filter((m) => m.user_id !== user.id),
        { user_id: user.id, role, full_name: user.full_name },
      ],
    }));};
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
    name: formData.name,
    description: formData.description,
    is_public: true,
    members: formData.members.map(m => ({
      user_id: m.user_id,
      role: m.role.toLowerCase() // only "leader" or "member"
    }))};
    try {
      const res = await axios.post("http://localhost:8000/projects", payload, axiosConfig);
      alert("✅ Project created successfully!");
      setProjects([...projects, res.data]);
      setFormData({ name: "", description: "", members: [] });
    } catch (err) {
      console.error("Error creating project:", err);
      alert("❌ Failed to create project.");
    }};
  const goToTasks = (id) => {
    navigate(`/project/${id}/tasks`);
  };
  return (
    <div className="flex bg-gradient-to-br from-indigo-100 via-white to-gray-50 min-h-screen text-gray-800">
      <AdminSidebar />
      <div className="flex-1 p-10">
        <header className="text-center mb-14">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight drop-shadow-md">
            Project Dashboard
          </h1>
          <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
            Organize, track, and manage your projects with ease ✨</p>
        </header>
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-1/3 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiFolderPlus className="text-green-600" /> Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows="4"
                  required/>
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-xl bg-green-600 text-white font-bold hover:bg-indigo-700 transition flex justify-between items-center"
                  onClick={() => setShowDropdown(!showDropdown)}>
                  Assign Team Members
                  {formData.members.length > 0 && (
                    <span className="ml-2">({formData.members.length})</span>
                  )}
                </button>
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-72 overflow-y-auto z-50">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                        <span className="text-gray-800 font-medium">
                          {user.full_name} ({user.role})
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                            onClick={() => handleSelectUser(user, "leader")}>
                            Leader
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                            onClick={() => handleSelectUser(user, "member")}>
                            Member</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {formData.members.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.members.map((m) => (
                      <span
                        key={m.user_id}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm">
                        {m.full_name} ({m.role})
                        <button
                          type="button"
                          onClick={() => removeMember(m.user_id)}
                          className="ml-1 text-red-500 hover:text-red-700">
                          ✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold">
                ➕ Create Project
              </button>
            </form>
          </div>
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiFolder className="text-indigo-600" /> Existing Projects
            </h2>
            {projects.length === 0 ? (
              <div className="text-center text-gray-500 py-14 bg-white rounded-2xl shadow-lg">
                No projects yet. Start by creating one 🌱
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-2xl cursor-pointer border"
                    onClick={() => goToTasks(project.id)}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{project.description}</p>
                    <div className="mt-4 text-sm text-green-600 font-medium">
                      View Tasks →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Projects;
