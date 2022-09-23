import React from 'react';
import { format } from 'date-fns';
import { Grid } from '@material-ui/core';
import { reverse } from 'lodash';

import CallActivityLog from 'components/CallActivityLog';
import AppointmentActivityLog from 'components/AppointmentActivityLog';

import styles from './index.module.css';
import './index.css';

const getActivityLogComponent = (key, log, selectedPatient) => {
  const typeId = log?.log_type_id;
  switch (typeId) {
    case 2:
    case 3:
    case 4:
      return (
        <CallActivityLog
          key={key}
          log={log}
          patientName={selectedPatient.displayName}
        />
      );
    case 8:
      return (
        <AppointmentActivityLog
          key={key}
          log={log}
          selectedPatient={selectedPatient}
        />
      );
  }
};

const Log = ({ key, log, selectedPatient }) => {
  const dateTime = log?.log_type_id == '8' ? log?.datetime : log?.end_datetime;
  const component = getActivityLogComponent(key, log, selectedPatient);
  return component ? (
    <div className={styles.activityLogRow}>
      <Grid container style={{ display: 'flex', width: 'auto' }}>
        <Grid item xs={12}>
          {component}
          <div className={styles.activityLogTime}>
            {format(new Date(dateTime), 'h:mm a')}
          </div>
        </Grid>
      </Grid>
    </div>
  ) : null;
};

const PatientActivityLog = ({ activityLogs, callLogs, selectedPatient }) => {
  const aLogs = activityLogs ? reverse(activityLogs.pages.flat()) : [];
  const cLogs = callLogs ? reverse(callLogs.pages.flat()) : [];
  const logs = [...aLogs, ...cLogs];
  return (
    <React.Fragment>
      {logs.map((log, i) => {
        return <Log key={i} log={log} selectedPatient={selectedPatient} />;
      })}
    </React.Fragment>
  );
};

export default PatientActivityLog;
