import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import TimePickerField from 'components/Core/Formik/TimePickerField';
import { useStores } from 'hooks/useStores';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import moment from 'moment';
import { Formik, Form } from 'formik';
import { isEmpty } from 'lodash';
import Skeleton from '@material-ui/lab/Skeleton';
import { Button } from '@material-ui/core';
import * as Yup from 'yup';

// Config keys - DB keys and UI keys mapping
const CONFIG_KEYS = {
  timeToSendGeneralReminders: 'kasper_reminder_global_time_to_send',
};

const initialValues = {
  timeToSendGeneralReminders: moment().set({ hour: 8, minute: 0 }),
};
let validationSchema = Yup.object({
  timeToSendGeneralReminders: Yup.date().required('Enter reminder time'),
});

function stringToTime(time) {
  const [hour, minute] = time.split(':');
  console.log(moment().set({ hour, minute }));
  return moment().set({ hour, minute });
}
const GlobalSettings = () => {
  const { reminders, notification, trigger } = useStores();
  const queryClient = useQueryClient();
  const [formInitialValues, setFormInitialValues] = useState(initialValues);

  // React query to fetch global settings for an office
  const globalSettingsQuery = useQuery(
    ['officeConfigs', 'globalSettings'],
    () => reminders.getOfficeConfigs(Object.values(CONFIG_KEYS).join()),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Set initial values for form fields
  useEffect(() => {
    if (globalSettingsQuery.isSuccess && !isEmpty(globalSettingsQuery.data)) {
      const {
        [CONFIG_KEYS.timeToSendGeneralReminders]: timeToSendGeneralReminders,
      } = globalSettingsQuery.data;
      setFormInitialValues({
        timeToSendGeneralReminders: stringToTime(
          timeToSendGeneralReminders || '08:00',
        ),
      });
    }
  }, [globalSettingsQuery.isSuccess, globalSettingsQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutate global settings
  const updateGlobalSettings = useMutation(
    (configObj) => reminders.updateOfficeConfigs(configObj),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          ['officeConfigs', 'globalSettings'],
          (oldData) => ({
            ...oldData,
            ...variables,
          }),
        );
        notification.showSuccess('Settings updated!');
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Handle submit form
  const handleSubmitForm = async (values, { setSubmitting }) => {
    const configObj = {
      [CONFIG_KEYS.timeToSendGeneralReminders]: moment(
        values.timeToSendGeneralReminders,
      ).format('HH:mm'),
    };
    setSubmitting(true);
    await updateGlobalSettings.mutateAsync(configObj);
    setSubmitting(false);
  };

  return (
    <>
      <Grid className={styles.root}>
        <div>
          <div className={styles.titlesContainer}>
            <span className={styles.title}>Global Settings</span>
            <span className={styles.subtitle}>
              <br />
              <b>Time of day to send reminders</b>
            </span>
            <span className={styles.subtitle1}>
              Applies to the following reminder types:
            </span>
            <span>
              <ul>
                <li>Appointment reminders (except same day reminders)</li>
              </ul>
            </span>
            <Formik
              enableReinitialize={true}
              initialValues={formInitialValues}
              onSubmit={handleSubmitForm}
              validationSchema={validationSchema}
            >
              {({ isSubmitting }) => {
                return (
                  <Form>
                    <span>
                      {globalSettingsQuery.isSuccess ? (
                        <TimePickerField
                          mt={0}
                          fieldLabel="TIME"
                          fieldName="timeToSendGeneralReminders"
                          variant="inline"
                          minutesStep={5}
                          disabled={globalSettingsQuery.isLoading}
                          disableUserInput
                        />
                      ) : (
                        <Skeleton variant="rect" width="100%" height={36} />
                      )}
                    </span>
                    <div className={`${styles.buttonArea} mt-4`}>
                      <Button
                        type="submit"
                        className="secondary-btn"
                        variant="contained"
                        color="secondary"
                        disabled={isSubmitting || globalSettingsQuery.isLoading}
                      >
                        Save
                      </Button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </Grid>
    </>
  );
};

export default GlobalSettings;
