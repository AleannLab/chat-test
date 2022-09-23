import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import Button from '@material-ui/core/Button';
import Table from 'components/Core/Table';
import AddNewRoom from './AddNewRoom';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react-lite';

const tableColumns = [
  {
    id: 'name',
    numeric: false,
    disablePadding: false,
    label: 'Name',
    canSort: true,
  },
  { id: 'action', numeric: false, disablePadding: false, label: 'Action' },
];

const ManageRooms = observer(() => {
  const { rooms, notification } = useStores();
  // const [tableRows, setTableRows] = useState([]);
  const [showAddNewRoomModal, setShowAddNewRoomModal] = useState(false);
  // const [selectedRoomName, setSelectedRoomName] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);

  const createData = (id, name) => {
    const action = (
      <Button
        className="primary-btn me-2"
        variant="outlined"
        color="primary"
        startIcon={<DeleteIcon />}
        onClick={() => handleDeleteSelectedRoom(id)}
      >
        Delete
      </Button>
    );
    return { id, name, action };
  };

  useEffect(() => {
    rooms.fetchList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    rooms.loaded && setIsEmpty(!rooms.data.length);
  }, [rooms.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const tableRows = rooms.data.map((room) => {
    const roomData = rooms.get([{}, room]);
    return createData(roomData.id, roomData.name);
  });

  const handleAddEditModalClose = () => {
    // setSelectedRoomName(null);
    setShowAddNewRoomModal(false);
  };

  const handleDeleteSelectedRoom = async (id) => {
    await rooms.bulkDelete({ ids: [id] });
    notification.showSuccess('Room was deleted successfully');
    setSelectedRooms(selectedRooms.filter((item) => item !== id));
    setTimeout(() => {
      notification.hideNotification();
    }, 2500);
  };

  const handleDeleteRooms = async () => {
    await rooms.bulkDelete({ ids: selectedRooms });
    notification.showSuccess('Room(s) deleted successfully');
    setSelectedRooms([]);
    setTimeout(() => {
      notification.hideNotification();
    }, 2500);
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>Manage Exam Rooms</div>
          <div>
            <Button
              className="primary-btn me-2"
              variant="outlined"
              color="primary"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteRooms}
              disabled={!selectedRooms.length}
            >
              Delete{' '}
              {selectedRooms.length ? (
                <span> ({selectedRooms.length})</span>
              ) : null}
            </Button>
            <Button
              className="secondary-btn"
              variant="contained"
              color="secondary"
              onClick={() => setShowAddNewRoomModal(true)}
            >
              New Room
            </Button>
          </div>
        </div>
        <Table
          columns={tableColumns}
          rows={tableRows}
          sortBy={tableColumns[0].id}
          allowSelectAll
          selected={selectedRooms}
          onRowSelect={(ids) => {
            setSelectedRooms(ids);
          }}
          isEmpty={isEmpty}
        />
      </div>
      {showAddNewRoomModal ? (
        <AddNewRoom onClose={handleAddEditModalClose} />
      ) : null}
    </div>
  );
});

export default ManageRooms;
