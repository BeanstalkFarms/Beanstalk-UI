import React from 'react';
import { Box, Card, Stack, Tabs } from '@mui/material';
import useTabs from '~/hooks/display/useTabs';
import BadgeTab from '~/components/Common/BadgeTab';
import BIP from '~/components/Governance/Proposals/BIP';
import { ProposalsDocument } from '~/generated/graphql';
import useGovernanceQuery from '~/hooks/useGovernanceQuery';

export const ProposalAddress = {
  BeanstalkDAO: 'beanstalkdao.eth',
};

const queryConfig = {
  // variables: { space_in: ['beanstalkdao.eth', 'beanstalkfarms.eth', 'wearebeansprout.eth'] },
  variables: { space_in: ['beanstalkdao.eth', 'beanstalkfarms.eth'] },
};

const SLUGS = ['bip', 'bop', 'BFCP', 'BSP', 'BFBP'];
const Proposals: React.FC<{}> = () => {
  const [tab, handleChange] = useTabs(SLUGS, 'type');

  /// Query all proposals=
  const { loading, error, data } = useGovernanceQuery(ProposalsDocument, queryConfig);
  console.log('DATA', data);

  return (
    <Card sx={{ position: 'relative' }}>
      <Stack gap={1.5}>
        {/* Header */}
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
            <BadgeTab label="BIP" showBadge />
            <BadgeTab label="BOP" showBadge={false} />
            <BadgeTab label="BFCP" showBadge={false} />
            <BadgeTab label="BSP" showBadge={false} />
            <BadgeTab label="BFBP" showBadge={false} />
          </Tabs>
        </Stack>
        <Box sx={{ px: 1, pb: 1 }}>
          {tab === 0 && <BIP proposals={{ test: 'yes' }} />}
          {/* {tab === 1 && <Transfer />} */}
          {/* {tab === 2 && <Harvest />} */}
        </Box>
      </Stack>
    </Card>
  );
};

export default Proposals;
