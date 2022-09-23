import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import Modal from 'components/Core/Modal';
import Table from 'components/Core/Table';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './index.module.css';

const tableColumns = [
  {
    id: 'firstname',
    numeric: false,
    disablePadding: false,
    label: 'First Name',
  },
  { id: 'lastname', numeric: false, disablePadding: false, label: 'Last name' },
  { id: 'company', numeric: false, disablePadding: false, label: 'Company' },
  {
    id: 'faxNumber',
    numeric: false,
    disablePadding: false,
    label: 'Fax Number',
  },
];

const FaxContactList = (props) => {
  const history = useHistory();
  const { contacts } = useStores();
  const [selectedRows, setSelectedRows] = useState([]);

  function isAlreadyAdded(id) {
    if (
      props.recipients?.length > 0 &&
      props.recipients.find((c) => c.id === id)
    ) {
      return true;
    }
    return false;
  }

  function createData(id, firstname, lastname, company, faxNumber) {
    return { id, firstname, lastname, company, faxNumber };
  }

  useEffect(() => {
    contacts.fetchList();
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  const tableRows = contacts.data.map((contact) => {
    const contactData = contacts.get([{}, contact]);
    return createData(
      contactData.uuid,
      contactData.firstname,
      contactData.lastname,
      contactData.company,
      contactData.faxNumber,
    );
  });

  const handleClose = (selectedRows) => {
    let contactListElement = [];
    for (let i = 0; i < selectedRows?.length; i++) {
      const searchId = selectedRows[i];
      contactListElement[i] = tableRows.find(
        (tableRow) => tableRow.id === searchId,
      );
    }
    if (props.onClose) {
      props.onClose(contactListElement);
    } else {
      history.goBack();
    }
  };

  const handleContactSelect = (data) => {
    setSelectedRows(data);
  };

  const handleDeleteContact = () => {
    for (let i = 0; i < selectedRows.length; i++) {
      contacts.delete(selectedRows[i]);
      setSelectedRows([]);
    }
  };

  return (
    <Modal
      header="Fax Contact List"
      body={
        <div className="d-flex flex-column justify-content-center">
          <div className={styles.subTitleText}>
            You can select the recipient(s) to send a fax.
          </div>
          <Table
            columns={tableColumns}
            rows={tableRows}
            selected={selectedRows}
            isSelectable={true}
            onRowSelect={handleContactSelect}
            sortBy={tableColumns[0].id}
            emptyText="No contacts"
            isEmpty={!contacts.loading && !tableRows.length}
            height={350}
            isAlreadyAdded={isAlreadyAdded}
          />
        </div>
      }
      footer={
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            className="primary-btn"
            variant="outlined"
            color="primary"
            onClick={handleDeleteContact}
            startIcon={<DeleteIcon style={{ fontSize: '1rem' }} />}
            disabled={!selectedRows.length}
          >
            <span>Delete</span>
            {selectedRows.length ? <span>({selectedRows.length})</span> : null}
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={() => handleClose(selectedRows)}
            disabled={!selectedRows.length}
          >
            Add
          </Button>
        </>
      }
      onClose={handleClose}
    />
  );
};

export default observer(FaxContactList);
