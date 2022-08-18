import React, { useCallback, useMemo } from 'react';
import { Box, Card, Stack, Tabs } from '@mui/material';
import useTabs from '~/hooks/display/useTabs';
import BadgeTab from '~/components/Common/BadgeTab';
import ProposalList from '~/components/Governance/Proposals/ProposalList';
import { useProposalsQuery } from '~/generated/graphql';

// export type Proposal = {
//   /** Proposal ID on Snapshot. */
//   id: string;
//   /** */
//   title: string;
//   /** Number of Stalk voted for each choice */
//   scores: number[];
//   /** Status of proposal: active, closed, etc. */
//   state: string;
//   /** Date & time the proposal closes */
//   end: number;
// }

/// Variables
const snapshotSpaces = ['beanstalkdao.eth', 'beanstalkfarms.eth', 'wearebeansprout.eth'];
const SLUGS = ['dao', 'beanstalk-farms', 'bean-sprout'];
const queryConfig = {
  variables: { space_in: snapshotSpaces },
  context: { subgraph: 'snapshot' }
};

const Proposals: React.FC = () => {
  const [tab, handleChange] = useTabs(SLUGS, 'type');

  /// Query Proposals
  const { loading, data } = useProposalsQuery(queryConfig);

  const filterProposals = useCallback((t: number) => {
    if (!loading && data !== undefined) {
      return data.proposals?.filter((p: any) => p.space.id === snapshotSpaces[t]);
    }
  }, [data, loading]);

  /// true if any proposals are active
  const hasActive = (proposals: any) => {
    if (proposals) {
      return proposals?.filter((p: any) => p.state === 'active').length > 0;
    }
    return false;
  };

  /// Dao Proposals
  const [daoProposals, hasActiveDao] = useMemo(() => {
    const filtered = filterProposals(0);
    const hasActiveProposals = hasActive(filtered);
    return [filtered, hasActiveProposals];
  }, [filterProposals]);

  /// Beanstalk Farms Proposals
  const [beanstalkFarmsProposals, hasActiveBF] = useMemo(() => {
    const filtered = filterProposals(1);
    const hasActiveProposals = hasActive(filtered);
    return [filtered, hasActiveProposals];
  }, [filterProposals]);

  /// Bean Sprout Proposals
  const [beanSproutProposals, hasActiveBS] = useMemo(() => {
    const filtered = filterProposals(2);
    const hasActiveProposals = hasActive(filtered);
    return [filtered, hasActiveProposals];
  }, [filterProposals]);

  return (
    <Card sx={{ position: 'relative' }}>
      <Stack gap={1.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ overflow: 'visible', px: 2, pt: 2 }}>
          <Tabs
            value={tab}
            onChange={handleChange}
            sx={{ minHeight: 0, overflow: 'visible', '& .MuiTabs-scroller': { overflow: 'visible' } }}
            variant="scrollable">
            <BadgeTab label="DAO" showBadge={hasActiveDao} />
            <BadgeTab label="Beanstalk Farms" showBadge={hasActiveBF} />
            <BadgeTab label="Bean Sprout" showBadge={hasActiveBS} />
          </Tabs>
        </Stack>
        <Box>
          {tab === 0 && <ProposalList proposals={daoProposals} />}
          {tab === 1 && <ProposalList proposals={beanstalkFarmsProposals} />}
          {tab === 2 && <ProposalList proposals={beanSproutProposals} />}
        </Box>
      </Stack>
    </Card>
  );
};

export default Proposals;
