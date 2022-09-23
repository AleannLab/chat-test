import {
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@material-ui/core';
import * as React from 'react';
import { ReactComponent as MenuIcon } from 'assets/images/menu.svg';
import { ReactComponent as CorrectIcon } from 'assets/images/correct-arrow.svg';
import { ReactComponent as ArrowUpIcon } from 'assets/images/up-pointer.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import styles from './index.module.css';
import { useMutation, useQueryClient } from 'react-query';
import { useStores } from 'hooks/useStores';

const FadeMenu = ({
  id: scheduleId,
  schedule_uuid,
  setFieldValue,
  onMoveUp,
  onMoveDown,
}) => {
  const queryClient = new useQueryClient();
  const { incomingCalls, notification } = useStores();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const { mutateAsync: deleteScheduleSlotData, isLoading } = useMutation(
    'deleteScheduleSlotData',
    (payload) => incomingCalls.deleteScheduleSlotData(payload),
    {
      onSuccess: () => {
        notification.showSuccess('Schedule deleted successfully!');
        queryClient.invalidateQueries('getScheduleSlots');
      },
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to update the schedule',
        ),
      retry: false,
    },
  );

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
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const handleDeleteScheduleSlot = async (e) => {
    await deleteScheduleSlotData(scheduleId);
    handleClose(e);
  };

  const handleSetActiveSchedule = async (e) => {
    setFieldValue('activeSchedule', schedule_uuid, false);
    handleClose(e);
  };
  const handleScheduleMoveUp = (e) => {
    onMoveUp();
    handleClose(e);
  };
  const handleScheduleMoveDown = (e) => {
    onMoveDown();
    handleClose(e);
  };

  const MenuItemsList = [
    {
      label: 'Set Schedule as Active',
      icon: <CorrectIcon />,
      transform: false,
      onclick: handleSetActiveSchedule,
    },
    {
      label: 'Order: Move Up',
      icon: <ArrowUpIcon />,
      transform: false,
      onclick: handleScheduleMoveUp,
    },
    {
      label: 'Order: Move Down',
      icon: <ArrowUpIcon />,
      transform: true,
      onclick: handleScheduleMoveDown,
    },
    {
      label: 'Delete Schedule',
      icon: <DeleteIcon />,
      transform: false,
      onclick: handleDeleteScheduleSlot,
    },
  ];

  return (
    <div>
      <span
        ref={anchorRef}
        id="composition-button"
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <MenuIcon />
      </span>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
        style={{ zIndex: 1 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper className={styles.paper}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  {MenuItemsList.map(
                    ({ label, icon, transform, onclick }, index) => (
                      <MenuItem
                        key={index}
                        onClick={(e) => onclick(e)}
                        className={styles.li}
                      >
                        <span
                          className={`${styles.svgIcon} ${
                            transform && styles.rotate
                          }
                        }`}
                        >
                          {icon}
                        </span>
                        <span className={styles.label}> {label}</span>
                      </MenuItem>
                    ),
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
};
export default FadeMenu;
