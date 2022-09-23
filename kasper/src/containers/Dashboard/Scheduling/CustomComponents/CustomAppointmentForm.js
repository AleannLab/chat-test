import React from 'react';
import Modal from 'components/Core/Modal';
import AppointmentForm from 'components/AppointmentForm';
import { useStores } from 'hooks/useStores';
import { useMutation, useQueryClient } from 'react-query';
import LinearProgress from '@material-ui/core/LinearProgress';

const CustomAppointmentForm = ({ appointmentId = null, open, onClose }) => {
  const queryClient = useQueryClient();
  const { scheduling: schedulingStore, notification } = useStores();

  const appointmentMutation = useMutation(
    (reqObj) => {
      return reqObj.id
        ? schedulingStore.updateAppointment(reqObj)
        : schedulingStore.scheduleAppointment(reqObj);
    },
    {
      onSuccess: (data, reqObj) => {
        // TODO: 5 seconds of timeout is added due async limitation in create/update appointment API
        // Remove this time out once the API is fixed.
        setTimeout(() => {
          notification.showSuccess('Appointment scheduled successfully');
          queryClient.invalidateQueries(['officeAppointments']);
          if (reqObj.patient_id === schedulingStore.selectedPatientId) {
            queryClient.invalidateQueries([
              'patientAppointments',
              reqObj.patient_id,
            ]);
          } else {
            schedulingStore.setSelectedPatientId(reqObj.patient_id);
          }
        }, 5000);
      },
      onError: (errorMessage) => {
        notification.showError(errorMessage);
      },
    },
  );

  const handleSubmitForm = async (values) => {
    // TODO: Remove this info message once the create/update appointment API is fixed.
    notification.showInfo(
      <div>
        <div className="mb-2">Scheduling appointment...</div>
        <LinearProgress color="primary" />
      </div>,
    );

    await appointmentMutation.mutateAsync(values);
    onClose();
    return true;
  };

  return (
    open && (
      <Modal
        size="sm"
        header={appointmentId ? 'Edit Appointment' : 'Schedule Appointment'}
        body={
          <div className="mt-4">
            <AppointmentForm
              appointmentId={appointmentId}
              onFormSubmit={handleSubmitForm}
              onFormCancel={onClose}
            />
          </div>
        }
        footer={''}
        onClose={onClose}
      />
    )
  );
};

export default CustomAppointmentForm;
