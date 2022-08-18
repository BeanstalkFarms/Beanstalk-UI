import React, { useCallback } from 'react';
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

  const filterBySpace = useCallback((t: number) => {
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

  /// Filter proposals & check if there are any active ones
  const filterProposals = useCallback((t: number) => {
    const filtered = filterBySpace(t);
    const hasActiveProposals = hasActive(filtered);
    return [filtered, hasActiveProposals];
  }, [filterBySpace]);

  const [daoProposals, hasActiveDao] = filterProposals(0);
  const [beanstalkFarmsProposals, hasActiveBF] = filterProposals(1);
  const [beanSproutProposals, hasActiveBS] = filterProposals(2);

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
            <BadgeTab label="DAO" showBadge={hasActiveDao as boolean} />
            <BadgeTab label="Beanstalk Farms" showBadge={hasActiveBF as boolean} />
            <BadgeTab label="Bean Sprout" showBadge={hasActiveBS as boolean} />
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
