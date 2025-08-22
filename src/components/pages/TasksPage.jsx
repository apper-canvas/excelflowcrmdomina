import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchInput from "@/components/atoms/SearchInput";
import ApperIcon from "@/components/ApperIcon";
import TaskTable from "@/components/organisms/TaskTable";
import TaskModal from "@/components/organisms/TaskModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { taskService } from "@/services/api/taskService";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortField, setSortField] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, sortField, sortDirection]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getAll();
      setTasks(tasksData);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error("Load tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTasks = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date sorting
      if (sortField === "dueDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredTasks(filtered);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        const updatedTask = await taskService.update(editingTask.Id, taskData);
        setTasks(prev => prev.map(t => t.Id === editingTask.Id ? updatedTask : t));
        toast.success("Task updated successfully!");
      } else {
        const newTask = await taskService.create(taskData);
        setTasks(prev => [newTask, ...prev]);
        toast.success("Task created successfully!");
      }
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      toast.error("Failed to save task. Please try again.");
      throw error;
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTask = await taskService.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.Id === taskId ? updatedTask : t));
    } catch (error) {
      toast.error("Failed to update task status. Please try again.");
      console.error("Status change error:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t.Id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete task. Please try again.");
      console.error("Delete task error:", error);
    }
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleTaskClick = (task) => {
    setSelectedTaskId(selectedTaskId === task.Id ? null : task.Id);
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const overdue = tasks.filter(t => 
      t.status === "pending" && new Date(t.dueDate) < new Date()
    ).length;

    return { total, completed, pending, overdue };
  };

  if (loading) {
    return <Loading message="Loading tasks..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadTasks} />;
  }

  const stats = getTaskStats();

  if (tasks.length === 0) {
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
          onAction={handleCreateTask}
          icon="CheckSquare"
        />

        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleTaskSubmit}
          task={editingTask}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Stay on top of your follow-ups</p>
        </div>
        <Button onClick={handleCreateTask} variant="primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ApperIcon name="CheckSquare" className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ApperIcon name="Clock" className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search tasks..."
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <TaskTable
        tasks={filteredTasks}
        onTaskClick={handleTaskClick}
        onStatusChange={handleStatusChange}
        onDeleteTask={handleDeleteTask}
        selectedTaskId={selectedTaskId}
        onSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleTaskSubmit}
        task={editingTask}
      />
    </div>
  );
};

export default TasksPage;