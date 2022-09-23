import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Switch from 'components/Core/Switch';
import Table from 'components/Core/Table';
import clsx from 'clsx';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useStores } from 'hooks/useStores';
import Menu from './Menu';
import DeleteIcon from '@material-ui/icons/Delete';
import { LinearProgress } from '@material-ui/core';
import moment from 'moment';

import styles from './index.module.css';

const ControlledSwitch = ({ name, checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(false);
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);
  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    if (onChange) onChange(event.target.checked);
  };
  return <Switch name={name} checked={isChecked} onClick={handleChange} />;
};

const tableColumns = [
  { id: 'name', width: '35%', disablePadding: false, label: 'Name' },
  {
    id: 'created',
    width: '25%',
    disablePadding: false,
    label: 'Created',
    canSort: true,
  },
  { id: 'status', width: '20%', disablePadding: false, label: 'Status' },
  {
    id: 'action',
    width: '20%',
    disablePadding: false,
    label: 'Action',
  },
];

const IvrList = () => {
  // const [tableRows, setTableRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const history = useHistory();
  const match = useRouteMatch('/dashboard/settings/phone-and-fax/ivr-settings');
  const { ivrSettings, notification } = useStores();
  const queryClient = useQueryClient();

  const fetchIvrQuery = useQuery(['fetchIvr'], () => ivrSettings.fetchIvr(), {
    initialData: [],
    onError: (err) => {
      notification.showError(err.message);
    },
  });

  const deleteIvrQuery = useMutation(
    'deleteIvr',
    (id) => ivrSettings.deleteIvr(id),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
      onSuccess: () => queryClient.invalidateQueries('fetchIvr'),
    },
  );

  const multipleDeleteIVRQuery = useMutation(
    'multipleDeleteIvr',
    (data) => ivrSettings.deleteIvrMultiple(data),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries('fetchIvr');
        setSelectedRows([]);
      },
    },
  );

  const updateStatusQuery = useMutation(
    'updateIvr',
    (data) => ivrSettings.updateIvr(data),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
      onSuccess: () => queryClient.invalidateQueries('fetchIvr'),
    },
  );

  const handleStatusChange = async (id, enabled) =>
    await updateStatusQuery.mutateAsync({ id, data: { default: !enabled } });

  const createData = (id, created, name, enabled) => {
    const checked = enabled === 1;
    const ivrName = <span>{name}</span>;
    const ivrCreatedAt = <span>{moment(created).format('MM/DD/YYYY')}</span>;
    const ivrStatus = (
      <ControlledSwitch
        name="newPatients"
        checked={checked}
        onChange={() => handleStatusChange(id, enabled)}
      />
    );
    const ivrAction = (
      <Menu
        handleEditIvr={(id) => history.push(`${match.url}/create-ivr/${id}`)}
        id={id}
        handleDeleteIvr={(id) => handleDeleteIvr(id)}
      />
    );
    return { id, ivrName, ivrCreatedAt, ivrStatus, ivrAction };
  };

  const handleIrvSelect = (data) => setSelectedRows(data);

  const handleDeleteIvr = async (id = null) => {
    if (id) {
      await deleteIvrQuery.mutateAsync(id);
      // await queryClient.refetchQueries('fetchIvr');
      return;
    }

    // for (let i = 0; i < selectedRows.length; i++) {
    //   await deleteIvrQuery.mutateAsync(selectedRows[i]);
    //   setSelectedRows([]);
    // }
    // queryClient.refetchQueries('fetchIvr');
  };

  const handleMultipleDeleteIvr = async (selectedIvr = []) => {
    if (selectedIvr.length > 0) {
      const selected = { ids: selectedIvr.join() };
      await multipleDeleteIVRQuery.mutateAsync(selected);
      return;
    }
  };

  const { isFetching, data: ivrData } = fetchIvrQuery;
  const { isLoading: delMutationLoading } = deleteIvrQuery;
  const { isLoading: isDeletingMultiple } = multipleDeleteIVRQuery;
  const { isLoading: updateMutationLoading } = updateStatusQuery;

  const mapIvrDetails = (data) => {
    if (data === undefined) return [];
    return data.map((item) =>
      createData(item.id, item.created_at, item.name, item.default),
    );
  };

  const tableRows = mapIvrDetails(ivrData);

  return (
    <>
      <div className={styles.header}>
        <div>
          <Button
            className={clsx('primary-btn', styles.headerButtons)}
            variant="outlined"
            color="primary"
            style={{ marginRight: 10 }}
            disabled={
              !selectedRows.length ||
              delMutationLoading ||
              updateMutationLoading ||
              isDeletingMultiple
            }
            startIcon={<DeleteIcon style={{ fontSize: '1rem' }} />}
            onClick={() => handleMultipleDeleteIvr(selectedRows)}
          >
            <span>Delete</span>
            {selectedRows.length ? <span>({selectedRows.length})</span> : null}
          </Button>
          <Button
            className={`secondary-btn ${styles.headerButtons}`}
            variant="contained"
            color="secondary"
            disabled={
              delMutationLoading || updateMutationLoading || isDeletingMultiple
            }
            onClick={() => history.push(`${match.url}/create-ivr`)}
          >
            Create IVR
          </Button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {(isFetching ||
          delMutationLoading ||
          updateMutationLoading ||
          isDeletingMultiple) && (
          <LinearProgress
            color="secondary"
            className={styles.tableProgressBar}
          />
        )}
        <Table
          height="100%"
          columns={tableColumns}
          rows={tableRows}
          selected={selectedRows}
          onRowSelect={handleIrvSelect}
          sortBy={tableColumns[0].id}
          allowSelectAll
          disabled={
            isFetching ||
            updateMutationLoading ||
            delMutationLoading ||
            isDeletingMultiple
          }
          isEmpty={tableRows.length < 1 && !isFetching}
          emptyText="No IVRs Found"
        />
      </div>
    </>
  );
};

export default IvrList;
