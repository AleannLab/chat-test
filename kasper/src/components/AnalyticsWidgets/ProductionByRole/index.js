import React from 'react';
import styles from './index.module.css';
import { convertToCurrency } from 'helpers/misc';
import GrowthIndicator from 'components/AnalyticsWidgets/GrowthIndicator';
import {
  Chart,
  PieSeries,
  Legend,
  Tooltip,
} from '@devexpress/dx-react-chart-material-ui';
import { Palette, EventTracker, Animation } from '@devexpress/dx-react-chart';

const ProductionByRole = ({ current, past, data = [] }) => {
  const chartData = !!data &&
    data.length && [
      {
        role: 'Hygienists',
        count: data[0].hygieneProduction,
      },
      {
        role: 'Dentists',
        count: data[0].doctorProduction,
      },
    ];

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.title}>
          <span>Production by Role</span>
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
            <Palette scheme={['#432E88', '#F4266E']} />
            <PieSeries valueField="count" argumentField="role" />
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

export default ProductionByRole;
