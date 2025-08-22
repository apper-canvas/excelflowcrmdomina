import React from "react";
import Empty from "@/components/ui/Empty";

const TasksPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600">Stay on top of your follow-ups</p>
      </div>

      <Empty
        title="Create your first task"
        description="Keep track of important follow-ups and activities by creating tasks for your contacts and deals."
        actionText="Create Task"
        onAction={() => console.log("Create task clicked")}
        icon="CheckSquare"
      />
    </div>
  );
};

export default TasksPage;