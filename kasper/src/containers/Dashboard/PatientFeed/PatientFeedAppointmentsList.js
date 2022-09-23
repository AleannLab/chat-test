import React from 'react';
import clsx from 'clsx';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import Uparrow from 'assets/images/uparrow.svg';
// import { useHistory } from "react-router-dom";
import { Scrollbars } from 'react-custom-scrollbars';
import { useStyles } from './index';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
// import Button from "@material-ui/core/Button";
// import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import PatientFeedAppointmentsListLoading from './PatientFeedAppointmentListLoading';
import { convertCustomTime } from 'helpers/timezone';
import { useQuery } from 'react-query';
import { APPOINTMENT_STATUS_CONFIG } from 'helpers/constants';

export const PatientFeedAppointmentsList = observer((props) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(true);
  const { patientsFeed, notification } = useStores();

  const fetchAppointmentsQuery = useQuery(
    [
      'fetchAppointments',
      patientsFeed.selectedPatient && patientsFeed.selectedPatient.id,
    ],
    () =>
      patientsFeed.fetchPatientAppointments(patientsFeed.selectedPatient.id),
    {
      enabled:
        patientsFeed.selectedPatient !== null &&
        Object.keys(patientsFeed.selectedPatient).length > 0,
      onError: () => {
        notification.showError(
          'An unexpectedd error occurred while attempting to fetch the appointments',
        );
      },
    },
  );

  return (
    <Card
      style={{
        borderRadius: '0px',
        boxShadow: 'none',
        flex: '1 1 auto',
        paddingBottom: '30px',
      }}
    >
      <CardActions disableSpacing style={{ background: '#E8E8E8' }}>
        <Typography
          variant="h6"
          style={{
            fontWeight: '800',
            marginLeft: '16px',
            fontFamily: 'Playfair Display',
            fontSize: '18px',
            color: '#0D2145',
          }}
        >
          Appointments
        </Typography>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <img src={Uparrow} alt="kasper" style={{ height: '7px' }} />
        </IconButton>
      </CardActions>

      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
        collapsedHeight="100%"
        style={{
          marginRight: '14px',
          display: 'flex',
          flexFlow: 'column',
        }}
      >
        <Scrollbars style={{ flex: '1 1 auto' }}>
          <CardContent className="px-4 pt-0">
            {patientsFeed.selectedPatient &&
              (fetchAppointmentsQuery.status === 'success' ? (
                fetchAppointmentsQuery.data.length > 0 ? (
                  fetchAppointmentsQuery.data.map((appointment) => (
                    <PatientFeedAppointmentListItem
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))
                ) : (
                  <p
                    style={{ width: '100%', textAlign: 'center' }}
                    className="pt-5"
                  >
                    No appointments here.
                  </p>
                )
              ) : (
                [...Array(5)].map((x, i) => (
                  <PatientFeedAppointmentsListLoading variant="rect" key={i} />
                ))
              ))}
          </CardContent>
        </Scrollbars>
      </Collapse>
    </Card>
  );
});

const PatientFeedAppointmentListItem = ({ appointment: appointmentData }) => {
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
              variant="h6"
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
