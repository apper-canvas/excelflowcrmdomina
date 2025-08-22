import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { quoteService } from "@/services/api/quoteService";
import Button from "@/components/atoms/Button";
import SearchInput from "@/components/atoms/SearchInput";
import QuoteModal from "@/components/organisms/QuoteModal";
import QuoteDetailModal from "@/components/organisms/QuoteDetailModal";
import Pagination from "@/components/organisms/Pagination";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const QuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const itemsPerPage = 10;

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Draft", label: "Draft" },
    { value: "Sent", label: "Sent" },
    { value: "Accepted", label: "Accepted" },
    { value: "Rejected", label: "Rejected" },
    { value: "Expired", label: "Expired" }
  ];

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quoteService.getAll();
      setQuotes(data);
    } catch (err) {
      setError("Failed to load quotes. Please try again.");
      console.error("Error loading quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async (quoteData) => {
    try {
      setIsSubmitting(true);
      const newQuote = await quoteService.create(quoteData);
      setQuotes(prev => [newQuote, ...prev]);
      toast.success("Quote created successfully!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to create quote. Please try again.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQuote = async (id, quoteData) => {
    try {
      setIsSubmitting(true);
      const updatedQuote = await quoteService.update(id, quoteData);
      setQuotes(prev => prev.map(quote => 
        quote.Id === id ? updatedQuote : quote
      ));
      toast.success("Quote updated successfully!");
      setIsModalOpen(false);
      setEditingQuote(null);
    } catch (error) {
      toast.error("Failed to update quote. Please try again.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quote?")) {
      return;
    }

    try {
      await quoteService.delete(id);
      setQuotes(prev => prev.filter(quote => quote.Id !== id));
      toast.success("Quote deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete quote. Please try again.");
      console.error("Error deleting quote:", error);
    }
  };

  const handleEditClick = (quote) => {
    setEditingQuote(quote);
    setIsModalOpen(true);
};

  const handleQuoteClick = (quote) => {
    setSelectedQuote(quote);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuote(null);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedQuote(null);
  };
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.dealTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Draft: "bg-gray-100 text-gray-800",
      Sent: "bg-blue-100 text-blue-800",
      Accepted: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Expired: "bg-yellow-100 text-yellow-800"
    };

    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status] || "bg-gray-100 text-gray-800"
      )}>
        {status}
      </span>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadQuotes} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your quotes and proposals
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Create Quote
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {paginatedQuotes.length === 0 ? (
          <Empty 
            message={searchTerm || statusFilter !== "all" ? "No quotes found matching your criteria" : "No quotes yet"}
            actionLabel={searchTerm || statusFilter !== "all" ? undefined : "Create Quote"}
            onAction={searchTerm || statusFilter !== "all" ? undefined : () => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company / Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
{paginatedQuotes.map((quote) => (
                  <motion.tr
                    key={quote.Id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleQuoteClick(quote)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Quote #{quote.Id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quote.deliveryMethod}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {quote.company}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quote.contactName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quote.dealTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(quote.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>Created: {formatDate(quote.quoteDate)}</div>
                        <div>Expires: {formatDate(quote.expiresOn)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(quote)}
                        >
                          <ApperIcon name="Edit2" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuote(quote.Id)}
                          className="text-red-600 hover:text-red-900"
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

{/* Modals */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingQuote ? (data) => handleUpdateQuote(editingQuote.Id, data) : handleCreateQuote}
        quote={editingQuote}
        isSubmitting={isSubmitting}
      />

      <QuoteDetailModal
        isOpen={detailModalOpen}
        onClose={handleCloseDetailModal}
        quote={selectedQuote}
        onEdit={(quote) => {
          setEditingQuote(quote);
          setIsModalOpen(true);
          setDetailModalOpen(false);
        }}
        onDelete={handleDeleteQuote}
      />
    </div>
  );
};

export default QuotesPage;