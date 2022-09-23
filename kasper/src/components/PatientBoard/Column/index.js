import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { observer } from 'mobx-react-lite';
import moment from 'moment-timezone';
import { LinearProgress } from '@material-ui/core';

import { useStores } from 'hooks/useStores';
import Card, { LoadingCard } from '../Card';
import AddPatientButton from '../AddPatientButton';
import styles from './index.module.css';

const getListStyle = (isDraggingOver) => ({
  // change background if dragging over
  background: isDraggingOver ? '#566F9F' : '#0D2145',
});

const Column = observer(({ columnId, columnData }) => {
  const { lobby } = useStores();

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.titleHeader}>{columnData.title}</div>
        <div
          className={styles.titleBottom}
          style={{ background: columnData.titleBorderColor }}
        >
          {lobby.loaded === true && lobby.loading === true && (
            <LinearProgress />
          )}
        </div>
      </div>
      <Droppable droppableId={`${columnId}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            className={styles.column}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            {lobby.loaded === false &&
              lobby.loading === true &&
              [0, 1, 2].map((item, i) => <LoadingCard key={i} />)}
            {lobby.loaded === true && (
              <>
                {columnId === '0' ? <AddPatientButton /> : null}
                {columnData.data.map((patient, index) => {
                  let durationInMinutes = null;
                  if (patient.item.ready_for_doctor_at !== null) {
                    let startTime = moment.utc(
                      patient.item.ready_for_doctor_at,
                    );
                    let endTime = moment.utc();
                    let duration = moment.duration(
                      endTime.diff(startTime),
                      'milliseconds',
                    );
                    durationInMinutes = duration.asMinutes();
                  }
                  return (
                    <Card
                      key={patient.id}
                      index={index}
                      cardData={patient}
                      column={columnData.column}
                      warning={
                        !!durationInMinutes &&
                        durationInMinutes < lobby.ATTENTION_WAIT_TIME_IN_MINUTES
                      }
                      danger={
                        !!durationInMinutes &&
                        durationInMinutes >=
                          lobby.ATTENTION_WAIT_TIME_IN_MINUTES
                      }
                    />
                  );
                })}
              </>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
});

export default Column;
