import React, { useState } from 'react';
import styles from './index.module.css';
import {
  Chart,
  Legend,
  PieSeries,
} from '@devexpress/dx-react-chart-material-ui';
import { Palette, Animation } from '@devexpress/dx-react-chart';
import Skeleton from '@material-ui/lab/Skeleton';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';

const PatientsScheduled = () => {
  const { analytics: analyticsStore } = useStores();
  const [chartData, setChartData] = useState();

  // react-query to fetch analytics for total patients scheduled
  const totalPatientScheduledQuery = useQuery(
    'totalPatientScheduled',
    () => analyticsStore.getTotalPatientScheduled(),
    {
      onSuccess: (response) => {
        const mappedData = response.patientsScheduled.map(
          ({ status, count }) => ({
            status: `${status} (${count})`,
            count,
          }),
        );
        setChartData({
          data: [...mappedData],
          total: response.total,
        });
      },
    },
  );

  return (
    <div className={styles.container}>
      {!!chartData && !totalPatientScheduledQuery.isFetching ? (
        <>
          <span className={styles.title}>Total patients scheduled</span>
          <div className={styles.patientCountContainer}>
            <span className={styles.count}>{chartData.total}</span>
            <span className={styles.patients}>patients</span>
          </div>
          {!!chartData.total && (
            <div className={styles.chartContainer}>
              <Chart
                data={chartData.data}
                height={160}
                width={330}
                className="p-0"
              >
                <Palette
                  scheme={['#DDDDDD', '#6FDF7A', '#4AADE5', '#F5DD5F']}
                />
                <PieSeries
                  valueField="count"
                  argumentField="status"
                  pointComponent={(props) => <PieSeries.Point {...props} />}
                />
                <Legend
                  position="right"
                  rootComponent={(props) => (
                    <Legend.Root
                      {...props}
                      className="d-flex flex-column justify-content-center p-0 ps-3"
                    />
                  )}
                  itemComponent={(props) => (
                    <Legend.Item {...props} className="m-0 p-0" />
                  )}
                  labelComponent={(props) => (
                    <Legend.Label {...props} className={styles.legendLabel} />
                  )}
                />
                <Animation />
              </Chart>
            </div>
          )}
        </>
      ) : (
        <div>
          <Skeleton variant="text" height={20} />
          <Skeleton className="mt-2" variant="text" height={30} width={100} />
          <div className="d-flex mt-2">
            <Skeleton variant="circle" width={140} height={140} />
            <div className="ps-3 d-flex flex-column justify-content-center">
              <Skeleton variant="text" height={20} width={150} />
              <Skeleton
                className="mt-1"
                variant="text"
                height={20}
                width={150}
              />
              <Skeleton
                className="mt-1"
                variant="text"
                height={20}
                width={150}
              />
              <Skeleton
                className="mt-1"
                variant="text"
                height={20}
                width={150}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsScheduled;
