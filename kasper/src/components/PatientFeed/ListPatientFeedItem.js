import React, { useEffect, useState } from 'react';
import {
  Card,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { Badge } from '@material-ui/core';
import Avatar from 'components/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react';
import PhoneNumber from 'awesome-phonenumber';
import { convertCustomTime } from 'helpers/timezone';
import moment from 'moment';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useStores } from 'hooks/useStores';
import UnseenCounter from 'components/PatientFeed/UnseenCounter/UnseenCounter';
import { ReactComponent as UnreadMessageIcon } from 'assets/images/unread-message.svg';
import { selectedCardRef } from './patientFeedService';
import { useFlags } from 'launchdarkly-react-client-sdk';
import Guarantor from './Guarantor';
import ListPatientFeedSubItem from './ListPatientFeedSubItem';

const ListPatientFeedItem = observer(function ({ patient, unseenCount }) {
  const { id, firstname, lastname, phone_no, last_activity, dob, dependents } =
    patient;
  if (!firstname && !lastname) {
    patient.displayName = null;
  } else {
    patient.displayName = firstname + ' ' + lastname;
  }
  const classes = useStyles();
  const { patientsFeed, patientChats } = useStores();
  const [hoverOn, setHoverOn] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { patientFeedMarkMessageUnread } = useFlags();
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUnreadMessage = (e) => {
    e.stopPropagation();
    patientChats.martMessageAsUnread(patient.phone_no);
    setAnchorEl(null);
  };

  const isSelected =
    parseInt(id) === parseInt(patientsFeed.selectedPatient?.id);

  const [unreadTimeout, setUnreadTimeout] = useState(null);

  // Need to unread message after 1.5 seconds of selection, and clear timeout is selection has been changed
  useEffect(() => {
    if (isSelected === true && (unseenCount || 0) > 0) {
      setUnreadTimeout(
        setTimeout(() => {
          patientChats.markTextsAsUnseen({
            from_did: patient.phone_no,
          });
        }, 1500),
      );
    } else if (unreadTimeout) {
      clearTimeout(unreadTimeout);
      setUnreadTimeout(null);
    }
  }, [isSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // after coming from lobby selectedPatient has only id, replace it with full record
    if (isSelected) patientsFeed.setSelectedPatient(patient);
  }, [isSelected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={classes.cardContainer}>
      <Card
        ref={isSelected ? selectedCardRef : undefined}
        className={`${isSelected ? classes.selectedCard : classes.card}`}
        onClick={() => {
          patientsFeed.setIsNewSMS(false);
          patientsFeed.setSelectedPatient(patient);
        }}
        onMouseOver={() => setHoverOn(true)}
        onMouseLeave={() => setHoverOn(false)}
      >
        <div
          className={`${classes.content} ${
            isSelected ? classes.selectedContent : ''
          }`}
        >
          <UnseenCounter count={unseenCount} />

          <div style={{ position: 'relative' }}>
            {!!dependents?.length && <Guarantor />}
            <Badge
              badgeContent={2}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              className="patient-badge"
              invisible={true} // TODO : KAS-632 - Hide notification icons for unread messages
            >
              <Avatar
                id={parseInt(id)}
                firstName={firstname}
                lastName={lastname}
                mobileNo={phone_no}
                customLetter="00"
              />
            </Badge>
          </div>

          <div>
            <Typography
              variant="body1"
              className={`${
                isSelected ? classes.selectedTypography : classes.Typography
              }`}
            >
              {!!firstname || !!lastname ? (
                <>
                  {!!firstname && firstname}
                  &nbsp;
                  {!!lastname && lastname}
                </>
              ) : (
                !!phone_no && <>{PhoneNumber(phone_no).getNumber('national')}</>
              )}
              <span>{dob ? ` (${moment().diff(dob, 'years')} y/o)` : ''}</span>
            </Typography>
            <Typography variant="caption" className={classes.subtitle}>
              Last activity -{' '}
              {last_activity
                ? convertCustomTime({
                    dateTime: last_activity,
                    format: 'MM/DD/YYYY',
                  })
                : 'n/a'}
            </Typography>
          </div>
        </div>

        {patientFeedMarkMessageUnread && (
          <>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleClick}
              className={classes.contextMenuIconButton}
            >
              <MoreVertIcon
                style={{
                  visibility: !hoverOn ? 'hidden' : '',
                  color: '#999999',
                }}
              />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              keepMounted
              open={open}
              onClose={handleClose}
            >
              <MenuItem
                onClick={handleUnreadMessage}
                classes={{ root: classes.menuListItem }}
              >
                <ListItemIcon classes={{ root: classes.listItemIcon }}>
                  <UnreadMessageIcon
                    style={{ width: '1rem', height: '1rem' }}
                  />
                </ListItemIcon>
                <ListItemText
                  classes={{ root: classes.listItemText }}
                  primary="Mark as Unread"
                />
              </MenuItem>
            </Menu>
          </>
        )}
      </Card>
      {!!dependents?.length && (
        <>
          {dependents.map((patient, { id }) => (
            <ListPatientFeedSubItem key={id} patient={patient} />
          ))}
        </>
      )}
    </div>
  );
});

export { ListPatientFeedItem };

const useStyles = makeStyles((theme) => ({
  cardContainer: {
    position: 'relative',
    borderBottom: `1px ${theme.palette.primary[400]} solid`,
  },
  card: {
    background: theme.palette.primary[300],
    borderRadius: '0px',
    cursor: 'pointer',
    display: 'flex',
  },
  cardHeader: {
    background: theme.palette.primary[300],
    borderRadius: '0px',
    borderBottom: `1px ${theme.palette.primary[400]} solid`,
    height: '64px',
  },
  selectedCard: {
    background: '#02122F',
    borderRadius: '0px',
    borderBottom: '1px #293D63 solid',
    borderLeft: '3px #F4266E solid',
    display: 'flex',
  },
  content: {
    padding: '10px 15px 10px 15px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  selectedContent: {
    padding: '10px 15px 10px 12px',
  },
  Typography: {
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '13px',
    lineHeight: '16px',
    color: '#FFFFFF',
    paddingLeft: '6px',
  },
  selectedTypography: {
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '13px',
    lineHeight: '16px',
    color: '#FFFFFF',
    paddingLeft: '6px',
  },
  subtitle: {
    paddingLeft: '6px',
    color: '#FFFFFF',
    opacity: '0.5',
  },
  contextMenuIconButton: {
    padding: '0',
    marginLeft: 'auto',
    marginRight: '5px',
  },
  menuListItem: {
    alignItems: 'center',
  },
  listItemIcon: {
    minWidth: '1.5rem',
    minHeight: '1.5rem',
  },
  listItemText: {
    marginTop: '0',
  },
}));
