import React, { useState } from 'react';
import { Page } from 'Pages/index';
import { Grid } from '@material-ui/core';
import { BaseModule, EthInputField, InputFieldPlus, SettingsFormModule, TokenInputField, TokenOutputField, TransactionToast } from 'components/Common';
import { BASE_SLIPPAGE } from 'constants/values';
import BigNumber from 'bignumber.js';
import { buyExactBeans, CryptoAsset, getFromAmount, SwapMode, toBaseUnitBN, toStringBaseUnitBN, transferBeans, TrimBN } from 'util/index';
import { useSelector } from 'react-redux';
import { AppState } from 'state/index';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { BEAN, ETH } from 'constants/index';

const BEANSPROUT_WALLET = "0x516d34570521C2796f20fe1745129024d45344Fc"; // Silo Chad Test Wallet

function Poker() {
  const [settings, setSettings] = useState({
    claim: false,
    mode: null,
    slippage: new BigNumber(BASE_SLIPPAGE),
  })

  const { beanReserve, ethReserve, usdcPrice, beanPrice } = useSelector<
    AppState,
    AppState['prices']
  >((state) => state.prices);

  const {
    beanBalance,
    ethBalance,
    lpReceivableBalance,
    beanClaimableBalance,
    claimable,
    claimableEthBalance,
    harvestablePodBalance,
    hasClaimable,
    plots,
    harvestablePlots,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const ethNeeded = getFromAmount(
    (new BigNumber(100)).div(settings.slippage),
    ethReserve,
    beanReserve
  )

  const notEnoughOfToken = settings.mode === SwapMode.Bean ? (
    beanBalance.lt(100)
  ) : (
    ethBalance.lt(ethNeeded)
  );

  return (
    <Grid container item xs={12} justifyContent="center">
      <Grid
        item
        xs={9}
        sm={8}
        style={{ maxWidth: '500px' }}
      >
        <BaseModule
          allowance={
            undefined
            // section > 0 || orderIndex ? new BigNumber(1) : uniswapBeanAllowance
          }
          isDisabled={notEnoughOfToken}
          resetForm={() => {
            // setOrderIndex(1);
          }}
          section={0}
          sectionTitles={['Buy In']}
          // sectionTitlesDescription={sectionTitlesDescription}
          // setAllowance={updateUniswapBeanAllowance}
          // handleApprove={approveUniswapBean}
          handleForm={() => {
            // Toast
            const txToast = new TransactionToast({
              loading: `Buying in for 100 Beans`,
              success: `Bought into the Poker Tournament!`,
            });
            const onResponse = (response) => {
              txToast.confirming(response)
            };

            if (settings.mode === SwapMode.Bean) {
              // Execute
              transferBeans(
                BEANSPROUT_WALLET,
                toStringBaseUnitBN(100, BEAN.decimals),
                onResponse
              )
              .then((value) => {
                txToast.success(value);
              })
              .catch((err) => {
                txToast.error(err);
              });
            } else if (settings.mode === SwapMode.Ethereum) {
              // Execute
              buyExactBeans(
                toStringBaseUnitBN(ethNeeded, ETH.decimals),
                toStringBaseUnitBN(100, BEAN.decimals),
                BEANSPROUT_WALLET,
                onResponse
              )
              .then((value) => {
                txToast.success(value);
              })
              .catch((err) => {
                txToast.error(err);
              });
            }
          }}
          // handleTabChange={handleTabChange}
          marginTop="16px"
        >
          {settings.mode === SwapMode.Bean ? (
            <>
              <TokenInputField
                locked={true}
                key={0}
                balance={beanBalance}
                token={CryptoAsset.Bean}
                value={new BigNumber(100)}
              />
              {notEnoughOfToken ? (
                <p>You need 100 Beans to buy in. <button onClick={() => setSettings({ ...settings, mode: SwapMode.Ethereum })}>Use Ethereum</button></p>
              ) : null}
            </>
          ) : (
            <>
              <TokenInputField
                balance={ethBalance}
                locked
                token={CryptoAsset.Ethereum}
                value={TrimBN(ethNeeded, 9)}
              />
              <ExpandMoreIcon
                color="primary"
                style={{ marginBottom: '-14px', width: '100%' }}
              />
              <TokenOutputField
                value={100}
                token={CryptoAsset.Bean}
              />
            </>
          )}
          {/* Settings */}
          <SettingsFormModule
            settings={settings}
            setSettings={setSettings}
            // handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
            // hasClaimable={props.hasClaimable}
            hasSlippage
          />
        </BaseModule>
      </Grid>
    </Grid>
  )
}

export default function PokerPage() {
  const sectionTitles = ['Poker'];
  const sections = [<Poker />];

  return (
    <Page
      sections={sections}
      sectionTitles={sectionTitles}
    />
  );
}
