import React, { useState } from 'react';
import Button from '@material-ui/core/Button';

import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormControl from '@material-ui/core/FormControl';

const ROOMS = [
  'Room number one',
  'Room number two',
  'Room number three',
  'Room number four',
  'Room number five',
  'Room number six',
  'Room number seven',
  'Room number eight',
  'Room number nine',
  'Room number ten',
];

const SelectRoom = ({ onSelect, onClose }) => {
  const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);

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
                {ROOMS.map((room, index) => (
                  <FormControlLabel
                    key={index}
                    value={room}
                    control={<Radio />}
                    label={room}
                    className={styles.roomLabel}
                  />
                ))}
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
            >
              Select
            </Button>
          </div>
        </div>
      }
      onClose={handleClose}
    />
  );
};

export default SelectRoom;
