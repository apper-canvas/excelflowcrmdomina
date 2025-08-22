import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format, isAfter, isBefore, addDays } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchInput from "@/components/atoms/SearchInput";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Pagination from "@/components/organisms/Pagination";
import { taskService } from "@/services/api/taskService";
import { cn } from "@/utils/cn";

const TaskDetailView = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  const statuses = ['pending', 'in_progress', 'completed'];
  const priorities = ['low', 'medium', 'high'];

  const loadTaskData = async () => {
    try {
      setLoading(true);
      setError(null);

      const tasksData = await taskService.getAll();
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load task data:', err);
      setError('Failed to load task data');
      toast.error('Failed to load task data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskData();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    return isBefore(new Date(dueDate), new Date());
  };

  const isUpcoming = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    const due = new Date(dueDate);
    const threeDaysFromNow = addDays(new Date(), 3);
    return isAfter(due, new Date()) && isBefore(due, threeDaysFromNow);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'title':
        return multiplier * a.title.localeCompare(b.title);
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      case 'priority':
        return multiplier * priorities.indexOf(a.priority) - priorities.indexOf(b.priority);
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return multiplier;
        if (!b.dueDate) return -multiplier;
        return multiplier * (new Date(a.dueDate) - new Date(b.dueDate));
      case 'createdAt':
        return multiplier * (new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return 0;
    }
  });

  const paginatedTasks = sortedTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return "ArrowUpDown";
    return sortOrder === 'asc' ? "ArrowUp" : "ArrowDown";
  };

  // Calculate metrics
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;
  const upcomingTasks = tasks.filter(t => isUpcoming(t.dueDate, t.status)).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
        <Error message={error} onRetry={loadTaskData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Performance Analysis</h1>
            <p className="text-gray-600">Detailed view of all tasks and productivity metrics</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="CheckSquare" className="h-5 w-5 text-green-600" />
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
          <div className="text-xs text-gray-500">{completedTasks} of {tasks.length} completed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600" />
            <div className="text-sm text-gray-600">Overdue Tasks</div>
          </div>
          <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Clock" className="h-5 w-5 text-yellow-600" />
            <div className="text-sm text-gray-600">Due Soon</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{upcomingTasks}</div>
          <div className="text-xs text-gray-500">Next 3 days</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="List" className="h-5 w-5 text-blue-600" />
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search tasks by title or description..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Task</span>
                    <ApperIcon name={getSortIcon('title')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ApperIcon name={getSortIcon('status')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Priority</span>
                    <ApperIcon name={getSortIcon('priority')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Due Date</span>
                    <ApperIcon name={getSortIcon('dueDate')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    <ApperIcon name={getSortIcon('createdAt')} className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alerts
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTasks.map((task) => (
                <tr key={task.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {task.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn("inline-flex px-2 py-1 text-xs font-medium rounded-full", getStatusColor(task.status))}>
                      {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn("inline-flex px-2 py-1 text-xs font-medium rounded-full", getPriorityColor(task.priority))}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                    </div>
                    {task.dueDate && (
                      <div className="text-xs text-gray-500">
                        {format(new Date(task.dueDate), 'h:mm a')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(task.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {isOverdue(task.dueDate, task.status) && (
                        <div className="flex items-center text-red-600">
                          <ApperIcon name="AlertTriangle" className="h-4 w-4" />
                          <span className="text-xs ml-1">Overdue</span>
                        </div>
                      )}
                      {isUpcoming(task.dueDate, task.status) && (
                        <div className="flex items-center text-yellow-600">
                          <ApperIcon name="Clock" className="h-4 w-4" />
                          <span className="text-xs ml-1">Due Soon</span>
                        </div>
                      )}
                      {task.status === 'completed' && (
                        <div className="flex items-center text-green-600">
                          <ApperIcon name="CheckCircle" className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {paginatedTasks.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ApperIcon name="CheckSquare" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
};

export default TaskDetailView;