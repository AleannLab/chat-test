import React from 'react';
import ArrowBack from '@material-ui/icons/ArrowBack';
import styles from './index.module.css';

const ArchiveBack = ({ setShowArchiveItems }) => {
  return (
    <div
      onClick={() => setShowArchiveItems(false)}
      className={styles.archiveBack}
    >
      <span className={styles.archiveBackTitle}>Archived Groups</span>
      <div className={styles.archiveBack__container}>
        <ArrowBack />
        <span className={styles.archiveBackBack}>Back</span>
      </div>
    </div>
  );
};

export { ArchiveBack };
