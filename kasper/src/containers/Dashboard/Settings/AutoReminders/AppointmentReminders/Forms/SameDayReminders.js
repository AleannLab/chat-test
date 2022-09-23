import React, { useState, useEffect } from 'react';
import { Typography, Grid, Button, MenuItem } from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import TimePickerField from 'components/Core/Formik/TimePickerField';
import SelectField from 'components/Core/Formik/SelectField';
import moment from 'moment';
import { useStores } from 'hooks/useStores';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { isEmpty } from 'lodash';
import EditSMSTemplateModal from '../EditSMSTemplateModal';
import DoneIcon from '@material-ui/icons/Done';
import styles from './index.module.css';
import Skeleton from '@material-ui/lab/Skeleton';

// Config keys - DB keys and UI keys mapping
const CONFIG_KEYS = {
  reminderTime: 'kasper_reminder_same_day_start_time',
  timeBeforeAppointment: 'kasper_reminder_same_day_time_before_appointment',
  smsTemplateForIndividual: 'kasper_reminder_same_day_sms_individual',
  smsTemplateForFamily: 'kasper_reminder_same_day_sms_family',
};

// Default initial form values
const initialValues = {
  reminderTime: moment().set({ hour: 8, minute: 0 }),
  timeBeforeAppointment: 3,
};

// Form validation schema
let validationSchema = Yup.object({
  reminderTime: Yup.date().required('Enter reminder time'),
  timeBeforeAppointment: Yup.number().required(
    'Select time before appointment',
  ),
});

// Generate options for 'How long before appointment?' field
const timeBeforeAppointmentOptions = [...new Array(6)].map((d, i) => ({
  id: i,
  label: `${i + 1} hour${i ? 's' : ''}`,
  value: i + 1,
}));

export default function SameDayReminders() {
  const { reminders, notification } = useStores();
  const queryClient = useQueryClient();
  const [formInitialValues, setFormInitialValues] = useState(initialValues);
  const [showEditSMSTemplateModal, setShowEditSMSTemplateModal] =
    useState(false);
  const [settingsUpdated, setSettingsUpdated] = useState(false);

  // React query to fetch same day reminders configs
  const sameDayRemindersConfigsQuery = useQuery(
    ['officeConfigs', 'sameDayReminders'],
    () => reminders.getOfficeConfigs(Object.values(CONFIG_KEYS).join()),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Set initial values for form fields
  useEffect(() => {
    if (
      sameDayRemindersConfigsQuery.isSuccess &&
      !isEmpty(sameDayRemindersConfigsQuery.data)
    ) {
      const {
        [CONFIG_KEYS.reminderTime]: reminderTime,
        [CONFIG_KEYS.timeBeforeAppointment]: timeBeforeAppointment,
      } = sameDayRemindersConfigsQuery.data;
      const [hour, minute] = reminderTime.split(':');
      setFormInitialValues({
        reminderTime: moment().set({ hour, minute }),
        timeBeforeAppointment,
      });
    }
  }, [
    sameDayRemindersConfigsQuery.isSuccess,
    sameDayRemindersConfigsQuery.data,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutate office configs
  const updateOfficeConfigs = useMutation(
    (configObj) => reminders.updateOfficeConfigs(configObj),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          ['officeConfigs', 'sameDayReminders'],
          (oldData) => ({
            ...oldData,
            ...variables,
          }),
        );
        setSettingsUpdated(true);
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Handle submit form
  const handleSubmitForm = async (values, { setSubmitting }) => {
    const configObj = {
      [CONFIG_KEYS.reminderTime]: moment(values.reminderTime).format('HH:mm'),
      [CONFIG_KEYS.timeBeforeAppointment]: values.timeBeforeAppointment,
    };
    setSubmitting(true);
    await updateOfficeConfigs.mutateAsync(configObj);
    setSubmitting(false);
  };

  return (
    <>
      <Typography component="p">
        If the same day reminder is enabled, it will go out based on the rules
        below. Note that for families, the Same Day reminder will be based on
        the earliest scheduled appointment in the family.
      </Typography>

      <Formik
        enableReinitialize={true}
        initialValues={formInitialValues}
        onSubmit={handleSubmitForm}
        validationSchema={validationSchema}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="my-4">
              <Grid container className="my-4">
                <Grid item xs={12} md={6}>
                  {sameDayRemindersConfigsQuery.isSuccess ? (
                    <TimePickerField
                      mt={0}
                      fieldLabel="EARLIEST TIME TO SEND SAME DAY REMINDERS:"
                      fieldName="reminderTime"
                      variant="inline"
                      minutesStep={5}
                      disabled={sameDayRemindersConfigsQuery.isLoading}
                      disableUserInput
                    />
                  ) : (
                    <Skeleton variant="rect" width="100%" height={36} />
                  )}
                </Grid>
              </Grid>
              <Grid container className="my-4">
                <Grid item xs={12} md={6} className="d-flex align-items-center">
                  <Typography component="p">
                    How long before appointment?
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  {sameDayRemindersConfigsQuery.isSuccess ? (
                    <SelectField
                      mt={0}
                      fieldLabel=""
                      fieldName="timeBeforeAppointment"
                      disabled={
                        isSubmitting || sameDayRemindersConfigsQuery.isLoading
                      }
                      options={timeBeforeAppointmentOptions.map((item) => (
                        <MenuItem value={item.value} key={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    />
                  ) : (
                    <Skeleton variant="rect" width="100%" height={36} />
                  )}
                </Grid>
              </Grid>
            </div>

            <div className="d-flex justify-content-between">
              <Button
                className="primary-btn me-auto"
                variant="outlined"
                color="primary"
                onClick={() => setShowEditSMSTemplateModal(true)}
                disabled={
                  isSubmitting || sameDayRemindersConfigsQuery.isLoading
                }
              >
                Edit SMS Template
              </Button>

              <div className="d-flex align-items-center">
                <div
                  className={`${styles.submittedText} ${
                    settingsUpdated && !isSubmitting ? styles.show : styles.hide
                  }`}
                >
                  <DoneIcon htmlColor="#1ABA17" />
                  <span>Settings updated</span>
                </div>

                <Button
                  type="submit"
                  className="secondary-btn"
                  variant="outlined"
                  color="secondary"
                  disabled={
                    isSubmitting || sameDayRemindersConfigsQuery.isLoading
                  }
                >
                  Update
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {!!showEditSMSTemplateModal && (
        <EditSMSTemplateModal
          onClose={() => setShowEditSMSTemplateModal(false)}
        />
      )}
    </>
  );
}
