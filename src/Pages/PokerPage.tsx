import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Grid } from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import BigNumber from 'bignumber.js';

import { BaseModule, SettingsFormModule, TokenInputField, TokenOutputField, TransactionToast } from 'components/Common';
import { BASE_SLIPPAGE } from 'constants/values';
import { Page } from 'Pages/index';
import { account, buyExactBeans, CryptoAsset, getFromAmount, SwapMode, toStringBaseUnitBN, transferBeans, TrimBN } from 'util/index';
import { AppState } from 'state/index';
import { BEAN, ETH } from 'constants/index';

const BEANSPROUT_WALLET = '0x516d34570521C2796f20fe1745129024d45344Fc'; // Silo Chad Test Wallet
const POKER_CONFIRMATION_KEY = 'beanstalk-poker-confirmation';
const POKER_DISCORD_URL = 'https://discord.gg/TC8SV7evkw';
const POKER_REGISTRATION_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdNNy0obUeqJaJXnEqrtmN6s5STIUlmLvv3nk_p3mGDmB5Yjw/viewform'

const prefilledFormUrl = (
  _account: string,
  _txnHash: string,
) => (
  `${POKER_REGISTRATION_FORM_URL}?entry.673389134=${_account}&entry.1853585154=${_txnHash}`
);

type PokerConfirmations = {
  [account: string]: string;
}
const usePokerConfirmations = () => {
  let confirmation = null;
  try {
    const s = window.localStorage.getItem(POKER_CONFIRMATION_KEY);
    if (s) {
      confirmation = JSON.parse(s);
    }
  } catch (e) {
    // pass; default null if never set
  }
  return useState<PokerConfirmations | null>(confirmation);
};

function Poker() {
  /** Settings */
  const [settings, setSettings] = useState({
    claim: false,
    mode: SwapMode.Bean,
    slippage: new BigNumber(BASE_SLIPPAGE),
  });
  /** Disable the form button while the txn is pending. */
  const [transacting, setTransacting] = useState(false);
  /** When the buy-in txn confirms, we store it in local state to prevent people from buying in twice. */
  const [confirmations, setConfirmations] = usePokerConfirmations();

  // Global state
  const { beanReserve, ethReserve } = useSelector<AppState, AppState['prices']>((state) => state.prices);
  const { beanBalance, ethBalance } = useSelector<AppState, AppState['userBalance']>((state) => state.userBalance);

  // Calculations
  const alreadyConfirmed = confirmations && confirmations[account];
  const ethNeeded = getFromAmount(
    (new BigNumber(100)).div(settings.slippage),
    ethReserve,
    beanReserve
  );
  const notEnoughOfToken = settings.mode === SwapMode.Bean ? (
    beanBalance.lt(100)
  ) : (
    ethBalance.lt(ethNeeded)
  );

  // Handlers
  const handleConfirmation = (txnHash: string) => {
    const o = { 
      ...confirmations,   // keep prev entries
      [account]: txnHash, // add hash to current wallet
    };
    window.localStorage.setItem(
      POKER_CONFIRMATION_KEY,
      JSON.stringify(o)
    );
    setConfirmations(o);
  };

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
          isDisabled={alreadyConfirmed || transacting || notEnoughOfToken}
          section={0}
          sectionTitles={[alreadyConfirmed ? 'Buy-in received' : 'Buy in']}
          // sectionTitlesDescription={sectionTitlesDescription}
          // setAllowance={updateUniswapBeanAllowance}
          // handleApprove={approveUniswapBean}
          // Hide the button when we finalize the buy-in.
          showButton={!alreadyConfirmed}
          handleForm={() => {
            // Toast
            const txToast = new TransactionToast({
              loading: 'Buying in for 100 Beans',
              success: 'Bought into the Poker Tournament!',
            });
            const onResponse = (response: any) => {
              txToast.confirming(response);
            };
            const onConfirm = (value) => {
              txToast.success(value);
              setTransacting(false);
              handleConfirmation(value.transactionHash);
            };

            setTransacting(true);
            if (settings.mode === SwapMode.Bean) {
              // Execute
              transferBeans(
                BEANSPROUT_WALLET,
                toStringBaseUnitBN(100, BEAN.decimals),
                onResponse
              )
              .then(onConfirm)
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
              .then(onConfirm)
              .catch((err) => {
                txToast.error(err);
              });
            }
          }}
          marginTop="16px"
        >
          {alreadyConfirmed ? (
            <>
              <p>
                To finish registration, please create a <a href="https://pokerstars.com" target="_blank" rel="noreferrer">PokerStars</a> account and submit your username via the registration form below. If you have already done this, you don&apos;t need to submit the form again. Join the <a href={POKER_DISCORD_URL} target="_blank" rel="noreferrer">Beans of Poker</a> Discord for more updates.
              </p>
              <a href={prefilledFormUrl(account, confirmations[account])} target="_blank" rel="noreferrer">
                <Button
                  style={{
                    borderRadius: '15px',
                    fontFamily: 'Futura-Pt-Book',
                    fontSize: 'calc(10px + 1vmin)',
                    height: '44px',
                    margin: '12px 12px',
                    width: '64%',
                    maxWidth: '240px',
                    zIndex: '1',
                    color: '#fff',
                    textDecoration: 'none !important',
                  }}
                  color="primary"
                  variant="contained"
                >
                  Register
                </Button>
              </a>
            </>
          ) : (
            settings.mode === SwapMode.Bean ? (
              <>
                <TokenInputField
                  locked
                  key={0}
                  balance={beanBalance}
                  token={CryptoAsset.Bean}
                  value={new BigNumber(100)}
                />
                {notEnoughOfToken ? (
                  <p>You need 100 Beans to buy in. <button onClick={() => setSettings({ ...settings, mode: SwapMode.Ethereum })}>Use Ethereum</button></p>
                ) : null}
              </>
            ) : settings.mode === SwapMode.Ethereum ? (
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
            ) : null
          )}
          {/* Settings */}
          {!alreadyConfirmed && (
            <SettingsFormModule
              settings={settings}
              setSettings={setSettings}
              // Hide the BeanEthereum pair
              showBeanEthereum={false}
              hasSlippage
              // handleMode={() => fromValueUpdated(new BigNumber(-1), new BigNumber(-1))}
              // hasClaimable={props.hasClaimable}
            />
          )}
        </BaseModule>
      </Grid>
    </Grid>
  );
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
