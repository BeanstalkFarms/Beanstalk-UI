import React from 'react';
import {
  Button,
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
  const tabLabels = ['All', 'Create', 'Fill', 'Cancel'];

  const columns: DataGridProps['columns'] = !isMobile
    ? [
      COLUMNS.label(
        2.5,
        <Tabs value={tab} onChange={handleChangeTab}>
          {/* All */}
          <Tab label={tabLabels[0]} />
          {/* Create */}
          <Tab label={tabLabels[1]} />
          {/* Fill */}
          <Tab label={tabLabels[2]} />
          {/* Cancel */}
          <Tab label={tabLabels[3]} />
        </Tabs>,
      ),
      COLUMNS.numPodsMarketHistory(1),
      COLUMNS.placeInLineMarketHistory(1),
      COLUMNS.pricePerPodMarketHistory(1),
      COLUMNS.totalValueMarketHistory(1),
      COLUMNS.timeAgoMarketHistory(1),
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

  const { data, loading, fetchMoreData } = useMarketplaceEventData();

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
                  <ActivityTable 
                    fetchMore={fetchMoreData}
                    columns={columns} 
                    rows={data.filter((e) => (
                      tab === 0
                        ? e.action !== 'default'
                        : e.action === tabLabels[tab].toLowerCase()
                    ))}
                  />
                  <Button onClick={fetchMoreData}>Fetch more</Button>
                </>
              )}
          </ModuleContent>
        </Module>
      </Stack>
    </Container>
  );
};

export default MarketActivityPage;
