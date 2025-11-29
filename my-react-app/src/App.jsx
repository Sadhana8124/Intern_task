
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ProjectDashboard from "./pages/ProjectDashboard";
import InternDashboard from "./pages/InternDashboard";
import Projects from './pages/Projects';
import Tasks from "./pages/Tasks";
import TaskSubmission from "./pages/TaskSubmission";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route path="/projects" element={<Projects />} />
        {/* Redirect all unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/intern-dashboard" element={<InternDashboard />} />
        <Route path="/projects-dashboard" element={<ProjectDashboard />} />
        
        <Route path="/project/:projectId/tasks" element={<Tasks />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/task-submissions" element={<TaskSubmission />} />
      
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </>
  );
};

export default App;



