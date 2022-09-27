import React from 'react';
import { Button, Box, Typography, Paper, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
// import { Link } from "react-router-dom";
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
// import { TextField } from 'formik-material-ui';
// import { emailValidation } from '../helpers/validations';
import TextInputField from 'components/Core/Formik/TextInputField';

export default function FormChangePassword(props) {
  const classes = useStyles();
  const initialValues = {
    email: '',
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={() => {}}
    >
      <Container
        component={Paper}
        maxWidth="sm"
        elevation={1}
        className={classes.root}
      >
        <Typography variant="h2">Change your password </Typography>
        <Box pl={8} pr={8}>
          <Typography variant="body1" className={classes.subtitle}>
            Your password must have 8 or more characters, upper and lower
            letters, at last one number.{' '}
          </Typography>
        </Box>
        <Form>
          <TextInputField
            fieldLabel="PASSWORD"
            fieldName="password"
            type="password"
            placeholder="Enter Password"
            required
          />
          <TextInputField
            fieldLabel="CONFIRM PASSWORD"
            fieldName="confPassword"
            type="password"
            placeholder="Enter Confirm Password"
            required
          />

          {/* <Box mt={3} mb={1}>
            <Typography className="space-top space-bottom" variant="caption">
              PASSWORD
            </Typography>
          </Box>
          <Field
            component={TextField}
            id="email"
            name="email"
            required
            placeholder="Enter Email"
            autoComplete="email"
            variant="outlined"
            fullWidth
            size="small"
          /> */}
          {/* <Box mt={3} mb={1}>
            <Typography className="space-top space-bottom" variant="caption">
              CONFIRM PASSWORD
            </Typography>
          </Box>
          <Field
            component={TextField}
            id="email"
            name="email"
            required
            placeholder="Enter Email"
            autoComplete="email"
            variant="outlined"
            fullWidth
            size="small"
          /> */}
          <Box mt={4} mb={2}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              color="secondary"
            >
              <Typography>Change Password</Typography>
            </Button>
          </Box>
        </Form>
        {/* <Box mt={2}>
          <Link to="/login">
            <Typography variant="caption" color="secondary">
              Back
            </Typography>
          </Link>
        </Box> */}
      </Container>
    </Formik>
  );
}

const validationSchema = Yup.object({
  password: Yup.string().nullable().required(),
  confPassword: Yup.string().nullable().required(),
});

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
