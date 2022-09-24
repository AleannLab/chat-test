import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  InputBase,
} from '@material-ui/core';
import MuiTable from '@material-ui/core/Table';
import CloseIcon from '@material-ui/icons/Close';
import Person from '@material-ui/icons/Person';
import { compact, last } from 'lodash';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import Avatar from 'components/Avatar';
// import Table from 'components/Core/Table';
import SearchIcon from '@material-ui/icons/Search';
import CONSTANTS from 'helpers/constants';
import TableHead from 'components/Core/Table/TableHead';
import Skeleton from 'components/Core/Table/Skeleton';
import { Scrollbars } from 'react-custom-scrollbars';
import styles from './index.module.css';
import Checkbox from 'components/Core/Checkbox';

const ButtonsAddUsersToGroupModal = ({
  isNewGroup,
  handleBack,
  handleNextStep,
  isDisabled,
  setSelectUsers,
  handleCloseAddNewMemberModal,
}) => {
  return (
    <>
      {isNewGroup ? (
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={handleBack}
          >
            Back
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={handleNextStep}
            disabled={isDisabled}
          >
            Next
          </Button>
        </>
      ) : (
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={handleCloseAddNewMemberModal}
          >
            Cancel
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={setSelectUsers}
            disabled={isDisabled}
          >
            Add
          </Button>
        </>
      )}
    </>
  );
};

