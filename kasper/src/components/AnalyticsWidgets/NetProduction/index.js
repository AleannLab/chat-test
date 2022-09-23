import React, { useState } from 'react';
import styles from './index.module.css';
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  BarSeries,
} from '@devexpress/dx-react-chart-material-ui';
import { Animation } from '@devexpress/dx-react-chart';
import Skeleton from '@material-ui/lab/Skeleton';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import moment from 'moment';
import { convertToCurrency } from 'helpers/misc';
import { convertCustomTime } from 'helpers/timezone';

const DATE_FORMAT = 'M/DD';

const NetProduction = () => {
  const { analytics: analyticsStore } = useStores();
  const [chartData, setChartData] = useState();

  // react-query to fetch analytics for total patients scheduled
  const estimatedNetProductionQuery = useQuery(
    'estimatedNetProduction',
    () => analyticsStore.getEstimatedNetProduction(),
    {
      onSuccess: (response) => {
        const mappedData = response
          .map(({ date, amount }) => ({
            date: convertCustomTime({
              dateTime: moment(date).utc().format('L'),
              format: DATE_FORMAT,
            }),
            amount,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setChartData({
          data: [...mappedData],
          total: mappedData.reduce((prevVal, currVal) => ({
            amount: prevVal.amount + currVal.amount,
          })).amount,
        });
      },
    },
  );

  return (
    <div className={styles.container}>
      {!!chartData && !estimatedNetProductionQuery.isFetching ? (
        <>
          <span className={styles.title}>Estimated net production</span>
          <div className={styles.amountDaysContainer}>
            <span className={styles.amount}>
              {convertToCurrency(chartData.total)}
            </span>
            <span className={styles.days}>Past 7 days</span>
          </div>
          {!!chartData.total && (
            <div className={styles.chartContainer}>
              <Chart
                data={chartData.data}
                height={200}
                width={330}
                className="p-0"
              >
                <ArgumentAxis showGrid={false} />
                <ValueAxis showGrid={false} showLabels={false} />
                <BarSeries
                  argumentField="date"
                  valueField="amount"
                  barWidth={0.5}
                  pointComponent={(props) => (
                    <BarSeries.Point
                      {...props}
                      className={`${styles.bar} ${
                        props.argument ===
                        convertCustomTime({
                          dateTime: moment().subtract(1, 'day'),
                          format: DATE_FORMAT,
                        })
                          ? styles.highlightedBar
                          : ''
                      }`}
                    />
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
          <div className="d-flex mt-2 align-items-end">
            <Skeleton variant="rect" height={100} width={40} />
            <Skeleton className="ms-4" variant="rect" height={200} width={40} />
            <Skeleton className="ms-4" variant="rect" height={100} width={40} />
            <Skeleton className="ms-4" variant="rect" height={140} width={40} />
            <Skeleton className="ms-4" variant="rect" height={220} width={40} />
            <Skeleton className="ms-4" variant="rect" height={60} width={40} />
            <Skeleton className="ms-4" variant="rect" height={150} width={40} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NetProduction;
