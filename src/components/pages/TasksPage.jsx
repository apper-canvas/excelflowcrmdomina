import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import ApperIcon from "@/components/ApperIcon";
import TaskModal from "@/components/organisms/TaskModal";
import TaskTable from "@/components/organisms/TaskTable";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import SearchInput from "@/components/atoms/SearchInput";

const TasksPage = () => {
const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: "", end: "" });
  const [contactFilter, setContactFilter] = useState("all");
  const [dealFilter, setDealFilter] = useState("all");
  const [sortField, setSortField] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);

useEffect(() => {
    loadTasks();
    loadContacts();
    loadDeals();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, dateRangeFilter, contactFilter, dealFilter, sortField, sortDirection]);

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

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (err) {
      console.error("Load contacts error:", err);
    }
  };

  const loadDeals = async () => {
    try {
      const dealsData = await dealService.getAll();
      setDeals(dealsData);
    } catch (err) {
      console.error("Load deals error:", err);
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

    // Apply date range filter
    if (dateRangeFilter.start) {
      filtered = filtered.filter(task => 
        new Date(task.dueDate) >= new Date(dateRangeFilter.start)
      );
    }
    if (dateRangeFilter.end) {
      filtered = filtered.filter(task => 
        new Date(task.dueDate) <= new Date(dateRangeFilter.end)
      );
    }

    // Apply contact filter
    if (contactFilter !== "all") {
      filtered = filtered.filter(task => task.contactId === parseInt(contactFilter));
    }

    // Apply deal filter
    if (dealFilter !== "all") {
      filtered = filtered.filter(task => task.dealId === parseInt(dealFilter));
    }

    // Apply sorting - group by status first
    filtered.sort((a, b) => {
      // First sort by status (pending first, then completed)
      if (a.status !== b.status) {
        if (a.status === "pending" && b.status === "completed") return -1;
        if (a.status === "completed" && b.status === "pending") return 1;
      }

      // Then sort by the selected field within status groups
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

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? contact.name : `Contact ${contactId}`;
  };

  const getDealName = (dealId) => {
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.company : `Deal ${dealId}`;
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setDateRangeFilter({ start: "", end: "" });
    setContactFilter("all");
    setDealFilter("all");
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
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search tasks..."
              />
            </div>
            <Button 
              onClick={clearAllFilters}
              variant="secondary"
              size="sm"
              className="sm:w-auto w-full"
            >
              <ApperIcon name="X" className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Status Filter */}
            <FormField label="Status">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>

            {/* Priority Filter */}
            <FormField label="Priority">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </FormField>

            {/* Date Range Start */}
            <FormField label="Due From">
              <input
                type="date"
                value={dateRangeFilter.start}
                onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
              />
            </FormField>

            {/* Date Range End */}
            <FormField label="Due To">
              <input
                type="date"
                value={dateRangeFilter.end}
                onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
              />
            </FormField>

            {/* Contact Filter */}
            <FormField label="Contact">
              <select
                value={contactFilter}
                onChange={(e) => setContactFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
              >
                <option value="all">All Contacts</option>
                {contacts.map(contact => (
                  <option key={contact.Id} value={contact.Id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Deal Filter - Full Width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <FormField label="Deal">
              <select
                value={dealFilter}
                onChange={(e) => setDealFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
              >
                <option value="all">All Deals</option>
                {deals.map(deal => (
                  <option key={deal.Id} value={deal.Id}>
                    {deal.company} - ${deal.dealValue.toLocaleString()}
                  </option>
                ))}
              </select>
            </FormField>
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
        getContactName={getContactName}
        getDealName={getDealName}
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