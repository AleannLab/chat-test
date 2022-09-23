import React from 'react';
import Paper from '@material-ui/core/Paper';
// import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import moment from 'moment-timezone';

import styles from './index.module.css';

const AppointmentCard = ({ appointmentData, timezone }) => {
  const { start } = appointmentData;
  return (
    <Paper className={styles.paper}>
      <div className={styles.appointmentContent}>
        {/* <MoreHorizIcon className={styles.moreIcon} /> */}
        <div className={styles.mainContent}>
          <span className={styles.docHygName}>
            {appointmentData.procedures
              .map(({ abbrivation }) => abbrivation)
              .join(', ') || 'NA'}
          </span>
          <span className={styles.appointmentTime}>
            {moment.utc(start).tz(timezone).format('MM/DD/YYYY')}
            &nbsp;at&nbsp;
            {moment.utc(start).tz(timezone).format('hh:mm a')}
          </span>
          {/* <span className={styles.confirmed}>{status.charAt(0).toUpperCase() + status.slice(1)}</span> */}
        </div>
      </div>
    </Paper>
  );
};

export default AppointmentCard;
