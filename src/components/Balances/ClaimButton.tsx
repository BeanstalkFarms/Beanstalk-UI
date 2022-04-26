import React from 'react';
import { claim, updateSilo, toStringBaseUnitBN } from 'util/index';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { ClaimableAsset, Grid, SingleButton } from 'components/Common';
import { BEAN } from 'constants/index';
import TransactionToast from 'components/Common/TransactionToast';

export default function ClaimButton(props) {
  const {
    beanWrappedBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const handleForm = () => {
    if (props.asset === ClaimableAsset.Ethereum) {
      // Toast
      const txToast = new TransactionToast({
        loading: 'Claiming Beans', // FIXME
        success: 'Claim successful', // FIXME
      });

      // Execute
      claim(
        props.claimable,
        true,
        toStringBaseUnitBN(beanWrappedBalance, BEAN.decimals),
        (response) => {
          txToast.confirming(response);
        }
      )
      .then((value) => {
        txToast.success(value);
      })
      .catch((err) => {
        txToast.error(err);
      });
    } else {
      // Toast
      const txToast = new TransactionToast({
        loading: 'Farming Stalk',
        success: 'Farm successful',
      });

      // Execute
      updateSilo(
        // FIXME: removing this since the updateSilo
        // function doesn't take a claimable param. Was
        // this intended for some other legacy purpose?
        // props.claimable,
        (response) => {
          txToast.confirming(response);
        }
      )
      .then((value) => {
        txToast.success(value);
      })
      .catch((err) => {
        txToast.error(err);
      });
    }
  };

  // temporarily disable farm button until post restart
  const showButton = false && (
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
          handleClick={handleForm}
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
