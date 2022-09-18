import { useMemo } from 'react';
import { usePodFillOrderQuery } from '~/generated/graphql';
import { Source } from '~/util';
import { castPodOrder } from '~/state/farmer/market';

const usePodFillOrder = (id: string | undefined) => {
  const query          = usePodFillOrderQuery({ variables: { id: id || '' }, skip: !id });
  const [data, source] = useMemo(() => {
    if (id && query.data?.podFill?.order) {
      return [castPodOrder(query.data.podFill.order), Source.SUBGRAPH];
    }
    return [undefined, undefined];
  }, [id, query?.data?.podFill?.order]);

  return {
    ...query,
    /// If the query finished loading and has no data,
    /// check redux for a local order that was loaded
    /// via direct event processing.
    data,
    source,
  };
};

export default usePodFillOrder;
