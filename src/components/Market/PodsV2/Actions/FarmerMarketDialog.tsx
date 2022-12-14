import { Button, Dialog, IconButton, Stack } from '@mui/material';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { FontSize } from '~/components/App/muiTheme';
import CondensedCard from '~/components/Common/Card/CondensedCard';
import { FarmerMarketItem } from '~/hooks/farmer/useFarmerMarket';
import InfoRow from '~/components/Common/Form/InfoRow';

type Props = {
  item: FarmerMarketItem | undefined | null;
  open: boolean;
  onClose: () => void;
};

const sharedProps = {
  infoVariant: 'bodySmall' as any,
  labelVariant: 'bodySmall' as any,
  labelColor: 'text.primary',
  infoColor: 'text.secondary',
};

const FarmerMarketDialog: React.FC<Props> = ({ item, open, onClose }) => {
  if (
    !item ||
    (item?.type === 'order' && !item?.order) ||
    (item?.type === 'listing' && !item?.listing)
  ) {
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
            sx={{
              // color: (theme) => theme.palette.grey[900],
              p: 0,
            }}
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
            gap={1}
            px={1.5}
            py={1}
          >
            <InfoRow label="ACTION" {...sharedProps}>
              {item.action.toUpperCase()}
            </InfoRow>
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
            p={1}
          >
            <Button variant="text" sx={{ color: 'red', padding: 1 }}>
              CANCEL
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                pl: 3,
                pr: 3,
                pt: 1,
                pb: 1,
                borderRadius: '6px',
                height: 'unset',
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
