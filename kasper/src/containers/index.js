import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import Loader from 'components/Core/Loader';
import FamilyMenu from './FamilyMenu';

const Login = lazy(() => import('./Auth/Login'));
const ForgotPassword = lazy(() => import('./Auth/ForgotPassword'));
const ResetForgotPassword = lazy(() => import('./Auth/ResetForgotPassword'));
const ChangePassword = lazy(() => import('./Auth/ChangePassword'));
const Workspace = lazy(() => import('./Auth/Workspace'));
const Dashboard = lazy(() => import('./Dashboard'));
const CompleteRegistration = lazy(() => import('./CompleteRegistration'));
const ActiveSession = lazy(() => import('components/ActiveSession'));
const Invitation = lazy(() => import('./Invitation'));
// const MobileNotificationSettings = lazy(() =>
//   import('components/MobileNotificationSettings'),
// );
const PatientFormInitiation = lazy(() => import('./PatientFormInitiation'));
const LockScreen = lazy(() => import('./PatientFormInitiation/LockScreen'));
const AppointmentDetails = lazy(() => import('./AppointmentDetails'));
const OnlineScheduling = lazy(() => import('./OnlineScheduling'));
const PaperlessFormsPreview = lazy(() => import('./PaperlessFormsPreview'));
const PaperlessFormsPrintPreview = lazy(() =>
  import('./PaperlessFormsPrintPreview'),
);

const Routes = observer((props) => {
  const { authentication } = useStores();
  const loaderHtml = (
    <div style={{ height: '100vh' }}>
      <Loader show={true} message="KASPER"></Loader>
    </div>
  );

  if (authentication.loadedAuth === false) {
    return loaderHtml;
  } else {
    return (
      <Router>
        <Suspense fallback={loaderHtml}>
          <Route exact path="/login" component={Login} />
          <Route exact path="/forgot-password" component={ForgotPassword} />
          <Route
            exact
            path="/reset-forgot-password"
            component={ResetForgotPassword}
          />
          <Route exact path="/change-password" component={ChangePassword} />
          <Route path="/workspace" component={Workspace} />
          <PrivateRoute path="/dashboard" component={Dashboard} />
          <Route
            path="/complete-registration"
            component={CompleteRegistration}
          />
          <Route path="/active-session" component={ActiveSession} />
          <Route path="/invitations/:invite" component={Invitation} />
          <Route path="/family-invitations/:phoneUID" component={FamilyMenu} />
          <Route
            path="/paperless-forms-preview"
            component={PaperlessFormsPreview}
          />
          <Route
            path="/paperless-forms-print-preview"
            component={PaperlessFormsPrintPreview}
          />
          {/* <Route
            path="/notification-settings/:patientSecret"
            component={MobileNotificationSettings}
          /> */}
          <Route path="/schedule-appointment" component={OnlineScheduling} />
          <Route path="/forms" component={PatientFormInitiation} />
          <Route path="/lock-screen" component={LockScreen} />
          <Route
            path="/appointment-details/:appointmentId"
            component={AppointmentDetails}
          />
          <Route exact path="/">
            <Redirect to="/dashboard" />
          </Route>
        </Suspense>
      </Router>
    );
  }
});

export default Routes;

const PrivateRoute = observer(function ({ component: Component, ...rest }) {
  const { authentication } = useStores();

  return (
    <Route
      {...rest}
      render={(props) =>
        authentication.authenticatedData ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
});
