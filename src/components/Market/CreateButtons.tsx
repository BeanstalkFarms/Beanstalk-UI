import React from 'react';
import {
  Button, Card, MenuList,
  Stack, Tooltip,
  Typography,

} from '@mui/material';
import ROUTES from '../Nav/routes';
import MenuItem from '../Nav/MenuItem';
import DropdownIcon from '../Common/DropdownIcon';
import useToggle from '../../hooks/display/useToggle';
import { FontWeight } from '../App/muiTheme';

const CreateButtons: React.FC = () => {
  const [open, show, hide] = useToggle();
  return (
    <Stack direction="row" gap={1} alignItems="end" height="100%">
      <Tooltip
        components={{ Tooltip: Card }}
        title={(
          <MenuList>
            {ROUTES.market.map((item) => (
              <MenuItem key={item.path} item={item} onClick={hide} />
            ))}
          </MenuList>
        )}
        onOpen={show}
        onClose={hide}
        enterTouchDelay={50}
        leaveTouchDelay={10000}
        disableFocusListener
        placement="bottom-start"
        sx={{ marginTop: 10 }}
        componentsProps={{
          popper: {
            sx: {
              paddingTop: 0.5
            }
          }
        }}
      >
        {/* Partial duplicate of LinkButton */}
        <Button
          variant="contained"
          color="light"
          endIcon={<DropdownIcon sx={{ fontWeight: FontWeight.bold }} open={open} />}
          sx={{
            py: 1
          }}
          className={open ? 'Mui-focusVisible' : ''}
        >
          <Typography variant="h4">
            Market
          </Typography>
        </Button>
      </Tooltip>
      <Button
        href="#/market/create"
        color="primary"
        variant="contained"
        sx={{ py: 1 }}
      >
        <Typography variant="h4">Create Order</Typography>
      </Button>
    </Stack>
  );
};
export default CreateButtons;
