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
import BarChart from './BarChart';
import LineChart from './LineChart';
import PieChart from './PieChart';

const ReportCategories = [
  { label: 'Bar Chart', path: '/bar-chart' },
  { label: 'Line Chart', path: '/line-chart' },
  { label: 'Pie Chart', path: '/pie-chart' },
];

const Charts = () => {
  const match = useRouteMatch('/dashboard/reports');
  const location = useLocation();

  const isCurrentRoute = (path) => {
    return location.pathname.indexOf(`${match.url}${path}`) > -1;
  };

  return (
    <Grid container className={styles.root} wrap="nowrap">
      <Grid item xs={12} sm={3} className={styles.listContainer}>
        <div className={styles.headerContainer}>
          <div className={styles.listHeader}>Reports</div>
          <div className={styles.listSubHeader}>Categories</div>
        </div>
        <div className="d-flex flex-column">
          {ReportCategories.map((category, i) => (
            <Link
              key={i}
              className={`${styles.category} ${
                isCurrentRoute(category.path) ? styles.selectedCategory : ''
              }`}
              to={`${match.url}${category.path}`}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </Grid>

      <Grid item xs={12} sm={9} className={styles.detailsPane}>
        <Route exact path={`${match.url}`}>
          <Redirect to={`${match.url}${ReportCategories[0].path}`} />
        </Route>
        <Route path={`${match.url}/bar-chart`} component={BarChart} />
        <Route path={`${match.url}/line-chart`} component={LineChart} />
        <Route path={`${match.url}/pie-chart`} component={PieChart} />
      </Grid>
    </Grid>
  );
};

export default Charts;
