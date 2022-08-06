import React from 'react';
import {
  Button,
  Stack,
  Typography,
} from '@mui/material';
import useToggle from '../../hooks/display/useToggle';
import MoreDropdown from '~/components/Market/MoreDropdown';

const CreateButtons: React.FC = () => {
  const [open, show, hide] = useToggle();
  return (
    <Stack direction="row" gap={1} alignItems="end" height="100%">
      <MoreDropdown />
      {/* <Tooltip */}
      {/*  components={{ Tooltip: Card }} */}
      {/*  title={( */}
      {/*    <MenuList sx={{ zIndex: 3000 }}> */}
      {/*      {ROUTES.market.map((item) => { */}
      {/*        if (item.path !== ROUTES.market[0].path) { */}
      {/*          return (<MenuItem key={item.path} item={item} onClick={hide} />); */}
      {/*        } */}
      {/*        return null; */}
      {/*      })} */}
      {/*    </MenuList> */}
      {/*  )} */}
      {/*  onOpen={show} */}
      {/*  onClose={hide} */}
      {/*  disableFocusListener */}
      {/*  placement="bottom-start" */}
      {/*  sx={{ marginTop: 10 }} */}
      {/*  componentsProps={{ */}
      {/*    popper: { */}
      {/*      sx: { */}
      {/*        paddingTop: 0.5 */}
      {/*      } */}
      {/*    } */}
      {/*  }} */}
      {/* > */}
      {/*  /!* Partial duplicate of LinkButton *!/ */}
      {/*  <Button */}
      {/*    variant="contained" */}
      {/*    color="light" */}
      {/*    endIcon={<DropdownIcon sx={{ fontWeight: FontWeight.bold }} open={open} />} */}
      {/*    sx={{ */}
      {/*      py: 1 */}
      {/*    }} */}
      {/*    className={open ? 'Mui-focusVisible' : ''} */}
      {/*  > */}
      {/*    <Typography variant="h4"> */}
      {/*      More */}
      {/*    </Typography> */}
      {/*  </Button> */}
      {/* </Tooltip> */}
      <Button
        href="#/market/create"
        color="primary"
        variant="contained"
        sx={{ py: 1 }}
      >
        <Typography variant="h4">Create New</Typography>
      </Button>
    </Stack>
  );
};
export default CreateButtons;
