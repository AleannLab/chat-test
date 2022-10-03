import React from 'react';
import { Button, Box, Typography, Paper, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useStores } from 'hooks/useStores';
import { useHistory } from 'react-router-dom';
import TextInputField from 'components/Core/Formik/TextInputField';
import PasswordInputField from 'components/Core/Formik/PasswordInputField';
import HeadComp from '../SEO/HelmetComp';

export default function FormResetForgotPassword(props) {
  const classes = useStyles();
  const history = useHistory();
  const { authentication, notification } = useStores();

  const email = history.location.state ? history.location.state.email : null;

  const initialValues = {
    email: email,
    code: '',
    password: '',
    confPassword: '',
  };

  if (!email) {
    history.push('/forgot-password');
  }

  return (
    <>
      <HeadComp title="Reset Password" />
      <Formik
        initialValues={initialValues}
        validateOnChange={false}
        validateOnBlur={false}
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
            <Typography variant="h2">Reset Password</Typography>
            <Box pl={8} pr={8}>
              <Typography variant="body1" className={classes.subtitle}>
                Please enter the recovery code &amp; set new password.
              </Typography>
            </Box>
            <Form>
              <TextInputField
                fieldLabel="RECOVERY CODE"
                fieldName="code"
                placeholder="Enter Recovery Code"
                required
              />
              <PasswordInputField
                fieldLabel="NEW PASSWORD"
                fieldName="password"
                placeholder="Enter New Password"
                required
              />
              <PasswordInputField
                fieldLabel="CONFIRM NEW PASSWORD"
                fieldName="confPassword"
                placeholder="Enter Your Password Again"
                required
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
                  <Typography>Reset Password</Typography>
                </Button>
              </Box>
            </Form>
            {/* <Box mt={2}>
            <Link to="/login">
              <Typography variant="caption" color="secondary">
                Login
            </Typography>
            </Link>
          </Box> */}
          </Container>
        )}
      </Formik>
    </>
  );
}

const PASSWORD_REGEX = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const validationSchema = Yup.object({
  code: Yup.number().nullable().required('Required.'),
  password: Yup.string()
    .nullable()
    .required('Required.')
    .min(8, 'Password must be at least 8 characters long.')
    .test(
      'regex',
      'Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character',
      (val) => PASSWORD_REGEX.test(val),
    ),
  confPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match.')
    .required('Required.'),
});

const handleSubmitForm = ({ authentication, history }) =>
  async function (val, { setSubmitting, resetForm, setFieldError, setErrors }) {
    try {
      setSubmitting(true);
      await authentication.forgotPasswordConfirm(val);
      history.push('/login');
    } catch (e) {
      console.log(e);
      if (
        e.code == 'InvalidPasswordException' ||
        e.code == 'InvalidParameterException'
      ) {
        return setErrors({
          password:
            'Password must include Uppercase & Lowecase letters, Numbers & Special Characters. It also must be at least 8 characters long.',
          confPassword: ' ',
        });
      } else if (e.code == 'LimitExceededException') {
        return setErrors({
          code: 'You have exceeded the maximum number of attempts. Please try again after 5 minutes.',
          password: ' ',
          confPassword: ' ',
        });
      } else if (e.code == 'CodeMismatchException') {
        return setErrors({
          code: 'Invalid verification code provided. Please try again or try requesting a new code.',
          password: ' ',
          confPassword: ' ',
        });
      }
      return setFieldError('code', e.message);
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
