import React from 'react';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import Grid from '@material-ui/core/Grid';
import AppointmentItem from './AppointmentItem';
import Skeleton from '@material-ui/lab/Skeleton';

const PatientAppointments = ({ patientId }) => {
  const { scheduling: schedulingStore } = useStores();

  // react-query to fetch patient appointments by patient id
  const patientAppointmentsQuery = useQuery(
    ['patientAppointments', patientId],
    () => schedulingStore.getAppointmentsByPatientId(patientId),
    {
      enabled: !!patientId,
      onSuccess: (response) => {
        return response;
      },
    },
  );

  return (
    <div className="flex-grow-1">
      {patientAppointmentsQuery.isSuccess ? (
        patientAppointmentsQuery.data.length ? (
          patientAppointmentsQuery.data.map((appointment) => (
            <AppointmentItem
              key={appointment.id}
              appointmentData={appointment}
            />
          ))
        ) : (
          <div className="text-center">No appointments here.</div>
        )
      ) : patientAppointmentsQuery.isFetching ? (
        <Loader />
      ) : null}
    </div>
  );
};

export default PatientAppointments;

const Loader = () =>
  [...Array(4)].map((d, i) => (
    <Grid container key={i} className={styles.loaderItem}>
      <Grid item xs={1}>
        <Skeleton variant="rect" height="100%" width="20%" />
      </Grid>
      <Grid item xs={11}>
        <Skeleton height={20} width="40%" style={{ marginBottom: 10 }} />
        <Skeleton height={10} width="60%" style={{ marginBottom: 20 }} />
      </Grid>
    </Grid>
  ));
