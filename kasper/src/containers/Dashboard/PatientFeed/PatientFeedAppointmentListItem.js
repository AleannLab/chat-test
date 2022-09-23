import React from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import moment from 'moment';

export const PatientFeedAppointmentListItem = ({ datum, history }) => {
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
            backgroundColor: '#5A9B68',
            width: 5,
            marginRight: 18,
            borderRadius: 2,
          }}
        ></div>
        <Grid container>
          <Grid item xs={10} style={{ marginTop: '10px' }}>
            <Typography
              variant="h6"
              style={{
                fontSize: '14px',
                fontFamily: 'Montserrat',
                fontWeight: 600,
                color: '#02122F',
              }}
            >
              {datum.description}
            </Typography>
          </Grid>
          <Grid
            item
            xs={2}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
            }}
          >
            <IconButton aria-label="settings" style={{ padding: '0px' }}>
              <MoreHorizIcon />
            </IconButton>
          </Grid>
          <Grid item xs={12} style={{ marginTop: '7px' }}>
            <Typography
              style={{
                fontSize: '14px',
                fontFamily: 'Montserrat',
                color: '#02122F',
              }}
            >
              {moment(datum.created_at || new Date()).format('MM/DD/YYYY')}
              &nbsp;at&nbsp;
              {moment(datum.created_at || new Date()).format('hh:mm a')}
            </Typography>
          </Grid>

          <div className="d-flex w-100" style={{ margin: '13px 0px 0px 0px' }}>
            <Button
              className="p-0 me-auto"
              style={{
                color: '#5A9B68',
                textAlign: 'left',
                fontSize: '14px',
                fontFamily: 'Montserrat',
              }}
            >
              FULFILLED
            </Button>
            <Button
              className="p-0"
              // onClick={() => {
              //   history.push("/patient-feed/appointment-details");
              // }}
              style={{
                float: 'left',
                textAlign: 'right',
                fontSize: '14px',
                fontFamily: 'Montserrat',
                color: '#9A9A9A',
              }}
            >
              Details
            </Button>
          </div>
        </Grid>
      </Paper>
    </Grid>
  );
};
