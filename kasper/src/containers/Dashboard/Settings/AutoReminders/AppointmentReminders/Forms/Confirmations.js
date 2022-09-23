import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Button,
  MenuItem,
  FormControlLabel,
  OutlinedInput,
  Select,
  ListItemText,
} from '@material-ui/core';
import Checkbox from 'components/Core/Checkbox';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import SelectField from 'components/Core/Formik/SelectField';
import { useStores } from 'hooks/useStores';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { isEmpty } from 'lodash';
import { useFlags } from 'launchdarkly-react-client-sdk';
import DoneIcon from '@material-ui/icons/Done';
import styles from './index.module.css';
import Switch from 'components/Core/Switch';
import { ReactComponent as LongArrowIcon } from 'assets/images/long-arrow.svg';
import Skeleton from '@material-ui/lab/Skeleton';

// Config keys - DB keys and UI keys mapping
const CONFIG_KEYS = {
  confirmedStatus: 'kasper_reminder_confirmation_status_to_set',
  confirmationStatuses: 'kasper_reminder_confirmation_pms_statuses',
  markAsRead: 'kasper_reminder_confirmation_mark_as_read',
  confirmationRequestedStatus: 'kasper_reminder_confirmation_requested_status',
};

// Default initial form values
const initialValues = {
  confirmedStatus: '',
  confirmationStatuses: [],
  markAsRead: true,
  confirmationRequestedStatus: '',
};

// Form validation schema
let validationSchema = Yup.object({
  confirmedStatus: Yup.string().required('Please select the status'),
  markAsRead: Yup.boolean().required('Please set Mark As Read'),
});

