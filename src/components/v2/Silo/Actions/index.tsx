import React, { useState } from 'react';
import { Box, Button, Card, IconButton, Stack, Tab, Tabs, TextField } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { Token } from 'classes';
import TokenOutputField from 'components/v2/Common/Form/TokenOutputField';
import useChainConstant from 'hooks/useConstant';
import { Stalk } from 'constants/v2/tokens';
import BigNumber from 'bignumber.js';

const Deposit : React.FC<{
  token: Token
}> = () => {
  return (
    <form>
      <Stack gap={1}>
        <TextField
          type="text"
          variant="outlined"
          placeholder="Placeholder"
          fullWidth
          InputProps={{
            endAdornment: (
              <Button
                variant="contained"
                color="secondary"
                endIcon={<ArrowDropDownIcon />}
                fullWidth
                sx={{ 
                  // FIXME: button wraps. hack for now.
                  maxWidth: 170,
                  // whiteSpace: 'no-wrap !important',
                  // minWidth: 'auto !important',
                }}
              >
                Select a token
              </Button>
            )
          }}
        />
        <Stack direction="column" gap={1}>
          <TokenOutputField
            token={Stalk}
            value={new BigNumber(10_000)}
          />
          <Stack direction="row" gap={1} justifyContent="center">
            <Box sx={{ flex: 1 }}>
              <TokenOutputField
                token={Stalk}
                value={new BigNumber(10_000)}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TokenOutputField
                token={Stalk}
                value={new BigNumber(10_000)}
              />
            </Box>
          </Stack>
        </Stack>
        <Button disabled={true} type="submit" size="large" fullWidth>
          Deposit
        </Button>
      </Stack>
    </form>
  )
}

const Actions : React.FC<{
  token: Token
}> = (props) => {
  const [tab, setTab] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  return (
    <Card sx={{ p: 2 }}>
      <Stack gap={1.5}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tabs value={tab} onChange={handleChange} sx={{ minHeight: 0 }}>
            <Tab label="Deposit" />
            <Tab label="Withdraw" />
          </Tabs>
          <Box>
            <IconButton size="small">
              <SettingsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Stack>
        {/* Tabs */}
        <Box>
          {tab === 0 ? (
            <Deposit token={props.token} />
          ) : null}
        </Box>
      </Stack>
    </Card>
  );
};

export default Actions;
