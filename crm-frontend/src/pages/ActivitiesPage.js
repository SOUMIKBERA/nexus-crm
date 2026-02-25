import React, { useState, useEffect, useCallback } from 'react';
import { activityService } from '../services/activity.service';
import Pagination from '../components/common/Pagination';
import styles from './ActivitiesPage.module.css';

const ACTION_CONFIG = {
  CREATE: { label: 'Created', class: 'create', icon: '+' },
  UPDATE: { label: 'Updated', class: 'update', icon: '✎' },
  DELETE: { label: 'Deleted', class: 'delete', icon: '✕' },
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} minutes ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await activityService.getActivities({ page: p, limit: 20 });
      setActivities(res.data.activities);
      setPagination(res.data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(page); }, [page, fetch]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Activity Log</h1>
        <p className={styles.subtitle}>Complete history of all CRM actions</p>
      </header>

      <div className={styles.feed}>
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)
        ) : activities.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>◉</p>
            <p className={styles.emptyTitle}>No activity yet</p>
            <p className={styles.emptyDesc}>Actions on contacts will appear here</p>
          </div>
        ) : (
          activities.map((act) => {
            const config = ACTION_CONFIG[act.action] || {};
            return (
              <div key={act._id} className={styles.item}>
                <div className={`${styles.iconBadge} ${styles[config.class]}`}>
                  {config.icon}
                </div>
                <div className={styles.content}>
                  <p className={styles.desc}>
                    <span className={`${styles.badge} ${styles[config.class]}`}>{config.label}</span>
                    {' '}
                    <strong>{act.entityName}</strong>
                    {act.performedBy && (
                      <span className={styles.byUser}> by {act.performedBy.name}</span>
                    )}
                  </p>
                  {act.changes && Object.keys(act.changes).length > 0 && (
                    <div className={styles.changes}>
                      {Object.entries(act.changes).map(([field, change]) => (
                        <span key={field} className={styles.change}>
                          {field}: <span className={styles.from}>{String(change.from || '—')}</span>{' → '}
                          <span className={styles.to}>{String(change.to || '—')}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={styles.time}>{timeAgo(act.createdAt)}</span>
              </div>
            );
          })
        )}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ActivitiesPage;