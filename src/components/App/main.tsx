import { chainId } from '../../util'
import Footer from '../About/Footer'
import background from '../../img/cloud-background.png'
import SunIcon from '../../img/Sun.svg'

import './index.tsx'

export default function Main(props) {
  const navCloudStyle = {
    backgroundColor: 'transparent',
    backgroundImage: `url(${background}), url(${background})`,
    backgroundPosition: '0px 0px, 1px 0px',
    backgroundRepeat: 'repeat-x, repeat-x',
    boxShadow: 'none',
    backgroundSize: 'contain, contain',
    height: '85px',
    width: '100%',
    position: 'fixed',
    marginBottom: '-85px',
  }
  const sunStyle = {
    height: '15vw',
    left: 20,
    maxHeight: '125px',
    position: 'fixed',
    top: 100,
    zIndex:-1
  }

  return (
    <>
    <div className='BeanstalkBG' name={`Chain${chainId}`}></div>
    <div>
      <img alt='Sun Icon' src={SunIcon} style={sunStyle} />
      <div style={navCloudStyle} />
      {props.children}
      <Footer />
    </div>
    </>
  )

}
