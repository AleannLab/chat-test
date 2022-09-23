import React, { useState } from 'react';
import styles from './index.module.css';
import Button from '@material-ui/core/Button';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import PasswordInputField from 'components/Core/Formik/PasswordInputField';
import { useStores } from 'hooks/useStores';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CircularProgress from '@material-ui/core/CircularProgress';

const UpdatePassword = () => {
  const { authentication } = useStores();
  const [successMessage, setSuccessMessage] = useState(null);

  const initialValues = {
    current_password: '',
    new_password: '',
    confirm_password: '',
  };

  let validationSchema = Yup.object({
    current_password: Yup.string()
      .trim()
      .min(6, 'Current password cannot be less than 6 characters')
      .required('Please enter current password'),
    new_password: Yup.string()
      .nullable()
      .notOneOf(
        [Yup.ref('current_password')],
        'New password cannot be same as the current password',
      )
      .min(6, 'Password must be at least 6 characters long')
      .required('Please enter new password'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('new_password')], 'Passwords must match.')
      .required('Please confirm password'),
  });

  const handleSubmitForm = ({ authentication }) =>
    async function (val, { setSubmitting, resetForm, setFieldError }) {
      try {
        setSubmitting(true);
        const { current_password: currentPassword, new_password: newPassword } =
          val;
        console.debug({ currentPassword, newPassword });
        await authentication.changePassword({ currentPassword, newPassword });
        resetForm();
        setSuccessMessage('Password was changed.');
      } catch (e) {
        if (e.name.toLowerCase().includes('invalidpassword')) {
          // Throw the error if the conditions for the password are not met
          return setFieldError(
            'confirm_password',
            'A 6 character long password should contain: At least 1 uppercase letter, at least 1 number and at least 1 special character',
          );
        } else if (e.name.toLowerCase().includes('notauthorized')) {
          // Throw the error if all the conditions of a password are met, but the current password is wrong
          return setFieldError(
            'current_password',
            'Entered current password is incorrect',
          );
        }
        return setFieldError('confirm_password', e.message);
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div>
      <div className={styles.formTitle}>Password</div>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmitForm({ authentication })}
        validationSchema={validationSchema}
      >
        {({ isSubmitting, values }) => (
          <Form>
            {isSubmitting ? (
              <div className={styles.successMessage}>
                <CircularProgress
                  style={{ color: '#566F9F', marginRight: '1rem' }}
                  size={14}
                />
                <span>Updating, please wait...</span>
              </div>
            ) : successMessage ? (
              <div className={styles.successMessage}>
                <CheckCircleIcon className={styles.icon} />
                <span>{successMessage}</span>
              </div>
            ) : null}

            <div className="mb-3">
              <PasswordInputField
                fieldLabel="CURRENT PASSWORD"
                fieldName="current_password"
                placeholder="Enter current password"
                hideStrengthBar={true}
                required
              />
            </div>

            <div className="mb-3">
              <PasswordInputField
                fieldLabel="NEW PASSWORD"
                fieldName="new_password"
                placeholder="Enter New Password"
                required
              />
            </div>

            <div className="mb-3">
              <PasswordInputField
                fieldLabel="CONFIRM PASSWORD"
                fieldName="confirm_password"
                placeholder="Confirm Password"
                required
              />
            </div>

            <div className="d-flex mt-4 row no-gutters">
              <Button
                type="submit"
                className="secondary-btn col-6"
                variant="contained"
                color="secondary"
                fullWidth
                disabled={
                  isSubmitting ||
                  !values.current_password.length > 0 ||
                  !values.new_password.length > 0 ||
                  !values.confirm_password.length > 0
                }
              >
                Save New Password
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UpdatePassword;
