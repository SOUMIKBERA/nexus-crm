import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    const range = 2;
    for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={styles.container} role="navigation" aria-label="Pagination Navigation">
      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {currentPage > 3 && (
        <>
          <button className={styles.btn} onClick={() => onPageChange(1)} aria-label="Page 1">
            1
          </button>
          {currentPage > 4 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {getPages().map((page) => (
        <button
          key={page}
          className={`${styles.btn} ${page === currentPage ? styles.active : ''}`}
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && <span className={styles.ellipsis}>...</span>}
          <button
            className={styles.btn}
            onClick={() => onPageChange(totalPages)}
            aria-label={`Page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;