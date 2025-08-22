import React from "react";
import { format, isAfter } from "date-fns";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const TaskTable = ({ 
  tasks, 
  onTaskClick, 
  onStatusChange, 
  onDeleteTask, 
  selectedTaskId, 
  onSort, 
  sortField, 
  sortDirection 
}) => {
  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    onSort(field, direction);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "ArrowUpDown";
    return sortDirection === "asc" ? "ArrowUp" : "ArrowDown";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "call": return "Phone";
      case "email": return "Mail";
      case "meeting": return "Calendar";
      default: return "CheckSquare";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "pending": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const isOverdue = (dueDate, status) => {
    return status === "pending" && isAfter(new Date(), new Date(dueDate));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  Task
                  <ApperIcon name={getSortIcon("title")} className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("dueDate")}
              >
                <div className="flex items-center">
                  Due Date
                  <ApperIcon name={getSortIcon("dueDate")} className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("priority")}
              >
                <div className="flex items-center">
                  Priority
                  <ApperIcon name={getSortIcon("priority")} className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  <ApperIcon name={getSortIcon("status")} className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact/Deal
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task, index) => (
              <motion.tr
                key={task.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "hover:bg-gray-50 transition-colors",
                  selectedTaskId === task.Id && "bg-primary-50",
                  isOverdue(task.dueDate, task.status) && "bg-red-50"
                )}
              >
                <td className="px-6 py-4">
                  <div 
                    className="cursor-pointer"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <ApperIcon name={getTypeIcon(task.type)} className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900 capitalize">{task.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={cn(
                    "text-sm",
                    isOverdue(task.dueDate, task.status) ? "text-red-600 font-medium" : "text-gray-900"
                  )}>
                    {format(new Date(task.dueDate), "MMM d, yyyy")}
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="ml-1 text-xs">(Overdue)</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize",
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize",
                    getStatusColor(task.status)
                  )}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {task.contactId && `Contact ${task.contactId}`}
                    {task.dealId && (
                      <div className="text-xs text-gray-500">Deal {task.dealId}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {task.status === "pending" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onStatusChange(task.Id, "completed")}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <ApperIcon name="Check" className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onStatusChange(task.Id, "pending")}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <ApperIcon name="RotateCcw" className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteTask(task.Id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </Button>
</div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;