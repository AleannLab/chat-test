import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import Avatar from 'components/Avatar';
import { Typography, Button } from '@material-ui/core';
import * as Yup from 'yup';
import moment from 'moment';
import { Formik, Form } from 'formik';
import KasperImg from 'assets/images/kasper_default_logo.svg';
import Switch from 'components/Core/Switch';
import { useStores } from 'hooks/useStores';
import { isEmpty } from 'lodash';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import TimePickerField from 'components/Core/Formik/TimePickerField';

// Config keys - DB keys and UI keys mapping
const CONFIG_KEYS = {
  notificationWindowStartTime:
    'kasper_reminder_global_notification_window_start',
  notificationWindowEndTime: 'kasper_reminder_global_notification_window_stop',
  addformlink: 'kasper_reminder_global_notification_add_forms_link',
};

const APPOINTMENT_NOTIFICATION_KEY = 'appointment_notifications';

// Default initial form values
const initialValues = {
  notificationWindowStartTime: moment().set({ hour: 8, minute: 0 }),
  notificationWindowEndTime: moment().set({ hour: 20, minute: 0 }),
  addformlink: false,
};

// Form validation schema
let validationSchema = Yup.object({
  notificationWindowStartTime: Yup.string().required('Start Date is required'),
  notificationWindowEndTime: Yup.string().required('End Date is required'),
});

validationSchema = validationSchema.test('endTime_test', null, (value) => {
  if (
    moment(value.notificationWindowStartTime).isBefore(
      moment(value.notificationWindowEndTime),
    )
  ) {
    return true;
  }

  return new Yup.ValidationError(
    `'To' time must be after 'From' time`,
    null,
    'notificationWindowEndTime',
  );
});

function stringToTime(time) {
  const [hour, minute] = time.split(':');
  console.log(moment().set({ hour, minute }));
  return moment().set({ hour, minute });
}

