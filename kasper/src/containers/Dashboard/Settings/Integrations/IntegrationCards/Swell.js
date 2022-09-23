import React, { useState } from 'react';
import styles from './index.module.css';
import { ReactComponent as SwellIcon } from 'assets/images/swell-logo.svg';
import { Typography, Button } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Switch from 'components/Core/Switch';
import TokenIdModal from '../TokenIdModal';
import { useStores } from 'hooks/useStores';
import { useQuery, useMutation, useQueryClient } from 'react-query';

// Config keys - DB keys and UI keys mapping
const CONFIG_KEYS = {
  swellIntegrationTokenId: 'swell_integration_token_id',
  swellIntegrationEnabled: 'swell_integration_enabled',
};

export default function Swell() {
  const { notification, integrations, authentication } = useStores();
  const queryClient = useQueryClient();
  const [isTokenIdModalOpen, setIsTokenIdModalOpen] = useState(false);

  // React query to fetch token id
  const integrationsQuery = useQuery(
    ['officeConfigs', 'integrations'],
    () => integrations.getConfigs(Object.values(CONFIG_KEYS).join()),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Mutate config
  const updateIntegrationConfig = useMutation(
    (configObj) => integrations.updateConfigs(configObj),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(
          ['officeConfigs', 'integrations'],
          (oldData) => ({
            ...oldData,
            ...variables,
          }),
        );
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Update toggle for appointment notification
  const handleToggle = (event) => {
    const configObj = {
      [CONFIG_KEYS.swellIntegrationEnabled]: event.target.checked + '',
    };
    updateIntegrationConfig.mutate(configObj);
  };

  return (
    <div className={styles.root}>
      {integrationsQuery.isFetching ? null : (
        <Switch
          name="swellIntegration"
          className={styles.switch}
          checked={
            integrationsQuery.data[CONFIG_KEYS.swellIntegrationEnabled] ===
            'true'
              ? integrationsQuery.data[CONFIG_KEYS.swellIntegrationEnabled]
              : false
          }
          onChange={handleToggle}
          disabled={
            integrationsQuery.isFetching || updateIntegrationConfig.isLoading
          }
        />
      )}
      <div className={styles.header}>
        <SwellIcon height={48} width={48} className="me-2" />
        <div className={styles.title}>Swell</div>
      </div>
      <div className="mt-3">
        <Typography variant="body1">
          Swell helps prospects find your business through online reviews,
          converts website visitors, and turns customer interactions into
          revenue.
        </Typography>
      </div>
      <div className={styles.footer}>
        {integrationsQuery.isFetching ? (
          <Skeleton variant="rect" animation="wave" width="50%" height={15} />
        ) : (
          <span className={styles.idField}>
            ID:
            {integrationsQuery.data[CONFIG_KEYS.swellIntegrationTokenId]
              ? integrationsQuery.data[CONFIG_KEYS.swellIntegrationTokenId]
              : 'NA'}
          </span>
        )}
        <Button
          color="secondary"
          onClick={() => setIsTokenIdModalOpen(true)}
          disabled={
            integrationsQuery.isFetching || updateIntegrationConfig.isLoading
          }
        >
          Edit Token ID
        </Button>
      </div>

      {isTokenIdModalOpen ? (
        <TokenIdModal onClose={() => setIsTokenIdModalOpen(false)} />
      ) : null}
    </div>
  );
}
