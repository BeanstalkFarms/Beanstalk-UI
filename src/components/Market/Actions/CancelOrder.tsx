import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
import { IconSize } from 'components/App/muiTheme';
import AddressIcon from 'components/Common/AddressIcon';
import DescriptionButton from 'components/Common/DescriptionButton';
import { StyledDialog, StyledDialogContent, StyledDialogTitle } from 'components/Common/Dialog';
import TransactionToast from 'components/Common/TxnToast';
import { BEAN } from '~/constants/tokens';
import { BeanstalkReplanted } from 'generated';
import useToggle from 'hooks/display/useToggle';
import { useSigner } from 'hooks/ledger/useSigner';
import useChainConstant from 'hooks/useChainConstant';
import { useBeanstalkContract } from 'hooks/useContract';
import { FarmToMode } from '~/lib/Beanstalk/Farm';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchFarmerBalances } from '~/state/farmer/balances/updater';
import { PodOrder } from '~/state/farmer/market';
import { useFetchFarmerMarket } from '~/state/farmer/market/updater';

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
    description: 'Return Beans in this Order to your internal balance within Beanstalk  .',
    pill: <Typography variant="body1">🚜 Farm Balance</Typography>,
    icon: '🚜',
    value: FarmToMode.INTERNAL,
  },
];

const CancelOrder : React.FC<{
  order: PodOrder,
}> = ({ 
  order
}) => {
  /// Helpers
  const navigate = useNavigate();
  const Bean = useChainConstant(BEAN);
  
  /// Local state
  // const [destination, setDestination] = useState<FarmToMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, show, hide]  = useToggle();
  
  /// Contracts
  const { data: signer } = useSigner();
  const beanstalk = useBeanstalkContract(signer) as unknown as BeanstalkReplanted;
  
  /// Refetch
  const [refetchFarmerBalances]  = useFetchFarmerBalances();
  // const [refetchFarmerField]     = useFetchFarmerField();
  const [refetchFarmerMarket]    = useFetchFarmerMarket();

  const onClick = useCallback(() => {
    setLoading(true);
    show();
  }, [show]);
  const onSubmit = useCallback((destination: FarmToMode) => () => {
    (async () => {
      let txToast;
      try {
        hide();
        txToast = new TransactionToast({
          loading: 'Cancelling Pod Listing',
          success: 'Cancellation successful.',
        });
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
  }, [Bean, beanstalk, hide, navigate, order.maxPlaceInLine, order.pricePerPod, refetchFarmerBalances, refetchFarmerMarket]);

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