const NewAppointmentsAndUpdates = () => {
  const [enableSmsEmail, setEnableSmsEmail] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState(initialValues);
  const { reminders, notification, trigger } = useStores();
  const URL = 'https://meetkasper.page.link/{unique ID}';

  // React query to fetch new Appointments for an office
  const notificationQuery = useQuery(
    ['officeConfigs', 'globalSettings'],
    () => reminders.getOfficeConfigs(Object.values(CONFIG_KEYS).join()),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // React query to fetch automation config
  const aptNotificationQuery = useQuery(
    ['automationConfigs', APPOINTMENT_NOTIFICATION_KEY],
    () => trigger.getAutomationConfigByKey(APPOINTMENT_NOTIFICATION_KEY),
    {
      onSuccess: (data) => {
        setEnableSmsEmail(data.enabled === 0 ? false : true);
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Set initial values for form fields
  useEffect(() => {
    if (notificationQuery.isSuccess && !isEmpty(notificationQuery.data)) {
      const {
        [CONFIG_KEYS.notificationWindowStartTime]: notificationWindowStartTime,
        [CONFIG_KEYS.notificationWindowEndTime]: notificationWindowEndTime,
        [CONFIG_KEYS.addformlink]: addformlink,
      } = notificationQuery.data;
      setFormInitialValues({
        notificationWindowStartTime: stringToTime(
          notificationWindowStartTime || '8:00',
        ),
        notificationWindowEndTime: stringToTime(
          notificationWindowEndTime || '20:00',
        ),
        addformlink: addformlink === '1' ? true : false,
      });
    }
  }, [notificationQuery.isSuccess, notificationQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutate new Appointments
  const updateAppointmentSettings = useMutation(
    (configObj) => reminders.updateOfficeConfigs(configObj),
    {
      onSuccess: (data, variables) => {
        notification.showSuccess('Settings updated!');
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Mutate global settings
  const updateAptNotification = useMutation(
    ({ id, configObj }) => trigger.updateAutomationConfigById(id, configObj),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Update toggle Email & Sms notification
  const handleEmailSmsNotificationToggle = (e) => {
    setEnableSmsEmail(e.target.checked);
  };

  // Update toggle add Link To Fill Forms In Sms
  const handleFillFormNotificationToggle = (event) => {
    setFormInitialValues({
      ...formInitialValues,
      addformlink: event.target.checked,
    });
  };

  // Handle submit form
  const handleSubmitForm = async (values, { setSubmitting }) => {
    const configObj = {
      [CONFIG_KEYS.notificationWindowStartTime]: moment(
        values.notificationWindowStartTime,
      ).format('HH:mm'),
      [CONFIG_KEYS.notificationWindowEndTime]: moment(
        values.notificationWindowEndTime,
      ).format('HH:mm'),
      [CONFIG_KEYS.addformlink]: values.addformlink,
    };
    setSubmitting(true);
    await updateAppointmentSettings.mutateAsync(configObj);
    await updateAptNotification.mutateAsync({
      id: aptNotificationQuery.data.id,
      configObj: {
        enabled: enableSmsEmail,
      },
    });
    setSubmitting(false);
  };

  return (
    <>
      <Grid className={styles.root}>
        <div className={styles.header}>
          <div className={styles.titlesContainer}>
            <span className={styles.title}>New Appointments & Updates</span>
            <br />
            <span>
              <div
                className="my-2 d-flex"
                style={{
                  background: '#F0F3F8',
                  padding: '0.5rem',
                  borderRadius: '4px',
                }}
              >
                <InfoOutlinedIcon
                  fontSize="small"
                  htmlColor="#02122F"
                  className="me-2 mt-0.9"
                />
                <Typography variant="body2" color="textPrimary">
                  Notifications for new or updated appointments are sent to
                  patients after a delay (typically 1 hour) in case of potential
                  last minute adjustments.
                </Typography>
              </div>
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
                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ marginTop: '17px' }}
                    >
                      <Typography variant="h4" color="textPrimary">
                        Enable SMS & Email Notifications
                      </Typography>
                      <Switch
                        name="enableSmsEmail"
                        checked={enableSmsEmail}
                        onChange={handleEmailSmsNotificationToggle}
                        disabled={aptNotificationQuery.isFetching}
                      />
                    </div>

                    {enableSmsEmail && (
                      <>
                        <div
                          className="d-flex justify-content-between align-items-center"
                          style={{ marginTop: '17px' }}
                        >
                          <Typography
                            variant="p"
                            color="textPrimary"
                            style={{ fontSize: '1.1rem' }}
                          >
                            Add link to fill out forms in SMS
                          </Typography>
                          <Switch
                            name="aptNotification"
                            checked={formInitialValues.addformlink}
                            onChange={handleFillFormNotificationToggle}
                            disabled={notificationQuery.isFetching}
                          />
                        </div>
                        <Grid
                          item
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '25px',
                          }}
                        >
                          <h6 style={{ color: '#999999', fontSize: '11px' }}>
                            PREVIEW
                          </h6>
                          <div className={styles.messageTextWrapper}>
                            <div className={styles.messageText}>
                              <Typography
                                variant="p"
                                color="textPrimary"
                                style={{ fontSize: '10px', lineHeight: '160%' }}
                              >
                                Appointments have been created or updated at
                                (Your Practice):
                              </Typography>
                              <p
                                style={{
                                  fontSize: '10px',
                                  lineHeight: '160%',
                                  fontWeight: 'bold',
                                }}
                              >
                                Sally: Created for 3/14 @ 3:30pm
                                <br />
                                John: Updated to 4/20 @ 10:00am
                              </p>
                              <p
                                style={{
                                  fontSize: '10px',
                                  lineHeight: '160%',
                                  textDecorationLine:
                                    formInitialValues.addformlink === true
                                      ? 'none'
                                      : 'line-through',
                                  color:
                                    formInitialValues.addformlink === true
                                      ? 'black'
                                      : '#999999',
                                }}
                              >
                                Some forms are incomplete, click here to fill
                                them out: <b>{URL}</b>
                              </p>
                              <p
                                style={{
                                  fontSize: '10px',
                                  lineHeight: '160%',
                                }}
                              >
                                For questions please call us at{' '}
                                <b>800-555-5555</b>
                              </p>
                            </div>
                            <span
                              style={{
                                marginLeft: '5px',
                                marginTop: '110px',
                                height: '42px',
                                width: '42px',
                                borderRadius: '40px',
                                background: '#F0F3F8',
                              }}
                            >
                              <Avatar
                                src={KasperImg}
                                className={styles.Avatar}
                              />
                            </span>
                          </div>
                        </Grid>
                      </>
                    )}

                    <div
                      className="d-flex justify-content-between align-items-center"
                      style={{ marginTop: '17px', marginBottom: '10px' }}
                    >
                      <Typography variant="h4" color="textPrimary">
                        Notification Window
                      </Typography>
                    </div>
                    <Typography
                      style={{
                        color: '#02122F',
                        fontSize: '14px',
                        marginBottom: '4px',
                      }}
                    >
                      Appointments created or updated outside of this window
                      will be delayed until the start time of the notification
                      window. General reminders (such as hygiene, birthday,
                      etc.) will still go out according to global settings.
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        className="d-flex flex-column mt-2"
                      >
                        <TimePickerField
                          mt={0}
                          fieldLabel="FROM"
                          fieldName="notificationWindowStartTime"
                          variant="inline"
                          minutesStep={5}
                          disabled={notificationQuery.isLoading}
                          disableUserInput
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        className="d-flex flex-column mt-2"
                      >
                        <TimePickerField
                          mt={0}
                          fieldLabel="TO"
                          fieldName="notificationWindowEndTime"
                          variant="inline"
                          minutesStep={5}
                          disabled={notificationQuery.isLoading}
                          disableUserInput
                        />
                      </Grid>
                    </Grid>
                    <div className="mt-4" style={{ textAlign: 'right' }}>
                      <Button
                        type="submit"
                        className="secondary-btn"
                        variant="contained"
                        color="secondary"
                        disabled={isSubmitting || notificationQuery.isLoading}
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

export default NewAppointmentsAndUpdates;
