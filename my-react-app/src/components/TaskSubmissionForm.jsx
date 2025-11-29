import React, { useState } from "react";

function TaskSubmissionForm({ taskId, internId }) {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("task_id", taskId);
    formData.append("intern_id", internId);
    files.forEach(file => formData.append("uploaded_files", file));

    try {
      const response = await fetch("http://127.0.0.1:8000/task-submissions/", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert("Task submitted successfully!");
      } else {
        alert("Failed to submit task");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error submitting task");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" multiple onChange={handleFileChange} />
      <button type="submit">Submit Task</button>
    </form>
  );
}

export default TaskSubmissionForm;
