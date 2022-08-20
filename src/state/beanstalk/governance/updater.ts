import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { resetBeanstalkGovernance, updateActiveProposals } from './actions';
import { useProposalsLazyQuery } from '~/generated/graphql';
import { SNAPSHOT_SPACES } from '~/util/Governance';

const queryConfig = {
  variables: {
    space_in: SNAPSHOT_SPACES,
    state: 'active'
  },
  context: { subgraph: 'snapshot' }
};

export const useFetchBeanstalkGovernance = () => {
  const dispatch = useDispatch();
  const [get] = useProposalsLazyQuery(queryConfig);

  /// Handlers
  const fetch = useCallback(async () => {
    const result = await get();
    if (Array.isArray(result.data?.proposals)) {
      dispatch(updateActiveProposals(
        result.data!.proposals
          /// HACK:
          /// The snapshot.org graphql API defines that the proposals
          /// array can have `null` elements. I believe this shouldn't
          /// be allowed, but to fix we check for null values and manually
          /// assert existence of `p`.
          .filter((p) => p !== null)
          .map((p) => ({
            id: p!.id,
            title: p!.title,
            start: p!.start,
            end: p!.end,
          }))
      ));
    }
  }, [get, dispatch]);
  
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
