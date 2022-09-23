import React, { Suspense, lazy, useState, useEffect } from 'react';
import {
  Route,
  Switch,
  useRouteMatch,
  Redirect,
  useHistory,
} from 'react-router-dom';
import DashboardLayout from 'layouts/LayoutDashboard';
import Loader from 'components/Core/Loader';
import { useStores } from 'hooks/useStores';
import MicPermissionPrimary from 'components/MicPermissionHelper/MicPermissionPrimary';
import MicUnavailable from 'components/MicPermissionHelper/MicUnavailable';
import { FEATURES } from 'helpers/constants';
import { observer } from 'mobx-react';
import FaxLogs from './Fax';
import { useFlags } from 'launchdarkly-react-client-sdk';
import PermissionsOverlay from 'components/PermissionsOverlay';
import { usePermissions } from '../../hooks/usePermissions';
const PatientFeed = lazy(() => import('./PatientFeed'));
const Inbox = lazy(() => import('./CallsAndVoicemails'));
const OfficeTask = lazy(() => import('./OfficeTask'));
const FormBuilder = lazy(() => import('./FormBuilder'));
const PaperlessForms = lazy(() => import('./PaperlessForms'));
const Settings = lazy(() => import('./Settings'));
const Reports = lazy(() => import('./Reports'));
const Analytics = lazy(() => import('./Analytics'));
const Swell = lazy(() => import('./Swell'));
const MedicalHistoryForm = lazy(() =>
  import('./FormBuilder/MedicalHistoryForm/MedicalHistoryForm'),
);
const Tasks = lazy(() => import('./Tasks'));
const Scheduling = lazy(() => import('./Scheduling'));
const Chat = lazy(() => import('./ContainerChat'));

const PermissionCheck = ({ isLoading, canView, component: Component }) => {
  return (
    <Loader show={isLoading}>
      {canView ? <Component /> : <PermissionsOverlay />}
    </Loader>
  );
};

const Dashboard = observer(() => {
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [openUnavailableDialog, setOpenUnavailableDialog] = useState(false);
  const [session, setSession] = useState(null);
  const match = useRouteMatch('/dashboard');
  const { dialer, users, lobby, permissions, kittyOfficeChat } = useStores();
  const { allowMultipleSessions, showOfficeGroupChatBubble } = useFlags();
  const history = useHistory();

  if (!allowMultipleSessions) {
    localStorage.openpages = Date.now();
    var onLocalStorageEvent = function (e) {
      if (e.key === 'openpages') {
        history.push(`/active-session`);
      }
    };
    window.addEventListener('storage', onLocalStorageEvent, false);
  }

  const initSession = async (kittyKeys) => {
    if (kittyOfficeChat.session) {
      setSession(kittyOfficeChat.session);
      return;
    }
    await kittyOfficeChat.init(kittyKeys);
    const userSession = await kittyOfficeChat.startSession();
    setSession(userSession);
  };

  useEffect(() => {
    users.fetchList();
    lobby.fetchList().then(() => {
      lobby.initializePatientNotificationInfo();
    });
    users._userMe().then((kittyKeys) => {
      initSession(kittyKeys);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // This function checks whether microphone hardware is present or not
  useEffect(() => {
    const mediaTypes = [];
    if (
      permissions.phoneAccess &&
      navigator.mediaDevices &&
      navigator.mediaDevices?.enumerateDevices()
    ) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          devices.forEach((device) => {
            mediaTypes.push(device.kind);
          });
          let microphoneConnected = false;
          mediaTypes.forEach((type) => {
            if (type === 'audioinput') {
              microphoneConnected = true;
            }
          });
          if (microphoneConnected) {
            // Ask for permission
            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then(() => {
                dialer.setIsMicrophoneAllowed(true);
              })
              .catch(() => {
                dialer.setIsMicrophoneAllowed(false);
              });
          } else {
            dialer.setIsMicrophoneAllowed(false);
          }
        })
        .catch(function (err) {
          console.error(err.name + ': ' + err.message);
        });
    }
  }, [permissions.phoneAccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const loaderHtml = (
    <div style={{ height: '100vh', width: '100%' }}>
      <Loader />
    </div>
  );

  // React query to fetch user permission by user id [for Tasks]
  const userPermissionsQuery = usePermissions();

  return (
    <DashboardLayout>
      <Suspense fallback={loaderHtml}>
        <Switch>
          <Route exact path={`${match.url}`}>
            <Redirect to={`${match.url.replace(/\/+$/, '')}/office-task`} />
          </Route>
          <Route
            path={`${match.url}/patient-feed/:patientName?/:patientID?`}
            component={PatientFeed}
          />
          <Route path={`${match.url}/inbox`}>
            <Redirect to={`${match.url}/calls`} />
          </Route>
          <Route path={`${match.url}/calls`} component={Inbox} />
          <Route path={`${match.url}/fax`} component={FaxLogs} />
          <Route path={`${match.url}/office-task`} component={OfficeTask} />
          <Route path={`${match.url}/form-builder`} component={FormBuilder} />
          <Route
            path={`${match.url}/paperless-forms`}
            component={() => (
              <PermissionCheck
                isLoading={userPermissionsQuery.isLoading}
                canView={userPermissionsQuery?.data?.canViewPaperlessForms}
                component={PaperlessForms}
              />
            )}
          />
          <Route path={`${match.url}/settings`} component={Settings} />
          <Route path={`${match.url}/reports`} component={Reports} />
          <Route path={`${match.url}/analytics`} component={Analytics} />
          <Route
            path={`${match.url}/medical-history`}
            component={MedicalHistoryForm}
          />
          <Route
            path={`${match.url}/tasks`}
            component={() => (
              <PermissionCheck
                isLoading={userPermissionsQuery.isLoading}
                canView={userPermissionsQuery?.data?.canViewTasks}
                component={Tasks}
              />
            )}
          />
          <Route
            path={`${match.url}/calendar`}
            component={() => {
              if (!FEATURES.OFFICE_SCHEDULING) {
                return <Redirect to={`${match.url}/`} />;
              }
              return (
                <PermissionCheck
                  isLoading={userPermissionsQuery.isLoading}
                  canView={userPermissionsQuery?.data?.canViewCalendar}
                  component={Scheduling}
                />
              );
            }}
          />
          <Route path={`${match.url}/swell`} component={Swell} />
          <Route
            path={`${match.url}/office-chat`}
            component={() => (
              <div id="office-chat"></div>
            )}
          />
        </Switch>
      </Suspense>
      {openPermissionDialog === true && (
        <MicPermissionPrimary onClose={() => setOpenPermissionDialog(false)} />
      )}
      {openUnavailableDialog === true && (
        <MicUnavailable onClose={() => setOpenUnavailableDialog(false)} />
      )}
      {/* {showOfficeGroupChatBubble && (
        <Chat nameChat={'popup-chat'} session={session} />
      )} */}
    </DashboardLayout>
  );
});

export default Dashboard;
