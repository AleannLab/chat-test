import React, { useMemo, useEffect } from 'react';
import Notification from 'components/Notification';
import AppHeader from 'components/AppHeader';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import SideBar from '../components/SideBar/SideBar';
import { makeStyles } from '@material-ui/core/styles';
import { useAuthenticated } from 'hooks/useAuthenticated';
import StatusBar from 'components/StatusBar';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useFlags } from 'launchdarkly-react-client-sdk';

const isNotChrome = window.navigator.userAgent.indexOf('Chrome') === -1;

export default function LayoutDashboard(props) {
  const { localServerApp } = useStores();
  const [showBanner, setShowBanner] = React.useState(isNotChrome);
  const [showLSAWarning, setShowLSAWarning] = React.useState(false);
  const history = useHistory();
  useAuthenticated();

  const { localServerAppStatusPage } = useFlags();

  const headerHeight = useMemo(() => {
    let height = 64;
    if (showBanner) {
      height += 35;
    }
    if (showLSAWarning) {
      height += 35;
    }
    return height;
  }, [showBanner, showLSAWarning]);

  const classes = useStyles(headerHeight);

  const { data: lsaConfig } = useQuery(
    'fetchLSAConfig',
    () => localServerApp.getLSAConfig(),
    {
      refetchInterval: 15 * 60 * 1000,
      enabled: localServerAppStatusPage,
    },
  );

  useEffect(() => {
    if (lsaConfig) {
      const { IS_ONLINE, UP_TO_DATE } = lsaConfig.LOCAL_SERVER_APP_STATUS;
      setShowLSAWarning(!(IS_ONLINE && UP_TO_DATE));
    }
  }, [lsaConfig]);

  return (
    <>
      <CssBaseline />
      {showBanner && (
        <StatusBar
          message="It looks like you are using an unsupported browser. We strongly
          recommend using Google Chrome otherwise some functions may be limited."
          actionText="Got It"
          height="3rem"
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {showLSAWarning && (
        <StatusBar
          message="Your Kasper server application is either offline or needs to be updated. Please go to server status page to address this."
          actionText="SHOW ME HOW"
          bgColor="#FEA828"
          onDismiss={() =>
            history.push(
              '/dashboard/settings/server-settings/kasper-server-app',
            )
          }
        />
      )}

      <AppHeader headerHeight={headerHeight} />
      <Grid container className={classes.content}>
        <Grid item component={SideBar} headerHeight={headerHeight} />
        <Grid item xs>
          <Grid container className={classes.content}>
            {props.children}
          </Grid>
        </Grid>
      </Grid>
      <Notification />
    </>
  );
}

const useStyles = makeStyles(() => ({
  content: (headerHeight) => ({
    height: `calc(100vh - ${headerHeight}px)`,
  }),
}));
