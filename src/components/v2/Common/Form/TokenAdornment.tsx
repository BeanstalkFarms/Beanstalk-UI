import React from 'react';
import { Box, Button, ButtonProps, InputAdornment } from "@mui/material"
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Token from 'classes/Token';

const TokenAdornment : React.FC<{ token: Token } & ButtonProps> = ({ token, ...props }) => {
  return (
    <InputAdornment position="end">
      <Button variant="contained" color="secondary" {...props}>
        {token.logo ? <img src={token.logo} alt="" /> : null}
        <Box>{token.symbol}</Box>
        <KeyboardArrowDownIcon
          sx={{
            marginLeft: 0.5,
            fontSize: 18,
            color: 'rgba(0,0,0,0.87)' // FIXME
          }}
        />
      </Button>
    </InputAdornment>
  )
}

export default TokenAdornment;