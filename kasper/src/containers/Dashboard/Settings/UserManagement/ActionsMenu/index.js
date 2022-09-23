import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Modal from 'components/Core/Modal';
import DeleteIcon from '@material-ui/icons/Delete';
import UserPermissions from '../UserPermissions';
import { useStores } from 'hooks/useStores';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';
import ReplayIcon from '@material-ui/icons/Replay';
import { ReactComponent as MoreIcon } from 'assets/images/table-more.svg';

const ActionsMenu = (props) => {
  const { onChangeValue, menuItems } = props;
  const [open, setOpen] = useState(false);
  const [permissionsModalActive, setPermissionsModalActive] = useState(false);
  const anchorRef = useRef(null);
  const { permissions, users, notification, authentication } = useStores();
  const queryClient = useQueryClient();
  const history = useHistory();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleItemClick = (menuItem) => {
    if (menuItem.label === 'Edit Permissions') {
      setPermissionsModalActive(true);
    } else if (menuItem.label === 'Resend Invite') {
      resendInvite(props.email);
    } else if (menuItem.label === 'Revoke Invite') {
      props.handleDeleteUser(props.userId);
    }
  };
  const resendInvite = async (email) => {
    await users.inviteResend({ email });
  };
  const getProperIcon = (label) => {
    if (label === 'Edit Permissions') {
      return <PencilIcon />;
    } else if (label === 'Resend Invite') {
      return <ReplayIcon />;
    } else if (label === 'Revoke Invite') {
      return <DeleteIcon />;
    }
  };
  const changeRole = async (roleName) => {
    const user_id = props.user_id;
    await users.changeUserRole({ user_id, roleName }).then(() => {
      if (
        user_id === authentication.user.user_id &&
        roleName === 'General User'
      ) {
        history.push('/dashboard/office-task');
      }
    });
  };
  const handleModalClose = async (editedPermissions, accountType) => {
    setPermissionsModalActive(false);
    if (accountType !== props.userAccountType) {
      await changeRole(accountType);
    }
    if (editedPermissions != null) {
      await permissions.updateUserPermissions(props.userId, editedPermissions);
      props.userId === authentication.user.id &&
        queryClient.invalidateQueries([
          'userPermissions',
          authentication.user.id,
        ]);
      queryClient.invalidateQueries(['officeConfigs', 'integrations']);
      notification.showSuccess('User permissions updated successfully');
      setTimeout(() => {
        notification.hideNotification();
      }, 3000);
    }
    props.handleModalClose();
  };
  return (
    <div className={styles.root}>
      <div>
        <div
          ref={anchorRef}
          onClick={handleToggle}
          className={styles.selectMenu}
        >
          <div className="d-flex">
            <div>
              <span>{<MoreIcon />}</span>
            </div>
          </div>
        </div>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          placement="bottom-start"
          style={{ zIndex: 1 }}
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'center top' }}
            >
              <Paper
                elevation={4}
                style={{ maxHeight: 160, overflowY: 'auto' }}
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="menu-list-grow"
                    className="p-0"
                    onKeyDown={handleListKeyDown}
                  >
                    {menuItems.map((menuItem, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          handleItemClick(menuItem);
                          setOpen(false);
                        }}
                        value=""
                        className={styles.menuItem}
                      >
                        <div className="d-flex">
                          <div className={styles.menuItemIcon}>
                            {getProperIcon(menuItem.label)}
                          </div>
                          <div>{menuItem.label}</div>
                        </div>
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>

      {permissionsModalActive && (
        <Modal
          size="sm"
          header="Edit Permissions"
          body={
            <UserPermissions
              userId={props.userId}
              userAccountType={props.userAccountType}
              userName={props.userName}
              userEmail={props.email}
              closePermissionsModal={() => setPermissionsModalActive(false)}
              commitPermissionChanges={handleModalClose}
            />
          }
          onClose={() => setPermissionsModalActive(false)}
          footer={<></>}
        ></Modal>
      )}
    </div>
  );
};

export default ActionsMenu;
