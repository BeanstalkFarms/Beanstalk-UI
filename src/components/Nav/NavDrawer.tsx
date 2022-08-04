import React from 'react';
import {
  Box, Button,
  Drawer,
  IconButton, Link, ListItemText, Stack, Typography
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
}> = ({
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
        <Box position="fixed" sx={{ backgroundColor: '#f7fafe', width: '100%', height: '100%', top: 0, overflowY: 'scroll' }}>
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
          <Stack sx={{ mt: 1, fontSize: 22 }}>
            {ROUTES.top.map((item) => (
              <Box>
                <MenuItemMobile
                  key={item.path}
                  item={item}
                  onClick={hideDrawer}
                  sx={{ borderBottom: 2, borderColor: BeanstalkPalette.lightBlue }}
                />
              </Box>
            ))}
            <MenuItemMobile
              item={{ title: 'More', href: undefined, path: '' }}
              onClick={openMore ? hideMore : showMore}
              sx={{ borderBottom: 2, borderColor: BeanstalkPalette.lightBlue }}
              endAdornment={<DropdownIcon open={openMore} sx={{ color: 'text.secondary' }} />}
            >
              <Stack display={openMore ? 'block' : 'none'}>
                <Box sx={{ pl: 0.5 }}>
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
                    sx={{ py: 0.9, zIndex: 3000 }}
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
            </MenuItemMobile>
          </Stack>
        </Box>
      </Drawer>
    );
  };

export default NavDrawer;
