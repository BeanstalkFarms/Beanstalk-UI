import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Banner from '~/components/Nav/Banner';
import { BANNER_HEIGHT } from '~/hooks/app/usePageDimensions';
import { AppState } from '~/state';
import { ActiveProposal } from '~/state/beanstalk/governance';
import snapshotLogo from '~/img/ecosystem/snapshot-logo.svg';

const useBanner = () => {
  const activeProposals = useSelector<AppState, ActiveProposal[]>((state) => state._beanstalk.governance.activeProposals);
  return useMemo(() => {
    if (activeProposals.length > 1) {
      return (
        <Banner
          height={BANNER_HEIGHT}
          to="/governance"
        >
          <img src={snapshotLogo} alt="Snapshot" style={{ height: 14, marginBottom: -2 }} />&nbsp;&nbsp;
          {activeProposals.length} governance proposals are live.&nbsp;<strong>Vote now &rarr;</strong>
        </Banner>
      );
    }
    if (activeProposals.length === 1) {
      return (
        <Banner
          height={BANNER_HEIGHT}
          to={`/governance/${activeProposals[0].id}`}
        >
          <img src={snapshotLogo} alt="Snapshot" style={{ height: 14, marginBottom: -2 }} />&nbsp;&nbsp;
          {activeProposals[0].title} is live.&nbsp;<strong>Vote now &rarr;</strong>
        </Banner>
      );
    }
    return null;
  }, [activeProposals]);
};

export default useBanner;
