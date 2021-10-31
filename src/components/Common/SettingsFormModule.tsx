import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { IconButton, Box } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import { SwapMode } from '../../util';
import { SlippageModule, SwitchModule, UnitSelectionModule } from './index';

export default function SettingsFormModule(props) {
  const rightSettingStyle = {
    backgroundColor: '#F5FAFF',
    borderRadius: '0 10px 10px 0',
    bottom: '0px',
    boxShadow:
      '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)',
    clipPath: 'inset(-10px -10px -10px 0.4px)',
    height: 'auto',
    paddingBottom: '10px',
    position: 'absolute',
    right: '-79px',
    width: '60px',
    zIndex: '-1',
  };
  const bottomSettingStyle = {
    backgroundColor: '#F5FAFF',
    borderRadius: '0 0 10px 10px',
    bottom: '-76px',
    boxShadow:
      '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)',
    clipPath: 'inset(0.4px -10px -10px -10px)',
    height: '55px',
    position: 'absolute',
    right: '7px',
    width: 'auto',
    zIndex: '-1',
  };

  const [settingsStyle, setSettingsStyle] = useState({ display: 'none' });

  const [showSlippage, setShowSlippage] = useState(
    props.hasSlippage &&
      (!props.showUnitModule || props.settings.mode !== SwapMode.Bean)
  );

  const rightDrawerItems = [
    {
      visible: props.showLP && props.settings.mode !== SwapMode.LP,
      component: () => (
        <SwitchModule
          description="Toggle to also Deposit Circulating LP Tokens."
          label="Use LP"
          setValue={(value) =>
            props.setSettings({ ...props.settings, useLP: value })
          }
          value={props.settings.useLP}
        />
      ),
    },
    {
      visible: props.hasClaimable,
      component: () => (
        <SwitchModule
          description="Toggle to Claim and use Claimable assets in the transaction."
          label="Claim"
          setValue={(value) =>
            props.setSettings({ ...props.settings, claim: value })
          }
          value={props.settings.claim}
        />
      ),
    },
    {
      visible: props.hasConvertible,
      component: () => (
        <SwitchModule
          disabled={props.disableConvertible}
          description="Toggle to convert Deposited Beans into Deposited LP Tokens."
          label="Convert"
          setValue={(value) => {
            if (props.settings.mode !== SwapMode.BeanEthereum) {
              props.handleMode(SwapMode.BeanEthereum);
            }
            props.setSettings({
              ...props.settings,
              mode: SwapMode.BeanEthereum,
              convert: value,
            });
          }}
          value={
            props.settings.mode === SwapMode.BeanEthereum &&
            props.settings.convert &&
            props.hasConvertible
          }
        />
      ),
    },
    {
      visible: props.hasRemoveLP,
      component: () => (
        <SwitchModule
          description="Toggle to remove the Beans and ETH from the liquidity pool. By default this is toggled on."
          label="Remove LP"
          margin="-50px 0px 0px 20px"
          setValue={(value) =>
            props.setSettings({ ...props.settings, removeLP: value })
          }
          value={props.settings.removeLP}
        />
      ),
    },
    {
      visible: showSlippage && props.hasSlippage,
      component: () => (
        <SlippageModule
          setSlippage={(value) =>
            props.setSettings({ ...props.settings, slippage: value })
          }
          slippage={props.settings.slippage}
        />
      ),
    },
  ];

  const rightDrawerVisibleItems = rightDrawerItems.reduce(
    (hasVisible, item) => hasVisible || item.visible,
    false
  );

  const rightDrawer = rightDrawerVisibleItems ? (
    <Box id="y" style={Object.assign(rightSettingStyle, settingsStyle)}>
      {rightDrawerItems.map((item, index) => (
        <span key={index}>{item.visible ? item.component() : null}</span>
      ))}
    </Box>
  ) : null;

  const unitModule = props.showUnitModule ? (
    <UnitSelectionModule
      beanEthereumSwap={props.showBeanEthereumSwap}
      lp={props.showLP}
      setValue={(value) => {
        setShowSlippage(props.hasSlippage && value !== SwapMode.Bean);
        props.handleMode(value);
        props.setSettings({ ...props.settings, mode: value });
        setSettingsStyle({ display: 'none' });
      }}
      value={props.settings.mode}
    />
  ) : null;

  const bottomDrawer = props.showUnitModule ? (
    <Box id="x" style={Object.assign(bottomSettingStyle, settingsStyle)}>
      {unitModule}
    </Box>
  ) : null;

  const settingsIcon = (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        margin: props.margin,
      }}
    >
      <IconButton
        color="primary"
        onClick={() => {
          const shouldExpand = settingsStyle.display === 'none';
          setSettingsStyle(
            shouldExpand ? { display: 'block' } : { display: 'none' }
          );
        }}
        style={{ height: '44px', width: '44px', marginTop: '-8px' }}
      >
        <SettingsIcon />
      </IconButton>
    </Box>
  );

  return (
    <>
      {settingsIcon}
      {rightDrawer}
      {bottomDrawer}
    </>
  );
}

SettingsFormModule.defaultProps = {
  handleMode: () => {},
  hasClaimable: false,
  hasConvertible: false,
  hasRemoveLP: false,
  hasSlippage: false,
  margin: '20px -4px -56px 0',
  showBeanEthereumSwap: false,
  showLP: false,
  showUnitModule: true,
  siloBeanBalance: new BigNumber(0),
};
