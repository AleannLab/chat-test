import React, { useMemo, useRef, useState } from 'react';
import styles from './index.module.css';
import { Draggable } from 'react-beautiful-dnd';
import { useHistory } from 'react-router-dom';
import Skeleton from '@material-ui/lab/Skeleton';
import {
  Menu,
  Notifications,
  NotificationsOff,
  Create,
  Delete,
} from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import { PATIENT_BOARD_COLUMNS, DASHBOARD_SUB_STATE } from 'helpers/constants';
import { ReactComponent as HeartIcon } from 'assets/images/heart.svg';
import { ReactComponent as InfoIcon } from 'assets/images/info.svg';
import { ReactComponent as PaperCrossIcon } from 'assets/images/paper-cross.svg';
import { ReactComponent as CheckCircle } from 'assets/images/check-circle.svg';
import { ReactComponent as GiftIcon } from 'assets/images/gift.svg';

import { useStores } from 'hooks/useStores';
import { openPatientChat } from '../../PatientFeed/patientFeedService';
import LobbyIcon from '../LobbyIcon';
import RemovePatientModal from '../RemovePatient';
import UpdateNotesModal from '../UpdateNotes';
import WaitTimePopover from '../WaitTimePopover';
import HeadComp from 'components/SEO/HelmetComp';
import { birthdayCheck } from 'helpers/birthdayCheck';

const getItemStyle = (isDragging, draggableStyle, cardBorderColor) => {
  let border;

  if (isDragging) {
    border = '1px solid #566F9F';
  } else if (cardBorderColor) {
    border = `1px solid ${cardBorderColor}`;
  } else {
    border = '0px';
  }
  return {
    // change border if dragging
    border,

    // styles we need to apply on draggables
    ...draggableStyle,
  };
};

const TooltipList = ({ item, header }) => {
  return (
    <div className={styles.titleList}>
      <ul>
        <div className="row text-center"> {header}:</div>
        {item.map((value) => (
          <li key={value?.name ?? value}>{value?.name ?? value}</li>
        ))}
      </ul>
    </div>
  );
};

