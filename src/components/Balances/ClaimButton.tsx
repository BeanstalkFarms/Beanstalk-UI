import React from 'react';
import { claim, updateSilo, toStringBaseUnitBN } from 'util/index';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { ClaimableAsset, Grid, SingleButton } from 'components/Common';
import { BEAN } from 'constants/index';

export default function ClaimButton(props) {
  const {
    beanWrappedBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );
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
                  claim(props.claimable, true, toStringBaseUnitBN(beanWrappedBalance, BEAN.decimals));
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
