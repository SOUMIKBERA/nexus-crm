import React from 'react';
import styles from './ContactTable.module.css';

const STATUS_STYLES = {
  Lead: styles.statusLead,
  Prospect: styles.statusProspect,
  Customer: styles.statusCustomer,
};

const ContactTable = ({ contacts, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className={styles.tableWrap}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>◈</div>
        <p className={styles.emptyTitle}>No contacts found</p>
        <p className={styles.emptyDesc}>Try adjusting your search or add a new contact</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact._id} className={styles.row}>
              <td>
                <div className={styles.nameCell}>
                  <div className={styles.avatar}>{contact.name.charAt(0).toUpperCase()}</div>
                  <span className={styles.name}>{contact.name}</span>
                </div>
              </td>
              <td className={styles.email}>{contact.email}</td>
              <td className={styles.secondary}>{contact.phone || '—'}</td>
              <td className={styles.secondary}>{contact.company || '—'}</td>
              <td>
                <span className={`${styles.status} ${STATUS_STYLES[contact.status]}`}>
                  {contact.status}
                </span>
              </td>
              <td className={styles.secondary}>
                {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => onEdit(contact)} title="Edit">
                    ✎
                  </button>
                  <button className={styles.deleteBtn} onClick={() => onDelete(contact)} title="Delete">
                    ✕
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactTable;