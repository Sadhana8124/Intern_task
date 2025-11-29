import React from 'react';

const TaskCard = ({ task }) => {
  const isOverdue = new Date(task.deadline) < new Date();

  return (
    <div className={`p-4 border rounded shadow ${isOverdue ? 'bg-red-100' : 'bg-white'}`}>
      <h3 className="text-lg font-semibold">{task.title}</h3>
      <p className="mt-1">{task.description}</p>
      <p className="text-sm text-gray-500 mt-2">
        Deadline: {new Date(task.deadline).toLocaleString()}
      </p>
    </div>
  );
};

export default TaskCard;
