import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Modal from 'components/Core/Modal';
import Grid from '@material-ui/core/Grid';
import 'date-fns';
import * as Yup from 'yup';
import { Formik, Field, Form } from 'formik';
import { CheckboxWithLabel } from 'formik-material-ui';
import moment from 'moment-timezone';

import { useStores } from 'hooks/useStores';
import TimePickerField from 'components/Core/Formik/TimePickerField';
import styles from './index.module.css';
import { convertCurrentTime } from 'helpers/timezone';

const AddTime = () => {
  const history = useHistory();
  const { phoneFaxOptions, notification, authentication } = useStores();
  const { timezone } = authentication.user || {};

  const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

  const days = [
    { id: 1, day: 'Monday' },
    { id: 2, day: 'Tuesday' },
    { id: 3, day: 'Wednesday' },
    { id: 4, day: 'Thursday' },
    { id: 5, day: 'Friday' },
    { id: 6, day: 'Saturday' },
    { id: 7, day: 'Sunday' },
  ];

  let validationSchema = Yup.object({
    fromTime: Yup.date().nullable().required('Enter from time'),
    toTime: Yup.date().nullable().required('Enter to time'),
    Monday: Yup.bool(),
    Tuesday: Yup.bool(),
    Wednesday: Yup.bool(),
    Thursday: Yup.bool(),
    Friday: Yup.bool(),
    Saturday: Yup.bool(),
    Sunday: Yup.bool(),
  });

  validationSchema = validationSchema.test('checkBoxTest', null, (obj) => {
    if (
      obj.Monday ||
      obj.Tuesday ||
      obj.Wednesday ||
      obj.Thursday ||
      obj.Friday ||
      obj.Saturday ||
      obj.Sunday
    ) {
      return true;
    }

    return new Yup.ValidationError(
      'Select at least one day',
      null,
      'checkBoxField',
    );
  });

  validationSchema = validationSchema.test('timeComparison', null, (value) => {
    if (moment(value.fromTime, 'hh:mmA') > moment(value.toTime, 'hh:mmA')) {
      return new Yup.ValidationError('Invalid time range', null, 'toTime');
    }
    if (
      moment(value.fromTime, 'hh:mmA').diff(
        moment(value.toTime, 'hh:mmA'),
        'minutes',
      ) >= 0
    ) {
      return new Yup.ValidationError(
        'From and To time cannot be same',
        null,
        'toTime',
      );
    }

    return true;
  });

  const initialValues = {
    fromTime: convertCurrentTime({ format: TIME_FORMAT }),
    toTime: convertCurrentTime({ shouldFormat: false })
      .add(1, 'hour')
      .format(TIME_FORMAT),
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  };

  // Sunday is given id 0 since moment uses 0 for Sunday
  const handleSubmitForm = (e) => {
    phoneFaxOptions
      .addNewSchedule({
        Sunday: { added: e.Sunday, id: 0 },
        Monday: { added: e.Monday, id: 1 },
        Tuesday: { added: e.Tuesday, id: 2 },
        Wednesday: { added: e.Wednesday, id: 3 },
        Thursday: { added: e.Thursday, id: 4 },
        Friday: { added: e.Friday, id: 5 },
        Saturday: { added: e.Saturday, id: 6 },
        fromTime: moment(e.fromTime).format('HH:mm:ss'),
        toTime: moment(e.toTime).format('HH:mm:ss'),
      })
      .then(() => {
        notification.showSuccess('Schedule was added successfully');
        setTimeout(() => {
          notification.hideNotification();
          handleClose();
        }, 2500);
      })
      .catch((err) => {
        console.error(err);
        notification.showError(err.message);
      });
  };

  const handleClose = () => {
    history.goBack();
  };

  return (
    <Modal
      size="sm"
      header="Add Time"
      body={
        <div className={styles.addPatientContainer}>
          <div className="d-flex flex-column justify-content-center">
            <p className={styles.headingText}> Select Days </p>
            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmitForm}
              validationSchema={validationSchema}
              enableReinitialize
            >
              {({ errors, isSubmitting }) => (
                <Form>
                  <Grid container spacing={1}>
                    {days.map((day) => (
                      <Grid item xs={3} key={day.id}>
                        <Field
                          component={CheckboxWithLabel}
                          type="checkbox"
                          name={day.day}
                          Label={{ label: day.day }}
                          key={day.id}
                        />
                      </Grid>
                    ))}
                    {errors.checkBoxField ? (
                      <p className={styles.error}>{errors.checkBoxField}</p>
                    ) : null}
                  </Grid>
                  <div className="d-flex flex-column justify-content-center">
                    <p className={styles.headingText}> Select Time </p>
                    <p className={styles.subtitle}>
                      (GMT{moment.utc().tz(timezone).format('Z')}) {timezone}
                    </p>
                    <Grid container spacing={2} className="mt-1">
                      <Grid container className={styles.buttonContainer}>
                        <Grid item xs={4}>
                          <TimePickerField
                            mt={0}
                            fieldLabel="FROM TIME"
                            fieldName="fromTime"
                          />
                        </Grid>
                        <Grid item xs={3} />
                        <Grid item xs={4}>
                          <TimePickerField
                            mt={0}
                            fieldLabel="TO TIME"
                            fieldName="toTime"
                          />
                        </Grid>
                        <Grid item xs={1} />
                      </Grid>
                    </Grid>
                  </div>
                  <div className="d-flex justify-content-between">
                    <Button
                      className="primary-btn me-auto"
                      variant="outlined"
                      color="primary"
                      onClick={handleClose}
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
                </Form>
              )}
            </Formik>
          </div>
        </div>
      }
      onClose={handleClose}
    />
  );
};

export default AddTime;
