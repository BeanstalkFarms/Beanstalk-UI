import { createAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';

export const updateBeanPrice = createAction<BigNumber>('bean/token/updatePrice');
export const updateBeanSupply = createAction<BigNumber>('bean/token/updateSupply');
