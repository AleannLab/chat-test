import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { convertCustomTime } from 'helpers/timezone';
import { APPOINTMENT_STATUS_CONFIG } from 'helpers/constants';

const AppointmentItem = ({ appointmentData }) => {
  const appointmentConfig = APPOINTMENT_STATUS_CONFIG.find(
    (status) => status.odId === appointmentData.od_status_id,
  ) || {
    name: 'NA',
    primaryColor: '#727272',
    secondaryColor: '#EAEAEA',
  };

  return (
    <Grid container>
      <Paper
        style={{
          border: '1px solid #D2D2D2',
          marginTop: '10px',
          width: '100%',
          padding: 4,
          display: 'flex',
          background: '#FFFFFF',
          borderRadius: 3,
          boxShadow: 'none',
        }}
      >
        <div
          style={{
            backgroundColor: appointmentConfig.primaryColor,
            width: 5,
            marginRight: 18,
            borderRadius: 2,
          }}
        />
        <Grid container className="mb-1">
          <Grid item xs={12} style={{ marginTop: '0.7rem' }}>
            <div
              variant="body1"
              style={{
                fontSize: '14px',
                fontFamily: 'Montserrat',
                fontWeight: 600,
                color: '#02122F',
              }}
            >
              {appointmentData.procedures
                .map(({ abbrivation }) => abbrivation)
                .join(', ') || 'NA'}
            </div>
          </Grid>

          <Grid item xs={12}>
            <div
              style={{
                fontSize: '14px',
                fontFamily: 'Montserrat',
                color: '#02122F',
              }}
            >
              {convertCustomTime({
                dateTime: appointmentData.start || new Date(),
                format: 'MM/DD/YYYY',
              })}
              &nbsp;&nbsp;at&nbsp;&nbsp;
              {convertCustomTime({
                dateTime: appointmentData.start || new Date(),
                format: 'hh:mm a',
              })}
            </div>
          </Grid>

          <Grid>
            <div
              style={{
                color: appointmentConfig.primaryColor,
                marginTop: '1rem',
              }}
            >
              {appointmentConfig.name}
            </div>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default AppointmentItem;