const AddUsersToGroupChatModal = ({
  isNewGroup = true,
  open,
  handleCloseAddNewMemberModal,
  setOpenBack,
  setOpenNext,
  users,
  setUsers,
  setSelected,
  selected = [],
  resultGroupCreating,
  setResultGroupCreating,
  setGroupName,
  setGroupAvatar,
}) => {
  const { utils, authentication, kittyOfficeChat, notification } = useStores();
  const authToken = useAuthToken();
  const tableRows = useRef([]);
  const [rows, setRows] = useState([]);
  const [isTableEmpty, setIsTableEmpty] = useState(null);

  const handleAddUsersToChannel = async (users) => {
    const members = [
      ...users.map((user) => {
        return { username: user.email };
      }),
    ];

    if (resultGroupCreating) {
      let resultAdded;

      for (const user of users) {
        await kittyOfficeChat.createUser(user.email, user.username);
      }
      for (const member of members) {
        resultAdded = await kittyOfficeChat.addGroupChannelMember(
          resultGroupCreating.id,
          member,
        );
      }

      if (resultAdded.status === 200) {
        const newChannel = await kittyOfficeChat.getChannel(
          resultGroupCreating.id,
        );
        setResultGroupCreating(newChannel.channel);
        console.log('result', newChannel.channel);
      } else {
        console.log(resultAdded.error);
      }
    }
  };

  useEffect(() => {
    const empty = users && !users.length;
    setIsTableEmpty(empty);
  }, [users]);

  const tableColumns = [
    { id: 'name', width: '100%', disablePadding: false, label: 'Name' },
  ];

  const createTableRowComponent = (
    user_id,
    imgUrl,
    id,
    firstName,
    lastName,
    email,
    display_image,
    mobile_no,
  ) => {
    const userAvatar = (
      <Avatar
        uuid={display_image}
        firstName={firstName}
        lastName={lastName}
        id={user_id}
        mobileNo={mobile_no}
        src={imgUrl}
      />
    );

    const displayName =
      firstName || lastName ? `${firstName || ''} ${lastName || ''}` : email;

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

    return {
      user_id,
      id,
      email,
      displayName,
      name,
    };
  };

  const createAvatar = ({ username, display_image, mobile_no, user_id }) => {
    const imgUrl = utils.prepareMediaUrl({ uuid: display_image, authToken });
    const [firstName = '', lastName = ''] = username.split(' ');
    return (
      <Avatar
        height={58}
        width={58}
        uuid={display_image}
        firstName={firstName}
        lastName={lastName}
        id={user_id}
        mobileNo={mobile_no}
        src={imgUrl}
      />
    );
  };

  const setTableContent = () => {
    const rows = users.map((user) => {
      const loggedInUser = authentication.user || {};
      const kaspSuppEmail = ['support@meetkasper.com'];
      if (
        (kaspSuppEmail.includes(user.email) &&
          CONSTANTS.ENV === 'prod' &&
          !kaspSuppEmail.includes(loggedInUser.email)) ||
        user.email == loggedInUser.email
      ) {
        return;
      }
      const [firstName = '', lastName = ''] = user.username
        ? user.username.split(' ')
        : ['', ''];
      const imgUrl = utils.prepareMediaUrl({
        uuid: user.display_image,
        authToken,
      });

      const currentUserData = createTableRowComponent(
        user.user_id,
        imgUrl,
        user.id,
        firstName,
        lastName,
        user.email,
        user.display_image,
        user.mobile_no,
      );
      return currentUserData;
    });
    tableRows.current = compact(rows);
    setRows(compact(rows));
  };

  const searchMembers = (event) => {
    const value = event.target.value.toLowerCase();
    if (value) {
      const newTableRows = tableRows.current.filter(({ displayName }) =>
        displayName.toLowerCase().includes(value),
      );
      setRows(newTableRows);
    } else {
      setRows(tableRows.current);
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      setTableContent();
    }
  }, [users, authToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickOnRow = (row) => {
    let data = [];
    if (selected.includes(row)) {
      data = selected.filter((x) => x.id !== row.id);
    } else {
      data = [...selected, row];
    }
    setSelected(data);
  };

  const handleBack = () => {
    handleClose();
    setUsers([]);
    setOpenBack(true);
  };

  const closeModal = () => {
    handleCloseAddNewMemberModal();
    setSelected([]);
  };

  const handleClose = () => {
    if (isNewGroup) {
      onDeleting();
    } else {
      closeModal();
    }
  };

  const onDeleting = async () => {
    const resultDeleting = await kittyOfficeChat.deleteChannel(
      resultGroupCreating,
    );
    if (resultDeleting.succeeded) {
      setResultGroupCreating(null);
      closeModal();
      setGroupName('');
      setGroupAvatar(null);
      // notification.showSuccess('group deleted');
    } else {
      notification.showSuccess('group not deleted');
    }
    console.log('result', resultDeleting.data);
  };

  const handleRequestSort = () => {};

  const isSelected = (id) => {
    return selected.some((x) => x.id == id);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(rows);
      return;
    }
    setSelected([]);
  };

  const setSelectUsers = () => {
    setUsers(
      users.filter((user) => selected.some((row) => row.id === user.id)),
    );
    handleCloseAddNewMemberModal();
  };

  const handleNextStep = () => {
    handleAddUsersToChannel(
      users.filter((user) => selected.some((row) => row.id === user.id)),
    );
    setSelectUsers();
    setOpenNext(true);
  };

  const deleteSelectedRow = (user) => {
    setSelected(selected.filter((row) => row.id !== user.id));
  };

  const selectedUsers = users?.filter((x) =>
    selected.some((item) => item.id === x.id),
  );

  return (
    <>
      <Dialog
        onClose={handleClose}
        open={open}
        disableBackdropClick
        maxWidth="md"
        classes={{
          scrollPaper: styles.scrollPaper,
          paper: styles.dialogPaper,
        }}
      >
        <DialogTitle disableTypography className="p-0">
          <div className="d-flex justify-content-end">
            <IconButton aria-label="close" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>
          <div className={styles.titleText}>Add Users to Group</div>
        </DialogTitle>
        <DialogContent className={'mx-5 mb-5'}>
          <div className={styles.avatarContainer}>
            {selectedUsers.length ? (
              selectedUsers
                .slice(0, selectedUsers?.length <= 7 ? 7 : 6)
                .map((user) => {
                  const firstName = user.username.split(' ')[0];
                  return (
                    <div className={styles.avatar} key={user.id}>
                      {createAvatar(user)}
                      <span>{firstName}</span>
                      <div
                        onClick={() => deleteSelectedRow(user)}
                        className={styles.avatar_cross}
                      >
                        X
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className={styles.avatar}>
                <div className={styles.avatarNone}>
                  <Person />
                </div>
                <span>None</span>
              </div>
            )}
            {selectedUsers.length > 7 && (
              <div className={styles.avatar}>
                <div className={styles.usersOverSize}>
                  + {selectedUsers.length - 6}
                </div>
                <span>None</span>
              </div>
            )}
          </div>
          <div className={styles.searchBarWidth}>
            <SearchIcon className="me-1" />
            <InputBase
              fullWidth
              placeholder="Search..."
              onChange={searchMembers}
            />
          </div>
          <div className={styles.tableContainer}>
            <TableContainer style={{ width: '500px', maxHeight: '550px' }}>
              <div
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    inset: '0px',
                    overflow: 'scroll',
                    marginRight: '-14px',
                    marginBottom: '-14px',
                  }}
                >
                  <Table
                    className={styles.table}
                    aria-labelledby="tableTitle"
                    size="medium"
                    aria-label="enhanced table"
                    stickyHeader
                  >
                    <TableHead
                      cellWidth={Math.floor(100 / tableColumns.length)}
                      columns={tableColumns}
                      rows={rows}
                      numSelected={selected.length}
                      isSelectable={true}
                      orderBy={tableColumns[0].id}
                      onRequestSort={handleRequestSort}
                      rowCount={rows.length}
                      allowSelectAll={true}
                      enableSearchBar={true}
                      onSelectAllClick={handleSelectAllClick}
                      isPositionLeft={false}
                    />
                    <TableBody>
                      {rows.length ? (
                        rows.map((row, index) => {
                          const isItemSelected = isSelected(row.id);
                          const labelId = `enhanced-table-checkbox-${index}`;
                          return (
                            <TableRow
                              hover
                              aria-checked={isItemSelected}
                              tabIndex={-1}
                              key={row.id}
                              selected={isItemSelected}
                              className={
                                isItemSelected
                                  ? styles.selectionColor
                                  : styles.hideSelectionColor
                              }
                              onClick={() => handleClickOnRow(row)}
                            >
                              {Object.keys(row)
                                .filter(
                                  (rowKey) =>
                                    rowKey !== 'user_id' &&
                                    rowKey !== 'id' &&
                                    rowKey !== 'email' &&
                                    rowKey !== 'displayName',
                                )
                                .map((rowKey, i) => (
                                  <Fragment key={i}>
                                    <TableCell align={rows[i]?.align}>
                                      {row[rowKey]}
                                    </TableCell>
                                    <TableCell
                                      padding="checkbox"
                                      align={rows[i]?.align}
                                    >
                                      <Checkbox
                                        checked={isItemSelected}
                                        inputProps={{
                                          'aria-labelledby': labelId,
                                        }}
                                      />
                                    </TableCell>
                                  </Fragment>
                                ))}
                            </TableRow>
                          );
                        })
                      ) : isTableEmpty ? (
                        <TableRow>
                          <TableCell className={styles.emptyTextContainer}>
                            No Active user
                          </TableCell>
                        </TableRow>
                      ) : (
                        <Skeleton columns={rows} />
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div style={{ position: 'absolute', height: '6px' }}>
                  <div
                    style={{
                      position: 'relative',
                      display: 'block',
                      height: '100%',
                      cursor: 'pointer',
                      borderRadius: 'inherit',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      width: '0px',
                    }}
                  ></div>
                </div>
              </div>
            </TableContainer>
          </div>
          <DialogActions className="px-0" style={{ marginTop: '40px' }}>
            <ButtonsAddUsersToGroupModal
              isNewGroup={isNewGroup}
              handleBack={handleBack}
              setSelectUsers={setSelectUsers}
              handleNextStep={handleNextStep}
              handleCloseAddNewMemberModal={handleCloseAddNewMemberModal}
              isDisabled={selected.length < 1}
            />
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUsersToGroupChatModal;
