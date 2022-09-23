import React from 'react';
import { ResponsiveLine } from '@nivo/line';

const data = [
  {
    id: 'japan',
    color: 'hsl(43, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 82,
      },
      {
        x: 'helicopter',
        y: 294,
      },
      {
        x: 'boat',
        y: 131,
      },
      {
        x: 'train',
        y: 277,
      },
      {
        x: 'subway',
        y: 199,
      },
      {
        x: 'bus',
        y: 124,
      },
      {
        x: 'car',
        y: 122,
      },
      {
        x: 'moto',
        y: 195,
      },
      {
        x: 'bicycle',
        y: 36,
      },
      {
        x: 'horse',
        y: 270,
      },
      {
        x: 'skateboard',
        y: 249,
      },
      {
        x: 'others',
        y: 256,
      },
    ],
  },
  {
    id: 'france',
    color: 'hsl(61, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 212,
      },
      {
        x: 'helicopter',
        y: 156,
      },
      {
        x: 'boat',
        y: 84,
      },
      {
        x: 'train',
        y: 51,
      },
      {
        x: 'subway',
        y: 7,
      },
      {
        x: 'bus',
        y: 37,
      },
      {
        x: 'car',
        y: 290,
      },
      {
        x: 'moto',
        y: 33,
      },
      {
        x: 'bicycle',
        y: 262,
      },
      {
        x: 'horse',
        y: 272,
      },
      {
        x: 'skateboard',
        y: 197,
      },
      {
        x: 'others',
        y: 76,
      },
    ],
  },
  {
    id: 'us',
    color: 'hsl(226, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 182,
      },
      {
        x: 'helicopter',
        y: 157,
      },
      {
        x: 'boat',
        y: 117,
      },
      {
        x: 'train',
        y: 249,
      },
      {
        x: 'subway',
        y: 260,
      },
      {
        x: 'bus',
        y: 284,
      },
      {
        x: 'car',
        y: 209,
      },
      {
        x: 'moto',
        y: 280,
      },
      {
        x: 'bicycle',
        y: 234,
      },
      {
        x: 'horse',
        y: 108,
      },
      {
        x: 'skateboard',
        y: 289,
      },
      {
        x: 'others',
        y: 263,
      },
    ],
  },
  {
    id: 'germany',
    color: 'hsl(121, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 10,
      },
      {
        x: 'helicopter',
        y: 269,
      },
      {
        x: 'boat',
        y: 174,
      },
      {
        x: 'train',
        y: 226,
      },
      {
        x: 'subway',
        y: 99,
      },
      {
        x: 'bus',
        y: 286,
      },
      {
        x: 'car',
        y: 123,
      },
      {
        x: 'moto',
        y: 67,
      },
      {
        x: 'bicycle',
        y: 150,
      },
      {
        x: 'horse',
        y: 241,
      },
      {
        x: 'skateboard',
        y: 267,
      },
      {
        x: 'others',
        y: 164,
      },
    ],
  },
  {
    id: 'norway',
    color: 'hsl(354, 70%, 50%)',
    data: [
      {
        x: 'plane',
        y: 84,
      },
      {
        x: 'helicopter',
        y: 172,
      },
      {
        x: 'boat',
        y: 227,
      },
      {
        x: 'train',
        y: 132,
      },
      {
        x: 'subway',
        y: 209,
      },
      {
        x: 'bus',
        y: 153,
      },
      {
        x: 'car',
        y: 97,
      },
      {
        x: 'moto',
        y: 24,
      },
      {
        x: 'bicycle',
        y: 28,
      },
      {
        x: 'horse',
        y: 257,
      },
      {
        x: 'skateboard',
        y: 147,
      },
      {
        x: 'others',
        y: 207,
      },
    ],
  },
];

const LineChart = () => (
  <ResponsiveLine
    data={data}
    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
    xScale={{ type: 'point' }}
    yScale={{
      type: 'linear',
      min: 'auto',
      max: 'auto',
      stacked: true,
      reverse: false,
    }}
    yFormat=" >-.2f"
    axisTop={null}
    axisRight={null}
    axisBottom={{
      orient: 'bottom',
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'transportation',
      legendOffset: 36,
      legendPosition: 'middle',
    }}
    axisLeft={{
      orient: 'left',
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'count',
      legendOffset: -40,
      legendPosition: 'middle',
    }}
    pointSize={10}
    pointColor={{ theme: 'background' }}
    pointBorderWidth={2}
    pointBorderColor={{ from: 'serieColor' }}
    pointLabelYOffset={-12}
    useMesh={true}
    legends={[
      {
        anchor: 'bottom-right',
        direction: 'column',
        justify: false,
        translateX: 100,
        translateY: 0,
        itemsSpacing: 0,
        itemDirection: 'left-to-right',
        itemWidth: 80,
        itemHeight: 20,
        itemOpacity: 0.75,
        symbolSize: 12,
        symbolShape: 'circle',
        symbolBorderColor: 'rgba(0, 0, 0, .5)',
        effects: [
          {
            on: 'hover',
            style: {
              itemBackground: 'rgba(0, 0, 0, .03)',
              itemOpacity: 1,
            },
          },
        ],
      },
    ]}
  />
);

export default LineChart;
