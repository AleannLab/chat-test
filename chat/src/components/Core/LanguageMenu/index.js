import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import PropTypes from 'prop-types';
import {
  Button,
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  ClickAwayListener,
} from '@material-ui/core';
import { ReactComponent as FlagUsaIcon } from 'assets/images/flag-usa.svg';
import { ReactComponent as FlagSpainIcon } from 'assets/images/flag-spain.svg';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const menuItems = [
  { label: 'English', value: 'en', icon: <FlagUsaIcon /> },
  { label: 'Español', value: 'sp', icon: <FlagSpainIcon /> },
];

const LanguageMenu = ({ className, onChange }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(menuItems[0]);

  const handleToggle = (event) => {
    event.stopPropagation();
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
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleItemClick = (event, menu) => {
    event.stopPropagation();
    setSelectedMenuItem(menu);
    if (onChange && typeof onChange === 'function') onChange(menu.value);
    setOpen(false);
  };

  return (
    <div className={`${className} ${styles.root}`}>
      <Button
        className={styles.menuButton}
        startIcon={
          <span className={styles.selectedMenuItemIcon}>
            {selectedMenuItem.icon}
          </span>
        }
        endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        ref={anchorRef}
        onClick={(e) => handleToggle(e)}
      >
        {selectedMenuItem.label}
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        placement="bottom-start"
        style={{ zIndex: 1 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'center top' }}>
            <Paper elevation={4} className={styles.paper}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="lang-menu-list-grow"
                  className="p-0"
                  onKeyDown={handleListKeyDown}
                >
                  {menuItems.map((menuItem, index) => (
                    <MenuItem
                      key={index}
                      onClick={(e) => handleItemClick(e, menuItem)}
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
  );
};

LanguageMenu.propTypes = {
  /** Class name(s) for styling */
  className: PropTypes.string,
  /** Callback function triggered on selection change*/
  onChange: PropTypes.func,
};

LanguageMenu.defaultProps = {
  className: '',
  onChange: () => null,
};

export default LanguageMenu;
