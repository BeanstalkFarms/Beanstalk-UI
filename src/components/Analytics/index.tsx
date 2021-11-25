import React from 'react';
import { ContentSection } from '../Common';
// import Balances from '../Balances';
import Charts from '../Charts';
// import Seasons from '../Seasons';

export default function Analytics() {
  return (
    <>
      <ContentSection id="analytics" title="Analytics">
        {/* {chartData[0].data?.length > 1 ? (<BaseChart options={state.options} baselineSeries={chartData} autoWidth height={300} />) :} */
        /* <Balances />
        <Seasons />
      */}
        <Charts />
      </ContentSection>
    </>
  );
}
