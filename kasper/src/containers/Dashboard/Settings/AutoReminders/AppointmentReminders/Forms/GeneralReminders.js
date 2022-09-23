import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Button,
  MenuItem,
  OutlinedInput,
  ListItemText,
  Select,
  FormControl,
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import SelectField from 'components/Core/Formik/SelectField';
import { useStores } from 'hooks/useStores';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { isEmpty } from 'lodash';
import EditReminderSMSTemplateModal from '../EditReminderSMSTemplateModal';
import DoneIcon from '@material-ui/icons/Done';
import styles from './index.module.css';
import Skeleton from '@material-ui/lab/Skeleton';
import CustomTooltip from 'components/Core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Checkbox from 'components/Core/Checkbox';

// Config keys - DB keys and UI keys mapping
const CONFIG_KEYS = {
  daysBeforeNextAppointment: 'kasper_reminder_general_skip',
  smsTemplateForIndividual: 'kasper_reminder_general_sms_individual',
  smsTemplateForFamily: 'kasper_reminder_general_sms_family',
  checkedStatusGeneralRestrictedOps: 'kasper_reminder_general_restricted_ops',
};

// Default initial form values
const initialValues = {
  daysBeforeNextAppointment: 2,
  checkedStatusGeneralRestrictedOps: [],
};

// Form validation schema
let validationSchema = Yup.object({
  daysBeforeNextAppointment: Yup.number().required(
    'Select time before appointment',
  ),
});

// Generate options for time before next appointment
const daysBeforeNextAppointmentOptions = [...new Array(6)].map((d, i) => ({
  id: i,
  label: `${i + 1} day${i ? 's' : ''} before next reminder`,
  value: i + 1,
}));

