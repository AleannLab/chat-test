import Modal from 'components/Core/Modal';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import AddNumberForm from './AddNumberForm';

const AddGreetingsNumber = () => {
  const history = useHistory();
  const { state } = useLocation();
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [selectedName, setSelectedName] = useState('');

  useEffect(() => {
    if (state?.numbers) {
      console.log(state.numbers.split(','));
      setSelectedNumbers(state.numbers.split(','));
    }

    if (state?.name) {
      setSelectedName(state?.name);
    }
  }, [state]);

  const handleClose = () => {
    history.goBack();
  };
  return (
    <Modal
      size="sm"
      onClose={handleClose}
      body={
        <AddNumberForm
          handleClose={handleClose}
          selectedNumbers={selectedNumbers}
          selectedName={selectedName}
        />
      }
    />
  );
};

export default AddGreetingsNumber;
