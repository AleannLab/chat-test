import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import * as Yup from 'yup';
import { useStores } from 'hooks/useStores';
import Modal from 'components/Core/Modal';
import { Form, Formik } from 'formik';
import styles from './index.module.css';
import TextInputField from 'components/Core/Formik/TextInputField';

const AddHardwarePhone = () => {
  const { hardwarePhone, notification } = useStores();
  const history = useHistory();

  const initialValues = {
    label_name: '',
  };

  let validationSchema = Yup.object({
    label_name: Yup.string().trim().required('Label is required'),
  });

  const handleClose = () => {
    history.goBack();
  };

  const handleSubmitForm = async (e, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      await hardwarePhone.addHardwarePhone(e.label_name);
      resetForm();
      notification.showSuccess('Hardware phone was added successfully.');
      setTimeout(() => {
        notification.hideNotification();
      }, 2500);
    } catch (ex) {
      notification.showError(
        'An unexpected error occurred while attempting to add hardware phone',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      size="sm"
      header="Add Hardware Phone"
      body={
        <div className={styles.root}>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmitForm}
            validationSchema={validationSchema}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <TextInputField
                    fieldLabel="Label (For Display Purposes)"
                    fieldName="label_name"
                    type="text"
                    placeholder="Enter phone name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="d-flex justify-content-center mt-5">
                  <Button
                    type="submit"
                    className="secondary-btn"
                    variant="contained"
                    color="secondary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      }
      onClose={handleClose}
    />
  );
};

export default AddHardwarePhone;
