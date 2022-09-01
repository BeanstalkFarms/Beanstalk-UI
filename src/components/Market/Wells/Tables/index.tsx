import React from 'react';
import { Tab, useMediaQuery } from '@mui/material';

import { DataGridProps } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import useTabs from '~/hooks/display/useTabs';
import { PodListing } from '~/state/farmer/market';
import COLUMNS from '~/components/Common/Table/cells';
import useMarketData from '~/hooks/beanstalk/useMarketData';
import WellBaseTable from '~/components/Market/Wells/Tables/Base';
import { Module, ModuleContent, ModuleTabs } from '~/components/Common/Module';

const SLUGS = ['all', 'swaps', 'adds', 'removes'];
const WellActivity: React.FC<{}> = () => {
  const theme = useTheme();
  const [tab, handleChangeTab] = useTabs(SLUGS, 'bean');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const data = useMarketData();
  
  /// Data Grid setup
  const columns: DataGridProps['columns'] = !isMobile
    ? [
      COLUMNS.listingId(1.3),
      // index
      COLUMNS.plotIndex(data.harvestableIndex, 1),
      // pricePerPod
      COLUMNS.pricePerPod(1),
      // amount
      COLUMNS.numPodsActive(1),
      // maxHarvestableIndex
      COLUMNS.expiry(data.harvestableIndex, 1),
      // other
      COLUMNS.rightChevron
    ]
    : [
      COLUMNS.listingId(0.7),
      // index
      COLUMNS.plotIndex(data.harvestableIndex, 1),
      // pricePerPod
      COLUMNS.pricePerPod(1),
      // amount
      COLUMNS.numPodsActive(1),
    ];

  return (
    <Module>
      <ModuleTabs value={tab} onChange={handleChangeTab}>
        <Tab label="All" />
        <Tab label="Swaps" />
        <Tab label="Adds" />
        <Tab label="Removes" />
      </ModuleTabs>
      <ModuleContent>
        <WellBaseTable
          columns={columns}
          rows={data.listings || []}
          loading={data.loading}
          maxRows={8}
          getRowId={(row : PodListing) => `${row.account}-${row.id}`}
        />
      </ModuleContent>
    </Module>
  );
};

export default WellActivity;
