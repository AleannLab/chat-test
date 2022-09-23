import React, { useState, useEffect, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import Avatar from 'components/Avatar';
import Button from '@material-ui/core/Button';
import ReplayIcon from '@material-ui/icons/Replay';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { useHistory, useRouteMatch } from 'react-router-dom';
import styles from './index.module.css';
import Table from 'components/Core/Table';
import Menu from './Menu';
import ActionsMenu from './ActionsMenu';
import { useStores } from 'hooks/useStores';
import clsx from 'clsx';
import { useAuthToken } from 'hooks/useAuthToken';
import CONSTANTS from 'helpers/constants';

const statusTypes = [
  {
    label: 'Active',
    value: 1,
    icon: <FiberManualRecordIcon style={{ color: '#61A6E7' }} />,
  },
  {
    label: 'Invited',
    value: 2,
    icon: <FiberManualRecordIcon style={{ color: '#F4803F' }} />,
  },
  {
    label: 'Inactive',
    value: 3,
    icon: <FiberManualRecordIcon style={{ color: '#DDDDDD' }} />,
  },
];

const tableColumns = [
  { id: 'name', width: '40%', disablePadding: false, label: 'Name' },
  {
    id: 'accountType',
    width: '20%',
    disablePadding: false,
    label: 'Account type',
    showFilter: true,
    filterValues: ['Admin', 'General User'],
  },
  {
    id: 'status',
    width: '20%',
    disablePadding: false,
    label: 'Status',
    showFilter: true,
    filterValues: statusTypes.map(({ label }) => label),
    filterFunction: (rows, value) =>
      rows.filter(({ statusName }) => statusName === value),
  },
  {
    id: 'actions',
    width: '20%',
    disablePadding: false,
    label: 'Actions',
  },
];
const accountTypes = [
  { label: 'Admin', value: 1 },
  { label: 'General User', value: 2 },
];

const prepareActionList = (status) => {
  if (status === 'Invited') {
    return [
      { label: 'Edit Permissions', value: 1 },
      { label: 'Resend Invite', value: 2 },
      { label: 'Revoke Invite', value: 3 },
    ];
  } else {
    return [{ label: 'Edit Permissions', value: 1 }];
  }
};

const UserManagement = () => {
  const { users, utils, authentication, notification, permissions } =
    useStores();
  const history = useHistory();
  const match = useRouteMatch('/dashboard/settings/user-management');
  const [selectedRows, setSelectedRows] = useState([]);
  const authToken = useAuthToken();
  const [tableRows, setTableRows] = useState([]);
  const [usersPermissions, setUsersPermissions] = useState(null);
  const [subPermissions, setSubPermissions] = useState(false);
  const [groupPermissions, setGroupPermissions] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const filterConfigRef = useRef(null);

  const getPermissions = async () => {
    const usersPermissionsData = await permissions.getUsersPermissions();
    const subPermissions = await permissions.getSubPermissions();
    const groupPermissions = await permissions.getGroupPermissions();
    const userRoles = await permissions.getRoles();
    permissions.prepareJSONPermissions();
    permissions.getAdminPermissions();
    setSubPermissions(subPermissions);
    setUsersPermissions(usersPermissionsData);
    setGroupPermissions(groupPermissions);
  };

  useEffect(() => {
    (async () => {
      await getPermissions();
      setLoadingPermissions(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!usersPermissions || !subPermissions || !groupPermissions) return;
    setTableContent();
  }, [
    usersPermissions,
    subPermissions,
    groupPermissions,
    users.data,
    loadingPermissions,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const setTableContent = () => {
    const tableRows = [];
    for (let i = 0; i < users.data.length; i++) {
      const user = users.data[i];
      const userData = users.get([{}, user]);
      const loggedInUser = authentication.user || {};
      const kaspSuppEmail = ['support@meetkasper.com'];
      if (
        kaspSuppEmail.includes(userData.email) &&
        CONSTANTS.ENV === 'prod' &&
        !kaspSuppEmail.includes(loggedInUser.email) &&
        !loggedInUser.email.includes('@meetkasper.com')
      ) {
        continue;
      }
      const [firstName = '', lastName = ''] = userData.username
        ? userData.username.split(' ')
        : ['', ''];

      const currentUserData = createData(
        userData.user_id,
        userData.id,
        firstName,
        lastName,
        userData.email,
        userData.account_type,
        userData.status,
        userData.display_image,
        userData.mobile_no,
        subPermissions,
        groupPermissions,
      );
      tableRows.push(currentUserData);
    }
    setTableRows(tableRows);
  };

  const handleModalClose = async () => {
    const usersPermissionsData = await permissions.getUsersPermissions();
    setUsersPermissions(usersPermissionsData);
    setTableContent();
  };
  const createData = (
    user_id,
    id,
    firstName,
    lastName,
    email,
    accountType,
    statusName,
    display_image,
    mobile_no,
    subPermissions,
    groupPermissions,
  ) => {
    const imgUrl = utils.prepareMediaUrl({ uuid: display_image, authToken });
    const userAvatar = (
      <Avatar
        uuid={display_image}
        firstName={firstName}
        lastName={lastName}
        id={id}
        mobileNo={mobile_no}
        src={imgUrl}
      />
    );

    const name = (
      <div className={styles.avatarName}>
        {userAvatar}
        <div className={styles.info}>
          <span>
            {firstName} {lastName}
          </span>
          <span className={styles.email}>{email}</span>
        </div>
      </div>
    );

    let status = null;
    if (statusName === 'Invited') {
      status = (
        <span style={{ color: 'gray' }} className={styles.inviteText}>
          <ErrorOutlineIcon />
          Pending invite
        </span>
      );
    } else if (statusName === 'Active') {
      status = (
        <Menu
          value={statusTypes.find(
            (_status) =>
              _status.label.toLowerCase() === statusName.toLowerCase(),
          )}
          disabled={loadingPermissions}
          onChangeValue={async (value) => {
            await changeStatus(user_id, value);
          }}
          menuItems={[statusTypes[2]]}
        />
      );
    } else if (statusName === 'Inactive') {
      status = (
        <Menu
          value={statusTypes.find(
            (_status) =>
              _status.label.toLowerCase() === statusName.toLowerCase(),
          )}
          disabled={loadingPermissions}
          onChangeValue={async (value) => {
            await changeStatus(user_id, value);
          }}
          menuItems={[statusTypes[0]]}
        />
      );
    }

    const action = (
      <ActionsMenu
        menuItems={prepareActionList(statusName)}
        userId={id}
        user_id={user_id}
        userName={`${firstName} ${lastName || ''}`.trim()}
        userAccountType={accountType}
        subPermissions={subPermissions}
        groupPermissions={groupPermissions}
        usersPermissions={usersPermissions}
        handleModalClose={handleModalClose}
        email={email}
        handleDeleteUser={handleDeleteUser}
      />
    );

    return {
      user_id,
      id,
      name,
      accountType,
      status,
      action,
      statusName,
    };
  };

  const changeStatus = async (user_id, value) => {
    setLoadingPermissions(true);
    const changedStatus = statusTypes.find(
      (status) => status.value === value && status.label,
    );
    const labelName = changedStatus.label;
    await users.changeUserStatus({ user_id, labelName });
    await getPermissions();
    setLoadingPermissions(false);
  };

  const handleContactSelect = (data) => {
    setSelectedRows(data);
  };

  const getUserId = users.data.map((user) => {
    const userData = users.get([{}, user]);
    return { user_id: userData.user_id, id: userData.id };
  });

  const handleDeleteUser = (userId) => {
    let deleteUsers = [];

    if (typeof userId == 'number') {
      deleteUsers.push(getUserId.find((user) => user.id == userId).user_id);
    } else {
      deleteUsers = getUserId
        .filter((user) => selectedRows.includes(user.id))
        .map((user) => user.user_id);
    }

    notification.showInfo('Deactivating User(s), Please Wait...');

    deleteUsers.forEach(async (userId) => {
      await users.changeDeactivateUserStatus(userId);
      users.data.forEach((user) => {
        const userData = users.get([{}, user]);
        const [firstName = '', lastName = ''] = userData.username
          ? userData.username.split(' ')
          : ['', ''];
        return createData(
          userData.user_id,
          userData.id,
          firstName,
          lastName,
          userData.email,
          userData.account_type,
          userData.status,
          userData.display_image,
          userData.mobile_no,
        );
      });
      setSelectedRows([]);

      notification.showSuccess(
        'User(s) deactivated successfully! Refreshing User Management List...',
      );
      setTimeout(() => {
        notification.hideNotification();
      }, 5000);

      getPermissions();

      console.log('deletedUser', userId);
    });
  };

  return (
    <>
      <Grid className={styles.root}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>User Management</div>
          <div>
            {selectedRows.length ? (
              <Button
                className={clsx('primary-btn', styles.headerButtons)}
                variant="outlined"
                color="primary"
                style={{ marginRight: 10 }}
                onClick={handleDeleteUser}
              >
                <span>Deactivate</span>
                {selectedRows.length ? (
                  <span>({selectedRows.length})</span>
                ) : null}
              </Button>
            ) : null}
            <Button
              className={`secondary-btn ${styles.headerButtons}`}
              variant="contained"
              color="secondary"
              onClick={() => history.push(`${match.url}/invite-user`)}
            >
              Invite User
            </Button>
          </div>
        </div>
        <div className={styles.tableContainer}>
          <Table
            columns={tableColumns}
            rows={tableRows}
            selected={selectedRows}
            onRowSelect={handleContactSelect}
            sortBy={tableColumns[0].id}
            allowSelectAll
            isEmpty={users.loaded && !users.data.length}
          />
        </div>
      </Grid>
    </>
  );
};

export default UserManagement;
