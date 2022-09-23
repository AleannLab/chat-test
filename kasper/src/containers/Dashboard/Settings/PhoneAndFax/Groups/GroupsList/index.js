import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Table from 'components/Core/Table';
import clsx from 'clsx';
import Menu from './Menu';
import { useHistory, useRouteMatch } from 'react-router-dom';
import DeleteIcon from '@material-ui/icons/Delete';
import styles from './index.module.css';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useStores } from 'hooks/useStores';
import { LinearProgress } from '@material-ui/core';

const tableColumns = [
  { id: 'name', width: '40%', disablePadding: false, label: 'Name' },
  {
    id: 'members',
    width: '30%',
    disablePadding: false,
    label: 'Members',
  },
  {
    id: 'action',
    width: '30%',
    disablePadding: false,
    label: 'Action',
  },
];

const GroupsList = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const { ivrSettings, notification } = useStores();
  const queryClient = useQueryClient();
  const history = useHistory();
  const match = useRouteMatch('/dashboard/settings/phone-and-fax/call-groups');

  const fetchGroupQuery = useQuery(
    ['fetchGroups'],
    () => ivrSettings.fetchGroups(),
    {
      initialData: [],
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const { data: groupData } = fetchGroupQuery;

  const deleteGroupQuery = useMutation(
    'deleteIvr',
    (id) => ivrSettings.deleteGroup(id),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
      onSuccess: () => queryClient.invalidateQueries('fetchGroups'),
    },
  );

  const multipleDeleteGroupQuery = useMutation(
    'multipleDeleteGroup',
    (data) => ivrSettings.deleteGroupMultiple(data),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
      onSuccess: () => {
        queryClient.invalidateQueries('fetchGroups');
        setSelectedRows([]);
      },
    },
  );

  const handleDeleteGroup = async (id = null) => {
    if (id) {
      await deleteGroupQuery.mutateAsync(id);
      // await queryClient.refetchQueries('fetchIvr');
      return;
    }

    // for (let i = 0; i < selectedRows.length; i++) {
    //   await deleteGroupQuery.mutateAsync(selectedRows[i]);
    //   setSelectedRows([]);
    // }
    // queryClient.refetchQueries('fetchIvr');
  };

  const handleMultipleDeleteGroups = async (selectedGroups = []) => {
    if (selectedGroups.length > 0) {
      const selected = { ids: selectedGroups.join() };
      await multipleDeleteGroupQuery.mutateAsync(selected);
      return;
    }
  };

  const { isFetching } = fetchGroupQuery;
  const { isLoading: delMutationLoading } = deleteGroupQuery;
  const { isLoading: isDeletingMultiple } = multipleDeleteGroupQuery;

  const handleGroupSelect = (data) => {
    setSelectedRows(data);
  };

  const createDataItem = (id, name, count) => {
    const groupName = <span>{name}</span>;
    const membersCount = <span>{count}</span>;

    const groupAction = (
      <Menu
        id={id}
        handleEditGroup={(id) =>
          history.push(`${match.url}/create-group/${id}`)
        }
        handleDeleteGroup={(id) => handleDeleteGroup(id)}
      />
    );

    return { id, groupName, membersCount, groupAction };
  };

  const mapGroupDetails = (data) => {
    if (data === undefined) {
      return [];
    }

    return data.map(({ id, name, group_member_json }) =>
      createDataItem(id, name, group_member_json.length),
    );
  };

  const tableRows = mapGroupDetails(groupData);

  return (
    <>
      <div className={styles.header}>
        <div>
          <Button
            onClick={() => handleMultipleDeleteGroups(selectedRows)}
            className={clsx('primary-btn', styles.headerButtons)}
            variant="outlined"
            color="primary"
            startIcon={<DeleteIcon style={{ fontSize: '1rem' }} />}
            style={{ marginRight: 10 }}
            disabled={
              selectedRows.length < 1 ||
              delMutationLoading ||
              isDeletingMultiple
            }
          >
            <span>Delete</span>
            {selectedRows.length > 0 && (
              <span>{`(${selectedRows.length})`}</span>
            )}
          </Button>
          <Button
            className={`secondary-btn ${styles.headerButtons}`}
            variant="contained"
            color="secondary"
            onClick={() => history.push(`${match.url}/create-group`)}
          >
            Create Group
          </Button>
        </div>
      </div>

      <div
        className={styles.tableContainer}
        style={{
          pointerEvents:
            delMutationLoading || isDeletingMultiple ? 'none' : 'initial',
        }}
      >
        {(isFetching || delMutationLoading || isDeletingMultiple) && (
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
          onRowSelect={handleGroupSelect}
          sortBy={tableColumns[0].id}
          allowSelectAll
          disabled={isFetching || delMutationLoading || isDeletingMultiple}
          isEmpty={tableRows.length < 1 && !isFetching}
          emptyText="No Groups Found"
        />
      </div>
    </>
  );
};

export default GroupsList;
