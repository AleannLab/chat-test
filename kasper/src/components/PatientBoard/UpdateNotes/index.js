import React from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';

import { Grid, Button } from '@material-ui/core';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

import TextAreaField from 'components/Core/Formik/TextAreaField';

const validationSchema = Yup.object({
  notes: Yup.string().trim().required('Required'),
});

const UpdateNotesModal = ({ onSave, onCancel, patientName, note }) => {
  const handleSubmitForm = ({ notes }) => {
    onSave(notes);
  };
  return (
    <Modal
      size="sm"
      header={patientName}
      body={
        <Formik
          initialValues={{ notes: note || '' }}
          onSubmit={handleSubmitForm}
          validationSchema={validationSchema}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className={styles.container}>
                <Grid container spacing={2}>
                  <Grid xs={12} item>
                    <div className={`pb-2 ${styles.subTitle}`}>
                      Appointment notes are synchronized with your EHR. This
                      update may take up to 30 seconds to be reflected.
                    </div>
                  </Grid>
                  <Grid xs={12} className="py-0" item>
                    <TextAreaField
                      disabled={isSubmitting}
                      fieldLabel="NOTES"
                      placeholder="Text here..."
                      fieldName="notes"
                      mt={0}
                      maxLength={250}
                    />
                  </Grid>
                </Grid>
                <div className={styles.footer}>
                  <Button
                    className="primary-btn me-auto"
                    variant="outlined"
                    color="primary"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="secondary-btn"
                    variant="contained"
                    color="secondary"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      }
      footer={null}
      onClose={onCancel}
    />
  );
};

export default UpdateNotesModal;
