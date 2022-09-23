import React from 'react';
import Grid from '@material-ui/core/Grid';
import { ReactComponent as ServerOnline } from 'assets/images/server-online.svg';
import { ReactComponent as ServerOffline } from 'assets/images/server-offline.svg';
import { ReactComponent as ServerOutdated } from 'assets/images/server-outdated.svg';
import styles from './index.module.css';
import { useQuery, useQueryClient } from 'react-query';
import { Button } from '@material-ui/core';
import RefreshIcon from '@material-ui/icons/Refresh';
import { convertCustomTime } from 'helpers/timezone';
import CONSTANTS from 'helpers/constants';
import { useStores } from 'hooks/useStores';

const KasperServer = () => {
  const queryClient = useQueryClient();
  const { localServerApp } = useStores();

  const cachedLsaConfig = queryClient.getQueryData('fetchLSAConfig');
  const { data: lsaConfig } = useQuery(
    'fetchLSAConfig',
    () => localServerApp.getLSAConfig(),
    {
      enabled: !cachedLsaConfig,
    },
  );

  const getServerStatus = () => {
    const { IS_ONLINE, UP_TO_DATE } = lsaConfig.LOCAL_SERVER_APP_STATUS;
    if (!IS_ONLINE) {
      return 'Service not running';
    }
    return UP_TO_DATE ? 'Online' : 'Out of Date';
  };

  const getSubText = () => {
    const { IS_ONLINE, UP_TO_DATE } = lsaConfig.LOCAL_SERVER_APP_STATUS;
    return IS_ONLINE && !UP_TO_DATE
      ? `Please update to version ${lsaConfig.LATEST_LOCAL_SERVER_APP_VERSION} to continue using Kasper`
      : '';
  };

  if (!lsaConfig) {
    return null;
  }

  return (
    <Grid className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <div className="d-flex">
            <span className={styles.title}>Kasper Server Status</span>
            <Button
              className="primary-btn ms-auto"
              color="secondary"
              onClick={() => queryClient.invalidateQueries('fetchLSAConfig')}
            >
              Refresh
              <RefreshIcon fontSize="small" />
            </Button>
          </div>
          <span className={styles.subtitle}>
            The Kasper server app maintains synchronization between Kasper cloud
            and your patient management software. For all features to work
            correctly, please ensure you are on the latest version.
          </span>
        </div>
      </div>
      <div className={styles.serverStatus}>
        <span className={styles.title}>Server</span>
        <div className={styles.serverDetails}>
          {lsaConfig?.LOCAL_SERVER_APP_STATUS.IS_ONLINE ? (
            lsaConfig?.LOCAL_SERVER_APP_STATUS.UP_TO_DATE ? (
              <ServerOnline />
            ) : (
              <ServerOutdated />
            )
          ) : (
            <ServerOffline />
          )}
          <div className={styles.version}>
            <div>
              {getServerStatus()} (version {lsaConfig?.LOCAL_SERVER_APP_VERSION}
              )
            </div>
            <div>{getSubText()}</div>
          </div>
        </div>
      </div>
      <div className={styles.instructions}>
        <span className={styles.title}>Quick update:</span>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span>1</span>
            <span>
              Go to the desktop on your server and open “Kasper Config App”
            </span>
          </div>
          <div className={styles.step}>
            <span>2</span>
            <span>
              Click <strong>Check for Updates</strong> and follow the
              installation instructions to complete the update. Ensure that
              service started successfully
            </span>
          </div>
        </div>

        <span className={`${styles.title} mt-3`}>Start/Restart Service:</span>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span>1</span>
            <span>
              Go to the desktop on your server and open “Kasper Config App”
            </span>
          </div>
          <div className={styles.step}>
            <span>2</span>
            <span>Click “Start Service”</span>
          </div>
          <div className={styles.step}>
            <span>3</span>
            <span>
              Make sure service is running by confirming that “start service”
              button is grayed out
            </span>
          </div>
        </div>
      </div>
    </Grid>
  );
};

export default KasperServer;
