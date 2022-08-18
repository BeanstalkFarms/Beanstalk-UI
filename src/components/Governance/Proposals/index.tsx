import React, { useCallback, useMemo } from 'react';
import { Box, Card, Stack, Tabs } from '@mui/material';
import useTabs from '~/hooks/display/useTabs';
import BadgeTab from '~/components/Common/BadgeTab';
import ProposalList from '~/components/Governance/Proposals/ProposalList';
import { ProposalsDocument } from '~/generated/graphql';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';

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
};

const Proposals: React.FC = () => {
  const [tab, handleChange] = useTabs(SLUGS, 'type');

  /// Query Proposals
  const { loading, data } = useGovernanceQuery(ProposalsDocument, queryConfig);
  const filterProposals = useCallback((t: number) => {
    if (!loading && data !== undefined) {
      return data.proposals?.filter((p: any) => p.space.id === snapshotSpaces[t]);
    }
  }, [data, loading]); 

  /// Filtered proposal data
  const daoProposals = useMemo(() => filterProposals(0), [filterProposals]);
  const beanstalkFarmsProposals = useMemo(() => filterProposals(1), [filterProposals]);
  const beanSproutProposals = useMemo(() => filterProposals(2), [filterProposals]);

  /// true if any proposals are active
  const hasActive = (proposals: any) => proposals?.filter((p: any) => p.state === 'active').length > 0;

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
            <BadgeTab label="DAO" showBadge={hasActive(daoProposals)} />
            <BadgeTab label="Beanstalk Farms" showBadge={hasActive(beanstalkFarmsProposals)} />
            <BadgeTab label="Bean Sprout" showBadge={hasActive(beanSproutProposals)} />
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
