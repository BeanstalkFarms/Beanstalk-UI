import { useCallback, useState } from 'react';
import { useSigner } from 'wagmi';
import BigNumber from 'bignumber.js';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import TransactionToast from '~/components/Common/TxnToast';
import { useFetchFarmerField } from '~/state/farmer/field/updater';
import { useFetchFarmerMarket } from '~/state/farmer/market/updater';
import { useBeanstalkContract } from '../../ledger/useContract';
import useFormMiddleware from '../../ledger/useFormMiddleware';
import { BEAN, PODS } from '~/constants/tokens';
import useChainConstant from '../../chain/useChainConstant';
import { useFetchFarmerBalances } from '~/state/farmer/balances/updater';
import { PodOrder } from '~/state/farmer/market';
import { useFetchFarmerMarketItems } from './useFarmerMarket';

export default function useFarmerMarketCancelTxn() {
  /// Helpers
  const Bean = useChainConstant(BEAN);

  /// Local state
  const [loading, setLoading] = useState(false);

  /// Ledger
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);

  /// Farmer
  const [refetchFarmerField] = useFetchFarmerField();
  const [refetchFarmerBalances] = useFetchFarmerBalances();
  const [refetchFarmerMarket] = useFetchFarmerMarket();
  // subgraph queries
  const { fetch: fetchFarmerMarket } = useFetchFarmerMarketItems();

  /// Form
  const middleware = useFormMiddleware();

  const cancelListing = useCallback(
    (listingId: string) => {
      (async () => {
        const txToast = new TransactionToast({
          loading: 'Cancelling Pod Listing...',
          success: 'Cancellation successful.',
        });

        try {
          setLoading(true);
          middleware.before();

          const txn = await beanstalk.cancelPodListing(listingId);
          txToast.confirming(txn);

          const receipt = await txn.wait();
          await Promise.all([refetchFarmerField(), refetchFarmerMarket(), fetchFarmerMarket()]);
          txToast.success(receipt);
        } catch (err) {
          txToast.error(err);
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    },
    [beanstalk, middleware, refetchFarmerField, refetchFarmerMarket, fetchFarmerMarket]
  );

  const cancelOrder = useCallback(
    (order: PodOrder, destination: FarmToMode, before?: () => void) => {
      (async () => {
        const txToast = new TransactionToast({
          loading: 'Cancelling Pod Order',
          success: 'Cancellation successful.',
        });
        try {
          setLoading(true);
          middleware.before();
          before?.();
          const txn = await beanstalk.cancelPodOrder(
            Bean.stringify(order.pricePerPod),
            Bean.stringify(order.maxPlaceInLine),
            PODS.stringify(order.minFillAmount || new BigNumber(1)),
            destination
          );
          txToast.confirming(txn);

          const receipt = await txn.wait();
          await Promise.all([
            refetchFarmerMarket(), // clear old pod order
            refetchFarmerBalances(), // refresh Beans
            fetchFarmerMarket()
          ]);
          txToast.success(receipt);
          // navigate('/market/account');
        } catch (err) {
          console.error(err);
          txToast.error(err);
        } finally {
          setLoading(false);
        }
      })();
    },
    [Bean, beanstalk, middleware, refetchFarmerBalances, refetchFarmerMarket, fetchFarmerMarket]
  );

  return {
    loading,
    cancelListing,
    cancelOrder,
  };
}
