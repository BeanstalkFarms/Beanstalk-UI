import { Select, MenuItem } from '@mui/material';
import { useAtom } from 'jotai';
import React from 'react';
import { FontSize } from '~/components/App/muiTheme';
import { pricingFunctionAtom, PricingFn } from '../info/atom-context';

const PricingFnSelect: React.FC<{}> = () => {
  const [pricingFn, setPricingFn] = useAtom(pricingFunctionAtom);

  return (
    <Select
      value={pricingFn}
      defaultValue={PricingFn.FIXED}
      onChange={(e) => setPricingFn(e.target.value as PricingFn)}
      size="small"
      sx={{ fontSize: FontSize.sm }}
    >
      <MenuItem value={PricingFn.FIXED} sx={{ fontSize: FontSize.sm }}>
        {PricingFn.FIXED}
      </MenuItem>
      <MenuItem value={PricingFn.DYNAMIC} sx={{ fontSize: FontSize.sm }}>
        {PricingFn.DYNAMIC}
      </MenuItem>
    </Select>
  );
};

export default PricingFnSelect;
