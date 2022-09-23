import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import DeleteIcon from '@material-ui/icons/Delete';
import { useStores } from 'hooks/useStores';
import { ReactComponent as MoreIcon } from 'assets/images/table-more.svg';
import { ReactComponent as EditIcon } from 'assets/images/pencil.svg';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  eventPopover: {
    // transform: "translate3d(560px, 323px, 0px) !important",
    left: '-68px !important',
    top: '4px !important',
  },
});

const ActionsMenu = (props) => {
  const { menuItems, handleOpen } = props;
  const [open, setOpen] = useState(false);
  const actionRef = useRef(null);
  const anchorRef = actionRef;
  const { notification, paperlessForm } = useStores();
  const classes = useStyles();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleItemClick = (menuItem) => {
    if (menuItem.label === 'Edit') {
      handleOpen();
    } else if (menuItem.label === 'Delete') {
      //deleteHandler()
    }
  };

  const getProperIcon = (label) => {
    if (label === 'Edit') {
      return <EditIcon style={{ color: '#9a9a9a' }} />;
    }
    //will work shortly

    // else if (label === 'Delete') {
    //   return <DeleteIcon style={{ color: '#9a9a9a' }} />;
    // }
  };

  return (
    <div className={`${styles.root}`}>
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
          style={{ zIndex: 1302 }}
          className={classes.eventPopover}
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
    </div>
  );
};

export default ActionsMenu;
