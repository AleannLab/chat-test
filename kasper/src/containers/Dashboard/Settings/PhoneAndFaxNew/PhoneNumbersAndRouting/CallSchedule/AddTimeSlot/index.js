import Modal from 'components/Core/Modal';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import TimeSlotForm from './TimeSlotForm';

const AddTimeSlot = () => {
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing/schedule/:numberId',
  );
  const history = useHistory();

  const handleClose = () => {
    history.push(match.url);
  };

  return <Modal onClose={handleClose} body={<TimeSlotForm />} />;
};

export default AddTimeSlot;
