import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';

import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormControl from '@material-ui/core/FormControl';
import { useStores } from 'hooks/useStores';
import ListManager from 'components/ListManager';
import Skeleton from '@material-ui/lab/Skeleton';
import { observer } from 'mobx-react-lite';

const SelectRoom = observer(({ patient, onSelect, onClose }) => {
  const [selectedRoom, setSelectedRoom] = useState(
    patient && patient.room_id ? `${patient.room_id}` : null,
  );

  const { rooms } = useStores();

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = () => rooms.fetchList({});

  const handleChange = (event) => {
    setSelectedRoom(event.target.value);
  };

  const handleClose = () => {
    onClose();
  };

  const handleFormSelect = () => {
    onSelect(selectedRoom);
  };

  return (
    <Modal
      size="sm"
      fullWidth={false}
      header="Select Room"
      body={
        <div>
          <div className={styles.roomsContainer}>
            {
              <RadioGroup
                aria-label="select_room"
                name="select_room"
                value={selectedRoom}
                onChange={handleChange}
              >
                <ListManager
                  data={rooms.data}
                  loading={rooms.loading}
                  loaded={rooms.loaded}
                  emptyMessage={
                    <p className="text-center pt-5">
                      Oops! Nothing found here.
                    </p>
                  }
                  render={React.memo(RoomListItem)}
                  renderLoading={<Skeleton />}
                />
                {/* {
                                    Object.keys(rooms.datum)
                                        .map((room, index) => <FormControlLabel
                                            key={index}
                                            value={room.name}
                                            control={<Radio />}
                                            label={room.name}
                                            className={styles.roomLabel} />)
                                } */}
              </RadioGroup>
            }
          </div>
          <div className={styles.footerContainer}>
            <Button
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Cancel
            </Button>

            <Button
              className="secondary-btn"
              variant="contained"
              color="secondary"
              onClick={handleFormSelect}
              disabled={!selectedRoom}
            >
              Select
            </Button>
          </div>
        </div>
      }
      onClose={handleClose}
    />
  );
});

export default SelectRoom;

const RoomListItem = observer(({ id }) => {
  const { rooms } = useStores();
  const room = rooms.datum[id];

  return (
    <FormControlLabel
      key={id}
      value={`${room.id}`}
      control={<Radio />}
      label={room.name}
      className={styles.roomLabel}
    />
  );
});
