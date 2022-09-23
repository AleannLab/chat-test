import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import MentionInputField from 'components/Core/Formik/MentionInputField';
import SelectField from 'components/Core/Formik/SelectField';
import TextInputField from 'components/Core/Formik/TextInputField';
import Modal from 'components/Core/Modal';
import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import styles from './index.module.css';

const AddSMSReminder = ({
  isEditing,
  submitSMSReminder,
  onClose,
  editingData,
}) => {
  const [messagePreview, setMessagePreview] = useState('');
  const [template, setTemplate] = useState('');
  const [templatePreview, setTemplatePreview] = useState('');

  const dateOptions = [
    { id: 1, label: 'Before Due Date', value: 'before' },
    { id: 2, label: 'After Due Date', value: 'after' },
  ];

  const periodOptions = [
    { id: 1, label: 'Day(s)', value: 'day' },
    { id: 2, label: 'Week(s)', value: 'week' },
    { id: 3, label: 'Month(s)', value: 'month' },
  ];

  const tags = [
    { id: 'firstName', display: 'First Name' },
    { id: 'lastName', display: 'Last Name' },
    { id: 'preferredName', display: 'Preferred Name' },
    { id: 'practicePhone', display: 'Practice Phone' },
    { id: 'dateTime', display: 'Date & Time' },
    { id: 'month', display: 'Month' },
    { id: 'day', display: 'Day' },
    { id: 'dayOfMonth', display: 'Day of Month' },
    { id: 'time', display: 'Time' },
  ];

  const defaultValues = [
    { id: '{{firstName}}', value: 'John' },
    { id: '{{lastName}}', value: 'Doe' },
    { id: '{{preferredName}}', value: 'JD' },
    { id: '{{practicePhone}}', value: '+987654320' },
    { id: '{{dateTime}}', value: '10/10/2022 & 10:30AM' },
    { id: '{{month}}', value: 'April' },
    { id: '{{day}}', value: 'Monday' },
    { id: '{{dayOfMonth}}', value: '9' },
    { id: '{{time}}', value: '11.50PM' },
  ];

  const formattedMessage = (message) => {
    setTemplate(message);
    defaultValues.forEach((d) => {
      if (message.includes(d.id)) {
        message = message.replaceAll(d.id, d.value);
      }
    });
    setMessagePreview(message);
  };

  useEffect(() => {
    if (isEditing) {
      formattedMessage(editingData.modifiedCustomMessage);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  let initialValues;
  if (isEditing) {
    initialValues = {
      reminderName: editingData.reminderName,
      dueDate: editingData.dueDate,
      durationType: editingData.durationType,
      period: editingData.period,
      customMessage: editingData.customMessage,
    };
  } else {
    initialValues = {
      reminderName: '',
      dueDate: 'before',
      durationType: 'day',
      period: 2,
      customMessage: '',
    };
  }

  const validationSchema = Yup.object({
    reminderName: Yup.string().trim().required('Required'),
    dueDate: Yup.string().required('Required'),
    durationType: Yup.string().required('Required'),
    period: Yup.number()
      .min(1, 'Period should be greater than 0')
      .required('Required'),
    customMessage: Yup.string().trim().required('Required'),
  });

  const handleSubmitForm = (values) => {
    const { reminderName, dueDate, durationType, period } = values;
    if (isEditing) {
      submitSMSReminder(
        reminderName,
        dueDate,
        durationType,
        period,
        template,
        templatePreview,
        editingData.id,
      );
    } else {
      submitSMSReminder(
        reminderName,
        dueDate,
        durationType,
        period,
        template,
        templatePreview,
      );
    }
  };

  return (
    <Modal
      size="sm"
      header="Add SMS Reminder"
      body={
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmitForm}
          validationSchema={validationSchema}
        >
          {({ isSubmitting, values }) => (
            <Form>
              <div className={styles.container}>
                <Grid container spacing={2} direction="row">
                  <Grid item xs={12}>
                    <TextInputField
                      fieldLabel="REMINDER NAME"
                      fieldName="reminderName"
                      type="text"
                      required
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <SelectField
                      mt={0}
                      disabled={isSubmitting}
                      fieldLabel="DATE"
                      fieldName="dueDate"
                      options={dateOptions.map((item) => (
                        <MenuItem value={item.value} key={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextInputField
                      mt={0}
                      fieldLabel="PERIOD"
                      fieldName="period"
                      type="number"
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <SelectField
                      disabled={isSubmitting}
                      mt={3}
                      fieldName="durationType"
                      options={periodOptions.map((item) => (
                        <MenuItem value={item.value} key={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MentionInputField
                      disabled={isSubmitting}
                      fieldLabel="CUSTOMIZE YOUR SMS BELOW"
                      tagLabel="PLACE CURSOR IN DESIRED POSITION AND CLICK FIELD VARIABLE TO ADD"
                      fieldName="customMessage"
                      tags={tags}
                      formattedMessage={formattedMessage}
                      setTemplatePreview={setTemplatePreview}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <span className={styles.labelText}>MESSAGE PREVIEW</span>
                    <div className={styles.messagePreview}>
                      {messagePreview}
                    </div>
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

export default AddSMSReminder;
