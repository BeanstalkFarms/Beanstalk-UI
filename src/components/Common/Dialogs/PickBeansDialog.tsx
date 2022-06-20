import React, { useState } from 'react';
import {
  DialogProps,
  Stack,
  Dialog,
  Typography,
  Card,
  ListItemText,
  Button,
  Box,
  useMediaQuery,
  Divider, Tooltip
} from '@mui/material';
import brownBeanIcon from 'img/tokens/bean-logo-circled-brown.svg';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useTheme } from '@mui/styles';
import greenBeanIcon from 'img/tokens/bean-logo-circled.svg';
import { StyledDialogContent, StyledDialogTitle } from '../Dialog';
import { BeanstalkPalette } from '../../App/muiTheme';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const PickBeansDialog: React.FC<{ handleClose: any; } & DialogProps> =
  ({
     open,
     sx,
     onClose,
     fullWidth,
     fullScreen,
     disableScrollLock,
     handleClose
   }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [tab, setTab] = useState(0);
    const handleDialogClose = () => {
      handleClose();
      setTab(0);
    };

    const handleNextTab = () => {
      setTab(1);
    };

    const handlePreviousTab = () => {
      setTab(0);
    };

    const handlePickBeans = () => {
      // TODO
    };

    const handlePickAndDepositBeans = () => {
      // TODO
    };

    const tab0 = (
      <>
        <StyledDialogTitle sx={{ pb: 0.5 }} onClose={handleDialogClose}>Pick Unripe Beans</StyledDialogTitle>
        <StyledDialogContent>
          <Stack gap={2}>
            {/* Pod Balance */}
            <Typography color="text.secondary">Unripe Beans represent a pro rata share of underlying Beans that are
              minted as Fertilizer is sold and debt is repaid to Fertilizer.
            </Typography>
            <Card sx={{ p: 2 }}>
              <Stack justifyContent="center" alignItems="center" gap={0.7}>
                <Typography sx={{ textAlign: 'center' }}><span style={{ fontWeight: 'bold' }}>0x15094...1203</span> can
                  pick
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
                  <img src={brownBeanIcon} alt="Unripe Beans" width={33} />
                  <Typography sx={{ textAlign: 'center' }} variant="h1">680,203</Typography>
                  <Typography sx={{ textAlign: 'center' }}>Unripe Beans</Typography>
                </Stack>
                <Box justifyContent="center">
                  <Button
                    onClick={handleNextTab}
                    sx={{
                      py: 0.9,
                      px: 3,
                      mt: 1,
                      backgroundColor: BeanstalkPalette.brown,
                      color: BeanstalkPalette.white,
                      textAlign: 'center',
                      '&:hover': {
                        backgroundColor: BeanstalkPalette.brown,
                        opacity: 0.98
                      }
                    }}>
                    <Stack direction="row" alignItems="center">
                      <ListItemText>Pick Unripe Beans</ListItemText>
                    </Stack>
                  </Button>
                </Box>
              </Stack>
            </Card>
            <Stack gap={1}>
              <Stack direction="row" gap={0.3}>
                <Typography sx={{ fontSize: '18px' }}>Pre-exploit Bean Balance at block</Typography>
                <Typography variant="h3">14602789:</Typography>
              </Stack>
              <Stack sx={{ pl: 2 }} gap={1}>
                <Stack gap={0.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: '18px' }}>Deposited Balance</Typography>
                    <Typography sx={{ fontSize: '18px' }}>$3,233,130</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '12px' }} color="text.secondary">Your Deposited Balance will automatically
                    be deposited upon Replant, these beans do not need to be picked!
                  </Typography>
                </Stack>
                <Divider />
                <Stack gap={1.1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <CheckIcon sx={{ fontSize: '18px', color: BeanstalkPalette.logoGreen }} />
                      <Typography sx={{ fontSize: '18px' }}>Circulating Beans</Typography>
                      <Tooltip placement="right" title="Beans that are in Farmers' wallets.">
                        <HelpOutlineIcon
                          sx={{ color: 'text.secondary', fontSize: '14px' }}
                        />
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <img src={greenBeanIcon} alt="Circulating Beans" width={18} />
                      <Typography sx={{ fontSize: '18px' }}>630,130</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <CheckIcon sx={{ fontSize: '18px', color: BeanstalkPalette.logoGreen }} />
                      <Typography sx={{ fontSize: '18px' }}>Harvestable Beans</Typography>
                      <Tooltip placement="right" title="Beans that are Harvestable Pods.">
                        <HelpOutlineIcon
                          sx={{ color: 'text.secondary', fontSize: '14px' }}
                        />
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <img src={greenBeanIcon} alt="Circulating Beans" width={18} />
                      <Typography sx={{ fontSize: '18px' }}>50,073</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <CloseIcon sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }} />
                      <Typography sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }}>Ordered Beans</Typography>
                      <Tooltip placement="right" title="Beans that are stored in Pod Orders.">
                        <HelpOutlineIcon
                          sx={{ color: 'text.secondary', fontSize: '14px' }}
                        />
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <img src={greenBeanIcon} alt="Circulating Beans" width={18} />
                      <Typography sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }}>0</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <CloseIcon sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }} />
                      <Typography sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }}>Withdrawn Beans</Typography>
                      <Tooltip placement="right" title="Beans in the process of being withdrawn.">
                        <HelpOutlineIcon
                          sx={{ color: 'text.secondary', fontSize: '14px' }}
                        />
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <img src={greenBeanIcon} alt="Circulating Beans" width={18} />
                      <Typography sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }}>0</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <CloseIcon sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }} />
                      <Typography sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }}>Farmable Beans</Typography>
                      <Tooltip placement="right" title="Bean seignorage in the Silo that has not yet been Deposited in the particular Season.">
                        <HelpOutlineIcon
                          sx={{ color: 'text.secondary', fontSize: '14px' }}
                        />
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <img src={greenBeanIcon} alt="Circulating Beans" width={18} />
                      <Typography sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }}>0</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <CloseIcon sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }} />
                      <Typography sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }}>Wrapped Beans</Typography>
                      <Tooltip placement="right" title="Beans that were stored in Beanstalk but not deposited.">
                        <HelpOutlineIcon
                          sx={{ color: 'text.secondary', fontSize: '14px' }}
                        />
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.3}>
                      <img src={greenBeanIcon} alt="Circulating Beans" width={18} />
                      <Typography sx={{ fontSize: '18px', color: BeanstalkPalette.lightishGrey }}>0</Typography>
                    </Stack>
                  </Stack>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" gap={0.3}>
                    <Typography sx={{ fontSize: '18px' }}>Total Unripe Beans Available to Pick</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={0.3}>
                    <img src={brownBeanIcon} alt="Circulating Beans" width={18} />
                    <Typography variant="h2" sx={{ fontSize: '18px' }}>680,203</Typography>
                  </Stack>
                </Stack>
              </Stack>

            </Stack>
          </Stack>
        </StyledDialogContent>
      </>
    );

    const tab1 = (
      <>
        <StyledDialogTitle
          sx={{ pb: 0.5 }}
          onClose={handleDialogClose}
        >
          <Box sx={{ cursor: 'pointer' }} onClick={handlePreviousTab}>
            <ChevronLeftIcon />
          </Box>
          Pick & Deposit
        </StyledDialogTitle>
        <StyledDialogContent sx={{ width: isMobile ? null : '560px' }}>
          <Stack gap={0.8}>
            {/* Pod Balance */}
            <Card
              sx={{
                p: 2.5,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f9fcff'
                }
              }}
              onClick={handlePickBeans}
            >
              <Stack justifyContent="center" alignItems="start">
                <Typography sx={{ fontSize: '20px' }}>Pick Unripe Beans</Typography>
                <Typography sx={{ fontSize: '14px' }} color="text.secondary">Claim the Unripe Beans to your
                  wallet.
                </Typography>
              </Stack>
            </Card>
            <Card
              sx={{
                p: 2.5,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f9fcff'
                }
              }}
              onClick={handlePickAndDepositBeans}
            >
              <Stack justifyContent="center" alignItems="start">
                <Stack direction="row" gap={0.3}>
                  <Typography sx={{ fontSize: '20px' }}>Pick & Deposit Unripe Beans</Typography>
                  <Typography sx={{ fontSize: '15px', color: BeanstalkPalette.logoGreen }}>(Recommended)</Typography>
                </Stack>
                <Typography sx={{ fontSize: '14px' }} color="text.secondary">Claim the Unripe Beans & Deposit them in the
                  Silo to earn yield.
                </Typography>
              </Stack>
            </Card>
          </Stack>
        </StyledDialogContent>
      </>
    );

    return (
      <Dialog
        onClose={onClose}
        open={open}
        fullWidth={fullWidth}
        fullScreen={fullScreen}
        disableScrollLock={disableScrollLock}
        sx={{ ...sx }}
      >
        {tab === 0 && tab0}
        {tab === 1 && tab1}
      </Dialog>
    );
  };

export default PickBeansDialog;
