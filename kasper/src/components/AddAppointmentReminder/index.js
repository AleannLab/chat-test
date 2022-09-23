import React from 'react';
import Button from '@material-ui/core/Button';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';

import SelectField from 'components/Core/Formik/SelectField';
import TextInputField from 'components/Core/Formik/TextInputField';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';

const AddAppointmentReminder = ({
  isEditing,
  onClose,
  editingData,
  submitAppointmentReminder,
}) => {
  const notificationTypes = [
    { id: 1, label: 'SMS', value: 'SMS' },
    { id: 2, label: 'Email', value: 'EMAIL' },
    { id: 2, label: 'SMS and Email', value: 'SMS_EMAIL' },
  ];

  const periodOptions = [
    { id: 1, label: 'Minute(s)', value: 'minutes' },
    { id: 2, label: 'Hour(s)', value: 'hours' },
    { id: 3, label: 'Day(s)', value: 'days' },
    { id: 4, label: 'Week(s)', value: 'weeks' },
    // { id: 5, label: 'Month(s)', value: 'months' },
  ];

  let initialValues;
  if (isEditing) {
    initialValues = {
      notificationType: editingData.notificationType.toUpperCase(),
      time: editingData.time,
      durationType: editingData.durationType,
    };
  } else {
    initialValues = {
      notificationType: 'SMS',
      time: 30,
      durationType: 'minutes',
    };
  }

  const validationSchema = Yup.object({
    notificationType: Yup.string().trim().required('Required'),
    time: Yup.number()
      .min(1, 'Time should be greater than 0')
      .required('Required'),
    durationType: Yup.string().required('Required'),
  });

  const handleSubmitForm = (values) => {
    const { notificationType, time, durationType } = values;
    if (isEditing) {
      submitAppointmentReminder(
        notificationType,
        time,
        durationType,
        editingData.id,
      );
    } else {
      submitAppointmentReminder(notificationType, time, durationType);
    }
  };

  return (
    <Modal
      size="sm"
      header={`${isEditing ? 'Edit' : 'Add'} Appointment Reminder`}
      body={
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmitForm}
          validationSchema={validationSchema}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className={styles.container}>
                <Grid container spacing={2} direction="row">
                  <Grid item xs={5}>
                    <SelectField
                      disabled={isSubmitting}
                      mt={0}
                      fieldLabel="NOTIFICATION TYPE"
                      fieldName="notificationType"
                      options={notificationTypes.map((item) => (
                        <MenuItem value={item.value} key={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextInputField
                      mt={0}
                      fieldLabel="TIME"
                      fieldName="time"
                      type="number"
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <SelectField
                      disabled={isSubmitting}
                      mt={3}
                      fieldLabel=""
                      fieldName="durationType"
                      options={periodOptions.map((item) => (
                        <MenuItem value={item.value} key={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    />
                  </Grid>
                </Grid>
                <div className={styles.footer}>
                  <Button
                    className="primary-btn me-auto"
                    variant="outlined"
                    color="primary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="secondary-btn"
                    variant="contained"
                    color="secondary"
                    disabled={isSubmitting}
                  >
                    {isEditing ? 'Save' : 'Add'}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      }
      onClose={onClose}
    />
  );
};

export default AddAppointmentReminder;
