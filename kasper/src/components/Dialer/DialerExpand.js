import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import { Typography } from '@material-ui/core';
import DialerRoundButton from './DialerRoundButton';
import DialerSquareButton from './DialerSquareButton';
import DialPad from './DialPad';
import DialpadIcon from '@material-ui/icons/Dialpad';
import CallEndIcon from '@material-ui/icons/CallEnd';
import PauseIcon from '@material-ui/icons/Pause';
import { ReactComponent as CallMergeIcon } from 'assets/images/call-merge.svg';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallIcon from '@material-ui/icons/Call';
import { observer } from 'mobx-react';
import { useStores } from 'hooks/useStores';
import { CALL_STATUS } from 'stores/dialer.pbx.utils';
import TransferCallDialPad from './TransferCallDialPad';
import Switch from '@material-ui/core/Switch';

const containerWidth = 1000;

const DialerExpand = ({ open, onCollapse, size, callTitle }) => {
  const classes = useStyles();
  const { dialer } = useStores();
  const [showDialPad, setShowDialPad] = useState(false);
  // const [showTransferDialPad, setShowTransferDialPad] = useState(false);
  // const [dialPadType, setDialPadType] = useState(null);

  const activeCallLine = dialer.callLines[dialer.activeCallLineNumber];

  // console.log("DialerExpand", dialer.activeCallLineNumber, dialer.callLines, activeCallLine);

  // useEffect(() => {
  //   if (activeCallLine) {
  //     setShowTransferDialPad(false);
  //   }
  // }, [activeCallLine]);

  return (
    <div
      style={{ backgroud: 'red' }}
      className={clsx(classes.container, {
        [classes.containerOpen]: open,
        [classes.containerClose]: !open,
      })}
    >
      {showDialPad ? <DialPad onClose={() => setShowDialPad(false)} /> : null}
      {activeCallLine && activeCallLine.showTransferDialPad ? (
        <TransferCallDialPad
          onClose={() => activeCallLine.toggleTransferDialpad()}
        />
      ) : null}

      {size === 'sm' && (
        <div className="px-2 me-4 d-flex flex-column">
          <Typography
            className={`${classes.userName} flex-grow-1 d-flex align-items-end`}
          >
            {callTitle || 'No Calls'}
          </Typography>
          <div className={classes.callDuration}>
            {activeCallLine ? activeCallLine.callSubTitle : ''}
          </div>
        </div>
      )}

      <div className={classes.buttonsContainer}>
        {dialer.isCallCanceled ? (
          <DialerRoundButton
            disabled
            icon={<CallIcon />}
            backgroundColor="#9999"
            tooltip="The call was already answered by someone or was canceled by the caller!"
            tooltipOpen
          />
        ) : (
          <div className={classes.roundBtn} style={{ marginRight: '1.5rem' }}>
            <DialerRoundButton
              icon={<DialpadIcon />}
              backgroundColor={showDialPad ? '#ffffff45' : null}
              onClick={() => {
                // setDialPadType(dialPadType === "default" ? null : "default");
                setShowDialPad(!showDialPad);
              }}
            />
          </div>
        )}

        {activeCallLine && activeCallLine.call && (
          <>
            <div className={classes.roundBtn}>
              <DialerRoundButton
                onClick={() => {
                  if (activeCallLine.callStatus === CALL_STATUS.ACTIVE) {
                    activeCallLine.hangup();
                    // dialer.manageHoldCall();
                  } else if (
                    activeCallLine.callStatus === CALL_STATUS.INCOMING
                  ) {
                    activeCallLine.reject();
                  } else {
                    console.log('reject outgoing', activeCallLine);
                    const {
                      // parameters: { CallSid },
                      _id: CallSid,
                    } = activeCallLine.call;
                    dialer.removeLine(CallSid);
                  }
                  // dialer.reset();
                }}
                icon={<CallEndIcon />}
                backgroundColor="#F42626"
              />
            </div>
            {activeCallLine.callStatus === CALL_STATUS.INCOMING && (
              <div className={classes.roundBtn}>
                <DialerRoundButton
                  onClick={() => {
                    activeCallLine.answer();
                    dialer.start();
                  }}
                  icon={<CallIcon />}
                  backgroundColor="#1ABA17"
                />
              </div>
            )}
            {(activeCallLine.callStatus === CALL_STATUS.ACTIVE ||
              activeCallLine.isHelp === true ||
              activeCallLine.isMute === true) && (
              <>
                {!activeCallLine.call.customParameters?.get('Caller') && (
                  <>
                    <div className={classes.roundBtn}>
                      <DialerRoundButton
                        icon={<PauseIcon />}
                        backgroundColor={
                          activeCallLine.isOnHold ? '#FEA828' : null
                        }
                        onClick={() => {
                          activeCallLine.toggleHold();
                          if (
                            !activeCallLine.isOnHold &&
                            dialer.callLines.length > 1
                          )
                            dialer.start();
                        }}
                      />
                    </div>
                    <div className={classes.roundBtn}>
                      <DialerRoundButton
                        icon={<CallMergeIcon />}
                        backgroundColor={
                          activeCallLine.showTransferDialPad
                            ? '#ffffff45'
                            : null
                        }
                        onClick={() => activeCallLine.toggleTransferDialpad()}
                      />
                    </div>
                  </>
                )}
                <div className={classes.roundBtn}>
                  <DialerRoundButton
                    icon={<MicOffIcon />}
                    backgroundColor={activeCallLine.isMute ? '#F42626' : null}
                    onClick={() => {
                      console.log('toggling mute...');

                      activeCallLine.toggleMute();
                    }}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className={classes.buttonsContainer}>
        {dialer.callLines.map((line, index) => (
          <CallLinesWidget
            activeLineNumber={dialer.activeCallLineNumber}
            lineNumber={index}
            key={index}
            line={line}
          />
        ))}

        {/* <div className={classes.squareBtn}>
          <DialerSquareButton
            showBadge
            title="1"
            badgeContent={
              <CallIcon style={{ color: "#fff", fontSize: "0.8rem" }} />
            }
            badgeColor="secondary"
          />
        </div>
        <div className={classes.squareBtn}>
          <DialerSquareButton
            showBadge
            title="2"
            badgeContent={
              <PauseIcon style={{ color: "#fff", fontSize: "0.8rem" }} />
            }
            badgeColor="secondary"
          />
        </div>
        <div className={classes.squareBtn}>
          <DialerSquareButton title={<CallIcon />} backgroundColor="#1ABA17" />
        </div>
        <div className={classes.squareBtn}>
          <DialerSquareButton title="4" />
        </div> */}
        {!dialer.isCallCanceled && <DoNotDisturbWidget />}
      </div>

      <div
        className={`d-flex align-items-center ms-auto px-1 ${classes.collapseButtonContainer}`}
        onClick={onCollapse}
      >
        <DoubleArrowIcon
          className={classes.collapseButton}
          style={{ color: '#fff', fontSize: 10 }}
        />
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    color: '#fff',
    background: '#121414',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    display: 'flex',
    maxWidth: containerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    padding: '0.rem 0rem',
    overflow: 'hidden',
  },
  containerOpen: {
    maxWidth: containerWidth,
    transition: theme.transitions.create('max-width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  containerClose: {
    maxWidth: 0,
    transition: theme.transitions.create('max-width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
  },
  cursorPointer: {
    cursor: 'pointer',
  },
  collapseButtonContainer: {
    cursor: 'pointer',
    borderLeft: '1px solid #6c6c6c80',
  },
  collapseButton: {
    transform: 'rotate(180deg)',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    fontFamily: 'Playfair Display !important',
    marginRight: '1.5rem',
  },
  callDuration: {
    flexGrow: 1,
    opacity: 0.5,
    fontFamily: 'Montserrat',
  },
  buttonsContainer: {
    marginRight: '1.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  roundBtn: {
    margin: '0rem 0.2rem',
  },
  squareBtn: {
    margin: '0rem',
    display: 'flex',
    alignItems: 'center',
  },
}));

export default observer(DialerExpand);

const CallLinesWidget = observer(({ activeLineNumber, lineNumber, line }) => {
  const classes = useStyles();
  const { dialer } = useStores();

  // console.log('line', lineNumber, line);

  var title;

  var badge;
  var badgeColor;

  var backgroundColor;
  if (dialer.callLines[lineNumber]) {
    switch (line.callStatus) {
      case CALL_STATUS.INCOMING:
        backgroundColor = '#1ABA17';
        title = <CallIcon />;
        break;

      // case CALL_STATUS.OUTGOING:
      //   backgroundColor = "#1ABA17";
      //   title = <CallIcon />;
      //   break;

      case CALL_STATUS.ACTIVE:
        // backgroundColor = "#AAFFFFFF";
        // title = <CallIcon />;
        badge = <CallIcon style={{ color: '#fff', fontSize: '0.8rem' }} />;
        badgeColor = '#1ABA17';
        if (line.isOnHold) {
          badge = <PauseIcon style={{ color: '#fff', fontSize: '0.8rem' }} />;
          badgeColor = '#FEA828';
        } else if (line.isMute) {
          badge = <MicOffIcon style={{ color: '#fff', fontSize: '0.8rem' }} />;
          badgeColor = '#F42626';
        }
        break;

      // case CALL_STATUS.HOLD:
      //   badge = <PauseIcon style={{ color: "#fff", fontSize: "0.8rem" }} />;
      //   badgeColor = "#FEA828";
      //   // title = <PauseIcon />;
      //   break;

      // case CALL_STATUS.MUTE:
      //   badge = <MicOffIcon style={{ color: "#fff", fontSize: "0.8rem" }} />;
      //   badgeColor = "#F42626";
      //   // title = <PauseIcon />;
      //   break;

      case CALL_STATUS.INITIAL:
      default:
        title = null;
        break;
    }
  }

  return (
    <div
      className={classes.squareBtn}
      style={activeLineNumber === lineNumber ? { marginBottom: '0.8rem' } : {}}
    >
      <DialerSquareButton
        onLineClick={() => dialer.setActiveLineNumber(lineNumber)}
        title={title || lineNumber + 1}
        backgroundColor={backgroundColor}
        showBadge={badge ? true : false}
        badgeContent={badge}
        badgeColor={badgeColor}
      />
    </div>
  );
});

const dndButtonStyle = makeStyles(() => ({
  root: {
    width: 42,
    height: 19,
    padding: 0,
    display: 'flex',
  },
  switchBase: {
    padding: 2,
    color: '#ffffff',
    '&$checked': {
      transform: 'translateX(24px)',
      color: '#fff',
      '& + $track': {
        opacity: 1,
        backgroundColor: '#1ABA17',
        borderColor: '#1ABA17',
      },
    },
  },
  thumb: {
    width: 15,
    height: 15,
    boxShadow: 'none',
    '&:hover': {
      width: 15,
      height: 15,
      boxShadow: 'none',
    },
  },
  track: { borderRadius: 19 / 2 },
  checked: {},
  doNotDisturbContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'center',
    marginTop: '1rem',
  },
}));

const DoNotDisturbWidget = observer(() => {
  const classes = dndButtonStyle();
  const {
    authentication: { user },
    notification,
    incomingCalls: incomingCallsStore,
    dialer: { initDetails },
  } = useStores();

  const checked = !!initDetails.dnd_enable;
  const [isChecked, setIsChecked] = useState(checked);
  const [updatingCallPermission, setUpdatingCallPermission] = useState(false);

  const dndCallsToggle = async (userId, incomingCalls) => {
    try {
      setUpdatingCallPermission(true);
      await incomingCallsStore.setDnd(userId, incomingCalls);
      setUpdatingCallPermission(false);
    } catch (err) {
      notification.showError(
        'An unexpected error occurred while attempting to change the call permission',
      );
    }
  };

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    dndCallsToggle(user.user_id, event.target.checked);
  };

  return (
    <div
      className={classes.doNotDisturbContainer}
      style={{ pointerEvents: updatingCallPermission ? 'none' : 'initial' }}
    >
      <Switch
        checked={isChecked}
        name="callPermission"
        onClick={handleChange}
        size="medium"
        classes={{
          root: classes.root,
          switchBase: classes.switchBase,
          thumb: classes.thumb,
          track: classes.track,
          checked: classes.checked,
        }}
      />
      <Typography variant="overline" display="block" gutterBottom>
        Do not disturb
      </Typography>
    </div>
  );
});
