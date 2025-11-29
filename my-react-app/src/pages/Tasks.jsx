import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import axios from "axios";
import { motion } from "framer-motion";
import { ClipboardList, Calendar, Users, FileText } from "lucide-react"; // icons

const Tasks = () => {
  const { projectId } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    assigned_to: "",
  });

  const [interns, setInterns] = useState([]);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/users/interns/",
          axiosConfig
        );
        setInterns(res.data);
      } catch (err) {
        console.error("Error fetching interns:", err);
      }
    };

    if (token) {
      fetchInterns();
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        assigned_to: Number(formData.assigned_to),
        project_id: Number(projectId),
      };
      await axios.post("http://localhost:8000/admin/tasks", dataToSend, axiosConfig);
      setMessage("✅ Task created successfully!");
      setFormData({
        title: "",
        description: "",
        deadline: "",
        assigned_to: "",
      });
    } catch (err) {
      console.error("Error creating task:", err);
      setMessage("❌ Failed to create task.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AdminSidebar />

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 p-10"
      >
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 relative inline-block">
             Create Task
            <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></span>
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Assign tasks to interns under Project <b>#{projectId}</b>
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 p-4 rounded-lg text-center font-semibold shadow-md ${
              message.includes("successfully")
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Form Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-xl mx-auto space-y-6 border border-gray-200"
        >
          {/* Title */}
          <div>
            <label className=" mb-2 font-medium text-gray-700 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
              Task Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className=" mb-2 font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
              placeholder="Enter task description"
              rows="4"
              required
            />
          </div>

          {/* Deadline */}
          <div>
            <label className=" mb-2 font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
              required
            />
          </div>

          {/* Assign Intern */}
          <div>
            <label className="mb-2 font-medium text-gray-700 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Assign to Intern
            </label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
              required
            >
              <option value="">-- Select Intern --</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.full_name} ({intern.email})
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-200"
          >
            ➕ Create Task
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Tasks;
