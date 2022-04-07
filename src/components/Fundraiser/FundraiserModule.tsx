import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { updateBeanstalkUSDCAllowance } from 'state/allowances/actions';
import {
  approveBeanstalkUSDC,
  displayBN,
  displayFullBN,
  TokenLabel,
  CryptoAsset,
} from '../../util';
import {
  BaseModule,
  ContentDropdown,
  ContentSection,
  ContentTitle,
  Grid,
  HeaderLabelList,
} from '../Common';
import { FundModule } from './FundModule';

export default function FundraiserModule({
  remaining,
  total,
  description,
  title,
  id,
  minHeight,
}) {
  const { beanstalkUSDCAllowance } = useSelector<AppState, AppState['allowances']>(
    (state) => state.allowances
  );

  const {
    usdcBalance,
  } = useSelector<AppState, AppState['userBalance']>(
    (state) => state.userBalance
  );

  const [section, setSection] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);

  const { innerWidth: width } = window;
  const headerLabelStyle = {
    maxWidth: '300px',
    padding: '0px',
  };

  const sectionTitles = ['Fund'];
  const sectionTitlesDescription = [
    `Use this tab to Fund the audit by sowing ${TokenLabel(CryptoAsset.Usdc)} in the Field in exchange for Pods.`,
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
      ? beanstalkUSDCAllowance
      : new BigNumber(1);

  const fundPercent = total.minus(remaining).dividedBy(total).multipliedBy(100);

  return (
    <>
      <ContentTitle title={title} />
      <ContentSection id={title} paddingTop="10px" width="100%">
        <Grid container justifyContent="center" style={{ margin: '20px 0px' }}>
          <ContentDropdown
            description={description}
            descriptionTitle="What is this Fundraiser?"
          />
        </Grid>
        <Grid container item xs={12} justifyContent="center" style={headerLabelStyle}>
          <HeaderLabelList
            balanceDescription={[
              `${displayFullBN(remaining)} ${TokenLabel(CryptoAsset.Usdc)}`,
              `${displayFullBN(fundPercent)}%`,
            ]}
            description={[
              `The amount of remaining ${TokenLabel(CryptoAsset.Usdc)} needed to fund the audit`,
              'The percent of the Fundraiser that has been funded.',
            ]}
            title={[
              'Remaining USDC',
              'Funded',
            ]}
            value={[
              displayBN(remaining),
              `${(fundPercent).toFixed(2)}%`,
            ]}
            width="300px"
          />
        </Grid>
        <Grid
          container
          item
          xs={12}
          spacing={2}
          className="SiloSection"
          alignItems="flex-start"
          justifyContent="center"
          style={{ minHeight: minHeight, height: '100%' }}
        >
          <Grid
            item
            md={6}
            sm={12}
            style={width > 500 ? { maxWidth: '550px' } : { width: width - 64 }}
          >
            <BaseModule
              allowance={allowance}
              handleApprove={approveBeanstalkUSDC}
              handleForm={handleForm}
              handleTabChange={handleTabChange}
              isDisabled={isFormDisabled || remaining.isEqualTo(0)}
              marginTop="16px"
              section={section}
              sectionTitles={sectionTitles}
              sectionTitlesDescription={sectionTitlesDescription}
              setAllowance={updateBeanstalkUSDCAllowance}
              singleReset
            >
              <FundModule
                key={id}
                id={id}
                asset={CryptoAsset.Usdc}
                tokenBalance={usdcBalance}
                fundsRemaining={remaining}
                ref={sowTokenRef}
                setIsFormDisabled={setIsFormDisabled}
              />
            </BaseModule>
          </Grid>
        </Grid>
      </ContentSection>
    </>
  );
}

FundraiserModule.defaultProps = {
  minHeight: '400px',
};
