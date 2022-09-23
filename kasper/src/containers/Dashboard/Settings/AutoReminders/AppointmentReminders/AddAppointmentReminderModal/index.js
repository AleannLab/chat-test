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
import { useStores } from 'hooks/useStores';
import { useQuery, useQueryClient } from 'react-query';

const reminderTypes = [
  { id: 1, label: 'SMS', value: 'SMS' },
  { id: 2, label: 'Email', value: 'EMAIL' },
  { id: 3, label: 'SMS and Email', value: 'SMS_EMAIL' },
];

const initialValues = {
  channel: 'SMS',
  duration: 3,
};

const validationSchema = Yup.object({
  channel: Yup.string().trim().required('Required'),
  duration: Yup.number()
    .min(1, 'Min 1 day required')
    .max(60, 'Max 60 days')
    .required('Required'),
});

export default function AddAppointmentReminderModal({ onClose }) {
  const { reminders, notification } = useStores();
  const queryClient = useQueryClient();

  const handleSubmitForm = async (values, { setSubmitting }) => {
    setSubmitting(true);
    console.log(values);
    const res = await reminders.addReminderConfig({
      durationType: 'days',
      reminderType: 'appointment_general',
      ...values,
    });
    if (res.success) {
      notification.showSuccess('Added new appointment reminder!');
      queryClient.invalidateQueries('reminderConfigs');
    }
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal
      size="sm"
      header="Add Appointment Reminder"
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
                      fieldLabel="REMINDER TYPE"
                      fieldName="channel"
                      options={reminderTypes.map((item) => (
                        <MenuItem value={item.value} key={item.id}>
                          {item.label}
                        </MenuItem>
                      ))}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextInputField
                      mt={0}
                      fieldLabel="PERIOD"
                      fieldName="duration"
                      type="number"
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={5} className="pt-5">
                    Day(s) before appt.
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
                    Add
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
}
