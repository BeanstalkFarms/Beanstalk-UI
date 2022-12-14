import { Button, Dialog, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { BeanstalkPalette, FontSize } from '~/components/App/muiTheme';
import CondensedCard from '~/components/Common/Card/CondensedCard';
import { FarmerMarketItem } from '~/hooks/farmer/useFarmerMarket';
import InfoRow from '~/components/Common/Form/InfoRow';
import { displayBN, displayFullBN } from '~/util';
import dynamicPriceIcon from '~/img/misc/curve-adjustment-icon.svg';
import useHarvestableIndex from '~/hooks/beanstalk/useHarvestableIndex';

type Props = {
  item: FarmerMarketItem | undefined | null;
  open: boolean;
  onClose: () => void;
};

const openStates = ['ACTIVE', 'CANCELLED_PARTIAL', 'FILLED_PARTIAL'];

const sharedProps = {
  infoVariant: 'bodySmall' as any,
  labelVariant: 'bodySmall' as any,
  labelColor: 'text.primary',
  infoColor: 'text.secondary',
};

const FarmerMarketDialog: React.FC<Props> = ({ item, open, onClose }) => {
  const harvestableIndex = useHarvestableIndex();
  const isOrder = (item?.type === 'order' && item.order !== undefined);
  const isListing = (item?.type === 'listing' && item.listing !== undefined);

  if (!item || (!isOrder && !isListing)) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <CondensedCard
        title="ORDER DETAILS"
        actions={
          <IconButton
            aria-label="close"
            onClick={onClose}
            disableRipple
            sx={{ p: 0 }}
          >
            <CloseIcon
              sx={{ fontSize: FontSize.base, color: 'text.primary' }}
            />
          </IconButton>
        }
      >
        <Stack sx={{ borderTop: '0.5px solid', borderColor: 'divider' }}>
          <Stack
            sx={{ borderBottom: '0.5px solid', borderColor: 'divider' }}
            gap={2}
            px={1.5}
            py={1}
          >
            <InfoRow label="ACTION" {...sharedProps}>
              {item.action.toUpperCase()}
            </InfoRow>
            <InfoRow label="TYPE" {...sharedProps}>
              {item.type.toUpperCase()}
            </InfoRow>
            <InfoRow label="PRICE TYPE" {...sharedProps}>
              {item.priceType.toUpperCase()}
            </InfoRow>
            <InfoRow label="PRICE" {...sharedProps}>
              {item.priceType === 'dynamic' ? (
                <Typography variant="bodySmall" color="text.secondary" component="span">
                  {displayFullBN(item.pricePerPod, 2, 2)}
                  <img alt="" src={dynamicPriceIcon} style={{ height: 'inherit', width: 'auto' }} />
                </Typography>
              ) : (
                displayFullBN(item.pricePerPod, 2, 2)
              )}
            </InfoRow>
            {isListing && (
              <InfoRow label="AMOUNT" {...sharedProps}>
                {`${displayBN(item.remainingAmount)} PODS`}
              </InfoRow>
            )}
            <InfoRow label="PLACE IN LINE" {...sharedProps}>
              {`${isOrder ? '0 - ' : ''}${displayBN(item.placeInPodline)} PODS`}
            </InfoRow>
            {isListing && (() => {
              const expiry = item.listing?.maxHarvestableIndex.minus(harvestableIndex);
              return (
                <InfoRow label="EXPIRY" {...sharedProps}>
                  {expiry?.gt(0) ? expiry.toString() : 'N/A'}
                </InfoRow>
              );
            })()}
            <InfoRow label="% FILLED" {...sharedProps}>
              {(() => {
                if (item.fillPct.isNaN()) return '-%';
                return `${displayFullBN(item.fillPct, 2)}%`;
              })()}
            </InfoRow>
            <InfoRow label="TOTAL" {...sharedProps}>
              {`${displayFullBN(item.totalBeans, 2)} BEAN`}
            </InfoRow>
            <InfoRow label="STATUS" {...sharedProps}>
              <Typography
                variant="bodySmall"
                sx={{ 
                  color: openStates.includes(item.status) ? BeanstalkPalette.theme.winter.orderGreen : 'text.secondary' 
                }}
              >
                {item.status.toUpperCase()}
              </Typography>
            </InfoRow>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1} p={1}>
            <Button variant="text" sx={{ color: 'red', padding: 1 }} onClick={onClose}>
              CANCEL
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ 
                pl: 3, pr: 3, pt: 1, pb: 1, borderRadius: '6px', height: 'unset'
              }}
            >
              EDIT
            </Button>
          </Stack>
        </Stack>
      </CondensedCard>
    </Dialog>
  );
};
export default FarmerMarketDialog;
