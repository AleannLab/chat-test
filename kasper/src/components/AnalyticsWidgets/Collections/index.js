import React from 'react';
import styles from './index.module.css';
import { convertToCurrency } from 'helpers/misc';
import GrowthIndicator from 'components/AnalyticsWidgets/GrowthIndicator';
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  BarSeries,
  Tooltip,
} from '@devexpress/dx-react-chart-material-ui';
import moment from 'moment';
import { Palette, EventTracker, Animation } from '@devexpress/dx-react-chart';

const DATE_FORMAT = 'M/DD';
const Collections = ({ current, past, data = [] }) => {
  const chartData =
    !!data &&
    data.length &&
    data
      .map(({ date, totalCollection: amount }) => ({
        date: moment(date).format(DATE_FORMAT),
        amount,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.title}>
          <span>Collections</span>
        </div>

        <div className="d-flex mb-2">
          <span className={styles.mainText}>{convertToCurrency(current)}</span>
          <GrowthIndicator
            target={past}
            achieved={current}
            formatter={convertToCurrency}
          />
        </div>

        {chartData ? (
          <Chart data={chartData} height={200} className="p-0">
            <ArgumentAxis showGrid={false} />
            <ValueAxis showGrid={true} showLabels={true} showTicks={false} />
            <Palette scheme={['#6FDF7A']} />
            <BarSeries
              argumentField="date"
              valueField="amount"
              barWidth={0.5}
              pointComponent={(props) => <BarSeries.Point {...props} />}
            />
            <EventTracker />
            <Tooltip
              contentComponent={({ text, ...restProps }) => (
                <Tooltip.Content
                  {...restProps}
                  text={convertToCurrency(+text)}
                />
              )}
              overlayComponent={({ style, ...restProps }) => (
                <Tooltip.Overlay
                  {...restProps}
                  style={{
                    ...style,
                    zIndex: 10,
                  }}
                />
              )}
            />
            <Animation />
          </Chart>
        ) : (
          <div>No data to show</div>
        )}
      </div>
    </div>
  );
};

export default Collections;
