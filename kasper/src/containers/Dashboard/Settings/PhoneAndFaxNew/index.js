import React from 'react';
import {
  useRouteMatch,
  useLocation,
  Link,
  Route,
  Redirect,
} from 'react-router-dom';
import styles from './index.module.css';
import { Grid } from '@material-ui/core';
import PhoneNumbersAndRouting from './PhoneNumbersAndRouting';
import SettingsModal from './PhoneNumbersAndRouting/SettingsModal';
import CallSchedule from './PhoneNumbersAndRouting/CallSchedule';
import AddTimeSlot from './PhoneNumbersAndRouting/CallSchedule/AddTimeSlot';
import FallbackAction from './PhoneNumbersAndRouting/CallSchedule/FallbackAction';
import PurchaseNumbers from './PhoneNumbersAndRouting/PurchaseNumbers';
import CustomGreetings from './CustomGreetings';
import EditGreetingsModal from './CustomGreetings/EditGreetingsModal';

import AddGreetingsNumber from './CustomGreetings/EditGreetingsModal/AddGreetingsNumber';
import Vacations from './Vacations';
import AddVacation from './Vacations/AddVacation';
import AddGreetings from './CustomGreetings/EditGreetingsModal/AddGreetings';
import Groups from '../PhoneAndFax/Groups';
import HardwarePhones from '../PhoneAndFax/HardwarePhones';
import EditLineModal from '../PhoneAndFax/HardwarePhones/Configuration/EditLineModal';
import AddHardwarePhone from '../PhoneAndFax/HardwarePhones/AddHardwarePhone';
import IvrSettings from '../PhoneAndFax/IvrSettings';
import CallForwarding from '../PhoneAndFax/CallForwarding';

const PhoneAndFaxNew = () => {
  const match = useRouteMatch('/dashboard/settings/phone-and-fax');
  const location = useLocation();

  const sections = [
    {
      label: 'Phone Number & Routing',
      path: '/phone-number-and-routing',
      component: PhoneNumbersAndRouting,
    },
    { label: 'Custom Greetings', path: '/custom-greetings' },
    { label: 'Call Tree (IVR)', path: '/ivr-settings' },
    { label: 'Hardware Phones', path: '/hardware-phones' },
    { label: 'Call Groups', path: '/call-groups' },
    { label: 'Call Forwarding', path: '/call-forwarding' },
    // { label: 'Blocked Numbers', path: '/blocked-numbers' },
    { label: 'Vacation', path: '/vacations' },
  ];

  const isCurrentRoute = (path) => {
    return location.pathname.includes(`${match.url}${path}`);
  };

  return (
    <>
      <Grid container className={styles.root} wrap="nowrap">
        <Grid item xs={12} sm={4} className={styles.listContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.listHeader}>Phone & Fax</div>
            <div className={styles.listSubHeader}>options</div>
          </div>
          <div className="d-flex flex-column">
            {sections.map((section, i) => (
              <Link
                key={i}
                className={`${styles.section} ${
                  isCurrentRoute(section.path) ? styles.selectedSection : ''
                }`}
                to={`${match.url}${section.path}`}
              >
                {section.label}
              </Link>
            ))}
          </div>
        </Grid>
        <Grid item xs={12} sm={10} className={styles.detailsPane}>
          <Route exact path={`${match.url}`}>
            <Redirect to={`${match.url}${sections[0].path}`} />
          </Route>
          <Route
            path={`${match.url}/phone-number-and-routing`}
            component={PhoneNumbersAndRouting}
          />
          <Route path={`${match.url}/ivr-settings`} component={IvrSettings} />
          <Route
            path={`${match.url}/call-forwarding`}
            component={CallForwarding}
          />
          <Route path={`${match.url}/call-groups`} component={Groups} />
          <Route
            path={`${match.url}/hardware-phones/:hardwarePhoneId?`}
            component={HardwarePhones}
          />
          <Route
            path={`${match.url}/hardware-phones/:hardwarePhoneId/edit-line/:lineId?`}
            component={EditLineModal}
          />
          <Route
            path={`${match.url}/hardware-phones/add-hardware-phone`}
            component={AddHardwarePhone}
          />
          <Route
            path={`${match.url}/phone-number-and-routing/settings/:numberId/:uuid`}
            component={SettingsModal}
          />
          <Route
            path={`${match.url}/phone-number-and-routing/schedule/:numberId`}
            component={CallSchedule}
          />
          <Route
            path={`${match.url}/phone-number-and-routing/schedule/:numberId/time-slot`}
            component={AddTimeSlot}
          />
          <Route
            path={`${match.url}/phone-number-and-routing/schedule/:numberId/fallback-action`}
            component={FallbackAction}
          />
          <Route
            path={`${match.url}/phone-number-and-routing/purchase-numbers`}
            component={PurchaseNumbers}
          />
          <Route
            path={`${match.url}/custom-greetings`}
            component={CustomGreetings}
          />
          <Route
            path={`${match.url}/custom-greetings/edit-greetings/:greetingType/:Id`}
            component={EditGreetingsModal}
          />
          <Route
            path={`${match.url}/custom-greetings/edit-greetings/:greetingType/:Id/add-greeting`}
            component={AddGreetings}
          />
          <Route
            path={`${match.url}/custom-greetings/edit-greetings/:greetingType/:Id/add-numbers/:greetingID`}
            component={AddGreetingsNumber}
          />
          <Route path={`${match.url}/vacations`} component={Vacations} />
          <Route
            path={`${match.url}/vacations/add-vacation`}
            component={AddVacation}
          />
          <Route
            path={`${match.url}/vacations/edit-vacation/:Id`}
            component={AddVacation}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default PhoneAndFaxNew;
