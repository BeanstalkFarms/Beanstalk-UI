import React from 'react';
import {
  Box, Button, Divider,
  Drawer,
  IconButton, Link,
  List, ListItemText, Stack, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BeanstalkPalette, IconSize } from 'components/App/muiTheme';
import beanstalkLogo from 'img/tokens/bean-logo-circled.svg';
import ROUTES from './routes';
import MenuItemMobile from './MenuItemMobile';
import DropdownIcon from '../Common/DropdownIcon';
import useToggle from '../../hooks/display/useToggle';
import useChainConstant from '../../hooks/useChainConstant';
import { BEANSTALK_ADDRESSES, CHAIN_INFO } from '../../constants';

const NavDrawer: React.FC<{
  open: boolean;
  hideDrawer: () => void;
}> =
  ({
     open,
     hideDrawer
   }) => {
    const [openMore, showMore, hideMore] = useToggle();
    // Constants
    const chainInfo = useChainConstant(CHAIN_INFO);
    const beanstalkAddress = useChainConstant(BEANSTALK_ADDRESSES);
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={hideDrawer}
        sx={{ height: '100vh' }}
        transitionDuration={0}
      >
        <Box sx={{ backgroundColor: '#f7fafe', width: '100%', height: '100vh', position: 'relative' }}>
          {/* Beanstalk Logo & Close Button */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5 }}>
            <Box>
              <Link href="/" display="flex" alignItems="center">
                <img src={beanstalkLogo} alt="" width={IconSize.large} />
              </Link>
            </Box>
            <IconButton aria-label="close" onClick={hideDrawer} sx={{ mr: -0.8 }}>
              <CloseIcon sx={{ color: BeanstalkPalette.black, fontSize: 35 }} />
            </IconButton>
          </Stack>
          {/* Items */}
          <List style={{ fontSize: 22 }}>
            {ROUTES.top.map((item) => (
              <>
                <MenuItemMobile
                  key={item.path}
                  item={item}
                  onClick={hideDrawer}
                />
                <Divider />
              </>
            ))}
            <Stack onClick={openMore ? hideMore : showMore} sx={{ pb: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 1.6, py: 0.6, cursor: 'pointer', height: 48 }}
              >
                <Typography sx={{ fontSize: '25px' }} variant="body1" color="text.secondary">
                  More
                </Typography>
                <DropdownIcon open={openMore} sx={{ color: 'text.secondary' }} />
              </Stack>
              <Stack display={openMore ? 'block' : 'none'}>
                <Box sx={{ pl: 0.5, pt: 1 }}>
                  {ROUTES.more.map((item) => (
                    <MenuItemMobile
                      key={item.path}
                      item={item}
                      onClick={hideDrawer}
                    />
                  ))}
                </Box>
                <Box sx={{ px: 1, py: 0.6 }}>
                  <Button
                    fullWidth
                    href={`${chainInfo.explorer}/address/${beanstalkAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    variant="contained"
                    color="secondary"
                    sx={{ py: 0.9 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ListItemText>
                        <Typography variant="h4">
                          Contract: {beanstalkAddress.slice(0, 6)}...
                        </Typography>
                      </ListItemText>
                      <Typography variant="body2" color="text.secondary">
                        <ArrowForwardIcon
                          sx={{ transform: 'rotate(-45deg)', fontSize: 12 }}
                        />
                      </Typography>
                    </Stack>
                  </Button>
                </Box>
              </Stack>
            </Stack>
            <Divider />
          </List>
        </Box>
      </Drawer>
    );
  };

export default NavDrawer;
