/* eslint-disable */
import { Grid } from '@material-ui/core';
import {
  GitHub as GitHubIcon,
  Telegram as TelegramIcon,
  Twitter as TwitterIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { ReactComponent as BeanIcon } from 'img/bean-logo.svg';
import { ReactComponent as CoinGeckoIcon } from 'img/coingecko-icon.svg';
import { ReactComponent as CoinMarketCapIcon } from 'img/coinmarketcap-icon.svg';
import { ReactComponent as DiscordIcon } from 'img/discord-icon.svg';
import { ReactComponent as EtherscanIcon } from 'img/etherscan-logo.svg';
import { ReactComponent as MediumIcon } from 'img/medium-icon.svg';
import { ReactComponent as OpenSeaIcon } from 'img/opensea-icon.svg';
import { ReactComponent as UniswapIcon } from 'img/uniswap-logo-black.svg';
import ThemeBackground from 'components/Themes'
import LogoLinks from './LogoLinks';

import {
  BEAN_TOKEN_LINK,
  COINGECKO_LINK,
  COINMARKETCAP_LINK,
  DISCORD_LINK,
  GITHUB_LINK,
  MEDIUM_LINK,
  OPENSEA_LINK,
  SILO_CONTRACT_LINK,
  TELEGRAM_LINK,
  TWITTER_LINK,
  UNISWAP_CONTRACT_LINK,
  theme,
} from 'constants/index';

export default function Footer() {
  const classes = makeStyles({
    fixedGround: {
      backgroundColor: 'transparent',
      backgroundImage: `url(${theme.ground})`,
      backgroundPosition: '0% 0%',
      backgroundRepeat: 'repeat',
      backgroundSize: theme.groundSize,
      display: 'flex',
      alignContent: 'space-around',
      height: theme.groundHeight,
      zIndex: 1000000,
      position: 'fixed',
      bottom: '0px',
    },
  })();
  const width = window.innerWidth;

  const logoStyle = {
    height: '25px',
    width: '25px',
    fill: theme.footer,
  };

  return (
    <>
      <ThemeBackground />
      <Grid container className={classes.fixedGround} justifyContent="center">
        <LogoLinks close link={TWITTER_LINK}>
          <TwitterIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks link={TELEGRAM_LINK}>
          <TelegramIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks link={DISCORD_LINK}>
          <DiscordIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks link={MEDIUM_LINK}>
          <MediumIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks close link={OPENSEA_LINK} paddingRight="10px">
          <OpenSeaIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks link={COINMARKETCAP_LINK}>
          <CoinMarketCapIcon style={logoStyle} />
        </LogoLinks>
        {width > 500 ? (
          <LogoLinks link={COINGECKO_LINK}>
            <CoinGeckoIcon style={logoStyle} />
          </LogoLinks>
        ) : null}
        <LogoLinks close link={GITHUB_LINK}>
          <GitHubIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks close link={BEAN_TOKEN_LINK}>
          <BeanIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks close link={SILO_CONTRACT_LINK}>
          <EtherscanIcon style={logoStyle} />
        </LogoLinks>
        {width > 500 ? (
          <LogoLinks link={UNISWAP_CONTRACT_LINK}>
            <UniswapIcon style={logoStyle} />
          </LogoLinks>
        ) : null}
      </Grid>
    </>
  );
}
