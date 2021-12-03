import cloud from 'img/cloud-background.png';
import darkCloud from 'img/dark/cloud-background-dark.png';
import fallCloud from 'img/fall/cloud-background-fall.png';
import sun from 'img/Sun.svg';
import darkSun from 'img/dark/Sun.svg';
import fallSun from 'img/fall/Sun.svg';
import ground from 'img/ground.png';
import darkGround from 'img/dark/ground.png';
import fallGround from 'img/fall/ground.png';
import barn from 'img/Barn.svg';
import darkBarn from 'img/dark/Barn.svg';
import fallBarn from 'img/fall/Barn.svg';
import bean from 'img/bean-bold-logo.svg';
import beanWhite from 'img/bean-white-logo.svg';

const normalTheme = {
  name: 'main',
  primary: '#0E8837',
  secondary: '#627264',
  accentColor: '#9A9A9A',
  bodyBackground: '#DAF2FF',
  accentText: 'white',
  border: 'rgba(224, 224, 224, 1)',
  text: 'black',
  backgroundText: 'black',
  linkColor: '#3B3B3B',
  footer: '#000000',
  voteSelect: '#DAF2FF',
  activeSection: 'rgb(14, 136, 55)',
  navSelection: '#61dafb38',
  menuColor: 'white',
  module: {
    foreground: '#FFFFFF',
    background: '#F5FAFF',
    metaBackground: 'rgba(238 238 238 / 85%)',
  },
  cloud: cloud,
  cloudColor: '#F5FAFF',
  sun: sun,
  sunHeight: '10vw',
  ground: ground,
  groundSize: 'contain',
  groundHeight: '82px',
  groundItemHeight: '82px',
  groundGrass: 'none',
  footerPadding: '18px 15px 0 0',
  barn: barn,
  bean: bean,
};

export const ropstenTheme = {
  ...normalTheme,
  name: 'ropsten',
  primary: '#FF4A8D',
  secondary: '#7A2343',
};

export const spookyTheme = {
  ...normalTheme,
  name: 'spooky',
  text: 'black',
  backgroundText: 'white',
  bodyBackground: '#096A9F',
  primary: '#FF7F00',
  accentColor: '#3B3B3B',
  accentText: '#091F35',
  secondary: '#FF7F00',
  linkColor: '#9F9F9F',
  footer: '#FF7F00',
  voteSelect: '#B4DCEA',
  // menuColor: '#FFDDAD',
  module: {
    foreground: '#B4DCEA',
    background: '#96CEE0',
    metaBackground: '#091F35',
  },
  cloud: darkCloud,
  cloudColor: '#96CEE0',
  sun: darkSun,
  sunHeight: '25vw',
  ground: darkGround,
  groundSize: 'contain 100px',
  groundHeight: '82px',
  footerPadding: '28px 15px 0 0',
  barn: darkBarn,
  bean: beanWhite,
};

export const fallTheme = {
  ...normalTheme,
  name: 'fall',
  text: 'black',
  backgroundText: 'black',
  bodyBackground: '#FFF3D1',
  primary: '#E9983C',
  accentColor: '#815925',
  accentText: '#FFFFFF',
  secondary: '#E9983C',
  linkColor: '#C29B71',
  footer: '#5e3c0f',
  // voteSelect: '#C29B71',
  voteSelect: '#FFDE97',
  activeSection: '#BE4417',
  navSelection: '#FFF3D1',
  menuColor: '#FFDDAD',
  module: {
    foreground: '#FFF3D1',
    background: '#FFE5AD',
    metaBackground: '#FFDE97',
  },
  cloud: fallCloud,
  cloudColor: '#FFDDAD',
  sun: fallSun,
  // sunHeight: '15vw',
  ground: fallGround,
  groundSize: 'contain',
  groundHeight: '82px',
  groundItemHeight: '82px',
  groundGrass: 'flex',
  barn: fallBarn,
  bean: bean,
};

export let theme = fallTheme;

export function changeTheme(t: String) {
  if (t === 'ropsten') theme = ropstenTheme;
  else if (t === 'spooky') theme = spookyTheme;
  else if (t === 'fall') theme = fallTheme;
  else theme = normalTheme;
}
