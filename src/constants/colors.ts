import cloud from '../img/cloud-background.png';
import darkCloud from '../img/dark/cloud-background-dark.png';
import darkSun from '../img/dark/Sun.svg';

const normalTheme = {
    name: 'main',
    primary: '#0E8837',
    secondary: '#627264',
    accentColor: '#9A9A9A',
    accentText: 'white',
    border: 'rgba(224, 224, 224, 1)',
    text: 'black',
    backgrounText: 'black',
    linkColor: '#3B3B3B',
    module: {
        foreground: '#FFFFFF',
        background: '#F5FAFF',
        metaBackground: 'rgba(238 238 238 / 85%)',
    },
    cloud: cloud,
    sun: '../../img/Sun.svg',
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
    secondary: '#b85f00',
    linkColor: '#9F9F9F',
    module: {
        foreground: '#B4DCEA',
        background: '#96CEE0',
        metaBackground: '#091F35',
    },
    cloud: darkCloud,
    sun: darkSun,
};

export const theme = spookyTheme;
