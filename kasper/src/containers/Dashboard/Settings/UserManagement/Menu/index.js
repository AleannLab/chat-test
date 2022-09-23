import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';
import { useStores } from 'hooks/useStores';
import Skeleton from '@material-ui/lab/Skeleton';

const Menu = (props) => {
  const { value, onChangeValue, menuItems } = props;
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(value);
  const anchorRef = useRef(null);
  const { notification } = useStores();
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [menuInfo, setMenuInfo] = useState('');

  useEffect(() => {
    setSelectedItem(value);
  }, [value]);

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

  const handleItemClick = (menu) => {
    setMenuInfo(menu);
    const { adminCount, currentUserId, userId } = props;
    const { label } = menu;
    // Prevent user from changing account type to general user if only one admin exists in the user management table
    if (adminCount === 1 && label === 'General User') {
      notification.showError(
        'There must be at least one Admin among the users',
      );
      setOpen(false);
    } else {
      // Open additional modal to confirm limited privileges from the user
      if (currentUserId === userId && label === 'General User') {
        setOpenConfirmation(true);
      } else {
        setSelectedItem(menu);
        if (onChangeValue) onChangeValue(menu.value);
        setOpen(false);
      }
    }
  };

  const changeAccountType = () => {
    setSelectedItem(menuInfo);
    if (onChangeValue) onChangeValue(menuInfo.value);
    setOpen(false);
  };

  return (
    <div className={styles.root}>
      <div>
        <div
          ref={anchorRef}
          onClick={props.disabled ? () => {} : handleToggle}
          className={styles.selectMenu}
        >
          <div className="d-flex">
            <div className={styles.menuItemIcon}>{selectedItem.icon}</div>
            <div>
              <span>{selectedItem.label}</span>
              <span>
                {props.disabled ? (
                  <Skeleton
                    variant="circle"
                    width={10}
                    height={10}
                    className="d-inline-flex ms-2"
                  />
                ) : open ? (
                  <ArrowDropDownIcon />
                ) : (
                  <PencilIcon className="ms-2" />
                )}
              </span>
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
          {({ TransitionProps, placement }) => (
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
                        onClick={() => handleItemClick(menuItem)}
                        value=""
                        className={styles.menuItem}
                      >
                        <div className="d-flex">
                          <div className={styles.menuItemIcon}>
                            {menuItem.icon}
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
      {openConfirmation && (
        <Modal
          size="sm"
          header="Account Type change confirmation"
          body={
            <div calssName={styles.confirmationRoot}>
              <p className={styles.confirmationSubtitle}>
                Are you sure you want to change your account type to{' '}
                <b>General User</b>?
              </p>
              <p className={styles.confirmationSubtitle}>
                You will have limited privileges and you will lose access to
                this screen.
              </p>
              <div className="d-flex justify-content-between mt-5">
                <Button
                  className="primary-btn me-auto"
                  variant="outlined"
                  color="primary"
                  onClick={() => setOpenConfirmation(false)}
                >
                  Cancel
                </Button>

                <Button
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setOpenConfirmation(false);
                    changeAccountType();
                  }}
                >
                  Yes
                </Button>
              </div>
            </div>
          }
          onClose={() => setOpenConfirmation(false)}
        />
      )}
    </div>
  );
};

export default Menu;
