import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { ReactComponent as FilterListIcon } from 'assets/images/filter.svg';
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';

const CustomBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: '#F4266E',
    height: 8,
    width: 8,
    border: '1px solid #FFFFFF',
  },
}))(Badge);

const FilterMenu = (props) => {
  const { value, onChangeValue, menuItems } = props;
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState();

  useEffect(() => {
    setSelectedItem(value);
  }, [value]);

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
        <div
          ref={anchorRef}
          onClick={handleToggle}
          className={styles.selectMenu}
        >
          <CustomBadge
            badgeContent=" "
            variant="dot"
            invisible={
              !(
                !!selectedItem &&
                menuItems.map(({ value }) => value).includes(selectedItem)
              )
            }
          >
            <FilterListIcon className="my-1" />
          </CustomBadge>
        </div>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          placement="bottom-end"
          style={{ zIndex: 1 }}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: 'center top' }}
            >
              <Paper
                elevation={4}
                style={{ minWidth: 100, maxHeight: 200, overflowY: 'auto' }}
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
                        className={`${styles.menuItem} ${
                          menuItem.value === value && styles.selectedMenuItem
                        }`}
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

export default FilterMenu;
