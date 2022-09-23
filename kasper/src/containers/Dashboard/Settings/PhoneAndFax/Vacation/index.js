import React from 'react';
import VacationSchedule from './VacationSchedule';
import styles from './index.module.css';

const OutOfOfficeSettings = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>Vacation</div>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionTitleContainer}>
          <span className={styles.sectionTitle}>Vacation Schedule</span>
        </div>
        <VacationSchedule />
      </div>
    </div>
  );
};

export default OutOfOfficeSettings;
