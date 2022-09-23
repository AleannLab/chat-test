import { Typography } from '@material-ui/core';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { useFlags } from 'launchdarkly-react-client-sdk';
import styles from './index.module.css';
import data from './data';
import PatientsSeen from 'components/AnalyticsWidgets/PatientsSeen';

const Analytics = () => {
  const { analyticsView } = useFlags();
  return (
    <>
      {!analyticsView ? (
        <Redirect to="/dashboard" />
      ) : (
        <div className={styles.root}>
          <Typography variant="h2" classes={{ h2: styles.heading }}>
            Analytics
          </Typography>
          <PatientsSeen data={data} />
        </div>
      )}
    </>
  );
};

export default Analytics;
