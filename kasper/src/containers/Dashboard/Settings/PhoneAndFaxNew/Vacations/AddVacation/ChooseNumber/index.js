import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AddNumberForm from './AddNumberForm';

const ChooseNumber = ({
  handleClose,
  addVacation,
  isAddingVacation,
  editVacation,
}) => {
  const { state } = useLocation();
  const [selectedNumbers, setSelectedNumbers] = useState([]);

  useEffect(() => {
    if (state?.assigned_numbers) {
      setSelectedNumbers(state.assigned_numbers.split(','));
    }
  }, [state]);

  return (
    <AddNumberForm
      handleClose={handleClose}
      selectedNumbers={selectedNumbers}
      addVacation={addVacation}
      isAddingVacation={isAddingVacation}
      editVacation={editVacation}
    />
  );
};

export default ChooseNumber;
