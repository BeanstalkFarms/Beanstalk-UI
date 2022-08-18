import { useEffect, useState } from 'react';
import { DocumentNode, QueryOptions, useLazyQuery } from '@apollo/client';
import { apolloSnapshotClient } from '~/graph/client';

const useGovernanceQuery = (
  document: DocumentNode,
  config?: Partial<QueryOptions>,
) => {
  /// Custom loading prop
  const [loading, setLoading] = useState(false);

  /// Execute generic lazy query
  const [get, query] = useLazyQuery(document, { variables: {} });

  useEffect(() => {
    (async () => {
      try {
        await get({
          ...config,
          variables: {
            ...config?.variables,
          },
          fetchPolicy: 'cache-first',
        });

        const promises = [];
        const variables = {
          ...config?.variables,
        };
        promises.push(
          apolloSnapshotClient.query({
            // ...config,
            query: document,
            variables,
            notifyOnNetworkStatusChange: true,
          })
          .then((r) => r)
        );

        /**
         * Wait for queries to complete
         */
        await Promise.all(promises);
        setLoading(false);
      } catch (e) {
        console.debug('[useGovernanceQuery] failed');
        console.error(e);
      }
    })();
  }, [get, config, document]);

  return {
    ...query,
    loading: loading || query.loading,
  };
};

export default useGovernanceQuery;
