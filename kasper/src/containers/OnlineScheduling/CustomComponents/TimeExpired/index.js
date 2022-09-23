import React from 'react';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import { useStores } from 'hooks/useStores';

import styles from './index.module.css';

const TimeExpired = () => {
  const { onlineSchedule } = useStores();
  const handleOnClick = () => {
    onlineSchedule.setTimeExpired(false);
    onlineSchedule.setScheduleNow(false);
  };

  return (
    <Paper className={styles.container}>
      <span className={styles.title}>Confirmation Time Expired</span>
      <span className={styles.description}>
        Sorry, this time is no longer available, please select a new date and
        time.
      </span>
      <Button
        className={`${styles.button} secondary-btn`}
        variant="contained"
        color="secondary"
        onClick={handleOnClick}
      >
        Go To Scheduling
      </Button>
    </Paper>
  );
};

export default TimeExpired;
