import { LinearProgress } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { ReactComponent as NoRemindersIcon } from 'assets/images/no-reminders-bell.svg';
import AddEmailReminder from 'components/AddEmailReminder';
import EmailReminderPreview from 'components/AddEmailReminder/EmailReminderPreview';
import AddSMSReminder from 'components/AddSMSReminder';
import AddReminder from 'components/AddReminder';
import HygieneRemindersTable from 'components/HygieneRemindersTable';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import styles from './index.module.css';

const HygieneReminders = observer(() => {
  const { hygieneReminder, notification } = useStores();
  const queryClient = useQueryClient();
  const [showAddSMSReminder, setShowAddSMSReminder] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);

  const [showAddEmailReminder, setShowAddEmailReminder] = useState(false);
  const [showEmailReminderPreview, setShowEmailReminderPreview] =
    useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailReminderData, setEmailReminderData] = useState({
    reminderName: '',
    dueDate: '',
    durationType: '',
    period: '',
    customMessage: '',
    id: '',
  });

  // Get cached data for reminders
  const cachedHygieneReminders = queryClient.getQueryData(
    'fetchHygieneReminders',
  );

  // react-query for reminders
  const hygieneReminders = useQuery(
    'fetchHygieneReminders',
    () => hygieneReminder.fetchReminders(),
    {
      enabled: !cachedHygieneReminders, // Fetch data only if cached data is not present
      initialData: cachedHygieneReminders,
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the hygiene reminders',
        );
      },
    },
  );

  const addReminderData = useMutation(
    'addReminderData',
    (info) => hygieneReminder.addReminder(info),
    {
      onMutate: (newData) => {
        queryClient.cancelQueries('fetchHygieneReminders');
        let current = queryClient.getQueryData('fetchHygieneReminders');
        queryClient.setQueryData('fetchHygieneReminders', (prev) => [
          ...prev,
          { ...newData, id: new Date().valueOf() },
        ]);
        return current;
      },
      onError: (err, newData, rollback) => {
        rollback();
        notification.showError(err.message);
      },
      onSettled: () => queryClient.refetchQueries('fetchHygieneReminders'),
    },
  );

  const editReminderData = useMutation(
    'editReminderData',
    (info) => hygieneReminder.editReminder(info),
    {
      onMutate: (newData) => {
        queryClient.cancelQueries('fetchHygieneReminders');
        let current = queryClient.getQueryData('fetchHygieneReminders');
        queryClient.setQueryData('fetchHygieneReminders', (prev) => {
          let oldReminderDataIndex = prev?.[0]?.findIndex((p) => {
            return p.id === newData.id;
          });
          let newList = [...prev];
          newList[0][oldReminderDataIndex] = Object.assign(
            newList?.[0]?.[oldReminderDataIndex],
            newData,
          );
          return newList;
        });
        return current;
      },
      onError: (err, newData, rollback) => {
        // rollback();
        notification.showError(err.message);
      },
      onSettled: () => queryClient.refetchQueries('fetchHygieneReminders'),
    },
  );

  const deleteReminderData = useMutation(
    'deleteReminderData',
    (info) => hygieneReminder.deleteReminder(info),
    {
      onMutate: (id) => {
        queryClient.cancelQueries('fetchHygieneReminders');
        let current = queryClient.getQueryData('fetchHygieneReminders');
        queryClient.setQueryData('fetchHygieneReminders', (prev) =>
          prev.filter((p) => p.id !== id),
        );
        return current;
      },
      onError: (err) => {
        // rollback();
        notification.showError(err.message);
      },
      onSettled: () => queryClient.refetchQueries('fetchHygieneReminders'),
    },
  );

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);

  const reminderTypes = [
    { id: 1, label: 'SMS' },
    { id: 2, label: 'Email' },
    { id: 3, label: 'Add' },
  ];

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  const handleMenuClick = (item) => {
    if (item.label === 'SMS') {
      setShowAddSMSReminder(true);
    } else if (item.label === 'Email') {
      setShowAddEmailReminder(true);
    } else if (item.label === 'Add') {
      setShowAddReminder(true);
    }
  };

  const submitSMSReminder = async (
    name,
    pivot_date,
    template,
    template_preview,
    unit,
    period,
    id,
  ) => {
    setShowAddSMSReminder(false);
    if (!id) {
      await addReminderData.mutateAsync({
        name,
        reminder_type: 'hygiene',
        channel: 'SMS',
        template,
        template_preview,
        period,
        unit,
        pivot_date,
      });
    } else {
      // we are editing a reminder
      await editReminderData.mutateAsync({
        name,
        reminder_type: 'hygiene',
        channel: 'SMS',
        template,
        template_preview,
        period,
        unit,
        pivot_date,
        id,
      });
    }
  };

  const submitTemporaryEmailReminder = (
    reminderName,
    dueDate,
    durationType,
    period,
    modifiedCustomMessage,
    customMessage,
  ) => {
    setEmailReminderData({
      reminderName,
      dueDate,
      durationType,
      period,
      modifiedCustomMessage,
      customMessage,
    });
    setShowAddEmailReminder(false);
    setShowEmailReminderPreview(true);
  };

  const submitNewEmailReminder = async (
    name,
    pivot_date,
    unit,
    period,
    customMessage,
    modifiedCustomMessage,
    id,
  ) => {
    if (!id) {
      await addReminderData.mutateAsync({
        name,
        reminder_type: 'Hygiene',
        channel: 'EMAIL',
        template: modifiedCustomMessage,
        template_preview: customMessage,
        period,
        unit,
        isActive: 1,
        pivot_date,
      });
    } else {
      await editReminderData.mutateAsync({
        name,
        reminder_type: 'Hygiene',
        channel: 'EMAIL',
        template: modifiedCustomMessage,
        template_preview: customMessage,
        period,
        unit,
        pivot_date,
        id,
      });
    }

    setIsEditingEmail(false);
    setShowEmailReminderPreview(false);
  };

  const handleBack = () => {
    setIsEditingEmail(true);
    setShowEmailReminderPreview(false);
    setShowAddEmailReminder(true);
  };

  const handleEmailReminderClose = () => {
    setIsEditingEmail(false);
    setShowAddEmailReminder(false);
    setShowEmailReminderPreview(false);
  };

  const handleDelete = async (id) => {
    await deleteReminderData.mutateAsync(id);
  };

  const handleStatusChange = async (id, enabled) => {
    await editReminderData.mutateAsync({ id, enabled: enabled ? false : true });
  };

  const submitReminder = async (payload) => {
    setShowAddReminder(false);
    if (!payload.id) {
      await addReminderData.mutateAsync(payload);
    } else {
      // we are editing a reminder
      await editReminderData.mutateAsync(payload);
    }
  };
  return (
    <Grid className={styles.root}>
      <div className={styles.titlesContainer}>
        <span className={styles.title}>Hygiene Reminders</span>
        <span className={styles.subtitle}>
          Hygiene reminders will be automatically sent daily at the general
          reminder time. Due dates are set in your practice management software.
        </span>
      </div>

      <div className="my-2 d-flex justify-content-end">
        <Button
          ref={anchorRef}
          onClick={() => setShowAddReminder(true)}
          className={`secondary-btn ${styles.headerButtons}`}
          variant="contained"
          color="secondary"
        >
          Add Reminder
        </Button>
      </div>

      {hygieneReminders.isFetching && <LinearProgress />}

      {hygieneReminders.isSuccess && hygieneReminders?.data[0]?.length > 0 ? (
        <HygieneRemindersTable
          data={hygieneReminders?.data[0]}
          submitSMSReminder={submitSMSReminder}
          submitNewEmailReminder={submitNewEmailReminder}
          handleDelete={handleDelete}
          handleStatusChange={handleStatusChange}
          hygieneReminders={hygieneReminders}
          submitReminder={submitReminder}
        />
      ) : (
        <div className={styles.setupContainer}>
          <NoRemindersIcon />
          <span className={styles.setupText}>
            {`Click "Add Reminder" to set up reminders for hygiene`}
          </span>
        </div>
      )}

      {showAddSMSReminder === true && (
        <AddSMSReminder
          onClose={() => setShowAddSMSReminder(false)}
          submitSMSReminder={submitSMSReminder}
          isEditing={false}
        />
      )}
      {showAddEmailReminder === true && (
        <AddEmailReminder
          onClose={handleEmailReminderClose}
          submitTemporaryEmailReminder={submitTemporaryEmailReminder}
          isEditing={isEditingEmail}
          editingData={emailReminderData}
          isNew={true}
        />
      )}
      {showEmailReminderPreview === true && (
        <EmailReminderPreview
          onClose={() => setShowEmailReminderPreview(false)}
          emailReminderData={emailReminderData}
          submitNewEmailReminder={submitNewEmailReminder}
          handleBack={handleBack}
        />
      )}

      {showAddReminder === true && (
        <AddReminder
          onClose={() => setShowAddReminder(false)}
          submitReminder={submitReminder}
          isEditing={false}
        />
      )}
    </Grid>
  );
});

export default HygieneReminders;
