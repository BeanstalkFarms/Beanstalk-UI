import React, { useState, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { updateBeanstalkCurveAllowance } from 'state/allowances/actions';
import { BASE_SLIPPAGE } from 'constants/index';
import { approveBeanstalkCurve } from 'util/index';
import { BaseModule, curveStrings  } from 'components/Common';
import { DepositModule } from './DepositModule';
import { WithdrawModule } from './WithdrawModule';
import { ClaimModule } from './ClaimModule';

export default function CurveModule() {
  const [section, setSection] = useState(0);
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [settings, setSettings] = useState({
    slippage: new BigNumber(BASE_SLIPPAGE),
    useBalanced: false,
    useCrv3: false,
  });

  const { beanstalkCurveAllowance } = useSelector<AppState, AppState['allowances']>(
    (state) => state.allowances
  );

  const sectionTitles = ['Deposit', 'Withdraw'];
  const sectionTitlesDescription = [curveStrings.deposit, curveStrings.withdraw];

  const handleTabChange = (event, newSection) => {
    if (newSection !== section) {
      setSection(newSection);
      setIsFormDisabled(true);
      if (newSection > 0) {
        setSettings((p) => ({ ...p, useBalanced: false }));
      } else {
        setSettings((p) => ({ ...p, useBalanced: false }));
      }
    }
  };

  const depositRef = useRef<any>();
  const withdrawRef = useRef<any>();
  const claimRef = useRef<any>();
  const handleForm = () => {
    switch (section) {
      case 0:
        depositRef.current.handleForm();
        break;
      case 1:
        withdrawRef.current.handleForm();
        break;
      case 2:
        claimRef.current.handleForm();
        break;
      default:
        break;
    }
  };

  const sections = [
    <DepositModule
      key={0}
      ref={depositRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings} // hide
      settings={settings} // hide
    />,
    <WithdrawModule
      key={1}
      ref={withdrawRef}
      setIsFormDisabled={setIsFormDisabled}
      setSettings={setSettings} // hide
      settings={settings} // hide
    />,
  ];
  const curveLPClaimable = new BigNumber(1); /* placeholder for claimable curve lp */
  if (curveLPClaimable.isGreaterThan(0)) {
    sections.push(
      <ClaimModule
        key={2}
        claimableCurveLPBalance={curveLPClaimable}
        ref={claimRef}
        setIsFormDisabled={setIsFormDisabled}
        setSettings={setSettings} // hide
        settings={settings} // hide
      />
    );
    sectionTitles.push('Claim');
    sectionTitlesDescription.push(curveStrings.lpClaim);
  }
  if (section > sectionTitles.length - 1) setSection(0);

  return (
    <>
      <BaseModule
        allowance={section === 0 ? beanstalkCurveAllowance : new BigNumber(1)}
        resetForm={() => {
          setSettings({ ...settings });
        }}
        handleApprove={approveBeanstalkCurve}
        handleForm={handleForm}
        handleTabChange={handleTabChange}
        isDisabled={isFormDisabled}
        marginTop="20px"
        marginMeta="14px 0 22px 0"
        section={section}
        sectionTitles={sectionTitles}
        sectionTitlesDescription={sectionTitlesDescription}
        setAllowance={updateBeanstalkCurveAllowance}
      >
        {sections[section]}
      </BaseModule>
    </>
  );
}
