import React from 'react';
import { claim, updateSilo } from '../../util';
import {
  ClaimableAsset,
  Grid,
  SingleButton,
  TokenBalanceModule,
} from '../Common';

export default function ClaimableBalance(props) {
  const showButton = (
    <Grid container item xs={12}>
      <Grid
        container
        item
        direction="column"
        alignItems="center"
        style={{ margin: props.margin }}
      >
        <SingleButton
          backgroundColor="#3B3B3B"
          color="white"
          description={props.buttonDescription}
          handleClick={
            props.asset === ClaimableAsset.Ethereum
              ? () => {
                  claim(props.claimable);
                }
              : () => {
                  updateSilo(props.claimable);
                }
          }
          margin="-13px 7px 0 0"
          marginTooltip="0 0 -5px 20px"
          size="small"
          title={props.claimTitle}
          width="80%"
          widthTooltip="150px"
        />
      </Grid>
    </Grid>
  );

  if (props.userClaimable && props.balance.isGreaterThan(0)) {
    return (
      <Grid container item justifyContent="center">
        <Grid container item xs={12} justifyContent="center">
          <Grid item sm={9} xs={10}>
            <TokenBalanceModule
              balance={props.balance}
              claimPadding
              description={props.description}
              token={props.asset}
              widthTooltip={props.widthTooltip}
            />
          </Grid>
        </Grid>
        {showButton}
      </Grid>
    );
  }
  return (
    <Grid container item justifyContent="center">
      {showButton}
    </Grid>
  );
}

ClaimableBalance.defaultProps = {
  margin: 'inherit',
  userClaimable: 0,
  claimTitle: 'Claim',
  buttonDescription: 'Claim all Withdrawals, Harvestable Pods and ETH',
};
