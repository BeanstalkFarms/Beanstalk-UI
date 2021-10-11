import { Grid, Link } from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub'
import TelegramIcon from '@material-ui/icons/Telegram'
import TwitterIcon from '@material-ui/icons/Twitter';
import { makeStyles } from '@material-ui/styles'
import coingecko from '../../img/coingecko-icon.svg'
import discord from '../../img/discord-icon.svg'
import etherscan from '../../img/etherscan-logo.svg'
// import ground from '../../img/ground.png'
import ground from '../../img/ground-tall.png'
import medium from '../../img/medium-icon.svg'
import opensea from '../../img/opensea-icon.svg'
// import reddit from '../../img/reddit-icon.svg'
// import uniswap from '../../img/uniswap-logo-black.svg'
import BarnIcon from '../../img/Barn.svg'
import SiloIcon from '../../img/Silo.svg'
import {
  BEAN_TOKEN_LINK,
  COINGECKO_LINK,
  DISCORD_LINK,
  GITHUB_LINK,
  MEDIUM_LINK,
  OPENSEA_LINK,
  SILO_CONTRACT_LINK,
  // REDDIT_LINK,
  TELEGRAM_LINK,
  TWITTER_LINK
  // UNISWAP_CONTRACT_LINK
} from '../../constants'
import { CryptoAsset, TokenTypeImageModule } from '../Common'

export default function Footer(props) {
  const classes = makeStyles({
    fixedGround: {
      backgroundColor: 'transparent',
      backgroundImage: `url(${ground})`,
      backgroundPosition: '0% 0%',
      backgroundRepeat: 'repeat',
      backgroundSize: 'contain',
      display: 'flex',
      alignContent: 'space-around',
      height: '60px',
      zIndex: 1000000,
      position: 'fixed',
      bottom: '0px'
    }
  })()

  const logoStyle = {
    height: '25px',
    width: '25px',
  }
  // const uniswapStyle = {
  //   height: '25px',
  //   width: '30px',
  // }
  const linkStyle = {
    padding: '10px 15px 0 0',
  }
  const twitterStyle = {
    padding: '10px 12px 0 0',
  }
  const siloStyle = {
    bottom: '51px',
    height: '15vw',
    left: 22,
    minHeight: '155px',
    position: 'fixed',
    zIndex: -1
  }
  const barnStyle = {
    bottom: '51px',
    height: '15vw',
    left: 10,
    minHeight: '135px',
    position: 'fixed',
    zIndex: -1
  }

return (
  <>
  <img alt='Silo Icon' src={SiloIcon} style={siloStyle} />
  <img alt='Barn Icon' src={BarnIcon} style={barnStyle} />
  <Grid container className={classes.fixedGround} justifyContent='center'>
    <Grid item style={twitterStyle}>
      <Link href={TWITTER_LINK} color='inherit' target='blank'>
        <TwitterIcon />
      </Link>
    </Grid>
    <Grid item style={linkStyle}>
      <Link href={TELEGRAM_LINK} color='inherit' target='blank'>
        <TelegramIcon />
      </Link>
    </Grid>
    <Grid item style={linkStyle}>
      <Link href={DISCORD_LINK} color='inherit' target='blank'>
        <img alt='Discord Logo' src={discord} style={logoStyle}/>
      </Link>
    </Grid>
    <Grid item style={linkStyle}>
      <Link href={MEDIUM_LINK} color='inherit' target='blank'>
        <img alt='Medium Logo' src={medium} style={logoStyle}/>
      </Link>
    </Grid>
    <Grid item style={linkStyle}>
      <Link href={OPENSEA_LINK} color='inherit' target='blank'>
        <img alt='OpenSea Logo' src={opensea} style={logoStyle}/>
      </Link>
    </Grid>
    <Grid item style={linkStyle}>
      <Link href={COINGECKO_LINK} color='inherit' target='blank'>
        <img alt='CoinGecko Logo' src={coingecko} style={logoStyle}/>
      </Link>
    </Grid>
    <Grid item style={linkStyle}>
      <Link href={GITHUB_LINK} color='inherit' target='blank'>
        <GitHubIcon />
      </Link>
    </Grid>
    <Grid item style={linkStyle}>
      <Link href={BEAN_TOKEN_LINK} color='inherit' target='blank'>
        <TokenTypeImageModule style={logoStyle} token={CryptoAsset.Bean} />
      </Link>
    </Grid>
    <Grid item style={linkStyle}>
      <Link href={SILO_CONTRACT_LINK} color='inherit' target='blank'>
        <img alt='Etherscan Logo' src={etherscan} style={logoStyle}/>
      </Link>
    </Grid>
  </Grid>
  </>
 )
}
