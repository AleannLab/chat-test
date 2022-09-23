import { Grid, Paper, Typography } from '@material-ui/core';
import React from 'react';
import PatientSeenChart from './PatientsSeenChart';
import styles from './index.module.css';

const PatientsSeen = ({ data }) => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <Paper classes={{ root: styles.chartContainer }}>
          <Typography classes={{ root: styles.chartHeader }}>
            New Patients Seen in the last 30 days
          </Typography>
          <PatientSeenChart data={data} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PatientsSeen;
