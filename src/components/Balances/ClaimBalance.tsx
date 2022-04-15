import React from 'react';
import { Box } from '@mui/material';
import {
  CryptoAsset,
  displayBN,
  displayFullBN,
  smallDecimalPercent,
  TokenLabel,
} from 'util/index';
import {
  FormatTooltip,
  Grid,
  TokenTypeImageModule,
  QuestionModule,
} from 'components/Common';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(({
  style: {
    display: 'inline',
    fontFamily: 'Lucida Console',
    fontWeight: 400,
    lineHeight: '100%',
  },
  imageStyle: {
    display: 'inline-block',
    marginBottom: '-2px',
    marginLeft: '0px',
  },
  gridStyle: { height: '20px' }
}));

export default function ClaimBalance({
  asset,
  balance,
  balanceColor,
  description,
  height,
  title,
  token,
  width,
  widthTooltip,
}) {
  const classes = useStyles();

  const imageStyle = {
    display: 'inline-block',
    height: height,
    marginBottom: '-2px',
    marginLeft: '0px',
  };

  const displayBalance =
    balance.isLessThan(0.001) && token === CryptoAsset.Ethereum
      ? smallDecimalPercent(balance)
      : displayBN(balance);

  if (balance.isGreaterThan(0)) {
    return (
      <Grid container item xs={12} justifyContent="center">
        <Grid container item justifyContent="center" className={classes.gridStyle}>
          <Box sx={{ position: 'relative' }}>
            <Box className="claimTextField-header" sx={{ width: width }}>
              {`${asset !== undefined ? TokenLabel(asset) : title}`}
              <QuestionModule
                description={description}
                margin="-8px 0 0 -1px"
                widthTooltip={widthTooltip}
              />
          </Box>
        </Box>
        <Box>
          <FormatTooltip
            margin="0 0 6px 10px"
            placement="top-start"
            title={`${displayFullBN(balance)} ${
                asset !== undefined ? TokenLabel(asset) : title
              }`}
            >
              <Box
                className="claimTextField-content"
                sx={{ margin: '0 0 0 5px' }}
              >
                <Box sx={{ color: balanceColor }}>
                  <h5 className={classes.style}>{displayBalance}</h5>
                  <TokenTypeImageModule
                    style={imageStyle}
                    token={token}
                    left={height !== '15px' ? '2px' : '0px'}
                  />
                </Box>
              </Box>
            </FormatTooltip>
          </Box>
        </Grid>
      </Grid>
    );
  }
  return null;
}

ClaimBalance.defaultProps = {
  title: 'undefined',
  width: 'calc(55px + 2vw)',
  height: '15px',
};
