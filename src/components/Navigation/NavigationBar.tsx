import React, { useEffect, useState } from 'react'
import {
  AppBar,
  Button,
  ClickAwayListener,
  Container,
  Grow,
  IconButton,
  List,
  ListItem,
  MenuList,
  MenuItem,
  Paper,
  Popper,
  Toolbar
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import MenuIcon from '@material-ui/icons/Menu'
import { Link } from 'react-scroll'
import BeanLogo from '../../img/bean-logo.svg'
import background from '../../img/cloud-background.png'
import { chainId } from '../../util'
import WalletModule from './WalletModule'

export default function NavigationBar(props) {
  const classes = makeStyles({
    fixedNav: {
      zIndex:'10000',
      backgroundColor: 'transparent',
      backgroundImage: `url(${background}), url(${background})`,
      backgroundPosition: '0px 0px, 1px 0px',
      backgroundRepeat: 'repeat-x, repeat-x',
      backgroundSize: 'contain, contain',
      boxShadow: 'none',
      height: '85px',
      position: 'fixed',
      width: '100%',
    },
    navDisplayFlex: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    linkText: {
      borderRadius: '16px',
      color: 'black',
      fontFamily: 'Futura-PT-Book',
      fontSize: '15px',
      margin: '4px',
      padding: '0px !important',
      textDecoration: 'none',
      // textTransform: 'uppercase'
    },
    linkPadding: {
      borderRadius: '16px',
      padding: '12px 18px'
    },
    activeLinkText: {
      backgroundColor: '#61dafb38'
    },
    activeAboutLinkText: {
      backgroundColor: '#61dafb38',
      borderRadius: '16px',
      padding: '12px 18px'
    },
    currentPriceStyle: {
      color: 'black',
      fontFamily: 'Futura-PT-Book',
      fontSize: '15px',
      paddingLeft: '15px',

    }
  })()

  const anchorRef = React.useRef<any>(null)
  const [open, setOpen] = React.useState(false)
  const handleToggle = () => { setOpen((prevOpen) => !prevOpen) }
  const handleClose = () => { setOpen(false) }

  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false)
  function handleScroll() {
    const windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight
    const body = document.body
    const html = document.documentElement
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
    const windowBottom = windowHeight + window.pageYOffset
    setIsScrolledToBottom(windowBottom >= docHeight)
    localStorage.setItem('scrollPosition', window.pageYOffset)
  }
  useEffect(() => {
    const scrollY = localStorage.getItem('scrollPosition')
    if (scrollY !== undefined) window.scrollTo(0, scrollY)

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const linkItemStyle = (path) => ( (path === 'governance' || path === 'nft') ? {color: 'rgb(14, 136, 55)'} : null )

  const mobileNavigation = (
    <div className='NavigationBarHamburger'>
      <List component='nav' aria-labelledby='main navigation' className={classes.navDisplayFlex}>
        <ListItem>
          <WalletModule {...props} />
        </ListItem>
      </List>
      <Button
        ref={anchorRef}
        style={{height: '97%'}}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup='true'
        onClick={handleToggle}
      >
        <MenuIcon />
      </Button>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id='menu-list-grow'>
                  {props.links.map(({ title, path }) => (
                    <MenuItem key={path} button className={classes.linkText} style={linkItemStyle(path)}>
                      <Link
                        duration={450}
                        to={path}
                        onClick={handleClose}
                        activeClass={classes.activeLinkText}
                        className={classes.linkPadding}
                        spy={true}
                        smooth={true}
                      >
                        {title}
                      </Link>
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  )

  const desktopNavigation = (
    <List component='nav' aria-labelledby='main navigation' className='NavigationBar'>
      {props.links.map(({ title, path }) => (
        <ListItem key={path} button className={classes.linkText} style={linkItemStyle(path)}>
          <Link
            to={path}
            duration={450}
            activeClass={isScrolledToBottom ? null : classes.activeLinkText}
            className={path === 'about' && isScrolledToBottom ? classes.activeAboutLinkText : classes.linkPadding}
            spy={true}
            smooth={true}
          >
            {title}
          </Link>
        </ListItem>
      ))}
      <ListItem>
        <WalletModule {...props} />
      </ListItem>
    </List>
  )

  const beanLogoFilter = (
    chainId === 3
      ? {filter: 'invert(62%) sepia(71%) saturate(5742%) hue-rotate(312deg) brightness(103%) contrast(101%)'}
      : null
  )
  const currentBeanPrice = (
    <div className={classes.currentPriceStyle}>
    {`$${props.beanPrice.toFixed(4)}`}
    </div>
  )
  const beanLogo = (
    <IconButton edge='start' color='inherit' className='App-logo'>
      <img style={beanLogoFilter} height='36px' src={BeanLogo} alt='bean.money' />
      {currentBeanPrice}
    </IconButton>
  )

  return (
    <AppBar className={classes.fixedNav}>
      <Toolbar>
        <Container className={classes.navDisplayFlex}>
          {beanLogo}
          {mobileNavigation}
          {desktopNavigation}
        </Container>
      </Toolbar>
    </AppBar>
  )
}
