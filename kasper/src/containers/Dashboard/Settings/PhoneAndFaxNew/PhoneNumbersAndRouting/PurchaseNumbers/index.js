import React from 'react';
import { useHistory } from 'react-router-dom';
import Modal from 'components/Core/Modal';
import PurchaseNumberForm from './PurchaseNumberForm';

const PurchaseNumbers = () => {
  const history = useHistory();
  return (
    <Modal
      size="md"
      header="Purchase Numbers"
      body={<PurchaseNumberForm handleClose={() => history.goBack()} />}
      onClose={() => history.goBack()}
    />
  );
};

export default PurchaseNumbers;
