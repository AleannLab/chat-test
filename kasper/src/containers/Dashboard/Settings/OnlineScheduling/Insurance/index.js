import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { observer } from 'mobx-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import LinearProgress from '@material-ui/core/LinearProgress';

import { useStores } from 'hooks/useStores';
import Switch from 'components/Core/Switch';
import Table from 'components/Core/Table';
import styles from './index.module.css';

const ControlledSwitch = ({ name, checked, onChange, disabled }) => {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    if (onChange) onChange(event.target.checked);
  };

  return (
    <Switch
      name={name}
      checked={isChecked}
      onClick={handleChange}
      disabled={disabled}
    />
  );
};

const tableColumns = [
  {
    id: 'insurance name',
    width: '70%',
    disablePadding: false,
    label: 'Insurance Name',
  },
  { id: 'accept', width: '15%', disablePadding: false, label: 'Accept' },
  {
    id: 'in network',
    width: '15%',
    disablePadding: false,
    label: 'In Network',
  },
];

const Insurance = observer(() => {
  const { onlineScheduleSettings, notification } = useStores();
  const queryClient = useQueryClient();

  const [tableRows, setTableRows] = useState(
    queryClient.getQueryData('fetchInsurance')
      ? queryClient.getQueryData('fetchInsurance').map((insurance) => {
          return createData(
            insurance.id,
            insurance.name,
            insurance.is_active,
            insurance.in_network,
            false,
          );
        })
      : [],
  );

  const fetchInsuranceQuery = useQuery(
    'fetchInsurance',
    () => onlineScheduleSettings.fetchInsuranceInformation(),
    {
      onSuccess: (data) => {
        setTableRows(
          data.map((insurance) => {
            return createData(
              insurance.id,
              insurance.name,
              insurance.is_active,
              insurance.in_network,
              false,
            );
          }),
        );
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const updateInsuranceInformation = useMutation(
    'updateInsuranceQuery',
    (insurance) => onlineScheduleSettings.updateInsuranceInformation(insurance),
    {
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to update the insurance information',
        );
      },
    },
  );

  useEffect(() => () => onlineScheduleSettings.setShowEditInsurance(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  function createData(id, insuranceName, acceptInsurance, inNetwork, disabled) {
    const name = <span className={styles.insuranceName}>{insuranceName}</span>;
    const accept = (
      <ControlledSwitch
        disabled={disabled}
        name="newPatients"
        checked={acceptInsurance === 1}
        onChange={(checked) => acceptToggle(id, checked, inNetwork)}
      />
    );
    const network = (
      <ControlledSwitch
        disabled={disabled}
        name="newPatients"
        checked={inNetwork === 1}
        onChange={(checked) => inNetworkToggle(id, acceptInsurance, checked)}
      />
    );

    return { id, name, accept, network };
  }

  const acceptToggle = async (id, isActive, inNetwork) => {
    if (!isActive && inNetwork) {
      inNetwork = false;
    }
    setTableRows(
      queryClient.getQueryData('fetchInsurance').map((insuranceData) => {
        return createData(
          insuranceData.id,
          insuranceData.name,
          insuranceData.is_active,
          insuranceData.in_network,
          true,
        );
      }),
    );
    await updateInsuranceInformation.mutateAsync({
      id,
      isActive,
      inNetwork,
    });
    await queryClient.refetchQueries('fetchInsurance');
  };

  const inNetworkToggle = async (id, isActive, inNetwork) => {
    // If an insurance is in network, it has to be active
    if (inNetwork) {
      isActive = true;
    }
    const insurance = {
      id,
      isActive,
      inNetwork,
    };
    setTableRows(
      queryClient.getQueryData('fetchInsurance').map((insuranceData) => {
        return createData(
          insuranceData.id,
          insuranceData.name,
          insuranceData.is_active,
          insuranceData.in_network,
          true,
        );
      }),
    );
    await updateInsuranceInformation.mutateAsync(insurance);
    await queryClient.refetchQueries('fetchInsurance');
  };

  return (
    <>
      <Grid className={styles.root}>
        <div className={styles.header}>
          <div>
            <div className={styles.headerTitle}>Insurance</div>
            <div className={styles.info}>
              Select which insurance providers you accept and which you are in
              network for. This will appear when patients try to schedule an
              appointment online
            </div>
          </div>
          <Button
            className={`me-3 secondary-btn ${styles.headerButtons}`}
            size="medium"
            variant="outlined"
            color="primary"
            onClick={() => onlineScheduleSettings.setShowEditInsurance(false)}
          >
            Go Back
          </Button>
        </div>
        <div style={{ height: '5px' }}>
          {fetchInsuranceQuery.status === 'success' &&
            fetchInsuranceQuery.isFetching && (
              <LinearProgress className="mb-3" />
            )}
        </div>
        <div className={styles.tableContainer}>
          <Table
            isEmpty={
              fetchInsuranceQuery.status !== 'loading' &&
              !!fetchInsuranceQuery.data &&
              fetchInsuranceQuery.data.length === 0
            }
            columns={tableColumns}
            rows={tableRows}
            sortBy={tableColumns[0].id}
            allowSelectAll={false}
            isSelectable={false}
          />
        </div>
      </Grid>
    </>
  );
});

export default Insurance;
