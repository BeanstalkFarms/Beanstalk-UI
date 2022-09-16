import React from 'react';
import LineChart from '~/components/Common/Charts/LineChart';
import { mockDepositData } from '~/components/Common/Charts/LineChart.mock';

const MockSeries = [mockDepositData];
const MockPlot = () => (
  <LineChart
    series={MockSeries}
  />
);

export default MockPlot;
