import React from 'react';
import styles from './index.module.css';

const PermissionsOverlay = ({
  text = `Insufficient permissions to view this page.
Please contact your administrator.`,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.overlay}>
        <span className={styles.heading}>{text}</span>
      </div>
    </div>
  );
};

export default PermissionsOverlay;
