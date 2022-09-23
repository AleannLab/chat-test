import React, { useMemo } from 'react';
import styles from './index.module.css';
import {
  Route,
  useRouteMatch,
  Redirect,
  Link,
  useLocation,
} from 'react-router-dom';
import { useQuery } from 'react-query';
import Grid from '@material-ui/core/Grid';
import { useStores } from 'hooks/useStores';
import { PERMISSION_IDS } from 'helpers/constants';
import OfficeProfile from './OfficeProfile';
import BrandCustomization from './BrandCustomization';
import ManageRooms from './ManageRooms';
import Practitioners from './Practitioners';
import PatientSync from './PatientSync';
import { useFlags } from 'launchdarkly-react-client-sdk';

const OfficeSettings = () => {
  const match = useRouteMatch('/dashboard/settings/office-settings');
  const location = useLocation();
  const { enableBrandCustomization } = useFlags();

  const isCurrentRoute = (path) => {
    return location.pathname === `${match.url}${path}`;
  };

  const { permissions, authentication, notification } = useStores();
  const user = authentication.user || {};

  const { isLoading, data: userPermission = {} } = useQuery(
    ['userPermissions', user.id],
    () => permissions.getUserPermissions(user.id),
    {
      enabled: !!user.id,
      select: (data) => ({
        allowBrandingCustomization: data.some(
          (p) =>
            p.permission_id === PERMISSION_IDS.BRAND_CUSTOMIZATION &&
            p.enabled === 1,
        ),
      }),
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const canCustomizeBrand = useMemo(
    () => enableBrandCustomization && userPermission.allowBrandingCustomization,
    [enableBrandCustomization, userPermission.allowBrandingCustomization],
  );

  const sections = useMemo(
    () => [
      { label: 'Office Profile', path: '/office-profile' },
      ...(canCustomizeBrand
        ? [{ label: 'Brand Customization', path: '/brand-customization' }]
        : []),
      { label: 'Manage Exam Rooms', path: '/manage-rooms' },
      { label: 'Practitioners', path: '/practitioners' },
      { label: 'Patient Sync', path: '/patient-sync' },
    ],
    [canCustomizeBrand],
  );

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Grid container className={styles.root} wrap="nowrap">
        <Grid item xs={12} sm={4} className={styles.listContainer}>
          <div className={styles.headerContainer}>
            <div className={styles.listHeader}>Office Settings</div>
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
        <Grid item xs={12} sm={8} className={styles.detailsPane}>
          <Route exact path={`${match.url}`}>
            <Redirect to={`${match.url}${sections[0].path}`} />
          </Route>
          <Route
            path={`${match.url}/office-profile`}
            component={OfficeProfile}
          />
          {canCustomizeBrand && (
            <Route
              path={`${match.url}/brand-customization`}
              component={BrandCustomization}
            />
          )}
          <Route path={`${match.url}/manage-rooms`} component={ManageRooms} />
          <Route
            path={`${match.url}/practitioners`}
            component={Practitioners}
          />
          <Route path={`${match.url}/patient-sync`} component={PatientSync} />
        </Grid>
      </Grid>
    </>
  );
};

export default OfficeSettings;
