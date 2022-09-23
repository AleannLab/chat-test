import React from 'react';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import 'yup-phone';
import { useStores } from 'hooks/useStores';
import TextInputField from 'components/Core/Formik/TextInputField';
import styles from './index.module.css';
import PhoneInputField from 'components/Core/Formik/PhoneInputField';

const AddNumber = ({ onClose }) => {
  const { callForwarding, notification } = useStores();

  const validationSchema = Yup.object({
    name: Yup.string().trim().required('Required'),
    phoneNumber: Yup.string()
      .trim()
      .nullable()
      .required('Required')
      .matches(
        /^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/,
        'Invalid phone number.',
      )
      .phone('US', false, 'Invalid phone number'),
  });

  const handleSubmitForm = async (values, props) => {
    const phoneNumber = `+1${values.phoneNumber.replace(/\D/g, '')}`;
    try {
      await callForwarding.addNumber({
        did: phoneNumber,
        name: values.name,
      });
      props.resetForm();
      notification.showSuccess('The number was added successfully');
    } catch (err) {
      if (err.message.includes('already exists')) {
        notification.showError(
          'This number already exists in the call forwarding list',
        );
      } else {
        notification.showError(
          'An unexpected error occurred while attempting to add the number',
        );
      }
    } finally {
      callForwarding.fetchList();
      props.resetForm();
      onClose();
    }
  };

  const initialValues = {
    name: '',
    phoneNumber: '',
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      size="sm"
      header="Add Number"
      body={
        <div className={styles.container}>
          <p className={styles.subtitle}>Enter a number for call forwarding</p>
          <div className="d-flex flex-column justify-content-center">
            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmitForm}
              validationSchema={validationSchema}
            >
              {({ isSubmitting, errors, handleChange, touched, values }) => (
                <Form>
                  <TextInputField
                    fieldLabel="NAME"
                    fieldName="name"
                    disabled={isSubmitting}
                    type="text"
                    placeholder="Enter name"
                    required
                    maxLength={30}
                  />

                  <PhoneInputField
                    fieldLabel="NUMBER"
                    fieldName="phoneNumber"
                    disabled={isSubmitting}
                    type="text"
                    placeholder="Enter number"
                    required
                    maxLength={14}
                  />

                  <div className="d-flex justify-content-between mt-4">
                    <Button
                      className="primary-btn me-auto"
                      variant="outlined"
                      disabled={isSubmitting}
                      color="primary"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="secondary-btn"
                      variant="contained"
                      disabled={isSubmitting}
                      color="secondary"
                      style={{ width: 'auto' }}
                    >
                      {isSubmitting ? 'Adding Number' : 'Add Number'}
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

export default AddNumber;
