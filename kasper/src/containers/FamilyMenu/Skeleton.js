import React from 'react';
import styles from './PatientWithFormInfo.module.css';
import Skeleton from '@material-ui/lab/Skeleton';
import Grid from '@material-ui/core/Grid';

export default function PatientWithFromInfo() {
  return [...Array(4)].map((i) => (
    <Grid key={i} className={styles.container}>
      <Grid container justify="space-between" className={styles.patientDetails}>
        <Grid item xs={12} sm={6} className="d-flex">
          <Skeleton variant="circle" animation="wave" height={50} width={50} />
          <div className="ms-2">
            <Skeleton variant="rect" animation="wave" height={20} width={160} />
            <Skeleton
              className="mt-2"
              variant="rect"
              animation="wave"
              height={14}
              width={100}
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={3} className="d-flex align-items-center">
          <Skeleton variant="rect" animation="wave" height={20} width={160} />
        </Grid>
        <Grid
          item
          xs={12}
          sm={3}
          className="d-flex justify-content-end align-items-center"
        >
          <Skeleton variant="rect" animation="wave" height={36} width={120} />
        </Grid>
      </Grid>
    </Grid>
  ));
}