const Card = ({ index, cardData, warning, danger, column }) => {
  const menuRef = useRef(null);
  const notesRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRemovePatientModal, setShowRemovePatientModal] = useState(false);
  const [showUpdateNotesModal, setShowUpdateNotesModal] = useState(false);
  const [patientName, setPatientName] = useState();
  const { lobby, patientsFeed } = useStores();
  const history = useHistory();

  const patientClickHandler = () => {
    openPatientChat({
      patientName: cardData.content.header.trim(),
      patientId: cardData.item.patient_id,
      patientsFeed,
      history,
    });
  };

  const handleClose = (e) => {
    if (menuRef.current && menuRef.current.contains(e.target)) {
      return;
    }
    setMenuOpen(false);
  };

  const handleToggle = () => {
    setMenuOpen((prevOpen) => !prevOpen); //NOSONAR
  };

  const handleReadyForDoc = (item, subState) => {
    if (subState === DASHBOARD_SUB_STATE.READY_FOR_DOCTOR) {
      lobby.readyForDoctorSms(item);
    }
    lobby.editReadyForDoctor(item, subState);
    lobby.editAttentionRequired(item.id, false, null);

    lobby.handleUserNotification({
      patient: item,
      duration: 0,
    });
  };

  const patientBirthdayReminder = useMemo(() => {
    if (cardData?.item?.dob) {
      return birthdayCheck(cardData?.item?.dob);
    }
  }, [cardData?.item?.dob]);

  return (
    <>
      <HeadComp title="Dashboard" />
      <Draggable draggableId={cardData.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`${styles.container} ${
              cardData?.cardFlashAlert
                ? styles[`waitTime_${cardData.cardFlashAlert}`]
                : ''
            }`}
            style={getItemStyle(
              snapshot.isDragging,
              provided.draggableProps.style,
              cardData.cardBorderColor,
            )}
          >
            <div
              className={`${styles.content} ${
                cardData.item.completed ? styles.completed : ''
              }`}
            >
              <div className={styles.contentLeft}>
                <div className={styles.header} onClick={patientClickHandler}>
                  {cardData.content.header}
                </div>
                <div className={styles.subContent}>
                  {cardData.content.roomLink ? (
                    <div className={styles.subContentPrimary}>
                      {cardData.content.roomLink}
                    </div>
                  ) : null}
                  <div className={styles.subContentSecondary}>
                    <div className="me-auto">{cardData.content.inTime}</div>
                    <Tooltip
                      classes={{ tooltip: styles.waitTimeTooltip }}
                      title={<WaitTimePopover item={cardData.item} />}
                      placement="bottom-start"
                    >
                      <div style={{ cursor: 'pointer', width: 'fit-content' }}>
                        {cardData.content.waitTime}
                      </div>
                    </Tooltip>
                  </div>
                  {cardData.content?.readyContent &&
                    cardData.content.readyContent}
                </div>
              </div>

              <div className={styles.contentRight}>
                <div className="align-items-end d-flex flex-column flex-grow-1 w-100">
                  <div className={styles.iconContainer}>
                    {patientBirthdayReminder && (
                      <span>
                        <LobbyIcon
                          title={patientBirthdayReminder}
                          icon={<GiftIcon height="12px" width="12px" />}
                        />
                      </span>
                    )}
                    {!!cardData?.item?.note && (
                      <span>
                        <LobbyIcon
                          title={cardData?.item?.note}
                          icon={
                            <InfoIcon
                              fill="#E1E7F3"
                              height="12px"
                              width="12px"
                            />
                          }
                        />
                      </span>
                    )}
                  </div>
                  <div className={`${styles.iconContainer}`}>
                    {cardData?.item?.medical_conditions?.length > 0 && (
                      <Tooltip
                        classes={{ tooltip: styles.waitTimeTooltip }}
                        title={
                          <TooltipList
                            item={cardData.item.medical_conditions}
                            header="Medical conditions"
                          />
                        }
                        placement="right-start"
                      >
                        <div
                          style={{ cursor: 'pointer', width: 'fit-content' }}
                        >
                          <span>
                            <LobbyIcon
                              icon={
                                <HeartIcon
                                  fill="#F4266E"
                                  height="12px"
                                  width="12px"
                                />
                              }
                            />
                          </span>
                        </div>
                      </Tooltip>
                    )}
                    {!!cardData.item &&
                    cardData.item?.incomplete_forms.length ? (
                      <Tooltip
                        classes={{ tooltip: styles.waitTimeTooltip }}
                        title={
                          <TooltipList
                            item={cardData.item.incomplete_forms}
                            header="Incomplete forms"
                          />
                        }
                        placement="right-start"
                      >
                        <div
                          style={{ cursor: 'pointer', width: 'fit-content' }}
                        >
                          <span>
                            <LobbyIcon
                              className={styles.iconPaper}
                              icon={
                                <PaperCrossIcon
                                  fill="#F4266E"
                                  height="0.9rem"
                                  width="0.9rem"
                                />
                              }
                            ></LobbyIcon>
                          </span>
                        </div>
                      </Tooltip>
                    ) : (
                      <span>
                        <LobbyIcon
                          title="No outstanding flags"
                          icon={
                            <CheckCircle
                              fill="#1ABA17"
                              height="12px"
                              width="12px"
                            />
                          }
                        ></LobbyIcon>
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.menu}>
                  <Menu
                    ref={menuRef}
                    onClick={handleToggle}
                    className={styles.menuIcon}
                  />
                  <Popper
                    open={menuOpen}
                    anchorEl={menuRef.current}
                    role={undefined}
                    transition
                    placement="right-start"
                  >
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{ transformOrigin: 'center top' }}
                      >
                        <Paper elevation={4}>
                          <ClickAwayListener onClickAway={handleClose}>
                            <MenuList
                              id="menu-list-grow"
                              className={styles.popper}
                            >
                              {(column === PATIENT_BOARD_COLUMNS.screening ||
                                column === PATIENT_BOARD_COLUMNS.procedure) && (
                                <>
                                  {[
                                    DASHBOARD_SUB_STATE.IN_CHAIR,
                                    DASHBOARD_SUB_STATE.DOCTOR_ARRIVED,
                                  ].includes(cardData.item.sub_state) && (
                                    <MenuItem
                                      onClick={(e) => {
                                        handleReadyForDoc(
                                          cardData.item,
                                          DASHBOARD_SUB_STATE.READY_FOR_DOCTOR,
                                        );
                                        handleClose(e);
                                      }}
                                    >
                                      <Notifications
                                        fontSize="small"
                                        className={styles.menuItemIcon}
                                      />
                                      <Typography component="span">
                                        Ready for doctor
                                      </Typography>
                                    </MenuItem>
                                  )}

                                  {cardData.item.sub_state ===
                                    DASHBOARD_SUB_STATE.READY_FOR_DOCTOR && (
                                    <MenuItem
                                      onClick={(e) => {
                                        handleReadyForDoc(
                                          cardData.item,
                                          DASHBOARD_SUB_STATE.DOCTOR_ARRIVED,
                                        );
                                        handleClose(e);
                                      }}
                                    >
                                      <NotificationsOff
                                        fontSize="small"
                                        className={styles.menuItemIcon}
                                      />
                                      <Typography component="span">
                                        Dismiss Alert
                                      </Typography>
                                    </MenuItem>
                                  )}
                                </>
                              )}
                              <MenuItem
                                onClick={(e) => {
                                  handleClose(e);
                                  setPatientName(
                                    cardData.content.header.trim(),
                                  );
                                  setShowUpdateNotesModal(true);
                                }}
                              >
                                <Create
                                  fontSize="small"
                                  className={styles.menuItemIcon}
                                />
                                <Typography component="span">
                                  Update Notes
                                </Typography>
                              </MenuItem>
                              <MenuItem
                                onClick={(e) => {
                                  handleClose(e);
                                  setShowRemovePatientModal(true);
                                }}
                              >
                                <Delete
                                  fontSize="small"
                                  className={styles.menuItemIcon}
                                />
                                <Typography component="span">
                                  Remove Patient
                                </Typography>
                              </MenuItem>
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>
      {showRemovePatientModal && (
        <RemovePatientModal
          onCancel={() => setShowRemovePatientModal(false)}
          onRemove={() => {
            lobby.removePatient(cardData.item.appointment_id);
            setShowRemovePatientModal(false);
          }}
        />
      )}
      {showUpdateNotesModal && (
        <UpdateNotesModal
          onCancel={() => setShowUpdateNotesModal(false)}
          inputRef={notesRef}
          note={cardData.item.note}
          onSave={(notes) => {
            lobby.updatePatientNotes(cardData.item.appointment_id, notes);
            setShowUpdateNotesModal(false);
          }}
          patientName={patientName}
        />
      )}
    </>
  );
};

export default Card;

export const LoadingCard = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Skeleton animation="wave" variant="text" height={14} width={100} />
        </div>
        <div className={styles.subContent}>
          <div className="me-auto">
            <Skeleton animation="pulse" height={12} width={35} variant="text">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </Skeleton>
          </div>
          <div>
            <Skeleton height={12} width={35} variant="text" animation="wave" />
          </div>
        </div>
      </div>
    </div>
  );
};
