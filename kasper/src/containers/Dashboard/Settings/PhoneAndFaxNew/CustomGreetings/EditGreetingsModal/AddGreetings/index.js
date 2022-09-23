import Modal from 'components/Core/Modal';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import AddGreetingsForm from './AddGreetingsForm';

const AddGreetings = () => {
  const history = useHistory();
  const { Id, greetingType } = useParams();
  const GreetingName = greetingType.split('-')?.[0];

  const handleClose = () => {
    history.goBack();
  };
  return (
    <Modal
      size="sm"
      onClose={handleClose}
      body={
        <AddGreetingsForm
          Id={Id}
          handleClose={handleClose}
          GreetingName={GreetingName}
        />
      }
    />
  );
};

export default AddGreetings;
