import { useMemo } from "react";
import {
  Button,
  Grid,
  Box,
  Typography,
  Paper,
  Container,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Link, useLocation } from "react-router-dom";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { emailValidation, passwordValidation } from "../../helpers/validations";
import TextInputField from "../Core/Formik/TextInputField";
import PasswordInputField from "../Core/Formik/PasswordInputField";
import HeadComp from "../SEO/HelmetComp";
import WorkspaceCard from "./WorkspaceCard";
import { useAuthenticationState } from "../../hooks/useAuthenticationState";
import { useAuthenticationDispatch } from "../../hooks/useAuthenticationDispatch";
import * as Sentry from "@sentry/react";
import LogRocket from "logrocket";

export default function FormLogin() {
  const classes = useStyles();
  const location = useLocation();
  const search = location.search;
  const { login, setAuthData } = useAuthenticationDispatch();
  const initialValues = {
    email: "",
    password: "",
  };
  const authentication = useAuthenticationState();
  const isTenantValid = useMemo(
    () => authentication.loadedAuth && !authentication.invalidTenant,
    [authentication]
  );

  return (
    <>
      <HeadComp title="Login" />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmitForm({
          authentication,
          history,
          search,
          login,
          setAuthData,
        })}
      >
        {({ isSubmitting }) => (
          <Container
            component={Paper}
            maxWidth="sm"
            elevation={1}
            className={classes.root}
          >
            <Typography variant="h2" className="mb-4">
              Log In
            </Typography>

            <WorkspaceCard isValid={isTenantValid} />

            {!isSubmitting ? (
              <Typography variant="caption" className="mt-3">
                <Link to="/workspace">Change workspace?</Link>
              </Typography>
            ) : null}

            <Form>
              <TextInputField
                fieldLabel="EMAIL"
                fieldName="email"
                type="text"
                placeholder="Enter email"
                disabled={isSubmitting || !isTenantValid}
                required
              />
              <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
                component={Box}
                mt={3.5}
                mb={1}
              >
                <Typography variant="caption">PASSWORD</Typography>
                {isTenantValid && !isSubmitting ? (
                  <Typography variant="caption">
                    <Link to="/forgot-password">Forgot password</Link>
                  </Typography>
                ) : null}
              </Grid>
              <PasswordInputField
                fieldName="password"
                placeholder="Enter password"
                hideStrengthBar={true}
                disabled={isSubmitting || !isTenantValid}
                required
              />
              <Box mt={5}>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSubmitting || !isTenantValid}
                  variant="contained"
                  size="large"
                  color="secondary"
                >
                  <Typography>
                    {isSubmitting ? `Loading...` : `Log In`}
                  </Typography>
                </Button>
              </Box>
            </Form>
          </Container>
        )}
      </Formik>
    </>
  );
}

const handleSubmitForm = ({
  authentication,
  history,
  search,
  login,
  setAuthData,
}) =>
  async function (val, { setSubmitting, resetForm, setFieldError }) {
    const {
      user,
    } = authentication;

    try {
      setSubmitting(true);
      const data = {
        ...val,
        email: val.email.toLowerCase(),
      };
      const { email, password } = data;
      const cognitoUser = await Auth.signIn(email.toLowerCase(), password);
      const { signInUserSession } = cognitoUser;
      Sentry.setUser({ email });
      login(cognitoUser);
      setAuthData(signInUserSession);
      LogRocket.identify(user.id, {
        name: user.username,
        email: user.email,
      });
      if (search) {
        const route = search.split("/")[1];
        /**
         * Refreshing the page instead of client side routing to reset state
         */
        window.location.pathname = `/${route}`;
        // history.replace(`/${route}`);
      } else {
        /**
         * Refreshing the page instead of client side routing to reset state
         */
        window.location.pathname = "/";
        // history.replace('/dashboard');
      }
    } catch (e) {
      if (!e.message.includes("NEW_PASSWORD_REQUIRED")) {
        return setFieldError("password", e.message);
      } else {
        history.replace({
          pathname: "/complete-registration",
          state: data,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

const validationSchema = Yup.object({
  email: emailValidation,
  password: passwordValidation,
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "white",
    padding: theme.spacing(5, 10, 8, 10),
    "& form": {
      width: "100%", // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    "& a": {
      textDecoration: "none",
      color: theme.palette.secondary.main,
    },
  },
}));
