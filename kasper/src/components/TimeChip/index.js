import React from 'react';
import DeleteIcon from 'assets/images/time-chip-delete.svg';

import styles from './index.module.css';

const TimeChip = ({ deletable, time, deleteSchedule }) => {
  return deletable ? (
    <div className={styles.timeContainer}>
      <span className={styles.time}>{time}</span>
      <img
        src={DeleteIcon}
        alt="delete"
        className={styles.deleteIcon}
        onClick={() => deleteSchedule()}
      />
    </div>
  ) : (
    <div className={styles.timeContainer}>
      <span className={styles.time}>{time}</span>
    </div>
  );
};

export default TimeChip;
