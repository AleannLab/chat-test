import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import ScheduleInformation from './ScheduleInformation';
import PatientInformation from './PatientInformation';
import styles from './index.module.css';

const AppointmentForm = () => {
  return (
    <Paper className={styles.schedulePaper}>
      <Grid container>
        <Grid
          item
          md={3}
          className="d-none d-lg-block d-xl-block"
          style={{ border: '0.2px solid #f0f3f8' }}
        >
          <ScheduleInformation />
        </Grid>
        <Grid item xs={12} md={9} style={{ border: '0.2px solid #f0f3f8' }}>
          <PatientInformation />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AppointmentForm;
