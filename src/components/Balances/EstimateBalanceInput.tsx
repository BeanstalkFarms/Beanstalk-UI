import React from 'react';
import {
  Card,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ChangeHistoryOutlinedIcon from '@mui/icons-material/ChangeHistoryOutlined';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { BeanstalkPalette } from '../App/muiTheme';
import { AppState } from '~/state';
import { displayFullBN } from '~/util';
import { NEW_BN } from '~/constants';

const textFieldSx = {
  background: 'white',
  fontSize: '1rem !important',
  '& .MuiInputBase-root': {
    maxHeight: '40px',
    fontSize: '1rem',
  },
};

const EstimateBalanceInput: React.FC<{
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ active, amount, setActive, setAmount }) => {
  const totalBeanSupply: BigNumber = useSelector<
    AppState,
    AppState['_bean']['token']['supply']
  >((state) => state._bean.token.supply);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value ? new BigNumber(e.target.value) : null;
    setAmount(newValue ? newValue.toString() : '');
  };

  return (
    <Card
      sx={{
        px: 2,
        py: 1.5,
        background: BeanstalkPalette.lightYellow,
        border: 'none',
        width: '100%',
      }}
    >
      <Stack spacing={1} alignItems="center">
        <ChangeHistoryOutlinedIcon
          color="primary"
          sx={{
            width: '20px',
            height: '20px',
            transform: `rotate(${active ? '180deg' : 0})`,
            cursor: 'pointer',
          }}
          onClick={() => {
            if (active) {
              setAmount('');
              setActive(false);
            } else {
              setActive(true);
            }
          }}
        />
        {!active ? (
          <Typography textAlign="center" color="primary">
            How might my balances change if Beanstalk grows next season?
          </Typography>
        ) : (
          <Stack spacing={1}>
            <Typography textAlign="center">If Beanstalk minted</Typography>
            <TextField
              type="text"
              value={amount}
              onChange={handleChange}
              placeholder="0"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography fontWeight={450} color="black">
                      Beans
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
            <Typography textAlign="center" sx={{ whiteSpace: 'nowrap' }}>
              next Season, a total Supply of{' '}
              <strong>
                {`${
                  totalBeanSupply !== NEW_BN
                    ? displayFullBN(totalBeanSupply, 2)
                    : '0'
                }`}
              </strong>
            </Typography>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};
export default EstimateBalanceInput;
