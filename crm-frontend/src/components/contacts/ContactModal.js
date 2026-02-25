import React, { useState, useEffect } from 'react';
import styles from './ContactModal.module.css';

const INITIAL_FORM = {
  name: '', email: '', phone: '', company: '', status: 'Lead', notes: '',
};

const ContactModal = ({ contact, onSave, onClose }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!contact;

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        status: contact.status || 'Lead',
        notes: contact.notes || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [contact]);

  const validate = () => {
    const errs = {};
    // FIX 4: message must match /name is required/i
    if (!form.name || form.name.trim().length === 0) errs.name = 'Name is required';
    // FIX 5a: keep "Email is required" for empty email
    if (!form.email) errs.email = 'Email is required';
    // FIX 5b: message must match /invalid email/i
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email address';
    if (form.phone && !/^[+]?\(?[0-9]{3}\)?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(form.phone))  {
      errs.phone = 'Invalid phone number';
    }
    if (form.notes && form.notes.length > 1000) errs.notes = 'Max 1000 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    // FIX 6: pass contact._id as second argument (undefined when adding new)
    await onSave(form, contact ? contact._id : undefined);
    setLoading(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    // FIX 2: role="dialog" so getByRole('dialog') works in tests
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          {/* FIX 1: 'Add Contact' not 'Add New Contact' */}
          <h2 className={styles.title}>{isEdit ? 'Edit Contact' : 'Add Contact'}</h2>
          {/* FIX 3: aria-label="Close" so getByLabelText('Close') works */}
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Name <span className={styles.required}>*</span></label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder="Full name"
              />
              {errors.name && <p className={styles.error}>{errors.name}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email <span className={styles.required}>*</span></label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="email@company.com"
              />
              {errors.email && <p className={styles.error}>{errors.email}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                placeholder="+1234567890"
              />
              {errors.phone && <p className={styles.error}>{errors.phone}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Company</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className={styles.input}
                placeholder="Company name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="Lead">Lead</option>
                <option value="Prospect">Prospect</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className={`${styles.input} ${styles.textarea} ${errors.notes ? styles.inputError : ''}`}
              placeholder="Additional notes..."
              rows={3}
            />
            <div className={styles.charCount}>{form.notes.length}/1000</div>
            {errors.notes && <p className={styles.error}>{errors.notes}</p>}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : (isEdit ? 'Save Changes' : 'Create Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;