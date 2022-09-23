import React from 'react';
import {
  Route,
  useRouteMatch,
  Redirect,
  Link,
  useLocation,
} from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';
import KasperServer from './KasperServer';

const sections = [{ label: 'Status & Updates', path: '/kasper-server-app' }];

const ServerSettings = () => {
  const match = useRouteMatch('/dashboard/settings/server-settings');
  const { authentication } = useStores();
  const user = authentication.user || {};
  const location = useLocation();

  const isCurrentRoute = (path) => {
    return location.pathname.indexOf(`${match.url}${path}`) > -1;
  };
  return (
    <Grid container className={styles.root} wrap="nowrap">
      <Grid item xs={12} sm={4} className={styles.listContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.listHeader}>Kasper Server App</div>
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
      <Grid item xs={12} sm={8} className={styles.detailsPane}>
        <Route exact path={`${match.url}`}>
          <Redirect to={`${match.url}${sections[0].path}`} />
        </Route>
        <Route path={`${match.url}/kasper-server-app`} component={KasperServer}>
          {user.account_type !== 'Admin' && (
            <Redirect to="/dashboard/office-task" />
          )}
        </Route>
      </Grid>
    </Grid>
  );
};

export default ServerSettings;
