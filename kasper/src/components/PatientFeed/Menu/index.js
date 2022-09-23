import React, { useEffect, useState, useRef } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import {
  Grow,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  Badge,
  FormGroup,
  FormControlLabel,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ReactComponent as FilterIcon } from 'assets/images/filter.svg';
import Switch from 'components/Core/Switch';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';

const CustomBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: '#F4266E',
    height: 8,
    width: 8,
    border: '1px solid #FFFFFF',
    marginTop: '0px',
    marginLeft: '5px',
  },
}))(Badge);

const ControlledSwitch = ({ name, label, checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    if (onChange) onChange(event.target.checked);
  };

  return (
    <FormGroup row>
      <FormControlLabel
        className="m-0"
        control={
          <Switch name={name} checked={isChecked} onClick={handleChange} />
        }
        label={<div className={styles.itemLabel}>{label}</div>}
      />
    </FormGroup>
  );
};

const Menu = ({ className }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);
  const [menuItems, setMenuItems] = useState([]);
  const { patientsFeed } = useStores();

  useEffect(() => {
    setMenuItems([
      {
        id: 1,
        label: 'Unseen messages only',
        checked: patientsFeed.smsUnseenOnly,
      },
    ]);
  }, [patientsFeed.smsUnseenOnly]);

  function handleFilterToggle() {
    setOpen((prevOpen) => !prevOpen);
  }

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  const handleMenuSelect = (checked) => {
    patientsFeed.setSmsUnseenOnly(checked);
    setOpen(false);
  };

  return (
    <span className={className}>
      <CustomBadge
        badgeContent=" "
        variant="dot"
        invisible={!menuItems.find((item) => item.checked)}
      >
        <FilterIcon
          className={styles.filterIcon}
          ref={anchorRef}
          onClick={handleFilterToggle}
        />
      </CustomBadge>

      <Popper
        className="mt-1"
        open={open}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-start"
        style={{ zIndex: 5 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'left top' }}>
            <Paper elevation={4} style={{ maxHeight: 160, overflowY: 'auto' }}>
              <div className={styles.menuHeader}>Filters:</div>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="menu-list-grow"
                  className="p-0"
                  onKeyDown={handleListKeyDown}
                >
                  {menuItems.map((menuItem, index) => (
                    <MenuItem key={index} className="p-3">
                      <ControlledSwitch
                        name="unseenOnly"
                        label={menuItem.label}
                        checked={menuItem.checked}
                        onChange={(checked) => {
                          handleMenuSelect(checked);
                        }}
                      />
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </span>
  );
};

export default Menu;
