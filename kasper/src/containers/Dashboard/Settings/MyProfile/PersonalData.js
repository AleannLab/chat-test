import React, { useMemo, useState } from 'react';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import Button from '@material-ui/core/Button';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextInputField from 'components/Core/Formik/TextInputField';

const EMAIL_REGEX = /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/;

const PersonalData = () => {
  const { authentication, users, notification } = useStores();
  const [successMessage, setSuccessMessage] = useState(null);

  const initialValues = useMemo(() => {
    if (authentication.user) {
      const { username, email, user_id } = authentication.user;
      return {
        user_id,
        username: username,
        email: email,
      };
    } else {
      return {
        user_id: '',
        username: '',
        email: '',
      };
    }
  }, [authentication.user]);

  let validationSchema = Yup.object({
    username: Yup.string().trim().required('Required.'),
    email: Yup.string()
      .trim()
      .required('Required.')
      .test('regex', 'Please enter valid email', (val) =>
        EMAIL_REGEX.test(val),
      ),
  });

  const handleSubmitForm = ({ users, notification }) =>
    async function (val, { setSubmitting, resetForm, setFieldError }) {
      try {
        setSubmitting(true);
        const { username, user_id } = val;
        await users.userUpdate({
          user_id,
          username,
        });
        setSuccessMessage('Profile info updated.');
        authentication.refreshUser();
        window.location.reload();
      } catch (e) {
        notification.showError(e.message);
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div>
      <div className={styles.formTitle}>Personal Data</div>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmitForm({ users, notification })}
        validationSchema={validationSchema}
      >
        {({ isSubmitting, values, initialValues }) => (
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
              <TextInputField
                fieldLabel="Full Name"
                fieldName="username"
                type="text"
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="mb-3">
              <TextInputField
                fieldLabel="Email"
                fieldName="email"
                type="text"
                placeholder="Enter email"
                required
                disabled={true}
              />
            </div>

            <div className="d-flex mt-4">
              <Button
                type="reset"
                className="secondary-btn me-2"
                variant="outlined"
                color="secondary"
                fullWidth
                disabled={
                  isSubmitting || values.username === initialValues.username
                }
              >
                Discard
              </Button>

              <Button
                type="submit"
                className="secondary-btn"
                variant="contained"
                color="secondary"
                fullWidth
                disabled={
                  isSubmitting || values.username === initialValues.username
                }
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PersonalData;