export default function Confirmations() {
  const { reminders, notification } = useStores();
  const queryClient = useQueryClient();
  const [formInitialValues, setFormInitialValues] = useState(initialValues);
  const [settingsUpdated, setSettingsUpdated] = useState(false);

  const { confirmationRequestedStatusSetting } = useFlags();

  // React query to fetch open dental statuses
  const openDentalStatusesQuery = useQuery(
    ['officeConfigs', 'openDentalStatuses'],
    () => reminders.getODStatuses(),
    {
      staleTime: Infinity,
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // React query to fetch confirmation configs
  const confirmationsConfigsQuery = useQuery(
    ['officeConfigs', 'confirmations'],
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
      confirmationsConfigsQuery.isSuccess &&
      !isEmpty(confirmationsConfigsQuery.data)
    ) {
      const {
        [CONFIG_KEYS.confirmedStatus]: confirmedStatus,
        [CONFIG_KEYS.confirmationStatuses]: confirmationStatuses,
        [CONFIG_KEYS.markAsRead]: markAsRead,
        [CONFIG_KEYS.confirmationRequestedStatus]: confirmationRequestedStatus,
      } = confirmationsConfigsQuery.data;
      setFormInitialValues({
        confirmedStatus,
        confirmationRequestedStatus,
        confirmationStatuses: confirmationStatuses
          ? confirmationStatuses.split(',').map(Number) // Transform comma separated string into an array
          : [],
        markAsRead: markAsRead === 'true' ? true : false, // KAS-2294: convert boolean to string due to backend incompatibility
      });
    }
  }, [confirmationsConfigsQuery.isSuccess, confirmationsConfigsQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mutate office configs
  const updateOfficeConfigs = useMutation(
    (configObj) => reminders.updateOfficeConfigs(configObj),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          ['officeConfigs', 'confirmations'],
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
      [CONFIG_KEYS.confirmedStatus]: values.confirmedStatus,
      [CONFIG_KEYS.confirmationRequestedStatus]:
        values.confirmationRequestedStatus,
      [CONFIG_KEYS.confirmationStatuses]: values.confirmationStatuses.join(), // Transform array into a comma separated string
      [CONFIG_KEYS.markAsRead]: values.markAsRead ? 'true' : 'false', // KAS-2294: convert boolean to string due to backend incompatibility
    };
    setSubmitting(true);
    await updateOfficeConfigs.mutateAsync(configObj);
    setSubmitting(false);
  };

  return (
    <>
      <Typography component="p">
        Kasper automatically updates appointments in Open Dental when a patient
        confirms an appointment via SMS. <br></br>
        <br></br>
        <b>Intelligent confirmations</b> <br></br> A variety of patient
        responses can confirm an appointment. The following is a partial list of
        responses that can trigger the confirmation:<br></br>
        <br></br>c, confirmed, yes, yeah, be there, coming, agree, okay, si, got
        it, sounds good, sure, 👍,👌
      </Typography>

      <Formik
        enableReinitialize={true}
        initialValues={formInitialValues}
        onSubmit={handleSubmitForm}
        validationSchema={validationSchema}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <div className="my-4">
              <Grid container className="my-4">
                <Grid
                  item
                  xs={12}
                  md={6}
                  className="d-flex align-items-center justify-content-between pe-5"
                >
                  <Typography variant="h3" color="textPrimary">
                    Kasper Status
                  </Typography>
                  <LongArrowIcon />
                </Grid>
                <Grid item xs={12} md={6} className="d-flex align-items-center">
                  <Typography variant="h3" color="textPrimary">
                    Open Dental Status
                  </Typography>
                </Grid>
              </Grid>
              {confirmationRequestedStatusSetting && (
                <Grid container className="my-4">
                  <Grid
                    item
                    xs={12}
                    md={6}
                    className="d-flex align-items-center"
                  >
                    <Typography component="p">
                      Confirmation Requested
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {openDentalStatusesQuery.isSuccess ? (
                      <SelectField
                        mt={0}
                        fieldLabel=""
                        fieldName="confirmationRequestedStatus"
                        disabled={
                          isSubmitting || openDentalStatusesQuery.isLoading
                        }
                        options={[
                          <MenuItem value="" key="none">
                            None
                          </MenuItem>,
                          ...openDentalStatusesQuery.data.map((item) => (
                            <MenuItem value={item.od_def_id} key={item.id}>
                              {item.name}
                            </MenuItem>
                          )),
                        ]}
                      />
                    ) : (
                      <Skeleton variant="rect" width="100%" height={36} />
                    )}
                  </Grid>
                </Grid>
              )}

              <Grid container className="my-4">
                <Grid item xs={12} md={6} className="d-flex align-items-center">
                  <Typography component="p">Confirmed</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  {openDentalStatusesQuery.isSuccess ? (
                    <SelectField
                      mt={0}
                      fieldLabel=""
                      fieldName="confirmedStatus"
                      disabled={
                        isSubmitting || openDentalStatusesQuery.isLoading
                      }
                      options={openDentalStatusesQuery.data.map((item) => (
                        <MenuItem value={item.od_def_id} key={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    />
                  ) : (
                    <Skeleton variant="rect" width="100%" height={36} />
                  )}
                </Grid>
              </Grid>

              <Grid container className="my-4">
                <Grid item xs={12} md={6} className="d-flex flex-column">
                  <Typography component="p">
                    Appointment Confirmation Statuses
                  </Typography>
                  <Typography component="p" className={styles.subText}>
                    Patient’s with any of these statuses will not receive
                    confirmation requests.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  {openDentalStatusesQuery.isSuccess ? (
                    <Select
                      multiple
                      value={values.confirmationStatuses}
                      onChange={(e) =>
                        setFieldValue('confirmationStatuses', e.target.value)
                      }
                      input={<OutlinedInput fullWidth />}
                      renderValue={(selected) =>
                        openDentalStatusesQuery.data
                          .map(
                            (data) =>
                              selected.includes(data.od_def_id) && data.name,
                          )
                          .filter(Boolean)
                          .join(', ')
                      }
                      disabled={
                        isSubmitting || openDentalStatusesQuery.isLoading
                      }
                    >
                      {openDentalStatusesQuery.data.map((item) => (
                        <MenuItem value={item.od_def_id} key={item.id}>
                          <Checkbox
                            checked={
                              values.confirmationStatuses.indexOf(
                                item.od_def_id,
                              ) > -1
                            }
                          />
                          <ListItemText primary={item.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <Skeleton variant="rect" width="100%" height={36} />
                  )}
                </Grid>
              </Grid>

              <Grid container className="my-4">
                <Grid item xs={12} md={10} className="d-flex flex-column">
                  <Typography component="p">Mark As Read</Typography>
                  <Typography component="p" className={styles.subText}>
                    Enable this if you would like the patient’s confirmation
                    response to automatically be marked as read.
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={2}
                  className="d-flex align-items-center justify-content-end"
                >
                  <FormControlLabel
                    onChange={(e) =>
                      setFieldValue('markAsRead', e.target.checked)
                    }
                    checked={values.markAsRead}
                    control={
                      <Switch
                        disabled={
                          isSubmitting || openDentalStatusesQuery.isLoading
                        }
                      />
                    }
                  />
                </Grid>
              </Grid>
            </div>

            <div className="d-flex justify-content-end">
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
                  disabled={isSubmitting || openDentalStatusesQuery.isLoading}
                >
                  Update
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}
