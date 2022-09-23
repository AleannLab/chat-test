import React, { useState } from 'react';
import { useStores } from 'hooks/useStores';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Table from 'components/Core/Table';
import Switch from 'components/Core/Switch';
import { ReactComponent as DeleteIcon } from 'assets/images/custom-delete.svg';
import { IconButton, Button, Typography } from '@material-ui/core';
import AddAppointmentReminderModal from '../AddAppointmentReminderModal';
import CustomTooltip from 'components/Core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

// Table column config
const tableColumns = [
  {
    id: 'reminderType',
    numeric: false,
    disablePadding: false,
    label: 'Reminder type',
    align: 'center',
  },
  {
    id: 'time',
    numeric: false,
    disablePadding: false,
    label: 'Time',
    align: 'center',
  },
  {
    id: 'addFormsLink',
    numeric: false,
    disablePadding: false,
    label: (
      <>
        <Typography component="p" style={{ fontWeight: 500 }}>
          Add Forms Link
        </Typography>
        <CustomTooltip
          title={`If enabled, Kasper will include a link in the email/SMS to fill out any incomplete forms`}
          color="#000"
          placement="top-start"
          arrow
          maxWidth={400}
        >
          <HelpOutlineIcon
            style={{ fontSize: '1rem', marginLeft: '0.25rem' }}
            htmlColor="#9A9A9A"
          />
        </CustomTooltip>
      </>
    ),
    align: 'center',
  },
  {
    id: 'confirm',
    numeric: false,
    disablePadding: false,
    label: (
      <>
        <Typography component="p" style={{ fontWeight: 500 }}>
          Ask to Confirm
        </Typography>
        <CustomTooltip
          title={`This will append "Reply with C to confirm" at the end of the reminder unless the appointment(s) is already confirmed`}
          color="#000"
          placement="top-start"
          arrow
          maxWidth={400}
        >
          <HelpOutlineIcon
            style={{ fontSize: '1rem', marginLeft: '0.25rem' }}
            htmlColor="#9A9A9A"
          />
        </CustomTooltip>
      </>
    ),
    align: 'center',
  },
  {
    id: 'enabled',
    numeric: false,
    disablePadding: false,
    label: 'Enabled',
    align: 'center',
  },
  {
    id: 'action',
    numeric: false,
    disablePadding: false,
    label: 'Action',
    align: 'center',
  },
];

export default function ReminderTable({ className = '' }) {
  const [showAddAppointmentReminder, setShowAddAppointmentReminder] =
    useState(false);
  const { reminders, notification } = useStores();
  const queryClient = useQueryClient();

  // React query to fetch reminder configs
  const reminderConfigsQuery = useQuery(
    'reminderConfigs',
    () =>
      reminders.getReminderConfig('appointment_same_day,appointment_general'),
    {
      initialData: [],
      select: (data) => {
        return data.map(
          ({
            id,
            reminderType,
            channel,
            duration, // for appt reminders duration will always be in days
            addFormsLink,
            askConfirmation,
            enabled,
          }) => {
            return createData(
              id,
              reminderType,
              channel,
              duration,
              addFormsLink,
              askConfirmation,
              enabled,
            );
          },
        );
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Mutate reminder config
  const updateReminderConfig = useMutation(
    ({ id, config }) => reminders.updateReminderConfig(id, config),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reminderConfigs');
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Delete reminder config by id
  const deleteReminderConfig = useMutation(
    (id) => reminders.deleteReminderConfig(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reminderConfigs');
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  /**
   * Handle switch toggle inside table
   * @param {number} id
   * @param {object} config
   */
  const handleToggle = (id, config) => {
    updateReminderConfig.mutate({ id, config });
  };

  // Function to create table data
  function createData(
    id,
    reminderType,
    channel,
    duration,
    addFormsLink,
    askConfirmation,
    enabled,
  ) {
    const _reminderType =
      channel === 'SMS_EMAIL'
        ? 'SMS and Email'
        : channel === 'EMAIL'
        ? 'Email'
        : 'SMS';
    const time =
      reminderType === 'appointment_same_day' ? (
        'Same day'
      ) : (
        <span>
          {duration} day{duration > 1 ? 's' : ''}
        </span>
      );
    const _addFormsLink = (
      <ControlledSwitch
        name="addFormsLink"
        checked={addFormsLink}
        onChange={(checkedState) => {
          handleToggle(id, { addFormsLink: checkedState });
        }}
      />
    );
    const confirm = (
      <ControlledSwitch
        name="confirm"
        checked={askConfirmation}
        onChange={(checkedState) => {
          handleToggle(id, { askConfirmation: checkedState });
        }}
      />
    );
    enabled = (
      <ControlledSwitch
        name="enabled"
        checked={enabled}
        onChange={(checkedState) => {
          handleToggle(id, { enabled: checkedState });
        }}
      />
    );
    const action =
      reminderType === 'appointment_same_day' ? null : (
        <IconButton onClick={() => deleteReminderConfig.mutate(id)}>
          <DeleteIcon style={{ fill: '#9A9A9A' }} />
        </IconButton>
      );

    return {
      id,
      reminderType: _reminderType,
      time,
      addFormsLink: _addFormsLink,
      confirm,
      enabled,
      action,
    };
  }

  return (
    <div className={`${className} d-flex flex-column`}>
      <Button
        onClick={() => setShowAddAppointmentReminder(true)}
        className="secondary-btn align-self-end my-4"
        variant="contained"
        color="secondary"
      >
        Add Reminder
      </Button>

      <Table
        columns={tableColumns}
        rows={reminderConfigsQuery.data}
        isSelectable={false}
        isEmpty={
          reminderConfigsQuery.isSuccess && !!reminderConfigsQuery.data.length
        }
        height={400}
      />

      {!!showAddAppointmentReminder && (
        <AddAppointmentReminderModal
          onClose={() => setShowAddAppointmentReminder(false)}
        />
      )}
    </div>
  );
}

// Controlled switch component
const ControlledSwitch = ({ name, checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    if (onChange) onChange(!checked);
  };

  return <Switch name={name} checked={isChecked} onClick={handleChange} />;
};
