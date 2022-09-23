import Modal from 'components/Core/Modal';
import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import TwentyFourSevenSchedule from '../TwentyFourSevenSchedule';
import FallbackActionForm from './FallBackActionForm';

const FallbackAction = () => {
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing/schedule/:numberId',
  );
  const history = useHistory();

  const handleClose = () => {
    history.push(match.url);
  };

  return (
    <Modal
      onClose={handleClose}
      header="Fallback Action"
      // body={<TwentyFourSevenSchedule fallbackAction={true} />}
      body={<FallbackActionForm />}
    />
  );
};

export default FallbackAction;
