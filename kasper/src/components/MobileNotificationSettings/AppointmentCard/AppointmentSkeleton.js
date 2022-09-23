import React from 'react';
import Paper from '@material-ui/core/Paper';
import Skeleton from '@material-ui/lab/Skeleton';

import styles from './index.module.css';

const AppointmentCard = () => {
  return (
    <Paper className={styles.paper}>
      <div className={styles.appointmentContent}>
        <div className={styles.mainContent}>
          <span className={styles.docHygName}>
            <Skeleton variant="rect" animation="wave" width="20%" height={15} />
          </span>
          <span className={styles.appointmentTime}>
            <Skeleton variant="rect" animation="wave" width="60%" height={15} />
          </span>
          <span className={styles.confirmed}>
            <Skeleton variant="rect" animation="wave" width="30%" height={15} />
          </span>
        </div>
      </div>
    </Paper>
  );
};

export default AppointmentCard;
