import { LoadingButton } from '@mui/lab';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BeanstalkPalette } from '~/components/App/muiTheme';
import TransactionToast from '~/components/Common/TxnToast';
import { useSigner } from '~/hooks/ledger/useSigner';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';
import { useFetchFarmerField } from '~/state/farmer/field/updater';
import { useFetchFarmerMarket } from '~/state/farmer/market/updater';
import useFormMiddleware from '~/hooks/ledger/useFormMiddleware';

import { FC } from '~/types';

const CancelListing : FC<{ id: string }> = ({ id }) => {
  /// Helpers
  const navigate = useNavigate();
  
  /// Local state
  const [loading, setLoading] = useState(false);
  
  /// Ledger
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);
  
  /// Farmer
  const [refetchFarmerField]  = useFetchFarmerField();
  const [refetchFarmerMarket] = useFetchFarmerMarket();

  /// Form
  const middleware = useFormMiddleware();

  const onSubmit = useCallback(() => {
    (async () => {
      const txToast = new TransactionToast({
        loading: 'Cancelling Pod Listing...',
        success: 'Cancellation successful.',
      });
      txToast.error('Cancelling Pod Listings is temporarily disabled. Check Discord for more details.');

      try {
        middleware.before();

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
        txToast.error(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [beanstalk, id, navigate, refetchFarmerField, refetchFarmerMarket, middleware]);

  return (
    <LoadingButton
      onClick={onSubmit}
      color="error"
      variant="text"
      loading={loading}
      disabled={loading}
      fullWidth
      sx={{ '&:hover': { backgroundColor: `${BeanstalkPalette.hoverRed} !important` } }}
    >
      Cancel
    </LoadingButton>
  );
};

export default CancelListing;
