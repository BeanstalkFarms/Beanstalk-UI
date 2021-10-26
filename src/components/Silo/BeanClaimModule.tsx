import React, { forwardRef, useImperativeHandle } from 'react';
import BigNumber from 'bignumber.js';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN } from '../../constants';
import { claimBeans, TrimBN, displayBN } from '../../util';
import {
  ClaimableAsset,
  CryptoAsset,
  TokenInputField,
  TokenOutputField,
} from '../Common';

export const BeanClaimModule = forwardRef((props, ref) => {
  props.setIsFormDisabled(props.maxFromBeanVal.isLessThanOrEqualTo(0));

  /* Input Fields */

  const fromBeanField = (
    <TokenInputField
      balance={props.maxFromBeanVal}
      token={ClaimableAsset.Bean}
      value={TrimBN(props.maxFromBeanVal, BEAN.decimals)}
    />
  );

  /* Output Fields */

  const toBeanField = (
    <TokenOutputField
      mint
      token={CryptoAsset.Bean}
      value={TrimBN(props.maxFromBeanVal, BEAN.decimals)}
    />
  );

  /* Transaction Details, settings and text */

  function transactionDetails() {
    if (props.maxFromBeanVal.isLessThanOrEqualTo(0)) return;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-block', width: '100%' }}>{toBeanField}</Box>
        <Box style={{ display: 'inline-block', width: '100%' }}>
          <span>
            {`Claim ${displayBN(
              new BigNumber(props.maxFromBeanVal)
            )} Beans from the Silo.`}
          </span>
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (props.maxFromBeanVal.isLessThanOrEqualTo(0)) return;

      claimBeans(Object.keys(props.crates), () => {});
    },
  }));

  return (
    <>
      {fromBeanField}
      {transactionDetails()}
    </>
  );
});
