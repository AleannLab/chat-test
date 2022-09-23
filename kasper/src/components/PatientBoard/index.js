import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';
import mockData from './mockData.js';
import SelectRoom from 'components/PatientBoard/SelectRoom';
import { observer } from 'mobx-react-lite';
import { useStores } from 'hooks/useStores';
import moment from 'moment-timezone';
import { reaction } from 'mobx';
import Timer, { useTimer } from 'react-compound-timer';
import { Link } from '@material-ui/core';
import {
  DASHBOARD_STATE,
  DASHBOARD_SUB_STATE,
  PATIENT_BOARD_COLUMNS,
  PATIENT_BOARD_STATE,
  WAIT_TIME_ALERT,
} from 'helpers/constants';
import PushNotification from 'stores/utils/PushNotification';
import TimeExceededAudio from 'assets/sounds/time-exceeded.wav';
import { ReactComponent as HelpIcon } from 'assets/images/help-outlined.svg';
import { ReactComponent as DoctorIcon } from 'assets/images/doctor.svg';

import Tooltip from 'components/Core/Tooltip';
import { ReactComponent as HourGlass } from 'assets/images/hour-glass.svg';
import { ReactComponent as Clock } from 'assets/images/clock.svg';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const PatientBoard = observer(() => {
  const [boardColumns, setBoardColumns] = useState(mockData);
  const [showRoomSelectModal, setShowRoomSelectModal] = useState(false);
  const [patient, setPatient] = useState(null);

  const { lobby, authentication } = useStores();

  const { timezone } = authentication.user || {};

  useEffect(() => {
    async function _loadData() {
      lobby.fetchList({ refreshList: true }).then(() => {
        if (lobby.readyForDoctor.size === 0) {
          lobby.data.forEach((id) => {
            lobby.editAttentionRequired(id, false, null);
          });
        }
        setBoardColumns(_buildColumns());
      });
    }

    _loadData();
    setBoardColumns(_buildColumns());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  reaction(
    () => lobby.data,
    (data) => {
      setBoardColumns(_buildColumns());
    },
  );

  const _buildColumns = () => {
    return [
      {
        title: 'Arrived',
        column: PATIENT_BOARD_COLUMNS.arrived,
        titleBorderColor: '#DDDDDD',
        data: [
          ...(
            lobby.getPatientsByState({ state: DASHBOARD_STATE.arrived }) || []
          ).map((item) => {
            const duration = getDuration(item.waited_time);

            return {
              id: `${item.id}`,
              cardBorderColor: getWaitTimeColor(duration.asMinutes(), true),
              item: item,
              patientId: item.patient_id,
              content: {
                header: `${item.firstname ? item.firstname : ''} ${
                  item.lastname ? item.lastname : ''
                }`,
                waitTime: _buildWaitTime('Arrived', duration),
              },
            };
          }),
        ],
      },
      {
        title: (
          <div className={styles.columnHeader}>
            <span>Ready</span>
            {/* Commenting it out as part of KAS-2646 */}
            {/* <Tooltip
              title="Patients move here automatically if forms are completed. Go to auto trigger settings to disable."
              color="#000000"
              maxWidth={500}
              placement="top-start"
              className="ms-1"
              style={{ cursor: 'pointer' }}
            >
              <HelpIcon />
            </Tooltip> */}
          </div>
        ),
        column: PATIENT_BOARD_COLUMNS.ready,
        titleBorderColor: '#5A9B68',
        data: [
          ...(
            lobby.getPatientsByState({ state: DASHBOARD_STATE.ready }) || []
          ).map((item) => {
            const duration = getDuration(item.waited_time);
            return {
              id: `${item.id}`,
              item: item,
              cardBorderColor: getWaitTimeColor(duration.asMinutes(), true),
              patientId: item.patient_id,
              content: {
                header: `${item.firstname ? item.firstname : ''} ${
                  item.lastname ? item.lastname : ''
                }`,
                waitTime: _buildWaitTime('Ready', duration),
              },
            };
          }),
        ],
      },
      {
        title: 'Screening & Hygiene',
        column: PATIENT_BOARD_COLUMNS.screening,
        titleBorderColor: '#4AADE6',
        data: [
          ...(
            lobby.getPatientsByState({ state: DASHBOARD_STATE.screening }) || []
          ).map((item) => {
            const duration = getDuration(item.waited_time);
            const durationInMinutes = duration.asMinutes();
            const readyForDoc =
              item?.sub_state === DASHBOARD_SUB_STATE.READY_FOR_DOCTOR;
            return {
              id: `${item.id}`,
              item: item,
              // cardBorderColor: getWaitTimeColor(duration.asMinutes(), true),
              cardFlashAlert:
                readyForDoc && getWaitTimeFlashAlert(durationInMinutes),
              patientId: item.patient_id,
              content: {
                header: `${item.firstname ? item.firstname : ''} ${
                  item.lastname ? item.lastname : ''
                }`,
                readyContent: null, //_getReadyForDoctor(item),
                roomLink: _buildRoomLink(item),
                waitTime: _buildWaitTime(
                  'Screening & Hygiene',
                  duration,
                  readyForDoc,
                ),
              },
            };
          }),
        ],
      },
      {
        title: 'Procedure',
        column: PATIENT_BOARD_COLUMNS.procedure,
        titleBorderColor: '#EA8A8A',
        data: [
          ...(
            lobby.getPatientsByState({ state: DASHBOARD_STATE.procedure }) || []
          ).map((item) => {
            const duration = getDuration(item.waited_time);
            const durationInMinutes = duration.asMinutes();
            const readyForDoc =
              item?.sub_state === DASHBOARD_SUB_STATE.READY_FOR_DOCTOR;
            return {
              id: `${item.id}`,
              item: item,
              // cardBorderColor: getWaitTimeColor(duration.asMinutes(), true),
              cardFlashAlert:
                readyForDoc && getWaitTimeFlashAlert(durationInMinutes),
              patientId: item.patient_id,
              content: {
                header: `${item.firstname ? item.firstname : ''} ${
                  item.lastname ? item.lastname : ''
                }`,
                readyContent: null, // _getReadyForDoctor(item),
                roomLink: _buildRoomLink(item),
                waitTime: _buildWaitTime('Procedure', duration, readyForDoc),
              },
            };
          }),
        ],
      },
      {
        title: (
          <div className={styles.columnHeader}>
            <span>Checkout</span>
            <Tooltip
              title="The entire patient board will automatically clear out at 8am UTC (around midnight) regardless of appointment status."
              color="#000000"
              maxWidth={500}
              placement="top-start"
              className="ms-1"
              style={{ cursor: 'pointer' }}
            >
              <HelpIcon />
            </Tooltip>
          </div>
        ),
        titleBorderColor: '#F1D182',
        column: PATIENT_BOARD_COLUMNS.checkout,
        data: [
          ...(
            lobby.getPatientsByState({
              state: DASHBOARD_STATE.checkout,
              sortByCompleted: true,
            }) || []
          ).map((item) => ({
            id: `${item.id}`,
            patientId: item.patient_id,
            item: item,
            content: {
              header: `${item.firstname ? item.firstname : ''} ${
                item.lastname ? item.lastname : ''
              }`,
              inTime: _inTime(item.state_added_at),
            },
          })),
        ],
      },
    ];
  };

  const handleReadyForDoctor = (item) => {
    lobby.editReadyForDoctor(item, DASHBOARD_SUB_STATE.IN_CHAIR);
    lobby.editAttentionRequired(item.id, false, null);
    // TODO: Keep it commented for future reference - Do not show notification for current user
    /*
    const playAudio = () => {
      const audio = new Audio(ReadyForDoctorAudio);
      audio.play();
    };
    PushNotification.showReadyForDoctorNotification(
      item.firstname + ' ' + item.lastname,
      playAudio,
    );
    */

    lobby.handleUserNotification({
      patient: item,
      duration: 0,
    });
  };

  const handleTimeExceeded = (item) => {
    setBoardColumns(_buildColumns());

    let audio = new Audio(TimeExceededAudio);
    const playAudio = () => {
      audio.loop = true;
      audio.play();
      setTimeout(() => {
        audio.loop = false;
        audio.currentTime = 0;
        audio.pause();
      }, 10000);
    };
    const stopAudio = () => {
      audio.currentTime = 0;
      audio.pause();
    };

    PushNotification.showWaitingForDoctorNotification(
      item.firstname + ' ' + item.lastname,
      lobby.ATTENTION_WAIT_TIME_IN_MINUTES,
    );

    lobby.editAttentionRequired(item.id, true, { audio, playAudio, stopAudio });
    const readyObj = lobby.getReadyForDoctor(item.id);
    readyObj.playAudio();
  };

  const _getReadyForDoctor = (item) => {
    return item.ready_for_doctor_at ? (
      _buildDoctorWaitTime(item)
    ) : (
      <div
        className={`${styles.cardButton} ${styles.readyButton}`}
        onClick={() => handleReadyForDoctor(item)}
      >
        <span>Ready for doctor</span>
      </div>
    );
  };

  const _buildRoomLink = (item) => {
    return (
      <Link
        component="button"
        onClick={() => {
          setPatient(item);
          setShowRoomSelectModal(true);
        }}
        color="inherit"
      >
        {item.room_name ? item.room_name : 'Attach a Room'}
      </Link>
    );
  };

  const _inTime = (inTime) => (
    <span>{moment.utc(inTime).tz(timezone).format('h:mm a')}</span>
  );

  const _buildDoctorWaitTime = (item) => {
    let startTime = moment.utc(item.ready_for_doctor_at);
    let endTime = moment.utc();
    let duration = moment.duration(endTime.diff(startTime), 'milliseconds');
    return (
      <span className={styles.waitingForDoctor}>
        waiting for doctor:{' '}
        <Timer
          formatValue={(value) => `${value < 10 ? `0${value}` : value}`}
          initialTime={duration.asMilliseconds()}
        >
          {({ getTime }) => {
            const minutes = getTime() / 1000 / 60;
            const hours = minutes / 60;
            if (
              minutes >= lobby.ATTENTION_WAIT_TIME_IN_MINUTES &&
              !!lobby.getReadyForDoctor(item.id) &&
              !lobby.getReadyForDoctor(item.id).attentionRequired
            ) {
              if ('playAudio' in lobby.getReadyForDoctor(item.id)) {
                const readyObj = lobby.getReadyForDoctor(parseInt(item.id));
                readyObj.stopAudio();
              } else {
                handleTimeExceeded(item);
              }
            }
            return (
              <>
                {hours > 24 && (
                  <>
                    <Timer.Days />:
                  </>
                )}
                {minutes > 59 && (
                  <>
                    <Timer.Hours />:
                  </>
                )}
                <Timer.Minutes />:
                <Timer.Seconds />
              </>
            );
          }}
        </Timer>
      </span>
    );
  };

  const getWaitTimeFlashAlert = (duration) => {
    switch (true) {
      case duration > WAIT_TIME_ALERT.DANGER:
        return 'danger';
      case duration < WAIT_TIME_ALERT.DANGER &&
        duration > WAIT_TIME_ALERT.WARNING:
        return 'warning';
      default:
        return null;
    }
  };

  const getWaitTimeColor = (duration, isBorder) => {
    let waitTimeColor;
    switch (true) {
      case duration > WAIT_TIME_ALERT.DANGER:
        waitTimeColor = '#F4266E';
        break;
      case duration < WAIT_TIME_ALERT.DANGER &&
        duration > WAIT_TIME_ALERT.WARNING:
        waitTimeColor = '#FDB528';
        break;
      default:
        waitTimeColor = !isBorder ? '#919AAA' : 'transparent';
        break;
    }
    return waitTimeColor;
  };

  const getDuration = (waitTime) => {
    const duration = moment.duration(waitTime * 1000, 'milliseconds');

    return duration;
  };

  const TimerComp = ({ duration }) => {
    const {
      value,
      controls: { setTime },
    } = useTimer({ initialTime: duration });

    useEffect(() => {
      setTime(duration);
    }, [duration, setTime]);

    const { d: days, h: hours, m: minutes, s: seconds } = value;

    return (
      <span className="ms-1">
        {days
          ? `${days}d+`
          : hours
          ? `${hours}h${minutes}m`
          : minutes > 0
          ? `${minutes}m`
          : `${seconds}s`}
      </span>
    );
  };

  const _buildWaitTime = (columnName, duration, readyForDoc) => {
    const durationInMinutes = duration.asMinutes();

    return (
      <span
        className="d-flex align-items-center mt-2"
        style={{
          color:
            columnName === 'Arrived' || columnName === 'Ready'
              ? getWaitTimeColor(durationInMinutes)
              : readyForDoc
              ? '#FEA828'
              : '#919AAA',
          lineHeight: 'initial',
        }}
      >
        {columnName === 'Arrived' || columnName === 'Ready' ? (
          <>
            <HourGlass
              fill={getWaitTimeColor(durationInMinutes)}
              height="0.8rem"
              width="0.8rem"
              className="me-1"
            />
            {' waited '}
          </>
        ) : (
          <>
            {readyForDoc ? (
              <DoctorIcon height="0.8rem" width="0.8rem" className="me-1" />
            ) : (
              <Clock
                fill="#919AAA"
                height="0.8rem"
                width="0.8rem"
                className="me-1"
              />
            )}
            {' in chair '}
          </>
        )}

        <TimerComp duration={duration.asMilliseconds()} />
      </span>
    );
  };

  function onDragEnd(data) {
    const { source, destination } = data;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd !== dInd && (dInd === 2 || dInd === 3)) {
      // 2 == Screening & Hygiene
      setPatient(boardColumns[sInd].data[source.index].item);
      setShowRoomSelectModal(true);
    }

    console.log(
      'board same state',
      'state',
      dInd,
      'order',
      destination.index,
      'patientId',
      boardColumns[sInd].data[source.index].patientId,
    );

    if (dInd !== sInd || destination.index !== source.index) {
      lobby.reorderPatientState({
        patientId: boardColumns[sInd].data[source.index].patientId,
        appointmentId:
          boardColumns[sInd].data[source.index].item.appointment_id,
        state: PATIENT_BOARD_STATE[dInd],
        index: destination.index,
        reset: dInd !== sInd && (sInd === 0 || sInd === 1 || sInd === 4),
      });

      if (sInd === dInd) {
        const items = reorder(
          boardColumns[sInd].data,
          source.index,
          destination.index,
        );
        const newState = [...boardColumns];
        newState[sInd].data = items;
        setBoardColumns(newState);
      } else {
        /**
         * Reset ready for doctor state only when card is moved from one column to another coumn
         * Do not reset state when card position is changed within the same column
         */

        lobby.editReadyForDoctor(
          boardColumns[sInd].data[source.index].item,
          DASHBOARD_SUB_STATE.IN_CHAIR,
        );
        if (
          !!lobby.getReadyForDoctor(
            parseInt(boardColumns[sInd].data[source.index].id),
          ) &&
          'audio' in
            lobby.getReadyForDoctor(
              parseInt(boardColumns[sInd].data[source.index].id),
            )
        ) {
          const readyObj = lobby.getReadyForDoctor(
            parseInt(boardColumns[sInd].data[source.index].id),
          );
          readyObj.stopAudio();
        }

        /**
         * To stop the audio from playing, pass stopAudio() function which would be called after the card is moved.
         */
        let audio = new Audio(TimeExceededAudio);
        const stopAudio = () => {
          audio.currentTime = 0;
          audio.pause();
        };
        lobby.editAttentionRequired(
          parseInt(boardColumns[sInd].data[source.index].id),
          false,
          {
            audio,
            stopAudio,
          },
        );
        lobby.patientNotificationInfo.set(
          parseInt(boardColumns[sInd].data[source.index].id),
          {
            timeIntervalFunction: clearTimeout(
              lobby.patientNotificationInfo.get(
                parseInt(boardColumns[sInd].data[source.index].id),
              ).timeIntervalFunction,
            ),
          },
        );
        const result = move(
          boardColumns[sInd].data,
          boardColumns[dInd].data,
          source,
          destination,
        );
        const newState = [...boardColumns];
        newState[sInd].data = result[sInd];
        newState[dInd].data = result[dInd];
        setBoardColumns(newState);
      }
    }
  }

  const onRoomSelect = (roomId) => {
    setShowRoomSelectModal(false);
    lobby.updatePatient({
      patientId: patient.patient_id,
      roomId: roomId,
      appointmentId: patient.appointment_id,
    });
  };

  return (
    <div className={styles.root}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        <div className={styles.container}>
          <DragDropContext onDragEnd={onDragEnd}>
            {boardColumns.map((column, index) => (
              <Column key={index} columnId={`${index}`} columnData={column} />
            ))}
          </DragDropContext>
        </div>
      </div>
      {showRoomSelectModal ? (
        <SelectRoom
          patient={patient}
          onSelect={onRoomSelect}
          onClose={() => setShowRoomSelectModal(false)}
        />
      ) : null}
    </div>
  );
});

export default PatientBoard;
