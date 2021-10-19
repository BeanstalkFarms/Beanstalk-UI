import React, { forwardRef, useImperativeHandle } from 'react';
import { Box } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN } from '../../constants';
import { TrimBN, claimBeans } from '../../util';
import {
  ClaimableAsset,
  CryptoAsset,
  TokenInputField,
  TokenOutputField,
} from '../Common';

export const BeanClaimSubModule = forwardRef((props, ref) => {
  props.setIsFormDisabled(props.maxFromBeansVal.isLessThanOrEqualTo(0));

  /* Input Fields */

  const fromBeansField = (
    <TokenInputField
      balance={props.maxFromBeansVal}
      token={ClaimableAsset.Bean}
      value={TrimBN(props.maxFromBeansVal, BEAN.decimals)}
    />
  );

  /* Output Fields */

  const toBeanField = (
    <TokenOutputField
      mint
      token={CryptoAsset.Bean}
      value={TrimBN(props.maxFromBeansVal, BEAN.decimals)}
    />
  );

  /* Transaction Details, settings and text */

  function transactionDetails() {
    if (props.maxFromBeansVal.isLessThanOrEqualTo(0)) return null;

    return (
      <>
        <ExpandMoreIcon
          color="primary"
          style={{ marginBottom: '-14px', width: '100%' }}
        />
        <Box style={{ display: 'inline-block', width: '100%' }}>
          {toBeanField}
        </Box>
      </>
    );
  }

  useImperativeHandle(ref, () => ({
    handleForm() {
      if (props.maxFromBeansVal.isLessThanOrEqualTo(0)) return;

      claimBeans(Object.keys(props.crates), () => {});
    },
  }));

  return (
    <>
      {fromBeansField}
      {transactionDetails()}
    </>
  );
});
