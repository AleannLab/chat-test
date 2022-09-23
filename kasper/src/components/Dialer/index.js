import React, { useRef, useState } from 'react';
import './index.css';
import { makeStyles } from '@material-ui/core/styles';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import DialerExpand from './DialerExpand';
import DialerRoundButton from './DialerRoundButton';
import PauseIcon from '@material-ui/icons/Pause';
import CallIcon from '@material-ui/icons/Call';
import MicOffIcon from '@material-ui/icons/MicOff';
import { Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import { useStores } from 'hooks/useStores';
import { CALL_STATUS } from 'stores/dialer.pbx.utils';
import MicPermissionSecondary from '../MicPermissionHelper/MicPermissionSecondary';
import MicUnavailable from '../MicPermissionHelper/MicUnavailable';
import PhoneInTalkIcon from '@material-ui/icons/PhoneInTalk';
import Tooltip from '@material-ui/core/Tooltip';
import { ReactComponent as NoMicrophoneIcon } from 'assets/images/no-microphone-dialer-cross.svg';
import { ReactComponent as NotificationsOffIcon } from 'assets/images/dnd.svg';
import { ReactComponent as CallForwardingIcon } from 'assets/images/call-forwarding.svg';
import { ReactComponent as IncomingDisabledIcon } from 'assets/images/incoming-disabled.svg';
import { ReactComponent as OfficeClosedIcon } from 'assets/images/office-closed.svg';
import { ReactComponent as VacationIcon } from 'assets/images/vacation.svg';

const useStyles = makeStyles(() => ({
  cursorPointer: {
    cursor: 'pointer',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    fontFamily: 'Playfair Display !important',
    color: '#ffffff',
  },
  callDuration: {
    flexGrow: 1,
    opacity: 0.5,
    color: '#ffffff',
    fontFamily: 'Montserrat',
  },
}));

const Dialer = ({ size = 'sm' }) => {
  const classes = useStyles();
  const { dialer, authentication } = useStores();
  var user = authentication.user || {};
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [openUnavailableDialog, setOpenUnavailableDialog] = useState(false);

  const mediaRef = useRef();

  const activeCallLine = dialer.callLines[dialer.activeCallLineNumber];

  React.useEffect(() => {
    dialer.initDialer();
  }, [dialer]);

  const getDialerStatus = () => {
    if (!user.is_open && !user.is_vacation) return 'Office closed';
    if (!dialer?.initDetails?.incoming_calls) return 'Incoming disabled';
    if (user.forwarding_did) return 'Forwarding active';
    if (user.is_vacation) return 'Vacation mode';
    if (dialer?.initDetails?.dnd_enable) return 'Do not disturb';
    return 'No Calls';
  };

  const getDialerIcon = () => {
    if (!dialer.isMicrophoneAllowed)
      return (
        <NoMicrophoneIcon
          onClick={handleNoMicrophoneClick}
          style={{ cursor: 'pointer' }}
        />
      );

    if (!user.is_open && !user.is_vacation)
      return (
        <DialerRoundButton
          icon={<OfficeClosedIcon />}
          backgroundColor="#B4B4B4"
        />
      );
    if (!dialer?.initDetails?.incoming_calls)
      return (
        <DialerRoundButton
          icon={<IncomingDisabledIcon />}
          backgroundColor="#B4B4B4"
        />
      );
    if (user.forwarding_did)
      return (
        <DialerRoundButton
          icon={<CallForwardingIcon />}
          backgroundColor="#FEA828"
        />
      );
    if (user.is_vacation)
      return (
        <DialerRoundButton icon={<VacationIcon />} backgroundColor="#566F9F" />
      );
    if (dialer?.initDetails?.dnd_enable)
      return (
        <DialerRoundButton
          icon={<NotificationsOffIcon />}
          backgroundColor="#B4B4B4"
        />
      );

    return <DialerRoundButton icon={<CallIcon />} backgroundColor="#243656" />;
  };

  const handleNoMicrophoneClick = () => {
    // This function checks whether microphone hardware is present or not
    let mediaTypes = [];
    if (navigator.mediaDevices && navigator.mediaDevices?.enumerateDevices()) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          devices.forEach((device) => {
            mediaTypes.push(device.kind);
          });
          let microphoneConnected = false;
          mediaTypes.forEach((type) => {
            if (type === 'audioinput') {
              microphoneConnected = true;
            }
          });
          if (microphoneConnected) {
            setOpenPermissionDialog(true);
          } else {
            setOpenUnavailableDialog(true);
          }
        })
        .catch(function (err) {
          console.error(err.name + ': ' + err.message);
        });
    }
  };

  // React.useEffect(() => {
  //   // let callLine = dialer.callLines[dialer.activeCallLineNumber || 0];
  //   console.log("activeCallLineStream", dialer.remoteStream);
  //   if (mediaRef.current && dialer.remoteStream) {
  //     if (dialer.remoteStream) {
  //       mediaRef.current.srcObject = dialer.remoteStream;
  //     } else mediaRef.current.srcObject = null;
  //   }
  // }, [mediaRef, dialer.remoteStream]);

  const handleDrawerOpen = () => dialer.setDialerExpanded(true);

  const handleDrawerClose = () => dialer.setDialerExpanded(false);

  const toggleDrawer = () => {
    dialer.isDialerExpanded ? handleDrawerClose() : handleDrawerOpen();
  };

  if (!dialer.isRegistered) return <></>;

  var dialerButton = getDialerIcon();

  if (
    activeCallLine?.callStatus === CALL_STATUS.INCOMING &&
    !dialer?.initDetails?.incoming_calls
  ) {
    dialerButton = (
      <DialerRoundButton
        icon={
          <Tooltip
            title="You don't have permission to answer this call"
            placement="top"
          >
            <PhoneInTalkIcon />
          </Tooltip>
        }
        backgroundColor="#243656"
      />
    );
  } else {
    if (
      activeCallLine &&
      (activeCallLine.callStatus === CALL_STATUS.ACTIVE ||
        activeCallLine.callStatus === CALL_STATUS.INCOMING)
    ) {
      if (activeCallLine.isOnHold)
        dialerButton = (
          <DialerRoundButton icon={<PauseIcon />} backgroundColor="#FEA828" />
        );
      else if (activeCallLine.isMute)
        dialerButton = (
          <DialerRoundButton icon={<MicOffIcon />} backgroundColor="#F42626" />
        );
      else
        dialerButton = (
          <DialerRoundButton icon={<CallIcon />} backgroundColor="#1ABA17" />
        );
    }
  }

  const dialerSmall = (
    <div
      style={{
        display: 'flex',
        width: '5rem',
        height: 70,
        background: '#121414',
      }}
      className={classes.cursorPointer}
      onClick={toggleDrawer}
    >
      <div
        className="flex-1 p-1 m-auto justify-content-center"
        style={{
          textAlign: 'center',
        }}
      >
        {dialerButton}
        {!dialer.isDialerExpanded &&
          activeCallLine &&
          (activeCallLine.callStatus === CALL_STATUS.ACTIVE ||
            activeCallLine.isOnHold === true ||
            activeCallLine.isMute === true) && (
            <small className={`${classes.callDuration} pt-1`}>
              {activeCallLine.callSubTitle}
            </small>
          )}
      </div>
      {dialer.isMicrophoneAllowed && (
        <div
          className={`d-flex align-items-center me-2 ${classes.cursorPointer}`}
          style={{
            visibility: dialer.isDialerExpanded ? 'hidden' : 'visible',
          }}
        >
          <DoubleArrowIcon style={{ color: '#fff', fontSize: 10 }} />
        </div>
      )}
    </div>
  );

  const dialerStatus = getDialerStatus();

  return (
    <div style={{ display: 'flex', position: 'fixed', bottom: 0 }}>
      <audio
        id="dialogAudio"
        autoPlay="autoplay"
        controls={false}
        ref={mediaRef}
      />

      {size === 'sm' ? (
        dialerSmall
      ) : (
        <div
          style={{
            display: 'flex',
            width: 240,
            height: 70,
            background: '#121414',
          }}
          className={dialer.isMicrophoneAllowed ? classes.cursorPointer : ''}
          onClick={toggleDrawer}
        >
          <div className="m-auto d-flex align-items-center w-100">
            <div style={{ marginLeft: '17px' }}>{dialerButton}</div>
            <div
              style={{ maxWidth: '150px', marginLeft: '19px' }}
              className={'flex-grow-1'}
            >
              <Typography
                style={{
                  maxWidth: '180px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                className={`${classes.userName} align-items-end`}
                onMouseEnter={(e) => {
                  if (!dialer?.initDetails?.incoming_calls)
                    e.target.style.color = 'red';
                }}
                onMouseLeave={(e) => {
                  if (!dialer?.initDetails?.incoming_calls)
                    e.target.style.color = '#fff';
                }}
              >
                {!dialer.isMicrophoneAllowed ? (
                  <span
                    onClick={handleNoMicrophoneClick}
                    style={{ cursor: 'pointer' }}
                  >
                    No Microphone
                  </span>
                ) : !activeCallLine ? (
                  dialerStatus
                ) : activeCallLine ? (
                  activeCallLine.callTitle
                ) : (
                  'No Calls'
                )}
              </Typography>
              <div className={classes.callDuration}>
                {activeCallLine ? activeCallLine.callSubTitle : ''}
              </div>
            </div>
            {dialer.isMicrophoneAllowed && (
              <div
                className={`d-flex align-items-center me-2 ${classes.cursorPointer}`}
                style={{
                  visibility: dialer.isDialerExpanded ? 'hidden' : 'visible',
                }}
              >
                <DoubleArrowIcon style={{ color: '#fff', fontSize: 10 }} />
              </div>
            )}
          </div>
        </div>
      )}
      {dialer.isMicrophoneAllowed && (
        <DialerExpand
          open={
            activeCallLine?.callStatus === CALL_STATUS.INCOMING &&
            !dialer?.initDetails?.incoming_calls
              ? false
              : dialer.isDialerExpanded
          }
          onCollapse={toggleDrawer}
          size={size}
          callTitle={
            !activeCallLine
              ? dialerStatus
              : activeCallLine
              ? activeCallLine.callTitle
              : 'No Calls'
          }
        />
      )}
      {openPermissionDialog === true && (
        <MicPermissionSecondary
          onClose={() => setOpenPermissionDialog(false)}
          customPosition={true}
        />
      )}
      {openUnavailableDialog === true && (
        <MicUnavailable
          onClose={() => setOpenUnavailableDialog(false)}
          customPosition={true}
        />
      )}
    </div>
  );
};

export default observer(Dialer);
