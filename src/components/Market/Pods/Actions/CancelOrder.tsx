import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSize } from '~/components/App/muiTheme';
import AddressIcon from '~/components/Common/AddressIcon';
import DescriptionButton from '~/components/Common/DescriptionButton';
import { StyledDialog, StyledDialogContent, StyledDialogTitle } from '~/components/Common/Dialog';
import TransactionToast from '~/components/Common/TxnToast';
import { BEAN } from '~/constants/tokens';
import useToggle from '~/hooks/display/useToggle';
import { useSigner } from '~/hooks/ledger/useSigner';
import useChainConstant from '~/hooks/chain/useChainConstant';
import { useBeanstalkContract } from '~/hooks/ledger/useContract';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import { useFetchFarmerBalances } from '~/state/farmer/balances/updater';
import { PodOrder } from '~/state/farmer/market';
import { useFetchFarmerMarket } from '~/state/farmer/market/updater';
import useFormMiddleware from '~/hooks/ledger/useFormMiddleware';

import { FC } from '~/types';

const OPTIONS = [
  {
    title: 'Circulating Balance',
    description: 'Return Beans in this Order to your wallet.',
    pill: <><AddressIcon size={IconSize.xs} /><Typography variant="body1">Wallet</Typography></>,
    icon: <AddressIcon size={IconSize.small} width={IconSize.small} height={IconSize.small} />,
    value: FarmToMode.EXTERNAL,
  },
  {
    title: 'Farm Balance',
    description: 'Return Beans in this Order to your internal Beanstalk balance.',
    pill: <Typography variant="body1">🚜 Farm Balance</Typography>,
    icon: '🚜',
    value: FarmToMode.INTERNAL,
  },
];

const CancelOrder : FC<{
  order: PodOrder,
}> = ({ 
  order
}) => {
  /// Helpers
  const navigate = useNavigate();
  const Bean = useChainConstant(BEAN);
  
  /// Local state
  const [loading, setLoading] = useState(false);
  const [isOpen, show, hide]  = useToggle();
  
  /// Ledger
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer);
  
  /// Farmer
  const [refetchFarmerBalances]  = useFetchFarmerBalances();
  const [refetchFarmerMarket]    = useFetchFarmerMarket();

  /// Form
  const middleware = useFormMiddleware();

  /// Handlers
  const onClick = useCallback(() => {
    setLoading(true);
    show();
  }, [show]);
  const onSubmit = useCallback((destination: FarmToMode) => () => {
    (async () => {
      const txToast = new TransactionToast({
        loading: 'Cancelling Pod Listing',
        success: 'Cancellation successful.',
      });
      try {
        middleware.before();
        hide();
        const txn = await beanstalk.cancelPodOrder(
          Bean.stringify(order.pricePerPod),
          Bean.stringify(order.maxPlaceInLine),
          destination,
        );
        txToast.confirming(txn);

        const receipt = await txn.wait();
        await Promise.all([
          refetchFarmerMarket(),    // clear old pod order
          refetchFarmerBalances(),  // refresh Beans
        ]);
        txToast.success(receipt);
        navigate('/market/account');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [Bean, beanstalk, hide, navigate, order.maxPlaceInLine, order.pricePerPod, refetchFarmerBalances, refetchFarmerMarket, middleware]);

  return (
    <>
      {/* FIXME: extracted from DestinationField */}
      <StyledDialog open={isOpen} onClose={hide} transitionDuration={0}>
        <StyledDialogTitle onClose={hide}>
          Destination
        </StyledDialogTitle>
        <StyledDialogContent>
          <Stack gap={1}>
            {OPTIONS.map((option, index) => (
              <DescriptionButton
                key={index}
                {...option}
                onClick={onSubmit(option.value)}
                fullWidth
                disableRipple
              />
            ))}
          </Stack>
        </StyledDialogContent>
      </StyledDialog>
      <LoadingButton
        onClick={onClick}
        color="error"
        variant="text"
        loading={loading}
        disabled={loading}
        fullWidth
      >
        Cancel
      </LoadingButton>
    </>
  );
};

export default CancelOrder;
