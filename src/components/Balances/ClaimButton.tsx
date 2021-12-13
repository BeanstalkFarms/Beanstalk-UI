import React from 'react';
import { claim, updateSilo } from 'util/index';
import { ClaimableAsset, Grid, SingleButton } from 'components/Common';
import { useAccount } from 'state/application/hooks';

export default function ClaimButton(props) {
  const account = useAccount();
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
                  updateSilo(account);
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

  return (
    <Grid container item>
      {props.children}
      {showButton}
    </Grid>
  );
}

ClaimButton.defaultProps = {
  margin: 'inherit',
  claimTitle: 'Claim',
  buttonDescription: 'Claim all Withdrawals, Harvestable Pods and ETH',
};
