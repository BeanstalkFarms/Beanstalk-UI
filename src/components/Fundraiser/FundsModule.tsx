import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { updateUniswapUSDCAllowance } from 'state/allowances/actions';
import { approveUniswapUSDC, displayBN, displayFullBN, TokenLabel } from '../../util';
// import { APY_CALCULATION, MEDIUM_INTEREST_LINK, theme } from '../../constants';
import { BaseModule, ContentSection, Grid, HeaderLabel } from '../Common';
import { SowAuditModule } from './SowAuditModule';

export default function FundsModule(props) {
  const { uniswapUSDCAllowance } = useSelector<AppState, AppState['allowances']>(
    (state) => state.allowances
  );

  const {
    usdcBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const { weather, soil } = useSelector<
    AppState,
    AppState['weather']
  >((state) => state.weather);

  const [section, setSection] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);

  const { innerWidth: width } = window;
  const headerLabelStyle = {
    maxWidth: '300px',
  };

  const sectionTitles = ['Fund'];
  const sectionTitlesDescription = [
    `Use this tab to Fund the audit by sowing ${TokenLabel(props.asset)} in the Field in exchange for Pods.`,
  ];

  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
    }
  };

  const sowTokenRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        sowTokenRef.current.handleForm();
        break;
      default:
        break;
    }
  };

  const allowance =
    section === 0
      ? uniswapUSDCAllowance
      : new BigNumber(1);

  return (
    <ContentSection id={props.title} title={props.title} description={props.description} style={{ paddingTop: '0px' }}>
      <Grid container item xs={12} spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${displayFullBN(props.fundsRemaining)} ${TokenLabel(props.asset)}`}
            description={`The amount of remaining ${TokenLabel(props.asset)} needed to fund the audit`}
            title="Remaining USDC"
            value={displayBN(props.fundsRemaining)}
          />
        </Grid>
        <Grid item xs={12} sm={6} style={headerLabelStyle}>
          <HeaderLabel
            balanceDescription={`${displayFullBN(props.fundPercent)}%`}
            description={`The amount of remaining ${TokenLabel(props.asset)} needed to fund the audit`}
            title="Fund %"
            value={`${(props.fundPercent).toFixed(2)}%`}
          />
        </Grid>
      </Grid>
      <Grid
        container
        item
        xs={12}
        spacing={2}
        className="SiloSection"
        alignItems="flex-start"
        justifyContent="center"
        style={{ minHeight: props.minHeight, height: '100%' }}
      >
        <Grid
          item
          md={6}
          sm={12}
          style={width > 500 ? { maxWidth: '550px' } : { width: width - 64 }}
        >
          <BaseModule
            allowance={allowance}
            handleApprove={approveUniswapUSDC}
            handleForm={handleForm}
            handleTabChange={handleTabChange}
            isDisabled={isFormDisabled || props.fundsRemaining.isEqualTo(0)}
            marginTop="14px"
            section={section}
            sectionTitles={sectionTitles}
            sectionTitlesDescription={sectionTitlesDescription}
            setAllowance={updateUniswapUSDCAllowance}
            singleReset
          >
            <SowAuditModule
              key={0}
              asset={props.asset}
              tokenBalance={usdcBalance}
              fundsRemaining={props.fundsRemaining}
              unripenedPods={props.unripenedPods}
              ref={sowTokenRef}
              setIsFormDisabled={setIsFormDisabled}
              soil={soil}
              weather={weather}
              {...props}
            />
          </BaseModule>
        </Grid>
      </Grid>
    </ContentSection>
  );
}

FundsModule.defaultProps = {
  minHeight: '400px',
};
