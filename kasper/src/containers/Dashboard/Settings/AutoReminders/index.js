import React, { useState } from 'react';
import styles from './index.module.css';
import {
  Route,
  useRouteMatch,
  Redirect,
  Link,
  useLocation,
} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react-lite';
import AppointmentReminders from './AppointmentReminders';
import NewAppointmentsAndUpdates from './NewAppointmentsAndUpdates/index';
import { useFlags } from 'launchdarkly-react-client-sdk';
import GlobalSettings from './GlobalSettings/index';
import HygieneReminders from './HygieneReminders/index';

const AutoReminders = observer(() => {
  const { authentication } = useStores();
  const match = useRouteMatch('/dashboard/settings/auto-reminders');
  const location = useLocation();
  const { newAppointmentsAndUpdates, hygieneReminder } = useFlags();
  var user = authentication.user || {};
  const sections = [
    { label: 'Global Settings', path: '/global-settings' },
    { label: 'New Appointments & Updates', path: '/new-appointment-updates' },
    {
      label: 'Appt. Reminders & Confirmations',
      path: '/appointment-reminders',
    },
    {
      label: 'Hygiene Reminders',
      path: '/hygiene-reminders',
    },
  ];
  const isCurrentRoute = (path) => {
    return location.pathname.indexOf(`${match.url}${path}`) > -1;
  };

  return (
    <>
      <Grid container className={styles.root} wrap="nowrap">
        <Grid item xs={12} sm={4} className={styles.listContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.listHeader}>
              <span>Auto Reminders</span>
            </div>
          </div>
          <div className="d-flex flex-column">
            {sections.map((section, i) => {
              if (
                section.label === 'Hygiene Reminders' &&
                hygieneReminder !== true
              ) {
                return;
              }

              if (section.label === 'New Appointments & Updates') {
                if (newAppointmentsAndUpdates === true) {
                  return (
                    <Link
                      key={i}
                      className={`${styles.section} ${
                        isCurrentRoute(section.path)
                          ? styles.selectedSection
                          : ''
                      }`}
                      to={`${match.url}${section.path}`}
                    >
                      {section.label}
                    </Link>
                  );
                }
              } else {
                return (
                  <Link
                    key={i}
                    className={`${styles.section} ${
                      isCurrentRoute(section.path) ? styles.selectedSection : ''
                    }`}
                    to={`${match.url}${section.path}`}
                  >
                    {section.label}
                  </Link>
                );
              }
            })}
          </div>
        </Grid>
        <Grid item xs={12} sm={8} className={styles.detailsPane}>
          <Route exact path={`${match.url}`}>
            <Redirect to={`${match.url}${sections[0].path}`} />
          </Route>
          <Route
            path={`${match.url}/global-settings`}
            component={GlobalSettings}
          ></Route>
          <Route
            path={`${match.url}/appointment-reminders`}
            component={AppointmentReminders}
          >
            {user.account_type !== 'Admin' && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>
          <Route
            path={`${match.url}/new-appointment-updates`}
            component={NewAppointmentsAndUpdates}
          >
            {!newAppointmentsAndUpdates && (
              <Redirect to="/dashboard/office-task" />
            )}
          </Route>

          {hygieneReminder === true && (
            <Route
              path={`${match.url}/hygiene-reminders`}
              component={HygieneReminders}
            >
              {user.account_type !== 'Admin' && (
                <Redirect to="/dashboard/office-task" />
              )}
            </Route>
          )}
        </Grid>
      </Grid>
    </>
  );
});

export default AutoReminders;
