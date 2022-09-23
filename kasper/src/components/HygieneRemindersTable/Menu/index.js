import React, { useEffect, useState, useRef } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import { ReactComponent as PencilIcon } from 'assets/images/pencil.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/custom-delete.svg';
import { ReactComponent as MoreIcon } from 'assets/images/table-more.svg';
import { ReactComponent as CopyIcon } from 'assets/images/copy.svg';
import styles from './index.module.css';
import { set } from 'lodash';

const Menu = ({ handleDelete, id, handleReminderEditing, handleDuplicate }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const prevOpen = useRef(open);

  const iconStyles = {
    width: '0.8rem',
    height: '0.8rem',
    marginRight: '0.5rem',
  };

  const actions = [
    { id: 1, label: 'Edit', icon: <PencilIcon style={iconStyles} /> },
    {
      id: 2,
      label: 'Duplicate',
      icon: <CopyIcon fill="#9A9A9A" style={iconStyles} />,
    },
    {
      id: 3,
      label: 'Delete',
      icon: <DeleteIcon fill="#9A9A9A" style={iconStyles} />,
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
    if (item.label === 'Edit') {
      handleReminderEditing(id);
      setOpen(false);
    } else if (item.label === 'Delete') {
      setOpen(false);
      handleDelete(id);
    } else if (item.label === 'Duplicate') {
      setOpen(false);
      handleDuplicate(id);
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
            <Paper
              elevation={4}
              style={{ maxHeight: 160, width: '120px', overflowY: 'auto' }}
            >
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
