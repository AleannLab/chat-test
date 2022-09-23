import MissedCallAutoReply from 'components/MissedCallAutoReply';
import React from 'react';
import styles from './index.module.css';

const AutomationSettings = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>Automation Settings</div>
      <div className={styles.info}>
        Look ma, no hands! Let Kasper streamline your office communication flow
        by updating the settings below.
      </div>
      <div className={styles.sectionContainer}>
        <MissedCallAutoReply />
      </div>
    </div>
  );
};

export default AutomationSettings;
