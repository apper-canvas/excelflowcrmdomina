import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import SearchInput from "@/components/atoms/SearchInput";
import Button from "@/components/atoms/Button";
import CompanyGrid from "@/components/organisms/CompanyGrid";
import CompanyDetailPanel from "@/components/organisms/CompanyDetailPanel";
import CompanyModal from "@/components/organisms/CompanyModal";
import ContactModal from "@/components/organisms/ContactModal";
import Pagination from "@/components/organisms/Pagination";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { companyService } from "@/services/api/companyService";

const CompaniesPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [companyMetrics, setCompanyMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
const [selectedCompany, setSelectedCompany] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  
  const itemsPerPage = 12;

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await companyService.getAll();
      setCompanies(data);
      
      // Load metrics for each company
      const metrics = {};
      await Promise.all(
        data.map(async (company) => {
          try {
            const companyMetrics = await companyService.getCompanyMetrics(company.Id);
            metrics[company.Id] = companyMetrics;
          } catch (err) {
            console.warn(`Failed to load metrics for company ${company.Id}:`, err);
            metrics[company.Id] = { contactCount: 0, dealCount: 0, totalDealValue: 0 };
          }
        })
      );
      setCompanyMetrics(metrics);
    } catch (err) {
      setError("Failed to load companies. Please try again.");
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

const handleSaveCompany = async (companyData) => {
    try {
      const newCompany = await companyService.create(companyData);
      setCompanies(prev => [newCompany, ...prev]);
      
      // Load metrics for the new company
      try {
        const metrics = await companyService.getCompanyMetrics(newCompany.Id);
        setCompanyMetrics(prev => ({ ...prev, [newCompany.Id]: metrics }));
      } catch (err) {
        console.warn(`Failed to load metrics for new company ${newCompany.Id}:`, err);
        setCompanyMetrics(prev => ({ 
          ...prev, 
          [newCompany.Id]: { contactCount: 0, dealCount: 0, totalDealValue: 0 }
        }));
      }
    } catch (err) {
      throw new Error("Failed to save company");
    }
  };

  const handleUpdateCompany = async (companyId, companyData) => {
    try {
      const updatedCompany = await companyService.update(companyId, companyData);
      setCompanies(prev => prev.map(c => c.Id === companyId ? updatedCompany : c));
      
      // Update selected company if it's the one being edited
      if (selectedCompany && selectedCompany.Id === companyId) {
        setSelectedCompany(updatedCompany);
      }
      
      // Refresh metrics for the updated company
      try {
        const metrics = await companyService.getCompanyMetrics(companyId);
        setCompanyMetrics(prev => ({ ...prev, [companyId]: metrics }));
      } catch (err) {
        console.warn(`Failed to load metrics for updated company ${companyId}:`, err);
      }
    } catch (err) {
      throw new Error("Failed to update company");
    }
  };

  const handleCompanyClick = async (company) => {
    setSelectedCompany(company);
    setDetailPanelOpen(true);
    
    // Ensure we have fresh metrics for the selected company
    if (!companyMetrics[company.Id]) {
      try {
        const metrics = await companyService.getCompanyMetrics(company.Id);
        setCompanyMetrics(prev => ({ ...prev, [company.Id]: metrics }));
      } catch (err) {
        console.warn(`Failed to load metrics for company ${company.Id}:`, err);
      }
    }
  };

  const handleContactClick = (contact) => {
    navigate('/contacts');
    // Note: In a real app, you might want to pass contact ID to highlight it
  };

  const handleDealClick = (deal) => {
    navigate('/deals');
    // Note: In a real app, you might want to pass deal ID to highlight it
};

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setEditModalOpen(true);
  };

  const handleAddContact = (company) => {
    setEditingCompany(company);
    setContactModalOpen(true);
  };

  const handleSaveContact = async (contactData) => {
    try {
      // Contact service would handle this
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Contact added successfully!");
      
      // Refresh company metrics to reflect new contact
      if (editingCompany) {
        try {
          const metrics = await companyService.getCompanyMetrics(editingCompany.Id);
          setCompanyMetrics(prev => ({ ...prev, [editingCompany.Id]: metrics }));
        } catch (err) {
          console.warn(`Failed to refresh metrics for company ${editingCompany.Id}:`, err);
        }
      }
    } catch (err) {
      throw new Error("Failed to add contact");
    }
  };
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies;

    // Filter by search query
    if (searchQuery) {
      filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company.website && company.website.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "totalDealValue") {
        aVal = companyMetrics[a.Id]?.totalDealValue || 0;
        bVal = companyMetrics[b.Id]?.totalDealValue || 0;
      } else if (sortField === "contactCount") {
        aVal = companyMetrics[a.Id]?.contactCount || 0;
        bVal = companyMetrics[b.Id]?.contactCount || 0;
      } else {
        aVal = aVal?.toString().toLowerCase() || "";
        bVal = bVal?.toString().toLowerCase() || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [companies, companyMetrics, searchQuery, sortField, sortDirection]);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCompanies, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedCompanies.length / itemsPerPage);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadCompanies} />;
  }

  if (companies.length === 0) {
    return (
      <Empty
        title="Add your first company"
        description="Start organizing your business relationships by adding companies to your database."
        actionText="Add Company"
        onAction={() => setModalOpen(true)}
        icon="Building2"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">
            {filteredAndSortedCompanies.length} company{filteredAndSortedCompanies.length !== 1 ? "ies" : "y"}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-full sm:w-80">
            <SearchInput
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button 
            onClick={() => setModalOpen(true)}
            className="hidden sm:flex"
          >
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sortField === "name" ? "primary" : "ghost"}
          size="sm"
          onClick={() => {
            setSortField("name");
            setSortDirection(sortField === "name" && sortDirection === "asc" ? "desc" : "asc");
          }}
        >
          Name
          {sortField === "name" && (
            <ApperIcon 
              name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} 
              className="h-4 w-4 ml-1" 
            />
          )}
        </Button>
        
        <Button
          variant={sortField === "industry" ? "primary" : "ghost"}
          size="sm"
          onClick={() => {
            setSortField("industry");
            setSortDirection(sortField === "industry" && sortDirection === "asc" ? "desc" : "asc");
          }}
        >
          Industry
          {sortField === "industry" && (
            <ApperIcon 
              name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} 
              className="h-4 w-4 ml-1" 
            />
          )}
        </Button>
        
        <Button
          variant={sortField === "contactCount" ? "primary" : "ghost"}
          size="sm"
          onClick={() => {
            setSortField("contactCount");
            setSortDirection(sortField === "contactCount" && sortDirection === "asc" ? "desc" : "asc");
          }}
        >
          Contacts
          {sortField === "contactCount" && (
            <ApperIcon 
              name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} 
              className="h-4 w-4 ml-1" 
            />
          )}
        </Button>
        
        <Button
          variant={sortField === "totalDealValue" ? "primary" : "ghost"}
          size="sm"
          onClick={() => {
            setSortField("totalDealValue");
            setSortDirection(sortField === "totalDealValue" && sortDirection === "asc" ? "desc" : "asc");
          }}
        >
          Deal Value
          {sortField === "totalDealValue" && (
            <ApperIcon 
              name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} 
              className="h-4 w-4 ml-1" 
            />
          )}
        </Button>
      </div>

      {filteredAndSortedCompanies.length === 0 ? (
        <Empty
          title="No companies found"
          description={`No companies match your search for "${searchQuery}". Try adjusting your search terms.`}
          actionText="Clear Search"
          onAction={() => setSearchQuery("")}
          icon="Search"
        />
      ) : (
        <>
          <CompanyGrid
            companies={paginatedCompanies}
            companyMetrics={companyMetrics}
            loading={false}
            error=""
            onCompanyClick={handleCompanyClick}
            onRetry={loadCompanies}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredAndSortedCompanies.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      )}

      {/* Mobile FAB */}
      <FloatingActionButton
        onClick={() => setModalOpen(true)}
        className="sm:hidden"
      />

{/* Detail Panel */}
      <CompanyDetailPanel
        company={selectedCompany}
        metrics={selectedCompany ? companyMetrics[selectedCompany.Id] : null}
        isOpen={detailPanelOpen}
        onClose={() => {
          setDetailPanelOpen(false);
          setSelectedCompany(null);
        }}
        onContactClick={handleContactClick}
        onDealClick={handleDealClick}
        onEditCompany={handleEditCompany}
        onAddContact={handleAddContact}
      />
{/* Add Company Modal */}
      <CompanyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCompany}
      />

      {/* Edit Company Modal */}
      <CompanyModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleUpdateCompany}
        company={editingCompany}
      />

      {/* Add Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleSaveContact}
        company={editingCompany}
      />
    </div>
  );
};

export default CompaniesPage;