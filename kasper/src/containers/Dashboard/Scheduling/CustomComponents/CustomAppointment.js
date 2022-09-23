import React from 'react';
import styles from '../index.module.css';
import { useStores } from 'hooks/useStores';
import { useQueryClient } from 'react-query';
import { Appointments } from '@devexpress/dx-react-scheduler-material-ui';
import CustomTooltip from './CustomTooltip';
import moment from 'moment-timezone';

const CustomAppointment = ({ data, children, style, ...restProps }) => {
  const { scheduling: schedulingStore, patientsFeed } = useStores();
  const queryClient = useQueryClient();
  const statusDefinition = queryClient
    .getQueryData('statusDefinitions')
    .find(({ id }) => id === data.status);

  const handleAppointmentSelect = (patient) => {
    schedulingStore.setSelectedPatientId(patient.id);
    patientsFeed.setSelectedPatient(patient);
  };

  return (
    <Appointments.Appointment
      {...restProps}
      className={styles.appointmentCard}
      style={{
        ...style,
        backgroundColor: statusDefinition.config.primaryColor,
      }}
      onClick={() => handleAppointmentSelect(data.patient)}
    >
      <CustomTooltip data={data}>
        <div
          className={styles.appointmentCardBody}
          style={{ backgroundColor: statusDefinition.config.secondaryColor }}
        >
          <div className={styles.appointmentCardTitle}>{data.title}</div>
          <div className="mt-2">
            {moment(data.startDate).format('h:mm a')} -{' '}
            {moment(data.endDate).format('h:mm a')}
          </div>
        </div>
      </CustomTooltip>
    </Appointments.Appointment>
  );
};

export default React.memo(CustomAppointment);
