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
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react-lite';
import PatientFolderMapping from './PatientFolderMapping';

const sections = [
  { label: 'Patient Folder Mapping', path: '/patient-folder-mapping' },
];

const PaperlessForms = observer(() => {
  const { authentication } = useStores();
  const match = useRouteMatch('/dashboard/settings/paperless-forms');
  const location = useLocation();
  var user = authentication.user || {};

  const isCurrentRoute = (path) => {
    return location.pathname.indexOf(`${match.url}${path}`) > -1;
  };

  return (
    <Grid container className={styles.root} wrap="nowrap">
      <Grid item xs={12} sm={4} className={styles.listContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.listHeader}>
            <span>Paperless Forms</span>
          </div>
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
        <Route
          path={`${match.url}/patient-folder-mapping`}
          component={PatientFolderMapping}
        >
          {user.account_type !== 'Admin' && (
            <Redirect to="/dashboard/office-task" />
          )}
        </Route>
      </Grid>
    </Grid>
  );
});

export default PaperlessForms;
