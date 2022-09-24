import React, { useEffect } from 'react';
import { Button, Box, Typography, Paper, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { emailValidation } from 'helpers/validations';
import { useStores } from 'hooks/useStores';
import { useHistory } from 'react-router-dom';
import TextInputField from 'components/Core/Formik/TextInputField';
import HeadComp from '../SEO/HelmetComp';

export default function FormForgotPassword(props) {
  const classes = useStyles();
  const history = useHistory();
  const { authentication, notification } = useStores();

  const initialValues = { email: '' };

  return (
    <>
      <HeadComp title="Forgot Password" />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmitForm({ authentication, notification, history })}
      >
        {({ isSubmitting }) => (
          <Container
            component={Paper}
            maxWidth="sm"
            elevation={1}
            className={classes.root}
          >
            <Typography variant="h2">Forgot your password </Typography>
            <Box pl={4} pr={4}>
              <Typography variant="body1" className={classes.subtitle}>
                Provide your registered email. We will send the Recovery Code to
                reset the password.
              </Typography>
            </Box>
            <Form>
              <TextInputField
                fieldLabel="EMAIL"
                fieldName="email"
                placeholder="Enter Email"
              />
              <Box mt={4} mb={2}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  color="secondary"
                >
                  <Typography>Send Recovery Code</Typography>
                </Button>

                <Link to="/login">
                  <Button
                    fullWidth
                    variant="text"
                    size="large"
                    color="secondary"
                    className="mt-2"
                  >
                    <Typography>Login</Typography>
                  </Button>
                </Link>
              </Box>
            </Form>
          </Container>
        )}
      </Formik>
    </>
  );
}

const validationSchema = Yup.object({
  email: emailValidation,
});

const handleSubmitForm = ({ authentication, history }) =>
  async function (val, { setSubmitting, resetForm, setFieldError }) {
    try {
      setSubmitting(true);
      await authentication.forgotPassword(val);
      history.push('/reset-forgot-password', val);
    } catch (e) {
      console.log('forgotPassword', e);
      return setFieldError('email', e.message);
    } finally {
      setSubmitting(false);
    }
  };

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: '180px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'white',
    padding: theme.spacing(5, 10, 8, 10),
    '& form': {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    '& a': {
      textDecoration: 'none',
      color: theme.palette.secondary.main,
    },
  },
  subtitle: {
    textAlign: 'center',
  },
}));
