import React from 'react';
import { ResponsivePie } from '@nivo/pie';

const data = [
  {
    id: 'python',
    label: 'python',
    value: 233,
    color: 'hsl(68, 70%, 50%)',
  },
  {
    id: 'php',
    label: 'php',
    value: 334,
    color: 'hsl(41, 70%, 50%)',
  },
  {
    id: 'javascript',
    label: 'javascript',
    value: 481,
    color: 'hsl(13, 70%, 50%)',
  },
  {
    id: 'c',
    label: 'c',
    value: 598,
    color: 'hsl(14, 70%, 50%)',
  },
  {
    id: 'lisp',
    label: 'lisp',
    value: 451,
    color: 'hsl(263, 70%, 50%)',
  },
];

const PieChart = () => (
  <ResponsivePie
    data={data}
    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
    innerRadius={0.5}
    padAngle={0.7}
    cornerRadius={3}
    colors={{ scheme: 'nivo' }}
    borderWidth={1}
    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
    radialLabelsSkipAngle={10}
    radialLabelsTextColor="#333333"
    radialLabelsLinkColor={{ from: 'color' }}
    sliceLabelsSkipAngle={10}
    sliceLabelsTextColor="#333333"
    defs={[
      {
        id: 'dots',
        type: 'patternDots',
        background: 'inherit',
        color: 'rgba(255, 255, 255, 0.3)',
        size: 4,
        padding: 1,
        stagger: true,
      },
      {
        id: 'lines',
        type: 'patternLines',
        background: 'inherit',
        color: 'rgba(255, 255, 255, 0.3)',
        rotation: -45,
        lineWidth: 6,
        spacing: 10,
      },
    ]}
    fill={[
      {
        match: {
          id: 'ruby',
        },
        id: 'dots',
      },
      {
        match: {
          id: 'c',
        },
        id: 'dots',
      },
      {
        match: {
          id: 'go',
        },
        id: 'dots',
      },
      {
        match: {
          id: 'python',
        },
        id: 'dots',
      },
      {
        match: {
          id: 'scala',
        },
        id: 'lines',
      },
      {
        match: {
          id: 'lisp',
        },
        id: 'lines',
      },
      {
        match: {
          id: 'elixir',
        },
        id: 'lines',
      },
      {
        match: {
          id: 'javascript',
        },
        id: 'lines',
      },
    ]}
    legends={[
      {
        anchor: 'bottom',
        direction: 'row',
        justify: false,
        translateX: 0,
        translateY: 56,
        itemsSpacing: 0,
        itemWidth: 100,
        itemHeight: 18,
        itemTextColor: '#999',
        itemDirection: 'left-to-right',
        itemOpacity: 1,
        symbolSize: 18,
        symbolShape: 'circle',
        effects: [
          {
            on: 'hover',
            style: {
              itemTextColor: '#000',
            },
          },
        ],
      },
    ]}
  />
);

export default PieChart;
