/* eslint-disable */
import { Grid, Link } from '@material-ui/core';
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

// halloween assets
import PumpkinIcon from 'img/dark/pumpkin-dark.svg';
import TombstoneIcon from 'img/dark/tombstone-dark.svg';

// fall assets
import TurkeyIcon from 'img/fall/turkey.svg';
import FenceIcon from 'img/fall/fence-fall.svg';
import fallGround from 'img/fall/ground-grass.png';

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

export default function Footer(props) {
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
    topGround: {
      backgroundColor: 'transparent',
      backgroundImage: `url(${fallGround})`,
      backgroundPosition: '0% 0%',
      backgroundRepeat: 'repeat',
      backgroundSize: theme.groundSize,
      display: theme.groundGrass,
      alignContent: 'space-around',
      height: theme.groundHeight,
      zIndex: -2,
      position: 'fixed',
      bottom: '14px',
    },
  })();
  const width = window.innerWidth;

  const logoStyle = {
    height: '25px',
    width: '25px',
    fill: theme.footer,
  };
  const linkStyle = {
    padding: theme.footerPadding,
  };
  const closeStyle = {
    padding: theme.footerPadding,
  };
  const barnStyle = {
    bottom: theme.groundItemHeight,
    height: '15vw',
    left: 10,
    minHeight: '135px',
    position: 'fixed',
    zIndex: -1,
  };
  const itemStyle =
    width > 650
      ? {
          bottom: theme.groundItemHeight,
          height: '5vw',
          left: '80%',
          minHeight: '75px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };
  const rightItemStyle =
    width > 850
      ? {
          bottom: theme.groundItemHeight,
          height: '3vw',
          left: 'calc(80% + 4.4vw)',
          minHeight: '55px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };
  const tombstoneStyle =
    width > 650
      ? {
          bottom: '44px',
          height: '5vw',
          maxHeight: '100px',
          left: '60%',
          minHeight: '55px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };
  const miscStyle =
    width > 650
      ? {
          bottom: theme.groundItemHeight,
          height: '5vw',
          maxHeight: '100px',
          left: '60%',
          minHeight: '55px',
          position: 'fixed',
          zIndex: -1,
        }
      : {
          display: 'none',
        };

  const spookyImg =
    theme.name === 'spooky' ? (
      <>
        <img alt="Tombstone Icon" src={TombstoneIcon} style={tombstoneStyle} />
        <img alt="Pumkpin Icon" src={PumpkinIcon} style={itemStyle} />
        <img alt="Pumkpin Icon" src={PumpkinIcon} style={rightItemStyle} />
      </>
    ) : null;

  const fallImg =
    theme.name === 'fall' ? (
      <>
        <img alt="Fence Icon" src={FenceIcon} style={miscStyle} />
        <img alt="Turkey Icon" src={TurkeyIcon} style={itemStyle} />
        <img alt="Turkey Icon" src={TurkeyIcon} style={rightItemStyle} />
      </>
    ) : null;

  return (
    <>
      <Grid container className={classes.topGround} justifyContent="center" />
      <img alt="Barn Icon" src={theme.barn} style={barnStyle} />
      {spookyImg}
      {fallImg}
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
