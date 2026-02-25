import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ fullScreen, size = 'md' }) => {
  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        <div className={styles.brand}>
          <span className={styles.logo}>⬡</span>
          <span className={styles.brandName}>NexusCRM</span>
        </div>
        <div className={`${styles.spinner} ${styles[size]}`} />
        <p className={styles.label}>Initializing...</p>
      </div>
    );
  }
  return <div className={`${styles.spinner} ${styles[size]}`} />;
};

export default LoadingSpinner;