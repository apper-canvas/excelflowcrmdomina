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
import PipelineChart from "@/components/molecules/PipelineChart";
import { dealService } from "@/services/api/dealService";
import { dashboardService } from "@/services/api/dashboardService";
import { cn } from "@/utils/cn";

const DealDetailView = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [pipelineMetrics, setPipelineMetrics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dealValue');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  const stages = ['Lead', 'Qualified', 'Proposal', 'Closed Won', 'Closed Lost'];
  const dateRanges = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'thisYear', label: 'This Year' }
  ];

  const loadDealData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dealsData, metricsData] = await Promise.all([
        dealService.getAll(),
        dashboardService.getPipelineMetrics(dateRange)
      ]);

      setDeals(dealsData);
      setPipelineMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load deal data:', err);
      setError('Failed to load deal data');
      toast.error('Failed to load deal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDealData();
  }, [dateRange]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageColor = (stage) => {
    const colors = {
      'Lead': 'bg-blue-100 text-blue-800',
      'Qualified': 'bg-yellow-100 text-yellow-800',
      'Proposal': 'bg-purple-100 text-purple-800',
      'Closed Won': 'bg-green-100 text-green-800',
      'Closed Lost': 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (value) => {
    if (value >= 50000) return 'text-green-600';
    if (value >= 25000) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'title':
        return multiplier * a.title.localeCompare(b.title);
      case 'contactName':
        return multiplier * a.contactName.localeCompare(b.contactName);
      case 'company':
        return multiplier * a.company.localeCompare(b.company);
      case 'dealValue':
        return multiplier * (a.dealValue - b.dealValue);
      case 'stage':
        return multiplier * stages.indexOf(a.stage) - stages.indexOf(b.stage);
      case 'createdAt':
        return multiplier * (new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return 0;
    }
  });

  const paginatedDeals = sortedDeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedDeals.length / itemsPerPage);

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
        <Error message={error} onRetry={loadDealData} />
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
            <h1 className="text-2xl font-bold text-gray-900">Deal Pipeline Analysis</h1>
            <p className="text-gray-600">Detailed view of all deals and pipeline metrics</p>
          </div>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">Time Period:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pipeline Overview</h3>
            <p className="text-sm text-gray-600">Deal values and conversion rates by stage</p>
          </div>
        </div>
        
        <PipelineChart 
          data={pipelineMetrics?.pipelineData} 
          conversionRates={pipelineMetrics?.conversionRates}
          loading={loading}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Pipeline Value</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(deals.reduce((sum, d) => sum + d.dealValue, 0))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Active Deals</div>
          <div className="text-2xl font-bold text-gray-900">
            {deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Won This Period</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + d.dealValue, 0))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Win Rate</div>
          <div className="text-2xl font-bold text-gray-900">
            {pipelineMetrics?.conversionRates?.overall || 0}%
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
              placeholder="Search deals by title, contact, or company..."
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deals Table */}
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
                    <span>Deal</span>
                    <ApperIcon name={getSortIcon('title')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('contactName')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Contact</span>
                    <ApperIcon name={getSortIcon('contactName')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dealValue')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Value</span>
                    <ApperIcon name={getSortIcon('dealValue')} className="h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stage')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Stage</span>
                    <ApperIcon name={getSortIcon('stage')} className="h-3 w-3" />
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
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDeals.map((deal) => (
                <tr key={deal.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                      <div className="text-sm text-gray-500">{deal.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{deal.contactName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn("text-sm font-medium", getPriorityColor(deal.dealValue))}>
                      {formatCurrency(deal.dealValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn("inline-flex px-2 py-1 text-xs font-medium rounded-full", getStageColor(deal.stage))}>
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(deal.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${((stages.indexOf(deal.stage) + 1) / stages.length) * 100}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(((stages.indexOf(deal.stage) + 1) / stages.length) * 100)}%
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

      {paginatedDeals.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ApperIcon name="BarChart3" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
};

export default DealDetailView;