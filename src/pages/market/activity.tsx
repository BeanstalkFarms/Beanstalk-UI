import React from 'react';
import {
  CircularProgress,
  Container,
  Stack, Tab, Tabs, useMediaQuery,
} from '@mui/material';
import { DataGridProps } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import ActivityTable from '~/components/Market/Pods/Tables/ActivityTable';
import PageHeaderSecondary from '~/components/Common/PageHeaderSecondary';
import COLUMNS from '~/components/Common/Table/cells';
import useTabs from '~/hooks/display/useTabs';
import useMarketplaceEventData from '~/hooks/beanstalk/useMarketplaceEventData';
import { Module, ModuleContent } from '~/components/Common/Module';

const MarketActivityPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Local State
  const [tab, handleChangeTab] = useTabs();

  const columns: DataGridProps['columns'] = !isMobile
    ? [
      COLUMNS.label(
        2.5,
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab label="All" />
          <Tab label="Create" />
          <Tab label="Fill" />
          <Tab label="Cancel" />
        </Tabs>,
      ),
      COLUMNS.numPodsMarketHistory(1),
      COLUMNS.placeInLineMarketHistory(1),
      COLUMNS.pricePerPodMarketHistory(1),
      COLUMNS.totalValueMarketHistory(1),
    ]
    : [
      COLUMNS.label(
        2.5,
        <Tabs value={tab} onChange={handleChangeTab}>
          <Tab label="All" />
        </Tabs>,
      ),
      COLUMNS.numPodsMarketHistory(1),
      COLUMNS.totalValueMarketHistory(1),
    ];

  const { data, loading } = useMarketplaceEventData();

  return (
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <PageHeaderSecondary
          title="Marketplace Activity"
        />
        <Module sx={{ pt: 2, px: 1 }}>
          <ModuleContent>
            {data === undefined || loading
              ? (
                <Stack height={300} alignItems="center" justifyContent="center">
                  <CircularProgress />
                </Stack>
              )
              : (
                <>
                  {tab === 0 && <ActivityTable columns={columns} rows={data.filter((e) => e.action !== 'default')} />}
                  {tab === 1 && <ActivityTable columns={columns} rows={data.filter((e) => e.action === 'create')} />}
                  {tab === 2 && <ActivityTable columns={columns} rows={data.filter((e) => e.action === 'fill')} />}
                  {tab === 3 && <ActivityTable columns={columns} rows={data.filter((e) => e.action === 'cancel')} />}
                </>
              )}
          </ModuleContent>
        </Module>
      </Stack>
    </Container>
  );
};

export default MarketActivityPage;
