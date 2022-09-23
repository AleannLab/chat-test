import React, { Suspense, lazy } from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import moment from 'moment';
import { useQuery } from 'react-query';
import { useStores } from 'hooks/useStores';
import { MORNING_HUDDLE_TYPE } from 'stores/analytics';
import { sanitizeNumber } from 'helpers/misc';
import Skeleton from './Skeleton';

const BalanceDue = lazy(() =>
  import('components/AnalyticsWidgets/PatientCards/BalanceDue'),
);
const UnscheduledTreatment = lazy(() =>
  import('components/AnalyticsWidgets/PatientCards/UnscheduledTreatment'),
);
const UnscheduledFamilyMembers = lazy(() =>
  import('components/AnalyticsWidgets/PatientCards/UnscheduledFamilyMembers'),
);
const UnscheduledHygiene = lazy(() =>
  import('components/AnalyticsWidgets/PatientCards/UnscheduledHygiene'),
);
const GoalCard = lazy(() => import('components/AnalyticsWidgets/GoalCard'));

const Tomorrow = () => {
  const { analytics: analyticsStore, notification } = useStores();

  // Transform API response and generate data model
  const transformData = (data) => {
    return {
      date: data.date,
      totalPatients: sanitizeNumber(data.scheduledForDate.totalPatients),
      totalProduction: sanitizeNumber(data.scheduledForDate.totalProduction),
      totalAppointments: sanitizeNumber(
        data.scheduledForDate.totalAppointments,
      ),
      unscheduledTreatment: {
        totalPatients: sanitizeNumber(data.unscheduled.totalPatients),
        totalProduction: sanitizeNumber(data.unscheduled.totalProduction),
        moreData:
          !!data.unscheduled.data &&
          data.unscheduled.data.length &&
          data.unscheduled.data.map(({ PatNum, Patient, ProcFee }) => ({
            patientId: PatNum,
            patientName: Patient,
            potentialFees: sanitizeNumber(ProcFee),
          })),
      },
      unscheduledFamily: {
        totalPatients: sanitizeNumber(data.unscheduledFamily.totalPatients),
        moreData:
          !!data.unscheduledFamily.data &&
          data.unscheduledFamily.data.length &&
          data.unscheduledFamily.data.map(
            ({ AptPat, AptPatNum, FamilyMemberPat, FamilyMemberPatNum }) => ({
              patientId: FamilyMemberPatNum,
              patientName: FamilyMemberPat,
              guarantorId: AptPatNum,
              guarantorName: AptPat,
            }),
          ),
      },
      unscheduledHygiene: {
        totalPatients: sanitizeNumber(data.unscheduledHygiene.totalPatients),
        moreData:
          !!data.unscheduledHygiene.data &&
          data.unscheduledHygiene.data.length &&
          data.unscheduledHygiene.data.map(({ PatNum, Patient, ProcFee }) => ({
            patientId: PatNum,
            patientName: Patient,
            potentialFees: sanitizeNumber(ProcFee),
          })),
      },
      balanceDues: {
        totalPatients: sanitizeNumber(data.balanceDues.totalPatients),
        totalProduction: sanitizeNumber(data.balanceDues.totalBalance),
        moreData:
          !!data.balanceDues.data &&
          data.balanceDues.data.length &&
          data.balanceDues.data.map(({ PatNum, Patient, BalEst }) => ({
            patientId: PatNum,
            patientName: Patient,
            balanceDue: sanitizeNumber(BalEst),
          })),
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

  // React query to fetch morning huddle data for tomorrow
  const {
    isLoading,
    isSuccess,
    data: morningHuddleData,
  } = useQuery(
    ['analytics', MORNING_HUDDLE_TYPE.TOMORROW],
    () => analyticsStore.getMorningHuddleData(MORNING_HUDDLE_TYPE.TOMORROW),
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
              <span className={styles.pageTitle}>Scheduled for Tomorrow</span>
              &nbsp;&nbsp;
              <span className={styles.dateField}>
                {moment(morningHuddleData.date).format('dddd, MMMM DD, Y')}
              </span>
            </div>
          </div>

          <Grid container className={`${styles.shortDetails} mb-3`}>
            <Grid item xs={12} md={10}>
              As of this morning we have {morningHuddleData.totalPatients}{' '}
              patients coming in.
            </Grid>
          </Grid>

          <Grid container spacing={3} className="mt-2">
            {/* First row */}
            <Grid container spacing={3} item>
              <Grid item xs={12} sm={6} md={4}>
                <UnscheduledTreatment
                  data={morningHuddleData.unscheduledTreatment}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <UnscheduledFamilyMembers
                  data={morningHuddleData.unscheduledFamily}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <UnscheduledHygiene
                  data={morningHuddleData.unscheduledHygiene}
                />
              </Grid>
            </Grid>

            {/* Second row */}
            <Grid container spacing={3} item>
              <Grid item xs={12} sm={8}>
                <GoalCard
                  totalPatients={morningHuddleData.totalPatients}
                  target={productionGoalQuery.data}
                  achieved={morningHuddleData.totalProduction}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <BalanceDue data={morningHuddleData.balanceDues} />
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </Suspense>
  );
};

export default Tomorrow;
