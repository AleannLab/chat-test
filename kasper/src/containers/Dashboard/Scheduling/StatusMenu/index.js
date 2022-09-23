import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';

const StatusMenu = (props) => {
  const { value, onChangeValue, menuItems, disabled } = props;
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(value);
  const anchorRef = useRef(null);

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
    setSelectedItem(menu);
    if (onChangeValue) onChangeValue(menu.value);
    setOpen(false);
  };

  return (
    <div className={styles.root}>
      <div>
        {disabled ? (
          <div ref={anchorRef}>
            <div className="d-flex">
              <div className={styles.menuItemIcon}>{selectedItem.icon}</div>
              <div>
                <span className={styles.selectedItemLabel}>
                  {selectedItem.label}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={anchorRef}
            onClick={handleToggle}
            className={styles.selectMenu}
          >
            <div className="d-flex">
              <div className={styles.menuItemIcon}>{selectedItem.icon}</div>
              <div>
                <span className={styles.selectedItemLabel}>
                  {selectedItem.label}
                </span>
                <span>
                  {open ? (
                    <ArrowDropDownIcon />
                  ) : (
                    <PencilIcon className="ms-2" />
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          placement="bottom-start"
          style={{ zIndex: 2 }}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'center top' }}
            >
              <Paper
                elevation={4}
                style={{ maxHeight: 160, overflowY: 'auto', minWidth: 260 }}
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
    </div>
  );
};

export default StatusMenu;
