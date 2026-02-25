import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { contactService } from '../services/contact.service';
import ContactModal from '../components/contacts/ContactModal';
import ContactTable from '../components/contacts/ContactTable';
import Pagination from '../components/common/Pagination';
import styles from './ContactsPage.module.css';

const STATUS_OPTIONS = ['', 'Lead', 'Prospect', 'Customer'];

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalContacts: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const searchTimeout = useRef(null);

  const fetchContacts = useCallback(async (currentPage, searchVal, statusVal) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (searchVal) params.search = searchVal;
      if (statusVal) params.status = statusVal;
      const res = await contactService.getContacts(params);
      setContacts(res.data.contacts);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts(page, search, statusFilter);
  }, [page, statusFilter, search, fetchContacts]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchContacts(1, val, statusFilter);
    }, 400);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleSave = async (data) => {
    try {
      if (editContact) {
        await contactService.updateContact(editContact._id, data);
        toast.success('Contact updated!');
      } else {
        await contactService.createContact(data);
        toast.success('Contact created!');
      }
      setModalOpen(false);
      setEditContact(null);
      fetchContacts(page, search, statusFilter);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await contactService.deleteContact(deleteTarget._id);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      fetchContacts(page, search, statusFilter);
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleEdit = (contact) => {
    setEditContact(contact);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditContact(null);
    setModalOpen(true);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Contacts</h1>
          <p className={styles.subtitle}>{pagination.totalContacts} total contacts</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.exportBtn} onClick={() => contactService.exportContacts()}>
            ⬇ Export CSV
          </button>
          <button className={styles.addBtn} onClick={handleAddNew}>
            + Add Contact
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <select value={statusFilter} onChange={handleStatusFilter} className={styles.statusSelect}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <ContactTable
        contacts={contacts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={(c) => setDeleteTarget(c)}
      />

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Contact modal */}
      {modalOpen && (
        <ContactModal
          contact={editContact}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditContact(null); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmIcon}>⚠</div>
            <h3 className={styles.confirmTitle}>Delete Contact?</h3>
            <p className={styles.confirmText}>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;