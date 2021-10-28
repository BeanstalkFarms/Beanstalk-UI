/* eslint-disable */
import { Grid, Link } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import TelegramIcon from '@material-ui/icons/Telegram';
import TwitterIcon from '@material-ui/icons/Twitter';
import { makeStyles } from '@material-ui/styles';
import { ReactComponent as BeanIcon } from '../../img/bean-logo.svg';
import { ReactComponent as CoinGeckoIcon } from '../../img/coingecko-icon.svg';
import { ReactComponent as CoinMarketCapIcon } from '../../img/coinmarketcap-icon.svg';
import { ReactComponent as DiscordIcon } from '../../img/discord-icon.svg';
import { ReactComponent as EtherscanIcon } from '../../img/etherscan-logo.svg';
// import ground from '../../img/dark/ground.png';
// import ground from '../../img/ground-tall.png';
import { ReactComponent as MediumIcon } from '../../img/medium-icon.svg';
import { ReactComponent as OpenSeaIcon } from '../../img/opensea-icon.svg';
// import reddit from '../../img/reddit-icon.svg'
import { ReactComponent as UniswapIcon } from '../../img/uniswap-logo-black.svg';

import PumpkinIcon from '../../img/dark/pumpkin-dark.svg';
import FenceIcon from '../../img/dark/fence-dark.svg';
import TombstoneIcon from '../../img/dark/tombstone-dark.svg';
import { theme } from '../../constants';

import {
  BEAN_TOKEN_LINK,
  COINGECKO_LINK,
  COINMARKETCAP_LINK,
  DISCORD_LINK,
  GITHUB_LINK,
  MEDIUM_LINK,
  OPENSEA_LINK,
  SILO_CONTRACT_LINK,
  // REDDIT_LINK,
  TELEGRAM_LINK,
  TWITTER_LINK,
  UNISWAP_CONTRACT_LINK,
} from '../../constants';

export default function Footer(props) {
  const classes = makeStyles({
    fixedGround: {
      backgroundColor: 'transparent',
      backgroundImage: `url(${theme.ground})`,
      backgroundPosition: '0% 0%',
      backgroundRepeat: 'repeat',
      backgroundSize: 'contain',
      display: 'flex',
      alignContent: 'space-around',
      height: '60px',
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
  const linkStyle = {
    padding: '18px 15px 0 0',
  };
  const closeStyle = {
    padding: '18px 7px 0 0',
  };
  const siloStyle = {
    bottom: '51px',
    height: '15vw',
    left: 22,
    minHeight: '155px',
    position: 'fixed',
    zIndex: -1,
  };
  const barnStyle = {
    bottom: '51px',
    height: '15vw',
    left: 10,
    minHeight: '135px',
    position: 'fixed',
    zIndex: -1,
  };
  const pumpkinStyle = width > 650 ?
    {
      bottom: '51px',
      height: '5vw',
      left: '80%',
      minHeight: '55px',
      position: 'fixed',
      zIndex: -1,
    }
    : {
      display: 'none',
    };
  const tombstoneStyle = width > 650 ?
    {
      bottom: '47px',
      height: '5vw',
      left: '60%',
      minHeight: '55px',
      position: 'fixed',
      zIndex: -1,
    }
    : {
      display: 'none',
    };

  const spookyImg = theme.name === 'spooky' ?
    <>
    <img alt="Barn Icon" src={TombstoneIcon} style={tombstoneStyle} />
    <img alt="Barn Icon" src={PumpkinIcon} style={pumpkinStyle} />
    </>
    : null;

  return (
    <>
      <img alt="Silo Icon" src={theme.silo} style={siloStyle} />
      <img alt="Barn Icon" src={theme.barn} style={barnStyle} />
      {spookyImg}
      <Grid container className={classes.fixedGround} justifyContent="center">
        <Grid item style={closeStyle}>
          <Link href={TWITTER_LINK} color="inherit" target="blank">
            <TwitterIcon style={logoStyle} />
          </Link>
        </Grid>
        <Grid item style={linkStyle}>
          <Link href={TELEGRAM_LINK} color="inherit" target="blank">
            <TelegramIcon style={logoStyle} />
          </Link>
        </Grid>
        <Grid item style={linkStyle}>
          <Link href={DISCORD_LINK} color="inherit" target="blank">
            <DiscordIcon style={logoStyle} />
          </Link>
        </Grid>
        <Grid item style={linkStyle}>
          <Link href={MEDIUM_LINK} color="inherit" target="blank">
            <MediumIcon style={logoStyle} />
          </Link>
        </Grid>
        <Grid item style={linkStyle}>
          <Link href={OPENSEA_LINK} color="inherit" target="blank">
            <OpenSeaIcon style={logoStyle} />
          </Link>
        </Grid>
        <Grid item style={linkStyle}>
          <Link href={COINMARKETCAP_LINK} color="inherit" target="blank">
            <CoinMarketCapIcon style={logoStyle} />
          </Link>
        </Grid>
        {width > 500 ? (
          <Grid item style={linkStyle}>
            <Link href={COINGECKO_LINK} color="inherit" target="blank">
              <CoinGeckoIcon style={logoStyle} />
            </Link>
          </Grid>
        ) : null}
        <Grid item style={closeStyle}>
          <Link href={GITHUB_LINK} color="inherit" target="blank">
            <GitHubIcon style={logoStyle} />
          </Link>
        </Grid>
        <Grid item style={closeStyle}>
          <Link href={BEAN_TOKEN_LINK} color="inherit" target="blank">
            <BeanIcon style={logoStyle} />
          </Link>
        </Grid>
        <Grid item style={linkStyle}>
          <Link href={SILO_CONTRACT_LINK} color="inherit" target="blank">
            <EtherscanIcon style={logoStyle} />
          </Link>
        </Grid>
        {width > 500 ? (
          <Grid item style={linkStyle}>
            <Link href={UNISWAP_CONTRACT_LINK} color="inherit" target="blank">
              <UniswapIcon style={logoStyle} />
            </Link>
          </Grid>
        ) : null}
      </Grid>
    </>
  );
}
