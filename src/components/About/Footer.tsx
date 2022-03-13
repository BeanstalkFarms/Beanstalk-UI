/* eslint-disable */
import { Grid } from '@material-ui/core';
import {
  GitHub as GitHubIcon,
  Telegram as TelegramIcon,
  Twitter as TwitterIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { ReactComponent as BeanIcon } from 'img/bean-logo.svg';
import { ReactComponent as CoinGeckoIcon } from 'img/coingecko-icon.svg';
import { ReactComponent as CoinMarketCapIcon } from 'img/coinmarketcap-icon.svg';
import { ReactComponent as CommonwealthIcon } from 'img/commonwealth-icon.svg';
import { ReactComponent as CurveIcon } from 'img/curve-dao-icon.svg';
import { ReactComponent as DuneWinterIcon } from 'img/dune-icon-winter.svg'; // Icon is 2 colors so manually changed for winter theme
import { ReactComponent as DuneIcon } from 'img/dune-icon.svg'; // Icon is 2 colors so manually changed for winter theme
import { ReactComponent as DiscordIcon } from 'img/discord-icon.svg';
import { ReactComponent as EtherscanIcon } from 'img/etherscan-logo.svg';
import { ReactComponent as MediumIcon } from 'img/medium-icon.svg';
import { ReactComponent as OpenSeaIcon } from 'img/opensea-icon.svg';
import { ReactComponent as RedditIcon } from 'img/reddit-icon.svg';
import { ReactComponent as UniswapIcon } from 'img/uniswap-logo-black.svg';
import ThemeBackground from 'components/Themes'
import LogoLinks from './LogoLinks';

import {
  BEAN_TOKEN_LINK,
  CODE_OF_CONDUCT_LINK,
  COINGECKO_LINK,
  COINMARKETCAP_LINK,
  COMMONWEALTH_LINK,
  CURVE_LINK,
  DUNE_LINK,
  DISCORD_LINK,
  GITHUB_LINK,
  LICENSE_LINK,
  MEDIUM_LINK,
  NETLIFY_LINK,
  OPENSEA_LINK_GENESIS,
  REDDIT_LINK,
  SILO_CONTRACT_LINK,
  TELEGRAM_LINK,
  TWITTER_LINK,
  UNISWAP_CONTRACT_LINK,
  theme,
} from 'constants/index';

export default function Footer() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );

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
      zIndex: 101,
      position: 'fixed',
      bottom: 0,
      left: 0,
      paddingLeft: width < 800 ? 0 : 300
    },
  })();

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
        {width > 450 ? (
          <LogoLinks close link={REDDIT_LINK}>
            <RedditIcon style={logoStyle} />
          </LogoLinks>
        ) : null}
        <LogoLinks link={TELEGRAM_LINK}>
          <TelegramIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks link={DISCORD_LINK}>
          <DiscordIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks link={MEDIUM_LINK}>
          <MediumIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks close link={OPENSEA_LINK_GENESIS} paddingRight="10px">
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
        <LogoLinks close link={DUNE_LINK} paddingRight="5px">
          {theme.name === 'winterUpgrade'
            ? <DuneWinterIcon style={logoStyle} />
            : <DuneIcon style={logoStyle} />}
        </LogoLinks>
        <LogoLinks close link={BEAN_TOKEN_LINK}>
          <BeanIcon style={logoStyle} />
        </LogoLinks>
        <LogoLinks close link={SILO_CONTRACT_LINK}>
          <EtherscanIcon style={logoStyle} />
        </LogoLinks>
        {width > 550 ? (
          <LogoLinks close link={UNISWAP_CONTRACT_LINK} paddingRight="5px">
            <UniswapIcon style={logoStyle} />
          </LogoLinks>
        ) : null}
        <LogoLinks close link={CURVE_LINK}>
          <CurveIcon style={theme.name === 'winterUpgrade' ? { height: '25px', width: '25px', fill: 'url(#winterGradient)'} : { height: '25px', width: '25px', fill: 'url(#blackGradient)' }} />
        </LogoLinks>
        {width > 900 ? (
          <LogoLinks link={COMMONWEALTH_LINK}>
            <CommonwealthIcon style={logoStyle} />
          </LogoLinks>
        ) : null}
        <Grid container justifyContent="center" style={{ marginTop: '-10px' }}>
          <LogoLinks close link={NETLIFY_LINK} paddingTop="0px" color={theme.footer}>
            <span style={{ color: theme.footer, fontSize: '12px', margin: '0 5px' }}>
              {'This site is powered by Netlify'}
            </span>
          </LogoLinks>
          <LogoLinks close link={LICENSE_LINK} paddingTop="0px" color={theme.footer}>
            <span style={{ color: theme.footer, fontSize: '12px', margin: '0 5px' }}>
              {'MIT License'}
            </span>
          </LogoLinks>
          <LogoLinks close link={CODE_OF_CONDUCT_LINK} paddingTop="0px" color={theme.footer}>
            <span style={{ color: theme.footer, fontSize: '12px', margin: '0 5px' }}>
              {'Code of Conduct'}
            </span>
          </LogoLinks>
        </Grid>
      </Grid>
    </>
  );
}
