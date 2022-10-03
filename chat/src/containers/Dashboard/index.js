import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import DashboardLayout from 'layouts/LayoutDashboard';
import Loader from 'components/Core/Loader';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { usePermissions } from '../../hooks/usePermissions';
import ContainerChat from './ContainerChat/index.js';

const Dashboard = observer(() => {
  const [session, setSession] = useState(null);
  const match = useRouteMatch('/');
  const { dialer, users, lobby, permissions, kittyOfficeChat } = useStores();
  const { allowMultipleSessions } = useFlags();
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
    users?.fetchList();
    lobby?.fetchList().then(() => {
      lobby?.initializePatientNotificationInfo();
    });
    users?._userMe().then((kittyKeys) => {
      initSession(kittyKeys);
    });
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  // This function checks whether microphone hardware is present or not
  useEffect(() => {
    const mediaTypes = [];
    if (
      permissions?.phoneAccess &&
      navigator?.mediaDevices &&
      navigator?.mediaDevices?.enumerateDevices()
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loaderHtml = (
    <div style={{ height: '100vh', width: '100%' }}>
      <Loader />
    </div>
  );

  // React query to fetch user permission by user id [for Tasks]

  return (
    <DashboardLayout>
      <ContainerChat nameChat={'office-chat'} session={session} />
    </DashboardLayout>
  );
});

export default Dashboard;
