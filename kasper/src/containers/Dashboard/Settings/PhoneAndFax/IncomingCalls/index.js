import React, { useState, useEffect, useMemo } from 'react';
import styles from './index.module.css';
import Table from 'components/Core/Table';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import LinearProgress from '@material-ui/core/LinearProgress';
import Avatar from 'components/Avatar';
import Switch from 'components/Core/Switch';
import { useAuthToken } from 'hooks/useAuthToken';
import HardwarePhoneIcon from 'assets/images/telephone.svg';
import Editable from 'components/Core/Editable';

const IncomingCalls = () => {
  const authToken = useAuthToken();
  const {
    incomingCalls: incomingCallsStore,
    notification,
    utils,
    users,
  } = useStores();
  const [updatingUser, setUpdatingUser] = useState(false);

  const {
    data: usersData,
    isFetching,
    isFetched,
    refetch: refetchUsers,
  } = useQuery('usersWithPhoneAccess', () => users.getUsersWithPhoneAccess(), {
    initialData: [],
  });

  // Handle switch button change event
  const incomingCallsToggle = async (userId, incomingCalls) => {
    try {
      setUpdatingUser(true);
      await incomingCallsStore.setIncomingCalls(userId, incomingCalls);
      await refetchUsers();
      setUpdatingUser(false);
    } catch (err) {
      notification.showError(
        'An unexpected error occurred while attempting to change the call permission',
      );
    }
  };

  const handleUpdate = async (user_id, username) => {
    try {
      setUpdatingUser(true);
      await users.userUpdate({ user_id, username });
      await refetchUsers();
      setUpdatingUser(false);
    } catch (e) {
      console.error(e);
      notification.showError(
        'An unexpected error occurred while attempting to update the user name',
      );
    }
  };

  // Generate table data which includes table headers and body
  const createTableData = (data) => {
    const userRows = [];
    for (const {
      userUuid: id,
      fullname: userName,
      incomingCalls,
      displayImage,
      mac_address,
      email,
    } of data) {
      const [firstName, lastName] = userName.split(' ');

      const userImg = displayImage?.length
        ? utils.prepareMediaUrl({ uuid: displayImage, authToken })
        : '';
      const userAvatar = (
        <Avatar
          className={mac_address && 'p-2'}
          src={mac_address ? HardwarePhoneIcon : userImg}
          firstName={firstName}
          id={id ?? 100}
          lastName={lastName}
        />
      );

      const name = (
        <div className={styles.avatarName}>
          {userAvatar}
          <div className={styles.info}>
            <Editable
              loading={isFetching || updatingUser}
              text={userName}
              onUpdate={(text) => handleUpdate(id, text)}
            />
            <span className={styles.email}>
              {mac_address ? '(Hardware Phone)' : email ?? ''}
            </span>
          </div>
        </div>
      );

      const callPermission = (
        <ControlledSwitch
          name="callPermission"
          checked={incomingCalls}
          onChange={(checked) => incomingCallsToggle(id, checked)}
        />
      );

      userRows.push({ id, name, callPermission });
    }

    return {
      tableColumns: [
        {
          id: 'name',
          numeric: false,
          width: '70%',
          disablePadding: false,
          label: 'Active Phones/Users',
        },
        {
          id: 'callPermission',
          numeric: false,
          width: '30%',
          disablePadding: false,
          label: `Receive Calls`,
        },
      ],
      tableRows: userRows,
    };
  };

  const tableData = useMemo(
    () => createTableData(usersData),
    [usersData, isFetching, updatingUser], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className={styles.root}>
      <div className={styles.header}>Incoming Calls</div>
      <div className={styles.subHeader}>
        Select which phones/users will receive incoming calls
      </div>

      <div
        style={{
          position: 'relative',
          height: '100%',
          pointerEvents: updatingUser ? 'none' : 'initial',
        }}
      >
        {(isFetching || updatingUser) && (
          <LinearProgress
            color="secondary"
            className={styles.tableProgressBar}
          />
        )}

        {!!tableData && (
          <Table
            columns={tableData.tableColumns}
            rows={tableData.tableRows}
            sortBy={tableData.tableColumns[0].id}
            height="100%"
            isSelectable={false}
            isEmpty={isFetched && !tableData.tableRows.length}
            emptyText=""
          />
        )}
      </div>
    </div>
  );
};

export default IncomingCalls;

const ControlledSwitch = ({ name, checked, onChange, isDisabled }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    if (onChange) onChange(event.target.checked);
  };

  return (
    <Switch
      name={name}
      checked={!!isChecked}
      onClick={handleChange}
      disabled={isDisabled}
    />
  );
};
