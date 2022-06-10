import React from 'react';
import { Grid, Link } from '@mui/material';
import {
  GitHub as GitHubIcon,
  Telegram as TelegramIcon,
  Twitter as TwitterIcon,
} from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

//
import BeanIcon from 'img/tokens/bean-logo.svg';
import CoinGeckoIcon from 'img/ecosystem/coingecko-logo.svg';
import CoinMarketCapIcon from 'img/coinmarketcap-icon.svg';
import DuneWinterIcon from 'img/dune-icon-winter.svg'; // Icon is 2 colors so manually changed for winter theme
import DuneIcon from 'img/dune-icon.svg'; // Icon is 2 colors so manually changed for winter theme
import DiscordIcon from 'img/discord-icon.svg';
import EtherscanIcon from 'img/etherscan-logo.svg';
import MediumIcon from 'img/medium-icon.svg';
import OpenSeaIcon from 'img/opensea-icon.svg';
import RedditIcon from 'img/reddit-icon.svg';

import ThemeBackground from 'components/Themes';
import {
  BEAN_TOKEN_LINK,
  CODE_OF_CONDUCT_LINK,
  COINGECKO_LINK,
  COINMARKETCAP_LINK,
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
  theme,
} from 'constants/index';
import LogoLink from './LogoLink';

const useStyles = makeStyles({
  fixedGround: {
    backgroundColor: 'transparent',
    backgroundImage: `url(${theme.ground})`,
    backgroundPosition: '0% 0%',
    backgroundRepeat: 'repeat',
    backgroundSize: theme.groundSize,
    display: 'flex',
    alignContent: 'space-around',
    height: theme.groundHeight,
    zIndex: 11,
    paddingTop: !theme.groundPaddingTop ? '0px' : theme.groundPaddingTop,
    // paddingLeft: (props: any) => (props.width < 800 ? 0 : 300),
    position: 'fixed',
    bottom: 0,
    left: 0,
  },
  logoStyle: {
    height: '25px',
    width: '25px',
    fill: theme.footer,
  },
  textLinks: {
    color: theme.footer,
    padding: '3px',
    'font-size': '12px',
    margin: '0 5px',
    backgroundColor: 'rgba(200, 165, 126, 0.4)',
    borderRadius: '5px'
  }
});

export default function Footer() {
  const { width } = useSelector<AppState, AppState['general']>(
    (state) => state.general
  );
  const classes = useStyles({ width: width });

  return (
    <>
      <ThemeBackground />
      {/* TODO: remove style */}
      <Grid
        container
        className={classes.fixedGround}
        justifyContent="center"
      >
        {/* Row 1: Icons */}
        <LogoLink link={TWITTER_LINK}>
          <TwitterIcon className={classes.logoStyle} />
        </LogoLink>
        {width > 900 ? (
          <>
            <LogoLink link={REDDIT_LINK}>
              <img src={RedditIcon} alt="Reddit Icon" className={classes.logoStyle} />
            </LogoLink>
            <LogoLink link={TELEGRAM_LINK}>
              <TelegramIcon className={classes.logoStyle} />
            </LogoLink>
          </>
        ) : null}
        <LogoLink link={DISCORD_LINK}>
          <img src={DiscordIcon} alt="Discord Icon" className={classes.logoStyle} />
        </LogoLink>
        <LogoLink link={MEDIUM_LINK}>
          <img src={MediumIcon} alt="Medium Icon" className={classes.logoStyle} />
        </LogoLink>
        <LogoLink link={OPENSEA_LINK_GENESIS}>
          <img src={OpenSeaIcon} alt="Opensea Icon" className={classes.logoStyle} />
        </LogoLink>
        {width > 900 ? (
          <>
            <LogoLink link={COINMARKETCAP_LINK}>
              <img src={CoinMarketCapIcon} alt="CoinMarketCap Icon" className={classes.logoStyle} />
            </LogoLink>
            <LogoLink link={COINGECKO_LINK}>
              <img src={CoinGeckoIcon} alt="CoinGecko Icon" className={classes.logoStyle} />
            </LogoLink>
          </>
        ) : null}
        <LogoLink link={GITHUB_LINK}>
          <GitHubIcon className={classes.logoStyle} />
        </LogoLink>
        <LogoLink link={DUNE_LINK}>
          {
            theme.name === 'winterUpgrade'
            ? <img src={DuneWinterIcon} alt="Dune Icon" className={classes.logoStyle} />
            : <img src={DuneIcon} alt="Dune Icon" className={classes.logoStyle} />
          }
        </LogoLink>
        <LogoLink link={BEAN_TOKEN_LINK}>
          <img src={BeanIcon} alt="Bean Icon" className={classes.logoStyle} />
        </LogoLink>
        <LogoLink link={SILO_CONTRACT_LINK}>
          <img src={EtherscanIcon} alt="Etherscan Icon" className={classes.logoStyle} />
        </LogoLink>
        {/* Row 2 */}
        <Grid container justifyContent="center" style={{ marginTop: '-10px' }}>
          <Grid item>
            <Link href={NETLIFY_LINK} color="inherit" target="blank" underline="hover">
              <span className={classes.textLinks}>
                This site is powered by Netlify
              </span>
            </Link>
          </Grid>
          <Grid item>
            <Link href={LICENSE_LINK} color="inherit" target="blank" underline="hover">
              <span className={classes.textLinks}>
                MIT License
              </span>
            </Link>
          </Grid>
          <Grid item>
            <Link
              href={CODE_OF_CONDUCT_LINK}
              color="inherit"
              target="blank"
              underline="hover">
              <span className={classes.textLinks}>
                Code of Conduct
              </span>
            </Link>
          </Grid>
        </Grid>
        {!theme.flowers
          ? null
          : (
            <img
              alt="Rainbow Icon"
              src={theme.flowers}
              style={{
                position: 'absolute',
                width: '100vw',
                minWidth: '1200px',
                top: '-50px',
                zIndex: '-1'
              }}
            />
          )
        }
      </Grid>
    </>
  );
}
