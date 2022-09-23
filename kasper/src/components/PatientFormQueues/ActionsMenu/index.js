import React, { useState, useEffect, useRef } from 'react';
import styles from './index.module.css';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import DeleteIcon from '@material-ui/icons/Delete';
import { ReactComponent as LinkIcon } from 'assets/images/link.svg';
import { useStores } from 'hooks/useStores';
import { ReactComponent as MoreIcon } from 'assets/images/table-more.svg';
import { makeStyles } from '@material-ui/styles';
import EmailIcon from '@material-ui/icons/Email';
import MessageIcon from '@material-ui/icons/Message';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Button from '@material-ui/core/Button';
import copy from 'copy-to-clipboard';
import ClearForm from '../ClearForm';

const useStyles = makeStyles({
  eventPopover: {
    // transform: "translate3d(560px, 323px, 0px) !important",
    left: '-163px !important',
  },
});

const ActionsMenu = (props) => {
  const {
    menuItems,
    rowData,
    refreshData,
    searchItem,
    HashFormQueue,
    styleClass,
    handleShareClose,
    clearFormRefresh,
    parentAnchorRef,
  } = props;
  const { phone, email } = rowData;
  const [open, setOpen] = useState(false);
  const [clearForms, setClearForms] = useState(false);
  const actionRef = useRef(null);
  const anchorRef = HashFormQueue ? parentAnchorRef : actionRef;
  const { notification, paperlessForm } = useStores();
  const classes = useStyles();

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  useEffect(() => {
    if (HashFormQueue) {
      handleToggle();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (
      HashFormQueue === undefined &&
      prevOpen.current === true &&
      open === false
    ) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [HashFormQueue, open]);

  const resendLinkViaEmailSMS = async (type) => {
    const SMS = type === 'sms' ? true : false;
    const Email = type === 'email' ? true : false;
    let forms = [];
    if (HashFormQueue) {
      rowData.incompleteForms.forEach((element) => {
        forms.push(element.key);
      });
    } else {
      forms = rowData.incompleteForms;
    }
    try {
      await paperlessForm.generateInviteLink(rowData.id, SMS, Email, forms);
      notification.showSuccess(
        `Forms were sent to ${type === 'sms' ? phone : email} successfully`,
      );
      setTimeout(() => {
        notification.hideNotification();
      }, 3000);
    } catch (err) {
      console.error(err);
      notification.showError(
        'An unexpected error occurred while attempting to send the invites',
      );
      setTimeout(() => {
        notification.hideNotification();
      }, 3000);
    }
  };

  const handleCopyToClipboard = async () => {
    let forms = [];
    if (HashFormQueue) {
      rowData.incompleteForms.forEach((element) => {
        forms.push(element.key);
      });
    } else {
      forms = rowData.incompleteForms;
    }
    try {
      const { inviteLink } = await paperlessForm.generateInviteLink(
        rowData.id,
        false,
        false,
        forms,
      );
      if (inviteLink) {
        const url = inviteLink;
        const copySuccessful = () => {
          notification.showSuccess('link copied successfully');
          setTimeout(() => {
            notification.hideNotification();
          }, 3000);
        };
        copy(url, {
          onCopy: copySuccessful(),
        });
      }
    } catch (err) {
      console.error(err);
      notification.showError(
        'An unexpected error occurred while attempting to generate the invite link',
      );
    }
  };

  const handleItemClick = (menuItem) => {
    if (menuItem.label === 'Resend link via Email') {
      resendLinkViaEmailSMS('email');
    } else if (menuItem.label === 'Resend link via SMS') {
      resendLinkViaEmailSMS('sms');
    } else if (menuItem.label === 'Copy Link') {
      handleCopyToClipboard();
    } else if (menuItem.label === 'Clear Forms') {
      setClearForms(true);
    }
  };

  const getProperIcon = (label) => {
    if (label === 'Resend link via Email') {
      return <EmailIcon style={{ color: '#9a9a9a' }} />;
    } else if (label === 'Resend link via SMS') {
      return <MessageIcon style={{ color: '#9a9a9a' }} />;
    } else if (label === 'Copy Link') {
      return <LinkIcon />;
    } else if (label === 'Clear Forms') {
      return <DeleteIcon style={{ color: '#9a9a9a' }} />;
    }
  };

  return (
    <div className={`${HashFormQueue ? styles.root : styles.root}`}>
      <div>
        {HashFormQueue ? (
          <></>
        ) : (
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
        )}
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          placement={`${HashFormQueue ? 'bottom' : 'bottom-start'}`}
          style={{ zIndex: 1302 }}
          className={styleClass ? styleClass : classes.eventPopover}
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
                <ClickAwayListener
                  onClickAway={HashFormQueue ? handleShareClose : handleClose}
                >
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

      {clearForms && (
        <ClearForm
          onClose={() => setClearForms(false)}
          searchItem={searchItem}
          inviteId={rowData.secret}
          refreshData={HashFormQueue ? clearFormRefresh : refreshData}
        />
      )}
    </div>
  );
};

export default ActionsMenu;
