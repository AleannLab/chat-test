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
import CloseIcon from '@material-ui/icons/Close';
import { compact } from 'lodash';
import SearchIcon from '@material-ui/icons/Search';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import Avatar from 'components/Avatar';
import CONSTANTS from 'helpers/constants';
import TableHead from 'components/Core/Table/TableHead';
import Skeleton from 'components/Core/Table/Skeleton';
import styles from './index.module.css';
import Checkbox from 'components/Core/Checkbox';

const ButtonsAddUsersToGroupModal = ({
  isNewGroup,
  handleBack,
  handleDone,
  isDisabled,
  setSelectUsers,
  handleCloseAddNewModeratorsModal,
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
            onClick={handleDone}
            disabled={isDisabled}
          >
            Done
          </Button>
        </>
      ) : (
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={handleCloseAddNewModeratorsModal}
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

const SelectGroupAdminsModal = ({
  isNewGroup = true,
  open,
  setOpen,
  setOpenBack,
  users,
  setUsers,
  setGroupName,
  setSelectedChannel,
  handleCloseAddNewModeratorsModal,
  setSelected,
  resultGroupCreating,
  setResultGroupCreating,
  setGroupAvatar,
}) => {
  const { utils, authentication, kittyOfficeChat } = useStores();
  const authToken = useAuthToken();
  const tableRows = useRef([]);
  const [rows, setRows] = useState([]);
  const [isTableEmpty, setIsTableEmpty] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCreateChatChannel = async () => {
    const moderators = [
      { username: authentication.user.email },
      ...selectedRows.map((user) => {
        return { username: user.email };
      }),
    ];

    if (resultGroupCreating) {
      let resultAddedModerators;

      for (const moderator of moderators) {
        resultAddedModerators = await kittyOfficeChat.addGroupChannelModerator(
          resultGroupCreating.id,
          moderator,
        );
      }
      if (resultAddedModerators.status) {
        const newChannel = await kittyOfficeChat.getChannel(
          resultGroupCreating.id,
        );
        setSelectedChannel(newChannel.channel);
        setResultGroupCreating(null);
        setOpen(false);
        setSelectedRows([]);
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
    id,
    firstName,
    lastName,
    email,
    display_image,
    mobile_no,
  ) => {
    const imgUrl = utils.prepareMediaUrl({ uuid: display_image, authToken });
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

      const currentUserData = createTableRowComponent(
        user.user_id,
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

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedRows(rows);
      return;
    }
    setSelectedRows([]);
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

  const setSelectUsers = () => {
    setUsers(selectedRows);
    handleCloseAddNewModeratorsModal();
  };

  useEffect(() => {
    if (users.length > 0) {
      setTableContent();
    }
  }, [users, authToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickOnRow = (row) => {
    let data = [];
    if (selectedRows.includes(row)) {
      data = selectedRows.filter((x) => x.id !== row.id);
    } else {
      data = [...selectedRows, row];
    }
    setSelectedRows(data);
  };

  const onDeleting = async () => {
    const resultDeleting = await kittyOfficeChat.deleteChannel(
      resultGroupCreating,
    );
    if (resultDeleting.succeeded) {
      setResultGroupCreating(null);
      setOpen(false);
      setGroupName('');
      setGroupAvatar(null);
      closeModal();
    }
  };

  const closeModal = () => {
    setSelected([]);
    setSelectedRows([]);
    handleCloseAddNewModeratorsModal();
  };

  const handleClose = () => {
    if (isNewGroup) {
      onDeleting();
    } else {
      closeModal();
    }
  };

  const handleBack = () => {
    handleClose();
    setOpenBack(true);
  };

  const handleRequestSort = () => {};

  const isSelected = (id) => {
    return selectedRows.some((x) => x.id == id);
  };

  const handleDone = () => {
    handleCreateChatChannel();
    handleCloseAddNewModeratorsModal();
    setUsers([]);
    setGroupName('');
    setSelected([]);
  };

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
          <div className={styles.titleText}>Select Group Admins</div>
        </DialogTitle>
        <DialogContent className={'mx-5 mb-5'}>
          <div className={styles.searchBarWidth}>
            <SearchIcon />
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
                      numSelected={selectedRows.length}
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
              handleBack={handleBack}
              handleDone={handleDone}
              isNewGroup={isNewGroup}
              isDisabled={selectedRows.length === 0}
              handleCloseAddNewModeratorsModal={
                handleCloseAddNewModeratorsModal
              }
              setSelectUsers={setSelectUsers}
            />
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectGroupAdminsModal;
