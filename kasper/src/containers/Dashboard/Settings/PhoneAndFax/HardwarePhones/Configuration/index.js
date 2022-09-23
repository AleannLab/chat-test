import { Button, CircularProgress } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import styles from './index.module.css';
import { ReactComponent as BackIcon } from 'assets/images/back-arrow.svg';
import { useHistory } from 'react-router-dom';
import { useStores } from 'hooks/useStores';
import ConfigureLines from './ConfigureLines';
import { useFlags } from 'launchdarkly-react-client-sdk';

const Header = ({ children }) => {
  const history = useHistory();
  return (
    <div className={styles.header}>
      <span>{children}</span>
      <Button
        onClick={() => {
          history.goBack();
        }}
        startIcon={<BackIcon />}
        color="secondary"
        variant="outlined"
      >
        Back
      </Button>
    </div>
  );
};

const DescriptionText = () => {
  return (
    <p className={styles.descriptionText}>
      You can edit your phone&apos;s directory below. Reboot the phone to apply
      the settings immediately. <b>Note:</b> Your device may not look the same
      depending on hardware
    </p>
  );
};

const RebootPhone = ({ rebootFunction, loading, disabled }) => {
  return (
    <div className="d-flex align-items-center justify-content-center mt-4">
      <Button
        disabled={disabled}
        style={{ height: 36.5, width: 135 }}
        onClick={rebootFunction}
        variant="outlined"
        color="secondary"
      >
        {loading ? <CircularProgress size={14} /> : 'Reboot Phone'}
      </Button>
    </div>
  );
};

const Configuration = ({ id: hardwarePhoneId }) => {
  const { incomingCalls, hardwarePhones, notification } = useStores();
  const queryClient = useQueryClient();
  const { showRebootPhone } = useFlags();

  const {
    data: hardwarePhoneDetails,
    isFetching,
    isLoading,
  } = useQuery(['hardwarePhoneDetails', hardwarePhoneId], () =>
    hardwarePhones.getHardwarePhone(hardwarePhoneId),
  );

  const prefetchAgents = async () =>
    await queryClient.prefetchQuery(['usersAlongWithIncomingCalls'], () =>
      incomingCalls.getUsers(),
    );

  useEffect(() => {
    prefetchAgents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { mutateAsync: rebootPhone, isLoading: isRebooting } = useMutation(
    'rebootPhoneMutation',
    (hardwarePhoneID) => hardwarePhones.rebootHardwarePhone(hardwarePhoneID),
    {
      onSuccess: () =>
        notification.showSuccess('Your phone should be rebooting now!'),
      onError: (error) => notification.showError(error.message ?? error),
    },
  );

  return (
    <div className={styles.root}>
      <Header>Phone Directory</Header>
      <DescriptionText />
      <ConfigureLines
        loading={isLoading}
        selectedPhone={hardwarePhoneDetails}
      />
      {showRebootPhone && (
        <RebootPhone
          rebootFunction={() => rebootPhone(hardwarePhoneId)}
          loading={isRebooting}
          disabled={isRebooting}
        />
      )}
    </div>
  );
};

export default Configuration;
