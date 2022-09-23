import React, { useState } from 'react';
import styles from './index.module.css';
import { Button, Paper, Container } from '@material-ui/core';
import AppBrandHeader from 'components/AppHeader';
import OuterLayout from 'layouts/LayoutOuter';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import { ReactComponent as UploadIcon } from 'assets/images/download.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { useLocation } from 'react-router-dom';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import axios from 'axios';
import TextInputField from 'components/Core/Formik/TextInputField';
import PasswordInputField from 'components/Core/Formik/PasswordInputField';
import HeadComp from 'components/SEO/HelmetComp';

const PASSWORD_REGEX = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

/**
 * Form validation schema
 */
const validationSchema = Yup.object({
  firstname: Yup.string().trim().required('Please enter your First name'),
  lastname: Yup.string().trim().required('Please enter your Last name'),
  password: Yup.string()
    .trim()
    .required('')
    .test('regex', 'Please enter valid password', (val) =>
      PASSWORD_REGEX.test(val),
    ),
  confirmPassword: Yup.string()
    .trim()
    .required('')
    .test('regex', 'Please enter valid password', (val) =>
      PASSWORD_REGEX.test(val),
    ),
});

/**
 * Component definition
 */
const CompleteRegistration = observer(() => {
  const { users, authentication, notification } = useStores();
  const location = useLocation();

  const initialValues = {
    firstname: '',
    lastname: '',
    password: '',
    confirmPassword: '',
  };
  const [avatarImgSrc, setAvatarImgSrc] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  const handleSubmitForm = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);
      const currentState = location.state;
      const user_id = currentState.email;
      const username = `${values.firstname} ${values.lastname}`;
      const newPassword = values.password;
      const oldPassword = currentState.password; //to check
      await authentication.forcePasswordChange({
        email: user_id,
        newPassword,
        oldPassword,
      });
      await authentication.login({ email: user_id, password: newPassword });
      await users.userRegistration({
        user_id,
        username,
        oldPassword,
        newPassword,
      });
      if (imgData) {
        const response = await users.userImageUpload(
          imgData,
          username,
          authentication.user.user_id,
        );
        if (response.url) {
          await axios({
            method: 'PUT',
            url: response.url,
            headers: {
              'content-type': imgData.type,
            },
            processData: false,
            data: imgData,
          });
          await users.downloadUserImage(response.uuid);
        }
      }
      /**
       * Refreshing the page instead of client side routing to reset state from previous session
       */
      window.location.pathname = '/';
      notification.showSuccess('Successfully completed registration');
      setTimeout(() => {
        notification.hideNotification();
      }, 2500);
      await authentication.refreshUser();
    } catch (e) {
      notification.showError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile.size < 1024 * 1024) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setAvatarImgSrc(objectUrl);
      setImgData(selectedFile);

      setShowNotification(false);
    } else {
      setShowNotification(true);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarImgSrc(null);
  };

  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowNotification(false);
  };

  return (
    <>
      <HeadComp title="New Account Registration" />
      <div className={styles.rootContainer}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmitForm}
        >
          {({ isSubmitting }) => (
            <Container
              component={Paper}
              maxWidth="xs"
              elevation={1}
              className={styles.root}
            >
              <div className={styles.header}>Complete registration</div>

              <Grid container xs={12} className="py-2">
                <Grid container xs={2} alignItems="center" className="me-4">
                  <Avatar
                    alt="Profile image"
                    src={avatarImgSrc}
                    style={{ width: 60, height: 60 }}
                  />
                </Grid>
                <Grid
                  container
                  xs={9}
                  direction="column"
                  alignItems="flex-start"
                  justify="center"
                >
                  <div>
                    <input
                      className={styles.hidden}
                      id="avatar_uploader"
                      type="file"
                      onChange={handleAvatarChange}
                      accept=".jpg, .png"
                    />
                    <label htmlFor="avatar_uploader">
                      <Button
                        component="span"
                        className={styles.avatarButton}
                        disabled={isSubmitting}
                        startIcon={
                          <UploadIcon className={styles.avatarButtonIcon} />
                        }
                      >
                        Upload Photo
                      </Button>
                    </label>
                  </div>
                  <Button
                    className={styles.avatarButton}
                    disabled={isSubmitting}
                    startIcon={
                      <DeleteIcon className={styles.avatarButtonIcon} />
                    }
                    onClick={handleDeleteAvatar}
                  >
                    Delete
                  </Button>
                </Grid>
              </Grid>

              <Form>
                <div>
                  <TextInputField
                    fieldLabel="FIRST NAME"
                    fieldName="firstname"
                    type="text"
                    placeholder="Enter first name"
                    required
                    disabled={isSubmitting}
                    mt={2}
                  />
                </div>

                <div>
                  <TextInputField
                    fieldLabel="LAST NAME"
                    fieldName="lastname"
                    type="text"
                    placeholder="Enter last name"
                    required
                    disabled={isSubmitting}
                    mt={2}
                  />
                </div>

                <div className={styles.infoText}>
                  Your <b>password must have</b> 8 or more characters, upper and
                  lower letters, at last one number and one special case
                  character.
                </div>

                <div>
                  <PasswordInputField
                    fieldLabel="PASSWORD"
                    fieldName="password"
                    placeholder="Enter password"
                    required
                    disabled={isSubmitting}
                    mt={2}
                  />
                </div>

                <div>
                  <PasswordInputField
                    fieldLabel="CONFIRM PASSWORD"
                    fieldName="confirmPassword"
                    placeholder="Re-enter password"
                    required
                    disabled={isSubmitting}
                    mt={2}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  fullWidth
                  variant="contained"
                  size="large"
                  color="secondary"
                  className="mt-3"
                >
                  {isSubmitting ? `Loading...` : `Complete Registration`}
                </Button>
              </Form>
            </Container>
          )}
        </Formik>

        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={showNotification}
          onClose={handleNotificationClose}
          autoHideDuration={5000}
        >
          <MuiAlert elevation={6} variant="filled" severity="warning">
            Please upload image of size less than 1MB
          </MuiAlert>
        </Snackbar>
      </div>
    </>
  );
});

export default function CompleteRegistrationWrapper() {
  return <OuterLayout Content={CompleteRegistration} Header={AppBrandHeader} />;
}
