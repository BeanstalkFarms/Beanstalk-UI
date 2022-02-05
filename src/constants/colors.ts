import cloud from 'img/cloud-background.png';
import darkCloud from 'img/dark/cloud-background-dark.png';
import fallCloud from 'img/fall/cloud-background-fall.png';
import mainCloud from 'img/main/cloud-navbar.png';
import sun from 'img/Sun.svg';
import darkSun from 'img/dark/Sun.svg';
import fallSun from 'img/fall/Sun.svg';
import winterSun from 'img/winter/Sun.svg';
import mainSun from 'img/main/Sun.svg';
import ground from 'img/ground.png';
import darkGround from 'img/dark/ground.png';
import fallGround from 'img/fall/ground.png';
import winterGround from 'img/winter/ground.png';
import mainGround from 'img/main/ground.png';
import barn from 'img/Barn.svg';
import darkBarn from 'img/dark/Barn.svg';
import fallBarn from 'img/fall/Barn.svg';
import winterBarn from 'img/winter/Barn.svg';
import winterUpgradeBarn from 'img/winter/upgrade/Barn.svg';
import mainBarn from 'img/main/Barn.svg';
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
  iconButtonColor: 'rgba(59, 59, 59, 0.8)',
  linkColor: '#3B3B3B',
  linkHoverColor: '#292929',
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
  sunLeftPosition: 20,
  ground: ground,
  groundSize: 'contain',
  groundHeight: '82px',
  groundItemHeight: 'calc(60px - 1vh)',
  groundGrass: 'none',
  barnHeight: '82px',
  landHeight: '82px',
  footerPadding: '18px 15px 0 0',
  barn: barn,
  bean: bean,
};

const mainTheme = {
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
  iconButtonColor: 'rgba(59, 59, 59, 0.95)',
  activeSection: 'rgb(14, 136, 55)',
  navSelection: '#61dafb38',
  menuColor: 'white',
  module: {
    foreground: '#FFFFFF',
    background: '#F5FAFF',
    metaBackground: 'rgba(238 238 238 / 85%)',
  },
  cloud: mainCloud,
  cloudColor: '#F5FAFF',
  sun: mainSun,
  sunHeight: '10vw',
  sunLeftPosition: 20,
  ground: mainGround,
  groundSize: 'cover',
  groundHeight: '82px',
  groundItemHeight: '82px',
  groundGrass: 'none',
  barnHeight: '82px',
  landHeight: '82px',
  footerPadding: '28px 15px 0 0',
  barn: mainBarn,
  bean: bean,
};

export const ropstenTheme = {
  ...mainTheme,
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
  activeSection: '#BE4417',
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
  barnHeight: '52px',
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
  footerPadding: '28px 15px 0 0',
  barn: fallBarn,
  bean: bean,
};

export const winterTheme = {
  ...normalTheme,
  name: 'winter',
  text: 'black',
  backgroundText: 'black',
  bodyBackground: '#005788',
  primary: '#1B4658',
  accentColor: '#9A9A9A',
  accentText: 'white',
  secondary: '#1B4658',
  linkColor: '#3B3B3B',
  footer: '#DDEBEF',
  voteSelect: '#DAF2FF',
  activeSection: '#1B4658',
  navSelection: '#61dafb38',
  menuColor: 'white',
  module: {
    foreground: '#FFFFFF',
    background: '#F5FAFF',
    metaBackground: 'rgba(238 238 238 / 85%)',
  },
  cloud: mainCloud,
  cloudColor: 'white',
  sun: winterSun,
  // sunHeight: '15vw',
  // sunLeftPosition: '55vw',
  ground: winterGround,
  groundSize: 'cover',
  groundHeight: '74px',
  groundItemHeight: '65px',
  groundGrass: 'flex',
  landHeight: '140px',
  barnHeight: '74px',
  footerPadding: '28px 15px 0 0',
  barn: winterBarn,
  bean: beanWhite,
};

// FIXME: temporarily added winterUpgrade, need to clean up theme files and naming
export const winterUpgradeTheme = {
  ...normalTheme,
  name: 'winterUpgrade',
  text: 'black',
  backgroundText: 'black',
  bodyBackground: '#66CCFF',
  primary: '#1B4658',
  accentColor: '#9A9A9A',
  accentText: 'white',
  secondary: '#1B4658',
  linkColor: '#3B3B3B',
  footer: '#DDEBEF',
  voteSelect: '#DAF2FF',
  activeSection: '#1B4658',
  navSelection: '#61dafb38',
  menuColor: 'white',
  module: {
    foreground: '#FFFFFF',
    background: '#F5FAFF',
    metaBackground: 'rgba(238 238 238 / 85%)',
  },
  cloud: mainCloud,
  cloudColor: 'white',
  sun: mainSun,
  // sunHeight: '15vw',
  // sunLeftPosition: '55vw',
  ground: winterGround,
  groundSize: 'cover',
  groundHeight: '74px',
  groundItemHeight: '65px',
  groundGrass: 'flex',
  landHeight: '140px',
  barnHeight: '74px',
  footerPadding: '28px 15px 0 0',
  barn: winterUpgradeBarn,
  bean: beanWhite,
};

export let theme = winterUpgradeTheme;

export function changeTheme(t: String) {
  if (t === 'ropsten') theme = ropstenTheme;
  else if (t === 'spooky') theme = spookyTheme;
  else if (t === 'fall') theme = fallTheme;
  else if (t === 'winter') theme = winterTheme;
  else if (t === 'winterUpgrade') theme = winterUpgradeTheme;
  else if (t === 'main') theme = mainTheme;
  else theme = normalTheme;
}
