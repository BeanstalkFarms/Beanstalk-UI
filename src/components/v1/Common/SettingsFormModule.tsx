import React, { useState } from 'react';
import BigNumber from 'bignumber.js';
import { IconButton, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import { SwapMode } from 'util/index';
import { theme } from 'constants/index';
import { settingsStrings, SlippageModule, SwitchModule, UnitSelectionModule } from './index';

const useStyles = makeStyles({
  settingsIcon: {
    display: 'flex',
    justifyContent: 'flex-end',
    // Makes the settings bar float to the right side of the module.
    // position: 'absolute', 
    // width: '100%',  //
    // height: 'auto', //
    // right: '15px',  // 
    // bottom: '20px', // 
    margin: '20px 0 -56px -4px',
  },
  /* */
  rightSettingStyle: {
    backgroundColor: theme.module.background,
    boxShadow: '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)',
    clipPath: 'inset(-10px -10px -10px 0.4px)',
    //
    paddingBottom: '10px',
    paddingRight: '10px',
    borderRadius: '0 10px 10px 0',
    //
    position: 'absolute',
    width: '80px',  // 
    height: 'auto', // no height restriction
    right: '-79px', // slightly less than width to ensure overlap
    bottom: '26px', // bypass the 15px border radius
    zIndex: 99,
  },
  /* */
  bottomSettingStyle: {
    backgroundColor: theme.module.background,
    borderRadius: '0 0 10px 10px',
    boxShadow:
    '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)',
    clipPath: 'inset(0.4px -10px -10px -10px)',
    //
    position: 'absolute',
    width: 'auto',    // no width restriction
    height: '55px',   // 
    right: '26px',    // bypass the 15px border radius
    bottom: '-54px',  // slightly less than height to ensure overlap 
    zIndex: 99,
  },
});

export type Settings = {
  mode: SwapMode;
  removeLP: boolean;
  useLP: boolean;
  claim: boolean;
  convert: boolean;
  toWallet: boolean;
  slippage: BigNumber;
}

type SettingsFormModuleProps = {
  handleMode: (mode: Settings['mode']) => void;
  hasClaimable: boolean;
  hasConvertible: boolean;
  hasRemoveLP: boolean;
  hasSlippage: boolean;
  // margin: string;
  showBeanEthereum: boolean;
  showBeanEthereumSwap: boolean;
  showLP: boolean;
  showUnitModule?: boolean;

  // siloBeanBalance: BigNumber;
  // disableConvertible: boolean;
  // convertSlippage: any; // FIXME
  
  //
  isCreateListing: boolean;

  //
  settings: Settings;
  setSettings: (s: Settings) => void;
}

export default function SettingsFormModule(props: SettingsFormModuleProps) {
  const classes = useStyles();
  const [visible, setVisible] = useState<boolean>(false);
  const [showSlippage, setShowSlippage] = useState(
    props.hasSlippage &&
      (!props.showUnitModule || props.settings.mode !== SwapMode.Bean)
  );

  const rightDrawerItems = [
    {
      enabled: props.showLP && props.settings.mode !== SwapMode.LP,
      component: () => (
        <SwitchModule
          description={settingsStrings.showLP}
          label="Use LP"
          setValue={(value: boolean) =>
            props.setSettings({
              ...props.settings,
              useLP: value
            })
          }
          value={props.settings.useLP}
        />
      ),
    },
    {
      enabled: props.hasClaimable,
      component: () => (
        <SwitchModule
          description={settingsStrings.hasClaimable}
          label="Claim"
          setValue={(value: boolean) =>
            props.setSettings({
              ...props.settings,
              claim: value
            })
          }
          value={props.settings.claim}
        />
      ),
    },
    {
      enabled: props.hasConvertible,
      component: () => (
        <SwitchModule
          disabled={props.disableConvertible}
          description={settingsStrings.disableConvertible}
          label="Convert"
          setValue={(value: boolean) => {
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
      enabled: props.hasRemoveLP,
      component: () => (
        <SwitchModule
          description={settingsStrings.hasRemoveLP}
          label="Remove LP"
          margin="-50px 0px 0px 20px"
          setValue={(value: boolean) =>
            props.setSettings({
              ...props.settings,
              removeLP: value
            })
          }
          value={props.settings.removeLP}
        />
      ),
    },
    {
      enabled: props.isCreateListing,
      component: () => (
        <SwitchModule
          description={settingsStrings.toWalletDescription}
          label="To Wallet"
          margin="-50px 0px 0px 17px"
          setValue={(value: boolean) =>
            props.setSettings({
              ...props.settings,
              toWallet: value
            })
          }
          value={props.settings.toWallet}
        />
      ),
    },
    {
      enabled: showSlippage && props.hasSlippage,
      component: () => (
        <SlippageModule
          setSlippage={(value: BigNumber) =>
            props.setSettings({
              ...props.settings,
              slippage: value
            })
          }
          slippage={props.settings.slippage}
          description={props.convertSlippage}
        />
      ),
    },
  ];

  const rightDrawerEnabled = rightDrawerItems.findIndex((item) => item.enabled === true) > -1;

  const settingsIcon = (
    <Box className={classes.settingsIcon}>
      <IconButton
        color="primary"
        onClick={() => {
          setVisible(!visible);
        }}
        style={{ height: '44px', width: '44px', marginTop: '-8px' }}
        size="large">
        <SettingsIcon />
      </IconButton>
    </Box>
  );

  return (
    <>
      {settingsIcon}
      {visible ? (
        <>
          {/* Right Drawer */}
          {rightDrawerEnabled ? (
            <Box id="y" className={classes.rightSettingStyle}>
              {rightDrawerItems.map((item, index) => (
                item.enabled ? (
                  <span key={index}>
                    <item.component /> 
                  </span>
                ) : null
              ))}
            </Box>
          ) : null}
          {/* Bottom Drawer */}
          {props.showUnitModule ? (
            <Box id="x" className={classes.bottomSettingStyle}>
              <UnitSelectionModule
                beanEthereum={props.showBeanEthereum}
                beanEthereumSwap={props.showBeanEthereumSwap}
                lp={props.showLP}
                setValue={(value: SwapMode) => {
                  setShowSlippage(props.hasSlippage && value !== SwapMode.Bean);
                  props.handleMode(value);
                  props.setSettings({ ...props.settings, mode: value });
                  setVisible(false);
                }}
                value={props.settings.mode}
              />
            </Box>
          ) : null}
        </>
      ) : null}
    </>
  );
}

SettingsFormModule.defaultProps = {
  // handleMode: () => {},
  // hasClaimable: false,
  // hasConvertible: false,
  // hasRemoveLP: false,
  // hasSlippage: false,
  // margin: '20px -4px -56px 0',
  // showBeanEthereumSwap: false,
  // showLP: false,
  showUnitModule: true,
  // siloBeanBalance: new BigNumber(0),
};
