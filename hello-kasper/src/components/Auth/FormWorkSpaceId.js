import React from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  Container,
  InputAdornment,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import TextInputField from 'components/Core/Formik/TextInputField';
import HeadComp from 'components/SEO/HelmetComp';
import { useHistory } from 'react-router-dom';

const DOMAIN = '.meetkasper.com';

export default function FormWorkSpaceId() {
  const history = useHistory();
  const classes = useStyles();
  const initialValues = {
    workspace: '',
  };

  return (
    <>
      <HeadComp title="Choose a Workspace " />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmitForm({})}
      >
        <Container
          component={Paper}
          maxWidth="sm"
          elevation={1}
          className={classes.root}
        >
          <Typography variant="h2">Provide your Workspace</Typography>
          <Form>
            <TextInputField
              fieldLabel="WORKSPACE"
              fieldName="workspace"
              placeholder="Enter Workspace"
              required
              endAdornment={
                <InputAdornment position="end">{DOMAIN}</InputAdornment>
              }
            />
            <Box mt={5}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                color="secondary"
              >
                <Typography>Next</Typography>
              </Button>
              <Button
                fullWidth
                variant="text"
                size="large"
                color="secondary"
                className="mt-2"
                onClick={() => history.goBack()}
              >
                <Typography>Back</Typography>
              </Button>
            </Box>
          </Form>
        </Container>
      </Formik>
    </>
  );
}

const validationSchema = Yup.object({
  workspace: Yup.string().required('Required'),
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
}));

const handleSubmitForm = (_props) =>
  async function (val, { setFieldError }) {
    try {
      window.location.replace(`https://${val.workspace}${DOMAIN}`);
    } catch (e) {
      setFieldError('workspace', 'Not a Valid Workspace');
    }
  };
