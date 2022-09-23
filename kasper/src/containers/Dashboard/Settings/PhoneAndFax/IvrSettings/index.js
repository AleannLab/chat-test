import React from 'react';
import IvrList from './IvrList';
import styles from './index.module.css';

const IvrSettings = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>IVR Settings</div>
      <div className={styles.info}>
        You can set up interactive voice response
      </div>
      <div className={styles.sectionContainer}>
        <IvrList />
      </div>
    </div>
  );
};

export default IvrSettings;
