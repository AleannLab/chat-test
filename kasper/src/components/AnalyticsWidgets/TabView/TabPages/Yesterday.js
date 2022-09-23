import React, { Suspense, lazy } from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import moment from 'moment';
import { useQuery } from 'react-query';
import { useStores } from 'hooks/useStores';
import { MORNING_HUDDLE_TYPE } from 'stores/analytics';
import {
  convertToCurrency,
  divideIfNotZero,
  sanitizeNumber,
} from 'helpers/misc';
import Skeleton from './Skeleton';

const TotalCollection = lazy(() =>
  import('components/AnalyticsWidgets/ProductionCards/TotalCollection'),
);
const Production = lazy(() =>
  import('components/AnalyticsWidgets/ProductionCards/Production'),
);
const HygieneReappointment = lazy(() =>
  import('components/AnalyticsWidgets/ProductionCards/HygieneReappointment'),
);
const DentistProduction = lazy(() =>
  import('components/AnalyticsWidgets/ProductionCards/DentistProduction'),
);
const HygienistProduction = lazy(() =>
  import('components/AnalyticsWidgets/ProductionCards/HygienistProduction'),
);
const Collections = lazy(() =>
  import('components/AnalyticsWidgets/Collections'),
);
const ProductionByRole = lazy(() =>
  import('components/AnalyticsWidgets/ProductionByRole'),
);

const Yesterday = () => {
  const { analytics: analyticsStore, notification } = useStores();

  // Transform API response and generate data model
  const transformData = (data) => {
    data.data.forEach((obj) => {
      for (var key in obj) {
        obj[key] =
          typeof obj[key] === 'number' ? sanitizeNumber(obj[key]) : obj[key];
      }
    });

    const sortedData = [
      ...data.data.sort((a, b) => new Date(b.date) - new Date(a.date)),
    ];
    const currentData = sortedData.slice(0, sortedData.length / 2);
    const pastData = sortedData.slice(sortedData.length / 2, sortedData.length);
    return {
      date: data.date,
      unscheduledPatients: data.unscheduled.totalPatients,
      totalPatients: currentData[0].totalPatients,
      totalProduction: currentData[0].totalProduction,
      collections: [...currentData],
      totalCollection: {
        current: currentData.reduce(
          (acc, curr) => acc + curr.totalCollection,
          0,
        ),
        past: pastData.reduce((acc, curr) => acc + curr.totalCollection, 0),
      },
      hygieneReappointmentPercentage: {
        current: sanitizeNumber(
          divideIfNotZero(
            currentData[0].futureHygienePatients,
            currentData[0].totalPatients,
          ) * 100,
        ),
        past: sanitizeNumber(
          divideIfNotZero(
            currentData[1].futureHygienePatients,
            currentData[1].totalPatients,
          ) * 100,
        ),
      },
      productionByRole: {
        current:
          currentData[0].doctorProduction + currentData[0].hygieneProduction,
        past:
          currentData[1].doctorProduction + currentData[1].hygieneProduction,
      },
    };
  };

  // React query to fetch production goal
  const productionGoalQuery = useQuery(
    ['analytics', 'productionGoal'],
    () => analyticsStore.getGoalByType('production_goal'),
    {
      staleTime: 300000, // 5 minutes
      select: (data) => Number(data['production_goal']),
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // React query to fetch morning huddle data for yesterday
  const {
    isLoading,
    isSuccess,
    data: morningHuddleData,
  } = useQuery(
    ['analytics', MORNING_HUDDLE_TYPE.YESTERDAY],
    () => analyticsStore.getMorningHuddleData(MORNING_HUDDLE_TYPE.YESTERDAY),
    {
      staleTime: 300000, // 5 minutes
      select: ({ data }) => transformData(data),
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  return (
    <Suspense fallback={<Skeleton />}>
      {isLoading && <Skeleton />}

      {isSuccess && (
        <>
          <div className="mb-3">
            <div>
              <span className={styles.pageTitle}>Yesterday</span>
              &nbsp;&nbsp;
              <span className={styles.dateField}>
                {moment(morningHuddleData.date).format('dddd, MMMM DD, Y')}
              </span>
            </div>
            <div className={styles.pageSubTitle}>Let’s see what happened.</div>
          </div>

          <Grid container className={`${styles.shortDetails} mb-3`}>
            <Grid item xs={12} md={10}>
              We have {morningHuddleData.totalPatients} patients with{' '}
              {convertToCurrency(morningHuddleData.totalProduction)} production,
              which was{' '}
              {convertToCurrency(
                Math.abs(
                  productionGoalQuery.data - morningHuddleData.totalProduction,
                ),
              )}{' '}
              {productionGoalQuery.data < morningHuddleData.totalProduction
                ? 'above'
                : 'below'}{' '}
              our goal.
            </Grid>
            {!!morningHuddleData.unscheduledPatients && (
              <Grid item xs={12} md={10}>
                {morningHuddleData.unscheduledPatients} patients were not
                rescheduled for a future appointment.
              </Grid>
            )}
          </Grid>

          <Grid container spacing={3} className="mt-2">
            {/* First row */}
            <Grid container spacing={3} item>
              <Grid item xs={12} sm={6} md={4}>
                <TotalCollection
                  current={morningHuddleData.totalCollection.current}
                  past={morningHuddleData.totalCollection.past}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Production
                  current={morningHuddleData.collections[0].totalProduction}
                  past={morningHuddleData.collections[1].totalProduction}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <HygieneReappointment
                  current={
                    morningHuddleData.hygieneReappointmentPercentage.current
                  }
                  past={morningHuddleData.hygieneReappointmentPercentage.past}
                />
              </Grid>
            </Grid>

            {/* Second row */}
            <Grid container spacing={3} item>
              <Grid item xs={12} sm={6} md={5}>
                <Collections
                  current={morningHuddleData.collections[0].totalCollection}
                  past={morningHuddleData.collections[1].totalCollection}
                  data={morningHuddleData.collections}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ProductionByRole
                  current={morningHuddleData.productionByRole.current}
                  past={morningHuddleData.productionByRole.past}
                  data={morningHuddleData.collections}
                />
              </Grid>
              <Grid container item xs={12} sm={12} md={3}>
                <Grid item xs={12}>
                  <DentistProduction
                    current={morningHuddleData.collections[0].doctorProduction}
                    past={morningHuddleData.collections[1].doctorProduction}
                  />
                </Grid>
                <Grid item xs={12}>
                  <HygienistProduction
                    current={morningHuddleData.collections[0].hygieneProduction}
                    past={morningHuddleData.collections[1].hygieneProduction}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </Suspense>
  );
};

export default Yesterday;
