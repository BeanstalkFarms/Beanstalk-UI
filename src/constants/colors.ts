import cloud from '../img/cloud-background.png';
import darkCloud from '../img/dark/cloud-background-dark.png';
import fallCloud from '../img/fall/cloud-background-fall.png';
import sun from '../img/Sun.svg';
import darkSun from '../img/dark/Sun.svg';
import fallSun from '../img/fall/Sun.svg';
import ground from '../img/ground.png';
import darkGround from '../img/dark/ground.png';
import fallGround from '../img/fall/ground.png';
// import fallGround from '../img/fall/trial2.png';
// import fallGround from '../img/fall/trial1.svg';
import barn from '../img/Barn.svg';
import darkBarn from '../img/dark/Barn.svg';
import fallBarn from '../img/fall/barn-fall.svg';
import silo from '../img/Silo.svg';
import darkSilo from '../img/dark/Silo.svg';
import fallSilo from '../img/fall/Silo.svg';
import bean from '../img/bean-bold-logo.svg';
import beanWhite from '../img/bean-white-logo.svg';

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
    groundHeight: '53px',
    groundItemHeight: '51px',
    footerPadding: '18px 15px 0 0',
    barn: barn,
    silo: silo,
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
    voteSelect: '#091F35',
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
    silo: darkSilo,
    bean: beanWhite,
};

export const fallTheme = {
    ...normalTheme,
    name: 'fall',
    text: '#815925',
    backgroundText: '#815925',
    primary: '#E9983C',
    accentColor: '#815925',
    accentText: '#FFFFFF',
    secondary: '#E9983C',
    linkColor: '#C29B71',
    footer: '#BE4417',
    // voteSelect: '#C29B71',
    voteSelect: '#FFDE97',
    module: {
        foreground: '#FFE5AD',
        background: '#FFF3D1',
        metaBackground: '#FFDE97',
    },
    cloud: fallCloud,
    cloudColor: '#FFDDAD',
    sun: fallSun,
    // sunHeight: '15vw',
    ground: fallGround,
    groundSize: 'contain',
    groundHeight: '82px',
    groundItemHeight: '69px',
    barn: fallBarn,
    silo: fallSilo,
    bean: beanWhite,
};

export let theme = fallTheme;

export function changeTheme(t: String) {
    if (t === 'ropsten') theme = ropstenTheme;
    else if (t === 'spooky') theme = spookyTheme;
    else if (t === 'fall') theme = fallTheme;
    else theme = normalTheme;
}
