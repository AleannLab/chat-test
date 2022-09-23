import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

const data = [
  {
    country: 'AD',
    'hot dog': 76,
    'hot dogColor': 'hsl(24, 70%, 50%)',
    burger: 8,
    burgerColor: 'hsl(165, 70%, 50%)',
    sandwich: 135,
    sandwichColor: 'hsl(220, 70%, 50%)',
    kebab: 138,
    kebabColor: 'hsl(156, 70%, 50%)',
    fries: 49,
    friesColor: 'hsl(301, 70%, 50%)',
    donut: 117,
    donutColor: 'hsl(31, 70%, 50%)',
  },
  {
    country: 'AE',
    'hot dog': 174,
    'hot dogColor': 'hsl(298, 70%, 50%)',
    burger: 150,
    burgerColor: 'hsl(102, 70%, 50%)',
    sandwich: 40,
    sandwichColor: 'hsl(280, 70%, 50%)',
    kebab: 65,
    kebabColor: 'hsl(94, 70%, 50%)',
    fries: 188,
    friesColor: 'hsl(105, 70%, 50%)',
    donut: 165,
    donutColor: 'hsl(86, 70%, 50%)',
  },
  {
    country: 'AF',
    'hot dog': 92,
    'hot dogColor': 'hsl(61, 70%, 50%)',
    burger: 8,
    burgerColor: 'hsl(26, 70%, 50%)',
    sandwich: 81,
    sandwichColor: 'hsl(144, 70%, 50%)',
    kebab: 35,
    kebabColor: 'hsl(220, 70%, 50%)',
    fries: 83,
    friesColor: 'hsl(6, 70%, 50%)',
    donut: 91,
    donutColor: 'hsl(59, 70%, 50%)',
  },
  {
    country: 'AG',
    'hot dog': 61,
    'hot dogColor': 'hsl(42, 70%, 50%)',
    burger: 11,
    burgerColor: 'hsl(261, 70%, 50%)',
    sandwich: 199,
    sandwichColor: 'hsl(337, 70%, 50%)',
    kebab: 120,
    kebabColor: 'hsl(34, 70%, 50%)',
    fries: 91,
    friesColor: 'hsl(77, 70%, 50%)',
    donut: 97,
    donutColor: 'hsl(99, 70%, 50%)',
  },
  {
    country: 'AI',
    'hot dog': 47,
    'hot dogColor': 'hsl(287, 70%, 50%)',
    burger: 33,
    burgerColor: 'hsl(123, 70%, 50%)',
    sandwich: 6,
    sandwichColor: 'hsl(324, 70%, 50%)',
    kebab: 15,
    kebabColor: 'hsl(317, 70%, 50%)',
    fries: 179,
    friesColor: 'hsl(276, 70%, 50%)',
    donut: 38,
    donutColor: 'hsl(343, 70%, 50%)',
  },
  {
    country: 'AL',
    'hot dog': 74,
    'hot dogColor': 'hsl(54, 70%, 50%)',
    burger: 105,
    burgerColor: 'hsl(289, 70%, 50%)',
    sandwich: 34,
    sandwichColor: 'hsl(335, 70%, 50%)',
    kebab: 3,
    kebabColor: 'hsl(209, 70%, 50%)',
    fries: 2,
    friesColor: 'hsl(186, 70%, 50%)',
    donut: 175,
    donutColor: 'hsl(224, 70%, 50%)',
  },
  {
    country: 'AM',
    'hot dog': 135,
    'hot dogColor': 'hsl(143, 70%, 50%)',
    burger: 133,
    burgerColor: 'hsl(192, 70%, 50%)',
    sandwich: 25,
    sandwichColor: 'hsl(120, 70%, 50%)',
    kebab: 43,
    kebabColor: 'hsl(338, 70%, 50%)',
    fries: 104,
    friesColor: 'hsl(92, 70%, 50%)',
    donut: 39,
    donutColor: 'hsl(106, 70%, 50%)',
  },
];

const BarChart = () => (
  <ResponsiveBar
    data={data}
    keys={['hot dog', 'burger', 'sandwich', 'kebab', 'fries', 'donut']}
    indexBy="country"
    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
    padding={0.3}
    valueScale={{ type: 'linear' }}
    colors={{ scheme: 'nivo' }}
    defs={[
      {
        id: 'dots',
        type: 'patternDots',
        background: 'inherit',
        color: '#38bcb2',
        size: 4,
        padding: 1,
        stagger: true,
      },
      {
        id: 'lines',
        type: 'patternLines',
        background: 'inherit',
        color: '#eed312',
        rotation: -45,
        lineWidth: 6,
        spacing: 10,
      },
    ]}
    fill={[
      {
        match: {
          id: 'fries',
        },
        id: 'dots',
      },
      {
        match: {
          id: 'sandwich',
        },
        id: 'lines',
      },
    ]}
    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
    axisTop={null}
    axisRight={null}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'country',
      legendPosition: 'middle',
      legendOffset: 32,
    }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: 'food',
      legendPosition: 'middle',
      legendOffset: -40,
    }}
    labelSkipWidth={12}
    labelSkipHeight={12}
    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
    legends={[
      {
        dataFrom: 'keys',
        anchor: 'bottom-right',
        direction: 'column',
        justify: false,
        translateX: 120,
        translateY: 0,
        itemsSpacing: 2,
        itemWidth: 100,
        itemHeight: 20,
        itemDirection: 'left-to-right',
        itemOpacity: 0.85,
        symbolSize: 20,
        effects: [
          {
            on: 'hover',
            style: {
              itemOpacity: 1,
            },
          },
        ],
      },
    ]}
    animate={true}
    motionStiffness={90}
    motionDamping={15}
  />
);

export default BarChart;
