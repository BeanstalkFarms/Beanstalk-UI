import cloud from '../img/cloud-background.png';
import darkCloud from '../img/dark/cloud-background-dark.png';
import darkSun from '../img/dark/Sun.svg';
import sun from '../img/Sun.svg';
import darkGround from '../img/dark/ground.png';
import ground from '../img/ground.png';
import darkBarn from '../img/dark/Barn.svg';
import barn from '../img/Barn.svg';
import darkSilo from '../img/dark/Silo.svg';
import silo from '../img/Silo.svg';
import bean from '../img/bean-bold-logo.svg';
import beanWhite from '../img/bean-white-logo.svg';

const normalTheme = {
    name: 'main',
    primary: '#0E8837',
    secondary: '#627264',
    accentColor: '#9A9A9A',
    accentText: 'white',
    border: 'rgba(224, 224, 224, 1)',
    text: 'black',
    backgroundText: 'black',
    linkColor: '#3B3B3B',
    footer: '#000000',
    module: {
        foreground: '#FFFFFF',
        background: '#F5FAFF',
        metaBackground: 'rgba(238 238 238 / 85%)',
    },
    cloud: cloud,
    sun: sun,
    sunHeight: '10vw',
    ground: ground,
    groundSize: 'contain',
    groundHeight: '60px',
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
    primary: '#FF7F00',
    accentColor: '#3B3B3B',
    accentText: '#091F35',
    secondary: '#FF7F00',
    linkColor: '#9F9F9F',
    footer: '#FF7F00',
    module: {
        foreground: '#B4DCEA',
        background: '#96CEE0',
        metaBackground: '#091F35',
    },
    cloud: darkCloud,
    sun: darkSun,
    sunHeight: '15vw',
    ground: darkGround,
    groundSize: 'contain 200%',
    groundHeight: '80px',
    barn: darkBarn,
    silo: darkSilo,
    bean: beanWhite,
};

export const theme = spookyTheme;
