import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { IconButton } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import TextField from '@material-ui/core/TextField';
import Skeleton from '@material-ui/lab/Skeleton';

import { useStores } from 'hooks/useStores';
import Switch from 'components/Core/Switch';
import { ReactComponent as PencilIcon } from 'assets/images/custom-pencil.svg';
import styles from './index.module.css';

const EmailNotifications = () => {
  const EMAIL_REGEX =
    /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/;

  const queryClient = useQueryClient();
  const [checked, setChecked] = useState(
    queryClient.getQueryData('fetchAppointmentNotificationEmail')
      ? parseInt(
          queryClient.getQueryData('fetchAppointmentNotificationEmail')
            .appointmentNotificationEnabled,
        ) === 1
      : false,
  );
  const [email, setEmail] = useState(
    queryClient.getQueryData('fetchAppointmentNotificationEmail')
      ? queryClient.getQueryData('fetchAppointmentNotificationEmail')
          .appointmentNotificationEmail
      : '',
  );
  const [isEditing, setIsEditing] = useState(false);

  const { notification, onlineScheduleSettings } = useStores();

  const fetchAppointmentNotificationEmailQuery = useQuery(
    'fetchAppointmentNotificationEmail',
    () => onlineScheduleSettings.fetchAppointmentNotificationEmail(),
    {
      onSuccess: (data) => {
        setEmail(data.appointmentNotificationEmail);
        setChecked(parseInt(data.appointmentNotificationEnabled) === 1);
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const updateAppointmentNotificationEmailSettingsQuery = useMutation(
    'updateAppointmentNotificationEmailSettings',
    (data) =>
      onlineScheduleSettings.updateAppointmentNotificationEmailSettings(data),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const handleSubmit = async () => {
    if (email.trim().length > 0) {
      const validEmail = EMAIL_REGEX.test(email);
      if (validEmail) {
        await updateAppointmentNotificationEmailSettingsQuery.mutateAsync({
          appointmentNotificationEmail: email,
          appointmentNotificationEnabled: checked,
        });
        await queryClient.refetchQueries('fetchAppointmentNotificationEmail');
        setIsEditing(false);
      } else {
        notification.showError('Please enter a valid email address');
      }
    } else if (email.trim().length === 0) {
      await updateAppointmentNotificationEmailSettingsQuery.mutateAsync({
        appointmentNotificationEmail: '',
        appointmentNotificationEnabled: false,
      });
      await queryClient.refetchQueries('fetchAppointmentNotificationEmail');
      setIsEditing(false);
    }
  };

  const handleSwitch = (checked) => {
    setChecked(checked);
    updateAppointmentNotificationEmailSettingsQuery.mutateAsync({
      appointmentNotificationEnabled: checked,
    });
  };

  return (
    <div className={styles.container}>
      <span className={styles.emailLabel}>
        Send email notifications when a patient schedules online
      </span>
      <div className={styles.switchInputContainer}>
        <Switch
          checked={checked}
          onChange={() => handleSwitch(!checked)}
          disabled={
            fetchAppointmentNotificationEmailQuery.isFetching ||
            updateAppointmentNotificationEmailSettingsQuery.isLoading ||
            email.trim().length === 0 ||
            !EMAIL_REGEX.test(email)
          }
        />
        {(email && !isEditing) ||
        (!email &&
          !isEditing &&
          fetchAppointmentNotificationEmailQuery.isFetched) ? (
          <div className="ms-4">
            <span>{email}</span>
            <IconButton onClick={() => setIsEditing(true)}>
              <PencilIcon fill="#9A9A9A" />
            </IconButton>
          </div>
        ) : isEditing ? (
          <>
            <TextField
              className="ms-4"
              value={email}
              variant="outlined"
              placeholder="Type email"
              onChange={(e) => setEmail(e.target.value)}
              disabled={
                fetchAppointmentNotificationEmailQuery.isFetching ||
                updateAppointmentNotificationEmailSettingsQuery.isLoading
              }
            />
            <IconButton
              size="small"
              onClick={() => {
                if (
                  !updateAppointmentNotificationEmailSettingsQuery.isLoading
                ) {
                  handleSubmit();
                }
              }}
            >
              <CheckIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                if (
                  !updateAppointmentNotificationEmailSettingsQuery.isLoading
                ) {
                  if (
                    queryClient.getQueryData(
                      'fetchAppointmentNotificationEmail',
                    ).appointmentNotificationEmail
                  ) {
                    setEmail(
                      queryClient.getQueryData(
                        'fetchAppointmentNotificationEmail',
                      ).appointmentNotificationEmail,
                    );
                    setIsEditing(false);
                  } else {
                    setEmail('');
                  }
                }
              }}
            >
              <ClearIcon />
            </IconButton>
          </>
        ) : (
          <Skeleton className="ms-4" variant="rect" width={200} height={40} />
        )}
      </div>
    </div>
  );
};

export default EmailNotifications;
