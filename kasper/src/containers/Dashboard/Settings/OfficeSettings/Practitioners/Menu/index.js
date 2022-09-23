import React, { useEffect, useState, useRef } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';
import { ReactComponent as DefaultIcon } from 'assets/images/default.svg';
import { ReactComponent as MoreIcon } from 'assets/images/table-more.svg';
import styles from './index.module.css';

const Menu = ({ handleSetDefault, id, handleEditPractitioner }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);

  const iconStyles = {
    width: '1rem',
    height: '1rem',
    marginRight: '0.5rem',
  };

  const actions = [
    {
      id: 1,
      label: 'Set as default',
      icon: <DefaultIcon style={iconStyles} />,
    },
    {
      id: 2,
      label: 'Edit practitioner',
      icon: <PencilIcon style={iconStyles} />,
    },
  ];

  function handleToggle() {
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

  const handleMenuClick = (item) => {
    if (item.id === 1) {
      handleSetDefault(id);
      setOpen(false);
    } else if (item.id === 2) {
      setOpen(false);
      handleEditPractitioner(id);
    }
  };

  return (
    <>
      <MoreIcon
        className={styles.moreIcon}
        ref={anchorRef}
        onClick={handleToggle}
      />
      <Popper
        className="mt-1"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        placement="bottom-end"
        style={{ zIndex: 5 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'center top' }}>
            <Paper elevation={4} style={{ maxHeight: 160, overflowY: 'auto' }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="menu-list-grow"
                  className="p-0"
                  onKeyDown={handleListKeyDown}
                >
                  {actions.map((menuItem, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleMenuClick(menuItem)}
                      value=""
                    >
                      <div className="d-flex">
                        <div className={styles.iconLabel}>
                          {menuItem.icon} {menuItem.label}
                        </div>
                      </div>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default Menu;
