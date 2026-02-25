import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contactService } from '../services/contact.service';
import { activityService } from '../services/activity.service';
import useAuthStore from '../store/authStore';
import styles from './DashboardPage.module.css';

const STAT_CONFIGS = [
  { key: 'total', label: 'Total Contacts', icon: '◈', color: '#6366f1' },
  { key: 'leads', label: 'Leads', icon: '◐', color: '#f59e0b' },
  { key: 'prospects', label: 'Prospects', icon: '◑', color: '#3b82f6' },
  { key: 'customers', label: 'Customers', icon: '◉', color: '#10b981' },
];

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ total: 0, leads: 0, prospects: 0, customers: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [allRes, leadRes, prospectRes, customerRes, actRes] = await Promise.all([
        contactService.getContacts({ limit: 1 }),
        contactService.getContacts({ status: 'Lead', limit: 1 }),
        contactService.getContacts({ status: 'Prospect', limit: 1 }),
        contactService.getContacts({ status: 'Customer', limit: 1 }),
        activityService.getActivities({ limit: 5 }),
      ]);

      setStats({
        total: allRes.data.pagination.totalContacts,
        leads: leadRes.data.pagination.totalContacts,
        prospects: prospectRes.data.pagination.totalContacts,
        customers: customerRes.data.pagination.totalContacts,
      });
      setRecentActivities(actRes.data.activities);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getActionLabel = (action) => {
    const map = { CREATE: 'Added', UPDATE: 'Updated', DELETE: 'Deleted' };
    return map[action] || action;
  };

  const getActionClass = (action) => {
    const map = { CREATE: styles.actionCreate, UPDATE: styles.actionUpdate, DELETE: styles.actionDelete };
    return map[action] || '';
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className={styles.accent}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className={styles.subtitle}>Here's your CRM overview</p>
        </div>
        <Link to="/contacts" className={styles.ctaBtn}>
          + Add Contact
        </Link>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {STAT_CONFIGS.map(({ key, label, icon, color }) => (
          <div key={key} className={styles.statCard} style={{ '--card-color': color }}>
            <div className={styles.statIcon}>{icon}</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>{label}</p>
              <p className={styles.statValue}>
                {loading ? '—' : stats[key].toLocaleString()}
              </p>
            </div>
            <div className={styles.statGlow} />
          </div>
        ))}
      </div>

      {/* Quick Actions + Activity */}
      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Quick Actions</h2>
          <div className={styles.actionsList}>
            <Link to="/contacts" className={styles.actionItem}>
              <span className={styles.actionItemIcon} style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>◈</span>
              <div>
                <p className={styles.actionItemTitle}>Manage Contacts</p>
                <p className={styles.actionItemDesc}>Add, edit, search contacts</p>
              </div>
              <span className={styles.arrow}>→</span>
            </Link>
            <Link to="/activities" className={styles.actionItem}>
              <span className={styles.actionItemIcon} style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>◉</span>
              <div>
                <p className={styles.actionItemTitle}>Activity Log</p>
                <p className={styles.actionItemDesc}>Review all changes</p>
              </div>
              <span className={styles.arrow}>→</span>
            </Link>
            <button
              className={styles.actionItem}
              onClick={() => contactService.exportContacts()}
              style={{ cursor: 'pointer', background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
            >
              <span className={styles.actionItemIcon} style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>⬇</span>
              <div>
                <p className={styles.actionItemTitle}>Export CSV</p>
                <p className={styles.actionItemDesc}>Download contacts list</p>
              </div>
              <span className={styles.arrow}>→</span>
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Recent Activity</h2>
          {loading ? (
            <p className={styles.emptyState}>Loading...</p>
          ) : recentActivities.length === 0 ? (
            <p className={styles.emptyState}>No activity yet. Start by adding contacts!</p>
          ) : (
            <div className={styles.activityList}>
              {recentActivities.map((act) => (
                <div key={act._id} className={styles.activityItem}>
                  <span className={`${styles.actBadge} ${getActionClass(act.action)}`}>
                    {getActionLabel(act.action)}
                  </span>
                  <p className={styles.actText}>{act.entityName}</p>
                  <span className={styles.actTime}>{timeAgo(act.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;