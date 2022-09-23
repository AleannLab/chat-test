import Modal from 'components/Core/Modal';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import EditCustomGreetings from './EditCustomGreetings';

const renderModalSize = (selectedTab) => {
  switch (selectedTab) {
    case 'Closed':
      return 'md';
    case 'Miscellaneous':
      return 'sm';
    default:
      return 'md';
  }
};

const EditGreetingsModal = () => {
  const history = useHistory();
  const { greetingType } = useParams();

  const handleClose = () => {
    history.goBack();
  };

  return (
    <Modal
      size={renderModalSize(greetingType)}
      onClose={handleClose}
      body={<EditCustomGreetings />}
    />
  );
};

export default EditGreetingsModal;
