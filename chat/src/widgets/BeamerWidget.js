/**
 * Beamer widget to display announce Kasper latest updates and changelogs, and get user feedback with an in-app notification center.
 * visit https://www.getbeamer.com/ for more details
 */

import React, { memo } from 'react';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CONSTANTS from 'helpers/constants';
import { useStores } from 'hooks/useStores';

const ELEMENT_ID = 'beamer_widget';
const TENANT_ID =
  (
    CONSTANTS.TEST_TENANT_ID ||
    (window.location.hostname ? window.location.hostname.split('.')[0] : null)
  ).trim() || '';

function BeamerWidget() {
  const { authentication } = useStores();

  // Do not render if no account is configured
  if (!CONSTANTS.BEAMER_PRODUCT_ID) {
    return null;
  }

  // Use a function ref to determine if the DOM is ready for init
  const initWidget = (element) => {
    if (element) {
      window.beamer_config = {
        product_id: CONSTANTS.BEAMER_PRODUCT_ID,
        selector: ELEMENT_ID,
        // display: 'in-app',
        lazy: true,
        //---------------Visitor Information---------------
        user_firstname: authentication?.user?.username || '',
        user_lastname: `(${TENANT_ID})`,
        user_id: authentication?.user?.id || '',
        user_email: authentication?.user?.email || '',
        filter: TENANT_ID,
      };

      window.Beamer.init();
    }
  };

  return (
    <div className="position-relative me-2" id={ELEMENT_ID} ref={initWidget}>
      <NotificationsIcon />
    </div>
  );
}

export default memo(BeamerWidget);
