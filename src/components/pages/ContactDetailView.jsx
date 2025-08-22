import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchInput from "@/components/atoms/SearchInput";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Pagination from "@/components/organisms/Pagination";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { cn } from "@/utils/cn";

const ContactDetailView = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalValue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  const loadContactData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [contactsData, dealsData] = await Promise.all([
        contactService.getAll(),
        dealService.getAll()
      ]);

      // Calculate contact metrics
      const contactMetrics = contactsData.map(contact => {
        const contactDeals = dealsData.filter(deal => 
          deal.contactName === contact.name || deal.contactId === contact.Id
        );
        
        const totalValue = contactDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
        const activeDeals = contactDeals.filter(deal => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost');
        const wonDeals = contactDeals.filter(deal => deal.stage === 'Closed Won');
        const lostDeals = contactDeals.filter(deal => deal.stage === 'Closed Lost');
        const winRate = contactDeals.length > 0 ? (wonDeals.length / contactDeals.length) * 100 : 0;

        return {
          ...contact,
          totalValue,
          activeDeals: activeDeals.length,
          wonDeals: wonDeals.length,
          lostDeals: lostDeals.length,
          totalDeals: contactDeals.length,
          winRate: Math.round(winRate),
          averageDealValue: contactDeals.length > 0 ? Math.round(totalValue / contactDeals.length) : 0
        };
      });

      setContacts(contactMetrics);
      setDeals(dealsData);
    } catch (err) {
      console.error('Failed to load contact data:', err);
      setError('Failed to load contact data');
      toast.error('Failed to load contact data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContactData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'company':
        return multiplier * a.company.localeCompare(b.company);
      case 'totalValue':
        return multiplier * (a.totalValue - b.totalValue);
      case 'totalDeals':
        return multiplier * (a.totalDeals - b.totalDeals);
      case 'winRate':
        return multiplier * (a.winRate - b.winRate);
      case 'createdAt':
        return multiplier * (new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return 0;
    }
  });

  const paginatedContacts = sortedContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedContacts.length / itemsPerPage);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return "ArrowUpDown";
    return sortOrder === 'asc' ? "ArrowUp" : "ArrowDown";
  };

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
        <Error message={error} onRetry={loadContactData} />
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
            <h1 className="text-2xl font-bold text-gray-900">Contact Performance Analysis</h1>
            <p className="text-gray-600">Detailed view of all contacts and their metrics</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Contacts</div>
          <div className="text-2xl font-bold text-gray-900">{contacts.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Pipeline Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(contacts.reduce((sum, c) => sum + c.totalValue, 0))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Active Deals</div>
          <div className="text-2xl font-bold text-gray-900">
            {contacts.reduce((sum, c) => sum + c.activeDeals, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Average Win Rate</div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(contacts.reduce((sum, c) => sum + c.winRate, 0) / contacts.length)}%
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search contacts by name, email, or company..."
            />
          </div>
        </div>
      </div>

      {/* Contact Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Contact</span>
                    <ApperIcon name={getSortIcon('name')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Company</span>
                    <ApperIcon name={getSortIcon('company')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalValue')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Value</span>
                    <ApperIcon name={getSortIcon('totalValue')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalDeals')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Deals</span>
                    <ApperIcon name={getSortIcon('totalDeals')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('winRate')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Win Rate</span>
                    <ApperIcon name={getSortIcon('winRate')} className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedContacts.map((contact) => (
                <tr key={contact.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(contact.totalValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg: {formatCurrency(contact.averageDealValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {contact.totalDeals} total
                    </div>
                    <div className="text-xs text-gray-500">
                      {contact.activeDeals} active, {contact.wonDeals} won
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn(
                      "text-sm font-medium",
                      contact.winRate >= 70 ? "text-green-600" :
                      contact.winRate >= 40 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {contact.winRate}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                      contact.activeDeals > 0 
                        ? "bg-green-100 text-green-800"
                        : contact.totalDeals > 0 
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    )}>
                      {contact.activeDeals > 0 ? 'Active' : contact.totalDeals > 0 ? 'Past Customer' : 'Prospect'}
                    </span>
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
              totalItems={sortedContacts.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {paginatedContacts.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ApperIcon name="Users" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-600">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default ContactDetailView;