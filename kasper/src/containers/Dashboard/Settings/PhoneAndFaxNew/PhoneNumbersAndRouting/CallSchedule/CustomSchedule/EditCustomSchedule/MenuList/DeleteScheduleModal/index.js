import React from 'react';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';
import { Button } from '@material-ui/core';
import { useStores } from 'hooks/useStores';
import { useMutation, useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

const DeleteScheduleModal = ({
  setDeleteSchedule,
  id,
  weekdayValue,
  itemIndex,
  scheduleData,
}) => {
  const { incomingCalls, notification } = useStores();
  const queryClient = useQueryClient();
  const { numberId } = useParams();
  if (numberId === null) {
    notification.showError('A phone number was not provided.');
    setTimeout(() => {
      notification.hideNotification();
    }, 5000);
    history.push('/dashboard/settings/phone-and-fax/phone-number-and-routing');
    return;
  }

  const { mutateAsync: updateSlot, isLoading: isLoadingSlot } = useMutation(
    'updateSlot',
    (payload) => {
      incomingCalls.updateTimeSlot(payload);
    },
    {
      onSuccess: () => {
        notification.showSuccess('Schedule settings updated successfully!');
        queryClient.invalidateQueries('getScheduleSlots');
        setDeleteSchedule(false);
      },
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to update the slot',
        );
        setDeleteSchedule(false);
      },
      retry: false,
    },
  );

  const { mutateAsync: getScheduleSlotData, isLoading: isLoadingScheduleData } =
    useMutation(
      'getScheduleSlotData',
      (payload) => incomingCalls.getScheduleSlotData(payload),
      {
        onSuccess: async (data) => {
          let ScheduleData = data.data;

          if (
            ScheduleData[weekdayValue] &&
            ScheduleData[weekdayValue].length > 0
          ) {
            const filteredData = ScheduleData[weekdayValue].filter(
              (_, index) => index !== itemIndex,
            );
            ScheduleData[`${weekdayValue}`] = filteredData;

            ScheduleData = {
              id: ScheduleData['id'],
              name: ScheduleData['name'],
              active_schedule: ScheduleData['active_schedule'],
              position: ScheduleData['position'],
              number: numberId,
              schedule_uuid: ScheduleData['schedule_uuid'],
              uuid: ScheduleData['uuid'],
              ...Object.fromEntries(
                Object.entries(ScheduleData).filter(([key]) =>
                  key.includes(weekdayValue),
                ),
              ),
            };

            const { schedule_uuid, ...rest } = ScheduleData;
            await updateSlot({ scheduleUuid: schedule_uuid, ...rest });
          }
        },
        onError: () => {
          notification.showError(
            'An unexpected error occurred while attempting to update the schedule',
          );
          setDeleteSchedule(false);
        },
        retry: false,
      },
    );

  const handleDeleteSlot = async () => {
    await getScheduleSlotData({
      scheduleId: scheduleData?.[0]?.uuid,
      id: id,
    });
  };

  const isUpdating = isLoadingSlot || isLoadingScheduleData;
  return (
    <Modal
      size="xs"
      body={
        <div className={styles.container}>
          <span className={styles.subtitle}>
            Are you sure you want to delete this time slot?
          </span>
        </div>
      }
      footer={
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={() => setDeleteSchedule(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            disabled={isUpdating}
            onClick={() => handleDeleteSlot()}
          >
            {isUpdating ? 'Deleting...' : 'Delete'}
          </Button>
        </>
      }
      onClose={() => setDeleteSchedule(false)}
    />
  );
};

export default DeleteScheduleModal;
