import { LoadingButton } from '@mui/lab';
import TransactionToast from 'components/Common/TxnToast';
import { BeanstalkReplanted } from 'generated';
import { useSigner } from 'hooks/ledger/useSigner';
import { useBeanstalkContract } from 'hooks/useContract';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchFarmerField } from 'state/farmer/field/updater';
import { useFetchFarmerMarket } from 'state/farmer/market/updater';

const CancelListing : React.FC<{ id: string }> = ({ id }) => {
  /// Helpers
  const navigate = useNavigate();
  
  /// Local state
  const [loading, setLoading] = useState(false);
  
  /// Contracts
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  
  /// Refetch
  const [refetchFarmerField]  = useFetchFarmerField();
  const [refetchFarmerMarket] = useFetchFarmerMarket();

  const onSubmit = useCallback(() => {
    (async () => {
      let txToast;
      try {
        txToast = new TransactionToast({
          loading: 'Cancelling Pod Listing',
          success: 'Cancellation successful.',
        });
        const txn = await beanstalk.cancelPodListing(id);
        txToast.confirming(txn);

        const receipt = await txn.wait();
        await Promise.all([
          refetchFarmerField(),
          refetchFarmerMarket(),
        ]);
        txToast.success(receipt);
        navigate('/market/account');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [beanstalk, id, navigate, refetchFarmerField, refetchFarmerMarket]);

  return (
    <LoadingButton
      onClick={onSubmit}
      color="error"
      variant="text"
      loading={loading}
      disabled={loading}
      fullWidth
    >
      Cancel
    </LoadingButton>
  );
};

export default CancelListing;