export default function GeneralReminders() {
  const { reminders, notification } = useStores();
  const queryClient = useQueryClient();
  const [formInitialValues, setFormInitialValues] = useState(initialValues);
  const [
    showEditReminderSMSTemplateModal,
    setShowEditReminderSMSTemplateModal,
  ] = useState(false);
  const [settingsUpdated, setSettingsUpdated] = useState(false);

  const [operatories, setOperatories] = useState([]);
  const { onlineScheduleSettings } = useStores();
  const fetchOperatoriesQuery = useQuery(
    'fetchOperatories',
    () => onlineScheduleSettings.fetchOperatories(),
    {
      onSuccess: (data) => {
        setOperatories(data);
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // React query to fetch same day reminders configs
  const remindersConfigsQuery = useQuery(
    ['officeConfigs', 'generalReminders'],
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
      remindersConfigsQuery.isSuccess &&
      !isEmpty(remindersConfigsQuery.data)
    ) {
      const {
        [CONFIG_KEYS.daysBeforeNextAppointment]: daysBeforeNextAppointment,
        [CONFIG_KEYS.checkedStatusGeneralRestrictedOps]:
          checkedStatusGeneralRestrictedOps,
      } = remindersConfigsQuery.data;
      if (
        remindersConfigsQuery.isSuccess &&
        !isEmpty(remindersConfigsQuery.data)
      ) {
        setFormInitialValues({
          daysBeforeNextAppointment,
          checkedStatusGeneralRestrictedOps:
            checkedStatusGeneralRestrictedOps
              ?.split(',')
              .filter((x) => x !== '')
              .map((x) => Number(x)) || [],
        });
      }
    }
  }, [remindersConfigsQuery.isSuccess, remindersConfigsQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutate office configs
  const updateOfficeConfigs = useMutation(
    (configObj) => reminders.updateOfficeConfigs(configObj),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          ['officeConfigs', 'generalReminders'],
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
      [CONFIG_KEYS.daysBeforeNextAppointment]: values.daysBeforeNextAppointment,
      [CONFIG_KEYS.checkedStatusGeneralRestrictedOps]:
        values.checkedStatusGeneralRestrictedOps.join(), // Transform array into a comma separated string
    };

    setSubmitting(true);
    await updateOfficeConfigs.mutateAsync(configObj);
    setSubmitting(false);
  };

  return (
    <>
      <Typography component="p">
        General reminders are sent daily to patients based on the settings
        below.
      </Typography>

      <Formik
        enableReinitialize={true}
        initialValues={formInitialValues}
        onSubmit={handleSubmitForm}
        validationSchema={validationSchema}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="d-flex flex-column items-center justify-center">
            <Grid
              container
              spacing={0}
              direction="row"
              alignItems="center"
              justifyContent="center"
              className="mb-1 mt-4 pt-1"
            >
              <Grid xs={12} md={6}>
                <Typography component="p">
                  Exclude appointments in OP
                  <CustomTooltip
                    title={
                      <div className="d-flex flex-column">
                        <Typography component="p">
                          Patient’s scheduled in these Operatories will not
                          receive a reminder for their appointments.
                        </Typography>
                      </div>
                    }
                    color="#000"
                    placement="top-start"
                    arrow
                    maxWidth={270}
                  >
                    <HelpOutlineIcon
                      style={{ fontSize: '1rem', marginLeft: '0.25rem' }}
                      htmlColor="#9A9A9A"
                    />
                  </CustomTooltip>
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                {fetchOperatoriesQuery.isSuccess ? (
                  <FormControl fullWidth>
                    <Select
                      mt={0}
                      multiple
                      value={values.checkedStatusGeneralRestrictedOps}
                      onChange={(e) => {
                        setFieldValue(
                          'checkedStatusGeneralRestrictedOps',
                          e.target.value,
                        );
                      }}
                      input={<OutlinedInput fullWidth />}
                      renderValue={(selected) =>
                        fetchOperatoriesQuery.data
                          .map(
                            (data) =>
                              selected.includes(data.id) && data.op_name,
                          )
                          .filter(Boolean)
                          .join(', ')
                      }
                      disabled={isSubmitting || fetchOperatoriesQuery.isLoading}
                    >
                      {operatories.map((item) => (
                        <MenuItem value={item.id} key={item.id}>
                          <Checkbox
                            checked={
                              values.checkedStatusGeneralRestrictedOps.indexOf(
                                item.id,
                              ) > -1
                            }
                          />
                          <ListItemText primary={item.op_name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Skeleton variant="react" width="100%" height={36} />
                )}
              </Grid>
            </Grid>

            <Grid container className="mb-4 pb-2">
              <Grid item xs={12} md={6} className="d-flex flex-column">
                <Typography component="p">
                  Skip upcoming reminder
                  <CustomTooltip
                    title={
                      <div className="d-flex flex-column">
                        <Typography component="p">
                          Eg. if you set the value to “<b>2 days before...</b>”,
                          then any appointments created today will <b>not</b>{' '}
                          receive any reminder messages for 2 days. Patients
                          will start receiving reminders again after the 2 days.
                        </Typography>
                        <Typography component="p" className="mt-3">
                          <b>Note:</b> New appointment message would still be
                          sent.
                        </Typography>
                      </div>
                    }
                    color="#000"
                    placement="top-start"
                    arrow
                    maxWidth={270}
                  >
                    <HelpOutlineIcon
                      style={{ fontSize: '1rem', marginLeft: '0.25rem' }}
                      htmlColor="#9A9A9A"
                    />
                  </CustomTooltip>
                </Typography>
                <Typography component="p" className={styles.subText}>
                  If appointment is created...
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                {remindersConfigsQuery.isSuccess ? (
                  <SelectField
                    mt={0}
                    fieldLabel=""
                    fieldName="daysBeforeNextAppointment"
                    disabled={isSubmitting || remindersConfigsQuery.isLoading}
                    options={daysBeforeNextAppointmentOptions.map((item) => (
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

            <div className="d-flex justify-content-between">
              <Button
                className="primary-btn me-auto"
                variant="outlined"
                color="primary"
                onClick={() => setShowEditReminderSMSTemplateModal(true)}
                disabled={isSubmitting || remindersConfigsQuery.isLoading}
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
                  disabled={isSubmitting || remindersConfigsQuery.isLoading}
                >
                  Update
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {!!showEditReminderSMSTemplateModal && (
        <EditReminderSMSTemplateModal
          onClose={() => setShowEditReminderSMSTemplateModal(false)}
        />
      )}
    </>
  );
}
