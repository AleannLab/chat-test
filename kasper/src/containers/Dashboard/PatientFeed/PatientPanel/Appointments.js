import React, { useMemo } from 'react';
import { Paper, Grid } from '@material-ui/core';
import { convertCurrentTime, convertCustomTime } from 'helpers/timezone';
import { APPOINTMENT_STATUS_CONFIG } from 'helpers/constants';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import Tabs from 'components/Core/Tabs';
import { ReactComponent as CalendarIcon } from 'assets/images/calendar-with-clock.svg';
import Loading from './Loading';
import NoDataAvailable from './NoDataAvailable';

const TabBody = ({ data: appointments, noDataMsg }) => {
  return appointments.length ? (
    appointments.map((appointment, i) => (
      <AppointmentCard key={i} appointment={appointment} />
    ))
  ) : (
    <NoDataAvailable icon={<CalendarIcon />} message={noDataMsg} />
  );
};

const AppointmentCard = ({ appointment }) => {
  const appointmentConfig = APPOINTMENT_STATUS_CONFIG.find(
    (status) => status.odId === appointment.od_status_id,
  ) || {
    primaryColor: '#727272',
    secondaryColor: '#EAEAEA',
    name: 'NA',
  };
  return (
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
            {appointment.procedures
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
              dateTime: appointment.start || new Date(),
              format: 'MM/DD/YYYY',
            })}
            &nbsp;&nbsp;at&nbsp;&nbsp;
            {convertCustomTime({
              dateTime: appointment.start || new Date(),
              format: 'LT',
            })}
          </div>
        </Grid>

        <Grid>
          <div
            style={{
              color: appointmentConfig.primaryColor,
              marginTop: '1rem',
              fontWeight: '500',
            }}
          >
            {appointmentConfig.name}
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
};

const Appointments = () => {
  const { patientsFeed, notification } = useStores();
  const selectedPatient = patientsFeed.selectedPatient;
  const { status: appointmentStatus, data: appointmentsData = [] } = useQuery(
    ['fetchAppointments', selectedPatient && selectedPatient.id],
    () => patientsFeed.fetchPatientAppointments(selectedPatient.id, false),
    {
      enabled:
        selectedPatient !== null && Object.keys(selectedPatient).length > 0,
      onError: () => {
        notification.showError(
          'An unexpectedd error occurred while attempting to fetch the appointments',
        );
      },
    },
  );

  const [upcomingAppointments, previousAppointments] = useMemo(() => {
    const [previous, upcoming] = appointmentsData.reduce(
      ([pre, up], appointment) => {
        return convertCustomTime({
          dateTime: appointment.start,
          shouldFormat: false,
        }).isBefore(convertCurrentTime({ shouldFormat: false }))
          ? [[...pre, appointment], up]
          : [pre, [...up, appointment]];
      },
      [[], []],
    );
    return [upcoming, previous];
  }, [appointmentsData]);

  const tabs = useMemo(
    () => [
      {
        index: 0,
        label: 'Upcoming',
        body: (
          <TabBody
            data={upcomingAppointments}
            noDataMsg="No upcoming appointments"
          />
        ),
      },
      {
        index: 1,
        label: 'Previous',
        body: (
          <TabBody
            data={previousAppointments}
            noDataMsg="No previous appointments"
          />
        ),
      },
    ],
    [upcomingAppointments, previousAppointments],
  );

  return appointmentStatus === 'success' ? (
    <Tabs
      className="patient-forms-tabs"
      panelClassName="tab-panel-container"
      config={tabs}
      defaultTabIndex={0}
    />
  ) : (
    [...Array(3)].map((x, i) => <Loading variant="rect" key={i} />)
  );
};

export default Appointments;
