import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import SearchInput from "@/components/atoms/SearchInput";
import Button from "@/components/atoms/Button";
import ContactTable from "@/components/organisms/ContactTable";
import ContactDetailPanel from "@/components/organisms/ContactDetailPanel";
import ContactModal from "@/components/organisms/ContactModal";
import Pagination from "@/components/organisms/Pagination";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  
  const itemsPerPage = 50;

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleSaveContact = async (contactData) => {
    try {
      const newContact = await contactService.create(contactData);
      setContacts(prev => [newContact, ...prev]);
    } catch (err) {
      throw new Error("Failed to save contact");
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setDetailPanelOpen(true);
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts;

    // Filter by search query
    if (searchQuery) {
      filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "lastContactDate") {
        aVal = aVal ? new Date(aVal) : new Date(0);
        bVal = bVal ? new Date(bVal) : new Date(0);
      } else {
        aVal = aVal?.toString().toLowerCase() || "";
        bVal = bVal?.toString().toLowerCase() || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [contacts, searchQuery, sortField, sortDirection]);

  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedContacts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedContacts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedContacts.length / itemsPerPage);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadContacts} />;
  }

  if (contacts.length === 0) {
    return (
      <Empty
        title="No contacts yet"
        description="Start building your customer database by adding your first contact."
        actionText="Add Contact"
        onAction={() => setModalOpen(true)}
        icon="Users"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">
            {filteredAndSortedContacts.length} contact{filteredAndSortedContacts.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-full sm:w-80">
            <SearchInput
              placeholder="Search contacts..."
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
            Add Contact
          </Button>
        </div>
      </div>

      {filteredAndSortedContacts.length === 0 ? (
        <Empty
          title="No contacts found"
          description={`No contacts match your search for "${searchQuery}". Try adjusting your search terms.`}
          actionText="Clear Search"
          onAction={() => setSearchQuery("")}
          icon="Search"
        />
      ) : (
        <>
          <ContactTable
            contacts={paginatedContacts}
            onContactClick={handleContactClick}
            selectedContactId={selectedContact?.Id}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredAndSortedContacts.length}
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
      <ContactDetailPanel
        contact={selectedContact}
        isOpen={detailPanelOpen}
        onClose={() => {
          setDetailPanelOpen(false);
          setSelectedContact(null);
        }}
      />

      {/* Add Contact Modal */}
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveContact}
      />
    </div>
  );
};

export default ContactsPage;