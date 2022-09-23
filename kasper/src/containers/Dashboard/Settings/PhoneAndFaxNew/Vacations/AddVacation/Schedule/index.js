import React, { useState } from 'react';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import 'date-fns';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';
import moment from 'moment-timezone';
import DatePickerField from 'components/Core/Formik/DatePickerField';
import TimePickerField from 'components/Core/Formik/TimePickerField';
import TextInputField from 'components/Core/Formik/TextInputField';
import styles from './index.module.css';
import { useLocation, useParams } from 'react-router-dom';

const Schedule = ({
  currentlyEditingId,
  doneEditing,
  editingSchedule,
  newSchedule,
  timezone,
  setSelectedTab,
  handleVacationPayload,
  handleClose,
}) => {
  const { Id } = useParams();
  const state = useLocation();

  let initialValues;
  if (Id) {
    const {
      state: { from, greeting, id, label, to },
    } = state;
    initialValues = {
      fromDate: moment.utc(from).tz(timezone).format('MM/DD/YYYY, LT'),
      toDate: moment.utc(to).tz(timezone).format('MM/DD/YYYY, LT'),
      fromTime: moment.utc(from).tz(timezone).format('MM/DD/YYYY, LT'),
      toTime: moment.utc(to).tz(timezone).format('MM/DD/YYYY, LT'),
      vacationName: label,
      greeting: greeting ? greeting : '',
    };
  } else if (newSchedule) {
    initialValues = {
      fromDate: moment(),
      toDate: moment().add(1, 'day'),
      fromTime: moment(),
      toTime: moment().add(1, 'hour'),
      vacationName: '',
      greeting: '',
    };
  }

  let validationSchema = Yup.object({
    fromDate: Yup.date()
      .nullable()
      .typeError('Invalid date format')
      .required('Enter from date'),
    toDate: Yup.date()
      .nullable()
      .typeError('Invalid date format')
      .required('Enter to date'),
    fromTime: Yup.date()
      .nullable()
      .typeError('Invalid time format')
      .required('Enter time'),
    toTime: Yup.date()
      .nullable()
      .typeError('Invalid time format')
      .required('Enter time'),
    // vacationName: Yup.string().trim().required('Enter vacation name'),
  });

  validationSchema = validationSchema.test('toTime_test', null, (value) => {
    if (moment(value.fromDate).isSameOrBefore(value.toDate, 'day')) {
      let customFromDate = moment(value.fromDate).format('MM/DD/YYYY');
      let customToDate = moment(value.toDate).format('MM/DD/YYYY');
      let customFromTime = moment(value.fromTime).format('hh:mmA');
      let customToTime = moment(value.toTime).format('hh:mmA');
      if (
        moment(customFromDate + customFromTime, 'MM/DD/YYYY hh:mmA') <=
        moment(customToDate + customToTime, 'MM/DD/YYYY hh:mmA')
      ) {
        // Should be a difference of at least 1 minute
        if (
          moment(customFromDate + customFromTime, 'MM/DD/YYYY hh:mmA').diff(
            moment(customToDate + customToTime, 'MM/DD/YYYY hh:mmA'),
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
      }
    }
    return new Yup.ValidationError('Invalid time', null, 'toTime');
  });

  validationSchema = validationSchema.test('toDate_test', null, (value) => {
    if (moment(value.fromDate).isSameOrBefore(value.toDate, 'day')) {
      return true;
    }

    return new Yup.ValidationError('Invalid date range', null, 'toDate');
  });

  const handleSubmitForm = (e) => {
    if (e.greeting === '') {
      e.greeting = '';
    }
    if (editingSchedule) {
      const fromDate = moment(e.fromDate).format('MM/DD/YYYY');
      const toDate = moment(e.toDate).format('MM/DD/YYYY');
      const fromTime = moment(e.fromTime).format('hh:mmA');
      const toTime = moment(e.toTime).format('hh:mmA');
      setTimeout(() => {
        doneEditing(
          true,
          {
            from: moment
              .tz(fromDate + fromTime, 'MM/DD/YYYY hh:mmA', timezone)
              .utc(),
            to: moment.tz(toDate + toTime, 'MM/DD/YYYY hh:mmA', timezone).utc(),
          },
          currentlyEditingId,
          e.vacationName,
          e.greeting,
        );
      }, 1000);
    } else if (newSchedule) {
      const fromDate = moment(e.fromDate).format('MM/DD/YYYY');

      const toDate = moment(e.toDate).format('MM/DD/YYYY');

      const fromTime = moment(e.fromTime).format('hh:mmA');

      const toTime = moment(e.toTime).format('hh:mmA');

      handleVacationPayload({
        label: e.vacationName,
        from: moment
          .tz(fromDate + fromTime, 'MM/DD/YYYY hh:mmA', timezone)
          .utc()
          .toISOString(),
        to: moment
          .tz(toDate + toTime, 'MM/DD/YYYY hh:mmA', timezone)
          .utc()
          .toISOString(),
      });
    }

    setSelectedTab('hold-music');
  };

  return (
    <>
      <div className={styles.header}>
        <span className="d-flex align-items-center">Set Schedule</span>
      </div>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmitForm}
        validationSchema={validationSchema}
      >
        {({ isSubmitting }) => (
          <Form>
            <Grid container direction="row">
              <Grid item xs={12} className="mb-3">
                <TextInputField
                  fieldLabel="NAME"
                  fieldName="vacationName"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="Enter vacation name"
                  required
                />
              </Grid>
              {/* <Grid item xs={6} /> */}
              <Grid item className="pe-3 w-50">
                <DatePickerField
                  mt={0}
                  fieldLabel="FROM"
                  fieldName="fromDate"
                />
              </Grid>
              <Grid item className="w-50">
                <TimePickerField
                  mt={0}
                  fieldLabel="TIME"
                  fieldName="fromTime"
                />
              </Grid>
              <Grid item className="pe-3 w-50">
                <DatePickerField mt={0} fieldLabel="TO" fieldName="toDate" />
              </Grid>
              <Grid item className="w-50">
                <TimePickerField mt={0} fieldLabel="TIME" fieldName="toTime" />
              </Grid>
              <Grid item xs={6} />
            </Grid>
            <div className={styles.flexButtons}>
              <Button
                onClick={handleClose}
                className="primary-btn me-2"
                variant="outlined"
                color="primary"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button variant="contained" color="secondary" type="submit">
                Next
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default Schedule;
