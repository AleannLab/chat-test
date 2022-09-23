import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  Table,
  TableSortLabel,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  InputBase,
} from '@material-ui/core';
import MuiTable from '@material-ui/core/Table';
import CloseIcon from '@material-ui/icons/Close';
import { compact, last } from 'lodash';
import SearchIcon from '@material-ui/icons/Search';
import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import Avatar from 'components/Avatar';
import CONSTANTS from 'helpers/constants';
import { search } from 'helpers/search';
import TableHead from 'components/Core/Table/TableHead';
import Skeleton from 'components/Core/Table/Skeleton';
import styles from './index.module.css';

const AddNewChatModal = ({ open, setOpen, users, setSelectedChannel }) => {
  const { utils, authentication, kittyOfficeChat } = useStores();
  const authToken = useAuthToken();
  const tableRows = useRef([]);
  const [rows, setRows] = useState([]);
  const [isTableEmpty, setIsTableEmpty] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const empty = users && !users.length;
    setIsTableEmpty(empty);
  }, [users]);

  const tableColumns = [
    { id: 'name', width: '100%', disablePadding: false, label: 'Name' },
  ];

  const createName = (firstName, lastName, email) =>
    firstName || lastName ? `${firstName || ''} ${lastName || ''}` : email;

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

    const displayName = createName(firstName, lastName);

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

  const searchMembers = (event) => {
    search(event.target.value, tableRows.current, setRows);
  };

  useEffect(() => {
    if (users.length > 0) {
      setTableContent();
    }
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickOnRow = (row) => {
    const data = selectedRow && selectedRow.id == row.id ? null : row;
    setSelectedRow(data);
    setDisplayName(data.displayName);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const handleRequestSort = () => {};

  const isSelected = (id) => {
    return selectedRow ? selectedRow.id == id : false;
  };

  const handleCreateChatChannel = async () => {
    const username = selectedRow ? selectedRow.email : null;
    if (!username) {
      return;
    }
    //TODO delete after all tests needed for fixing incorrect user
    // const result = await kittyOfficeChat.createUser(username, displayName);

    // console.log('checkUserExists', result);
    // if (result.status) {
    //   await kittyOfficeChat.deleteUser(result.data.id);
    // }

    const createdUser = await kittyOfficeChat.createUser(username, displayName);
    if (createdUser?.status === 200) {
      const imgSrc =
        selectedRow?.name && selectedRow?.name?.props?.children[0]?.props?.src;
      const id = createdUser.data.id;
      imgSrc &&
        (await kittyOfficeChat.updateUserDisplayPicture(id, imgSrc, 200));
    }
    const members = [
      { username: authentication.user.email },
      { username: username },
    ];
    const result = await kittyOfficeChat.createMessageChannel(
      'DIRECT',
      members,
    );
    if (result.succeeded) {
      setSelectedChannel(result.channel);
      handleClose();
    }
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
          <div className={styles.titleText}>New Chat</div>
        </DialogTitle>
        <DialogContent className={'mx-5 mb-5'}>
          <div className="d-flex align-items-center justify-content-between">
            <div className={styles.searchBarWidth}>
              <SearchIcon className="me-1" />
              <InputBase
                fullWidth
                placeholder="Search..."
                onChange={searchMembers}
              />
            </div>
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
                      rows={tableColumns}
                      numSelected={1}
                      isSelectable={false}
                      orderBy={tableColumns[0].id}
                      onRequestSort={handleRequestSort}
                      rowCount={tableColumns.length}
                      allowSelectAll={false}
                      enableSearchBar={true}
                      onSelectAllClick={() => {}}
                    />
                    <TableBody>
                      {rows.length ? (
                        rows.map((row, index) => {
                          const isItemSelected = isSelected(row.id);
                          return (
                            <TableRow
                              hover
                              aria-checked={isItemSelected}
                              tabIndex={-1}
                              key={row.id}
                              selected={isItemSelected}
                              className={
                                isItemSelected ? '' : styles.hideSelectionColor
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
                                  <TableCell key={i} align={rows[i]?.align}>
                                    {row[rowKey]}
                                  </TableCell>
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
            <Button
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Cancel
            </Button>

            <Button
              className="secondary-btn"
              variant="contained"
              color="secondary"
              onClick={handleCreateChatChannel}
            >
              Done
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNewChatModal;
