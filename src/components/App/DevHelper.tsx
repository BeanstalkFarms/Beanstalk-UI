import { Box } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUserBalance } from 'state/userBalance/actions';

const DevHelper : React.FC = () => { 
  const dispatch = useDispatch(); 
  const [key, setKey] = useState<string>(null);
  const [value, setValue] = useState<any>(null);
  const userBalance = useSelector((state) => state.userBalance);
  return (
    <Box sx={{ position: 'fixed', bottom: 0, right: 0, backgroundColor: 'white', zIndex: 9999 }}>
      <form onSubmit={(e) => {
        e.preventDefault();
        dispatch(setUserBalance({
          [key]: new BigNumber(value || -1),
        }));
        setValue(null);
      }}>
        <select value={key} onChange={(evt) => setKey(evt.target.value)}>
          {Object.keys(userBalance).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <input type="number" placeholder="enter value" value={value} onChange={(evt) => setValue(evt.target.value)} />
        <button type="submit">
          Update state
        </button>
      </form>
    </Box>
  );
};

export default DevHelper;
