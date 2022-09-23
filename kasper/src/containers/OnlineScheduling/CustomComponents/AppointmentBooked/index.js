import React from 'react';
import Paper from '@material-ui/core/Paper';
import moment from 'moment-timezone';

import { useStores } from 'hooks/useStores';
import FormsCompletedCheckBox from 'assets/images/forms-completed-checkbox.svg';
import styles from './index.module.css';

const AppointmentBooked = () => {
  const { onlineSchedule } = useStores();

  return (
    <div className={styles.container}>
      <Paper className={styles.content}>
        <img src={FormsCompletedCheckBox} alt="Success checkbox" />
        <span className={styles.successMessage}>Confirmed!</span>
        <div className={styles.appointmentInformation}>
          <span className={styles.instruction}>
            The appointment was successfully confirmed for
          </span>
          <span className={styles.scheduleInfo}>
            <b>
              {moment(onlineSchedule.dateTime.date).format(
                'dddd, MMMM Do YYYY',
              )}
            </b>{' '}
            at
            <b> {moment(onlineSchedule.dateTime.time).format('LT')}</b>
          </span>
          <span className={styles.closeWindow}>
            No further action needed, you may close this window.
          </span>
        </div>
      </Paper>
    </div>
  );
};

export default AppointmentBooked;
