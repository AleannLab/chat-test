import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import CheckIcon from '@material-ui/icons/Check';
import AddNumber from './AddNumber';
import { LinearProgress, useMediaQuery, IconButton } from '@material-ui/core';
import { useStores } from 'hooks/useStores';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import styles from './index.module.css';
import Table from 'components/Core/Table';

const CallForwarding = observer(() => {
  const [showAddNumberModal, setShowAddNumberModal] = useState(false);
  const { callForwarding, notification } = useStores();

  const notLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const handleSelect = async (uuid, value) => {
    try {
      if (uuid === 'disable') {
        await callForwarding.disableCallForwarding();
      } else {
        await callForwarding.updateDefaultNumber({ uuid, isDefault: value });
      }
      await callForwarding.fetchList();
    } catch (e) {
      notification.showError(
        'An unexpected error occurred while attempting to update the default number',
      );
    }
  };
  const handleDelete = async (uuid) => {
    try {
      await callForwarding.deleteNumber({ uuid });
      await callForwarding.fetchList();
    } catch (e) {
      console.error(e);
      notification.showError(
        'An unexpected error occurred while attempting to delete the number',
      );
    }
  };
  const COLUMNS = [
    { id: 'name', width: '30%', disablePadding: false, label: 'Name' },
    {
      id: 'did',
      width: '30%',
      disablePadding: false,
      label: 'Number',
      align: 'center',
    },
    {
      id: 'action',
      width: '30%',
      disablePadding: false,
      label: 'Action',
      align: 'center',
    },
  ];
  const createDataItem = (callForward) => {
    const callForwardData = callForwarding.get([{}, callForward]);
    const name = <span className={styles.label}>{callForwardData.name}</span>;
    const did = <span>{callForwardData.did}</span>;
    const action = (
      <Grid container spacing={4} alignItems="center" justify="center">
        <Grid item xs={8}>
          {callForwardData.default ? (
            <span
              className={
                callForwardData.global ? styles.selectedGlobal : styles.selected
              }
            >
              <CheckIcon
                fontSize="small"
                style={{ color: '#1ABA17', marginRight: '2px' }}
              />
              Selected
            </span>
          ) : (
            <Button
              className={styles.select}
              size={notLG ? 'small' : 'medium'}
              variant="outlined"
              color="primary"
              onClick={() => handleSelect(callForwardData.uuid, true)}
            >
              Select
            </Button>
          )}
        </Grid>
        <Grid item xs={4}>
          {callForwardData.uuid !== 'disable' && (
            <IconButton onClick={() => handleDelete(callForwardData.uuid)}>
              <DeleteIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
    );
    return { name, did, action };
  };

  useEffect(() => {
    callForwarding.fetchList().catch(() => {
      notification.showError(
        'An unexpected error occurred while attempting to fetch the call forwarding data',
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        Call Forwarding
        <Button
          className="secondary-btn"
          variant="contained"
          color="secondary"
          onClick={() => setShowAddNumberModal(true)}
        >
          Add Number
        </Button>
      </div>
      <div className={styles.sectionContainer}>
        {/* <div className={styles.sectionTitleContainer}>
          <span className={styles.sectionTitle}>Forwarding Numbers</span>
        </div> */}
        <div style={{ height: '10px' }}>
          {callForwarding.loaded === true && callForwarding.loading && (
            <LinearProgress />
          )}
        </div>
        <Table
          height="100%"
          isSelectable={false}
          columns={COLUMNS}
          noScroll={true}
          rows={callForwarding.data?.map((call) => createDataItem(call))}
        />
      </div>
      {showAddNumberModal ? (
        <AddNumber onClose={() => setShowAddNumberModal(false)} />
      ) : null}
    </div>
  );
});

export default CallForwarding;
