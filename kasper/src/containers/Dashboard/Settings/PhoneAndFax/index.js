import React from 'react';
import styles from './index.module.css';
import {
  Route,
  useRouteMatch,
  Redirect,
  Link,
  useLocation,
} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import OutOfOfficeSettings from './OutOfOfficeSettings';
import HardwarePhones from './HardwarePhones';
import IncomingCalls from './IncomingCalls';
import AddHardwarePhone from './HardwarePhones/AddHardwarePhone';
import Vacation from './Vacation';
import CallForwarding from './CallForwarding';
import IvrSettings from './IvrSettings';
import CallRecording from './CallRecording';
import Groups from './Groups';
import AutomationSettings from './AutomationSettings';
import EditLineModal from './HardwarePhones/Configuration/EditLineModal';

const PhoneAndFax = () => {
  const match = useRouteMatch('/dashboard/settings/phone-and-fax');
  const location = useLocation();

  const sections = [
    { label: 'Voicemail and Out of Office', path: '/out-of-office' },
    { label: 'Call Forwarding', path: '/call-forwarding' },
    { label: 'Hardware Phones', path: '/hardware-phones' },
    { label: 'Incoming Calls', path: '/incoming-calls' },
    { label: 'Vacation', path: '/vacation' },
    { label: 'IVR Settings', path: '/ivr-settings' },
    { label: 'Call Groups', path: '/call-groups' },
    { label: 'Call Recording', path: '/call-recording' },
    { label: 'Automation Settings', path: '/automation-settings' },
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
            path={`${match.url}/out-of-office`}
            component={OutOfOfficeSettings}
          />
          <Route
            path={`${match.url}/call-forwarding`}
            component={CallForwarding}
          />
          <Route
            path={`${match.url}/hardware-phones/:hardwarePhoneId?`}
            component={HardwarePhones}
          />
          <Route
            path={`${match.url}/hardware-phones/:hardwarePhoneId/edit-line/:lineId?`}
            component={EditLineModal}
          />
          <Route
            path={`${match.url}/incoming-calls`}
            component={IncomingCalls}
          />
          <Route
            path={`${match.url}/hardware-phones/add-hardware-phone`}
            component={AddHardwarePhone}
          />
          <Route path={`${match.url}/vacation`} component={Vacation} />
          <Route path={`${match.url}/ivr-settings`} component={IvrSettings} />
          <Route path={`${match.url}/call-groups`} component={Groups} />
          <Route
            path={`${match.url}/call-recording`}
            component={CallRecording}
          />
          <Route
            path={`${match.url}/automation-settings`}
            component={AutomationSettings}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default PhoneAndFax;
