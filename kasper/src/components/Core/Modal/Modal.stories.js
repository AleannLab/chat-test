import React, { useState } from 'react';
import Modal from '.';
import Button from '@material-ui/core/Button';

export default {
  title: 'Modal',
  component: Modal,
};

export const Main = (args) => {
  const [openModal, setOpenModal] = useState(false);
  return (
    <>
      <Button
        className="secondary-btn"
        variant="contained"
        color="secondary"
        onClick={() => setOpenModal(true)}
      >
        Open Modal
      </Button>
      {openModal && <Modal {...args} onClose={() => setOpenModal(false)} />}
    </>
  );
};

// Default arg values
Main.args = {
  size: 'md',
  header: 'Modal Title',
  body: 'Modal Body',
  footer: 'Modal Footer',
  defaultState: true,
  enableMargin: true,
  fullWidth: true,
  allowClosing: true,
  customPosition: false,
};

export const ControlledModal = () => {
  const [openModal, setOpenModal] = useState(false);
  return (
    <>
      <Button
        className="secondary-btn"
        variant="contained"
        color="secondary"
        onClick={() => setOpenModal(true)}
      >
        Open Modal
      </Button>

      {openModal && (
        <Modal
          header="Modal Title"
          body={
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: 400 }}
            >
              <h4>This is modal body</h4>
            </div>
          }
          footer={
            <>
              <Button
                className="primary-btn me-auto"
                variant="outlined"
                color="primary"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>

              <Button
                className="secondary-btn"
                variant="contained"
                color="secondary"
                onClick={() => setOpenModal(false)}
              >
                Send Fax
              </Button>
            </>
          }
          onClose={() => setOpenModal(false)}
        />
      )}
    </>
  );
};
