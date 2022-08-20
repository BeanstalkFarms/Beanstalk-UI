import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useBeanstalkContract } from '~/hooks/useContract';
import { resetBeanstalkGovernance, updateActiveProposals } from './actions';
import { useProposalsQuery } from '~/generated/graphql';

const queryConfig = {
  variables: {
    space_in: ['beanstalkdao.eth', 'beanstalkfarms.eth'],
    state: 'active'
  },
  context: { subgraph: 'snapshot' }
};

export const useFetchBeanstalkGovernance = () => {
  const dispatch = useDispatch();
  const beanstalk = useBeanstalkContract();

  // Fetch active proposals
  const { error, loading, data } = useProposalsQuery(queryConfig);

  // Handlers
  const fetch = useCallback(async () => {
    if (beanstalk && data?.proposals && !loading && !error) {
      dispatch(updateActiveProposals({
        activeProposals: data?.proposals?.map((p) => ({
            id: p?.id,
            title: p?.title
          }))
      }));
    }
  }, [beanstalk, data?.proposals, loading, error, dispatch]);
  
  const clear = useCallback(() => {
    console.debug('[beanstalk/governance/useBeanstalkGovernance] CLEAR');
    dispatch(resetBeanstalkGovernance());
  }, [dispatch]);

  return [fetch, clear] as const;
};

// -- Updater

const GovernanceUpdater = () => {
  const [fetch, clear] = useFetchBeanstalkGovernance();

  useEffect(() => {
    clear();
    fetch();
  }, [clear, fetch]);

  return null;
};

export default GovernanceUpdater;
