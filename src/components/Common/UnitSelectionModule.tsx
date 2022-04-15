import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import BeanEthIcon from 'img/bean-eth-logo.svg';
import BeanEthSwapIcon from 'img/bean-eth-swap-logo.svg';
import { CryptoAsset, SwapMode, TokenImage } from 'util/index';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  imageStyle: {
    display: 'inline',
    height: '20px',
    width: '20px',
  }
});

export default function UnitSelectionModule(props) {
  const classes = useStyles();
  const change = (event, value) => {
    if (value !== null) props.setValue(value);
  };

  const lpButton = props.lp ? (
    // <FormatTooltip
    //   placement="top"
    //   margin="0 0 0 0"
    //   title={props.lpDescription}
    // >
    <ToggleButton aria-label="right aligned" value={SwapMode.LP}>
      <img alt="LP" src={TokenImage(CryptoAsset.LP)} className={classes.imageStyle} />
    </ToggleButton>
  ) : // </FormatTooltip>
  null;
  const beanButton = props.bean ? (
    // <FormatTooltip
    //   placement="top"
    //   margin="0 0 0 0"
    //   title={props.beanDescription}
    // >
    <ToggleButton aria-label="left aligned" value={SwapMode.Bean}>
      <img alt="Bean" src={TokenImage(CryptoAsset.Bean)} className={classes.imageStyle} />
    </ToggleButton>
  ) : // </FormatTooltip>
  null;
  const ethButton = props.ethereum ? (
    // <FormatTooltip
    //   placement="top"
    //   margin="0 0 0 0"
    //   title={props.ethereumDescription}
    // >
    <ToggleButton aria-label="right aligned" value={SwapMode.Ethereum}>
      <img
        alt="Eth"
        src={TokenImage(CryptoAsset.Ethereum)}
        className={classes.imageStyle}
      />
    </ToggleButton>
  ) : // </FormatTooltip>
  null;
  const beanEthButton = props.beanEthereum ? (
    // <FormatTooltip
    //   placement="top"
    //   margin="0 0 0 0"
    //   title={props.beanEthereumDescription}
    // >
    <ToggleButton aria-label="centered" value={SwapMode.BeanEthereum}>
      <img alt="Bean/Eth" src={BeanEthIcon} className={classes.imageStyle} />
    </ToggleButton>
  ) : // </FormatTooltip>
  null;
  const beanEthSwapButton = props.beanEthereumSwap ? (
    // <FormatTooltip
    //   placement="top"
    //   margin="0 0 0 0"
    //   title={props.beanEthereumSwapDescription}
    // >
    <ToggleButton aria-label="right aligned" value={SwapMode.BeanEthereumSwap}>
      <img alt="Bean/Eth Swap" src={BeanEthSwapIcon} className={classes.imageStyle} />
    </ToggleButton>
  ) : // </FormatTooltip>
  null;

  return (
    <ToggleButtonGroup
      aria-label="text alignment"
      exclusive
      onChange={change}
      style={{ padding: '5px' }}
      value={props.value}
    >
      {lpButton}
      {beanButton}
      {ethButton}
      {beanEthButton}
      {beanEthSwapButton}
    </ToggleButtonGroup>
  );
}

UnitSelectionModule.defaultProps = {
  bean: true,
  beanDescription: 'Bean Mode: Use only Beans in tx',
  beanEthereum: true,
  beanEthereumDescription:
    'Bean Ethereum Mode: Use both Beans and Ethereum in tx',
  beanEthereumSwap: false,
  beanEthereumSwapDescription:
    'Bean Ethereum Mode: Use both Beans and Ethereum in tx',
  ethereum: true,
  ethereumDescription: 'Ethereum Mode: Use Ethereum in tx',
  lp: false,
  lpDescription: 'LP Mode: Use LP in tx',
  value: 0,
};
