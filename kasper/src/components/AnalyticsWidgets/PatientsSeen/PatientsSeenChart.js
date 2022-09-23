import { ResponsiveLine } from '@nivo/line';
import React from 'react';

const PatientsSeenChart = ({ data }) => (
  <ResponsiveLine
    data={data}
    margin={{
      top: 50,
      right: 30,
      bottom: 50,
      left: 30,
    }}
    xScale={{
      type: 'point',
    }}
    yScale={{
      type: 'linear',
      stacked: true,
      min: 'auto',
      max: 'auto',
    }}
    minY="auto"
    maxY="auto"
    stacked={true}
    curve="cardinal"
    axisBottom={{
      orient: 'bottom',
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legendOffset: 36,
      legendPosition: 'center',
    }}
    axisLeft={{
      orient: 'left',
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legendOffset: -40,
      legendPosition: 'center',
    }}
    colors={{ scheme: 'accent' }}
    dotSize={10}
    yFormat=" >-.2f"
    dotColor="inherit:darker(0.3)"
    dotBorderWidth={2}
    enableGridX={false}
    areaBaselineValue={0}
    enableArea
    enablePoints={false}
    dotBorderColor="#ffffff"
    enableDotLabel={true}
    dotLabel="y"
    dotLabelYOffset={-12}
    animate={true}
    motionStiffness={90}
    isInteractive
    motionDamping={15}
  />
);

export default PatientsSeenChart;
