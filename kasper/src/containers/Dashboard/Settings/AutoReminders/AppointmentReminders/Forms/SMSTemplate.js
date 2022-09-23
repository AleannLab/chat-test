import React, { useState, useEffect } from 'react';
import { Button, Grid } from '@material-ui/core';
import MentionInputField from 'components/Core/Formik/MentionInputField';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import styles from './index.module.css';

// Form validation schema
const validationSchema = Yup.object({
  customMessage: Yup.string()
    .test(
      'max-char-length',
      'Maximum 320 characters are allowed',
      (message = '') => message.replace(/[{}]/g, '').length <= 320, // remove braces before calculating the message length
    )
    .required('Required'),
});

export default function SMSTemplate({ message, tags, onSubmit, onClose }) {
  const [messagePreview, setMessagePreview] = useState('');
  const [formInitialValues, setFormInitialValues] = useState({
    customMessage: '',
  });

  // Set initial values for form fields
  useEffect(() => {
    setFormInitialValues({
      customMessage: replaceTagsWithDisplayValues(message),
    });
    setMessagePreview(replaceTagsWithSampleValues(message));
  }, [message]); // eslint-disable-line react-hooks/exhaustive-deps

  // Replace tag ids with corresponding display values
  const replaceTagsWithDisplayValues = (message) => {
    tags.forEach((tag) => {
      if (message.includes(`{{${tag.id}}}`)) {
        message = message.replaceAll(`{{${tag.id}}}`, `{${tag.display}}`);
      }
    });
    return message;
  };

  // Replace tag ids with corresponding sample values
  const replaceTagsWithSampleValues = (message) => {
    tags.forEach((tag) => {
      if (message.includes(`{{${tag.id}}}`)) {
        message = message.replaceAll(`{{${tag.id}}}`, tag.sampleValue);
      }
    });
    return message;
  };

  // Handle form submit event
  const handleSubmitForm = async (values, { setSubmitting }) => {
    let { customMessage } = values;

    // Replace tag display values with corresponding tag ids
    tags.forEach((tag) => {
      if (customMessage.includes(`{${tag.display}}`)) {
        customMessage = customMessage.replaceAll(
          `{${tag.display}}`,
          `{{${tag.id}}}`,
        );
      }
    });
    setSubmitting(true);
    await onSubmit({ message: customMessage });
    setSubmitting(false);
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={formInitialValues}
      onSubmit={handleSubmitForm}
      validationSchema={validationSchema}
    >
      {({ isSubmitting, isValid }) => (
        <Form>
          <div className={styles.container}>
            <Grid container spacing={2} direction="row">
              <Grid item xs={12}>
                <MentionInputField
                  disabled={isSubmitting}
                  fieldLabel="CUSTOMIZE YOUR SMS BELOW"
                  tagLabel="PLACE CURSOR IN DESIRED POSITION AND CLICK FIELD VARIABLE TO ADD"
                  fieldName="customMessage"
                  tags={tags}
                  formattedMessage={(message) =>
                    setMessagePreview(replaceTagsWithSampleValues(message))
                  }
                  maxLength={320}
                  showCharCount
                />
              </Grid>
              <Grid item xs={12}>
                <span className={styles.labelText}>MESSAGE PREVIEW</span>
                <div className={styles.messagePreview}>{messagePreview}</div>
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
                disabled={isSubmitting || !isValid}
              >
                Save
              </Button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
